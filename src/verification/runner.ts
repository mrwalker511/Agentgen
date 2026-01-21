/**
 * Verification runner - executes dependency verification steps
 */

import * as path from 'path';
import { VerificationReport, VerificationStep, VerificationOptions } from './types.js';
import { logger } from '../core/logger.js';
import { pathExists, isDirectory } from '../core/fs.js';
import { AgentgenError } from '../core/errors.js';
import { executeCommand } from '../core/exec.js';
import { detectPackageManager } from './strategies/node.js';

const VERIFICATION_VERSION = '1.0';

/**
 * Execute a verification step
 */
async function executeStep(
  step: VerificationStep,
  projectPath: string,
  verbose: boolean
): Promise<VerificationStep> {
  await Promise.resolve();

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
 * Run Node.js verification
 */
export async function runNodeVerification(options: VerificationOptions): Promise<VerificationReport> {
  const startTime = new Date();

  // Validate project path
  if (!pathExists(options.projectPath)) {
    throw new AgentgenError(`Project path does not exist: ${options.projectPath}`);
  }

  if (!isDirectory(options.projectPath)) {
    throw new AgentgenError(`Project path is not a directory: ${options.projectPath}`);
  }

  // Check for package.json
  const packageJsonPath = path.join(options.projectPath, 'package.json');
  if (!pathExists(packageJsonPath)) {
    throw new AgentgenError('package.json not found in project directory');
  }

  const packageManager = detectPackageManager(options.projectPath) || 'npm';

  const installCommand =
    packageManager === 'yarn'
      ? 'yarn install'
      : packageManager === 'pnpm'
        ? 'pnpm install'
        : 'npm install';

  const listCommand =
    packageManager === 'yarn' ? 'yarn list' : packageManager === 'pnpm' ? 'pnpm list' : 'npm ls';

  const testCommand =
    packageManager === 'yarn' ? 'yarn test' : packageManager === 'pnpm' ? 'pnpm test' : 'npm test';

  const steps: VerificationStep[] = [
    {
      name: `Install Dependencies (${packageManager})`,
      command: installCommand,
      status: 'pending',
    },
    {
      name: 'Verify Dependencies',
      command: listCommand,
      status: 'pending',
    },
  ];

  if (!options.skipTests) {
    steps.push({
      name: 'Run Tests',
      command: testCommand,
      status: 'pending',
    });
  }

  let overallStatus: 'success' | 'failed' = 'success';

  for (const step of steps) {
    await executeStep(step, options.projectPath, options.verbose || false);

    if (step.status === 'failed') {
      overallStatus = 'failed';
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

  return {
    version: VERIFICATION_VERSION,
    timestamp: startTime.toISOString(),
    projectPath: options.projectPath,
    ecosystem: 'node',
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
