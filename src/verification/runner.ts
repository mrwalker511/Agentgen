/**
 * Verification runner - executes dependency verification steps
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { VerificationReport, VerificationStep, VerificationOptions } from './types.js';
import { logger } from '../core/logger.js';
import { pathExists, isDirectory } from '../core/fs.js';
import { AgentgenError } from '../core/errors.js';

const VERIFICATION_VERSION = '1.0';

/**
 * Execute a command and capture output
 */
function executeCommand(
  command: string,
  cwd: string,
  verbose: boolean
): { exitCode: number; output: string; error?: string } {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: verbose ? 'inherit' : 'pipe',
      timeout: 300000, // 5 minute timeout
    });

    return {
      exitCode: 0,
      output: output.toString(),
    };
  } catch (error: any) {
    return {
      exitCode: error.status || 1,
      output: error.stdout?.toString() || '',
      error: error.stderr?.toString() || error.message,
    };
  }
}

/**
 * Execute a verification step
 */
async function executeStep(
  step: VerificationStep,
  projectPath: string,
  verbose: boolean
): Promise<VerificationStep> {
  const startTime = new Date();
  step.startTime = startTime.toISOString();
  step.status = 'running';

  logger.info(`Running: ${step.name}`);
  logger.debug(`Command: ${step.command}`);

  const result = executeCommand(step.command, projectPath, verbose);

  const endTime = new Date();
  step.endTime = endTime.toISOString();
  step.duration = endTime.getTime() - startTime.getTime();
  step.output = result.output;
  step.error = result.error;
  step.exitCode = result.exitCode;

  if (result.exitCode === 0) {
    step.status = 'success';
    logger.info(` ${step.name} passed`);
  } else {
    step.status = 'failed';
    logger.error(` ${step.name} failed (exit code ${result.exitCode})`);
    if (result.error) {
      logger.debug(`Error: ${result.error}`);
    }
  }

  return step;
}

/**
 * Run Python/Poetry verification
 */
export async function runPythonVerification(
  options: VerificationOptions
): Promise<VerificationReport> {
  const startTime = new Date();

  // Validate project path
  if (!pathExists(options.projectPath)) {
    throw new AgentgenError(`Project path does not exist: ${options.projectPath}`);
  }

  if (!isDirectory(options.projectPath)) {
    throw new AgentgenError(`Project path is not a directory: ${options.projectPath}`);
  }

  // Check for pyproject.toml
  const pyprojectPath = path.join(options.projectPath, 'pyproject.toml');
  if (!pathExists(pyprojectPath)) {
    throw new AgentgenError('pyproject.toml not found in project directory');
  }

  // Define verification steps
  const steps: VerificationStep[] = [
    {
      name: 'Poetry Lock',
      command: 'poetry lock',
      status: 'pending',
    },
    {
      name: 'Install Dependencies',
      command: 'poetry install',
      status: 'pending',
    },
    {
      name: 'Verify Dependencies',
      command: 'poetry run pip check',
      status: 'pending',
    },
  ];

  // Add test step if not skipped
  if (!options.skipTests) {
    steps.push({
      name: 'Run Tests',
      command: 'poetry run pytest',
      status: 'pending',
    });
  }

  // Execute steps
  let overallStatus: 'success' | 'failed' = 'success';

  for (const step of steps) {
    await executeStep(step, options.projectPath, options.verbose || false);

    // Fail fast - stop on first error
    if (step.status === 'failed') {
      overallStatus = 'failed';
      // Mark remaining steps as skipped
      const currentIndex = steps.indexOf(step);
      for (let i = currentIndex + 1; i < steps.length; i++) {
        const nextStep = steps[i];
        if (nextStep) {
          nextStep.status = 'skipped';
        }
      }
      break;
    }
  }

  const endTime = new Date();
  const totalDuration = endTime.getTime() - startTime.getTime();

  // Generate report
  const report: VerificationReport = {
    version: VERIFICATION_VERSION,
    timestamp: startTime.toISOString(),
    projectPath: options.projectPath,
    ecosystem: 'python',
    status: overallStatus,
    steps,
    summary: {
      total: steps.length,
      passed: steps.filter((s) => s.status === 'success').length,
      failed: steps.filter((s) => s.status === 'failed').length,
      skipped: steps.filter((s) => s.status === 'skipped').length,
      duration: totalDuration,
    },
  };

  return report;
}

/**
 * Detect ecosystem from project directory
 */
export function detectEcosystem(projectPath: string): 'python' | 'node' | 'unknown' {
  if (pathExists(path.join(projectPath, 'pyproject.toml'))) {
    return 'python';
  }

  if (pathExists(path.join(projectPath, 'package.json'))) {
    return 'node';
  }

  return 'unknown';
}
