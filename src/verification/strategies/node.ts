/**
 * Node.js verification strategy using npm/pnpm/yarn
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { VerificationOptions, VerificationReport, VerificationStep } from '../types.js';
import { logger } from '../../core/logger.js';

const VERIFICATION_VERSION = '1.0';

/**
 * Execute a command and capture output
 */
function executeCommand(command: string, cwd: string, verbose: boolean): { exitCode: number; output: string; error?: string } {
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
async function executeStep(step: VerificationStep, projectPath: string, verbose: boolean): Promise<VerificationStep> {
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
    logger.info(` ${step.name} passed`);
  } else {
    step.status = 'failed';
    logger.error(` ${step.name} failed (exit code ${result.exitCode})`);
    if (result.error) {
      logger.debug(`Error: ${result.error}`);
    }
  }

  return step;
}

/**
 * Run Node.js verification
 */
export async function runNodeVerification(options: VerificationOptions): Promise<VerificationReport> {
  const startTime = new Date();

  // Define verification steps
  const steps: VerificationStep[] = [
    {
      name: 'Install Dependencies',
      command: 'npm install',
      status: 'pending',
    },
    {
      name: 'Verify Dependencies',
      command: 'npm ls',
      status: 'pending',
    },
  ];

  // Add test step if not skipped
  if (!options.skipTests) {
    steps.push({
      name: 'Run Tests',
      command: 'npm test',
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

  return report;
}

/**
 * Check if npm is available
 */
export function checkNpmAvailable(): boolean {
  try {
    const result = executeCommand('npm --version', process.cwd(), false);
    return result.exitCode === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get npm version
 */
export function getNpmVersion(): string | null {
  try {
    const result = executeCommand('npm --version', process.cwd(), false);
    if (result.exitCode === 0) {
      return result.output.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Detect package manager (npm, pnpm, yarn)
 */
export function detectPackageManager(projectPath: string): 'npm' | 'pnpm' | 'yarn' | null {
  try {
    // Check for pnpm-lock.yaml
    const pnpmLockPath = `${projectPath}/pnpm-lock.yaml`;
    if (existsSync(pnpmLockPath)) {
      return 'pnpm';
    }

    // Check for yarn.lock
    const yarnLockPath = `${projectPath}/yarn.lock`;
    if (existsSync(yarnLockPath)) {
      return 'yarn';
    }

    // Default to npm
    return 'npm';
  } catch (error) {
    return 'npm'; // Default to npm if detection fails
  }
}