/**
 * Command: agentgen verify-deps
 */

import * as path from 'path';
import { runPythonVerification, detectEcosystem } from '../../verification/runner.js';
import { VerificationReport } from '../../verification/types.js';
import { resolvePath, writeFileSafe } from '../../core/fs.js';
import { logger } from '../../core/logger.js';
import * as output from '../output.js';

export interface VerifyDepsOptions {
  skipTests?: boolean;
  verbose?: boolean;
  outputFile?: string;
}

/**
 * Execute the verify-deps command
 */
export async function executeVerifyDepsCommand(
  projectPath: string,
  options: VerifyDepsOptions
): Promise<void> {
  try {
    output.heading('Agentgen - Verify Dependencies');

    // Resolve project path
    const resolvedPath = resolvePath(projectPath);
    output.info(`Project: ${resolvedPath}`);

    // Detect ecosystem
    const ecosystem = detectEcosystem(resolvedPath);
    if (ecosystem === 'unknown') {
      output.error('Could not detect project ecosystem (missing pyproject.toml or package.json)');
      process.exit(1);
    }

    output.info(`Ecosystem: ${ecosystem}`);
    output.blank();

    // Run verification
    let report: VerificationReport;

    if (ecosystem === 'python') {
      report = await runPythonVerification({
        projectPath: resolvedPath,
        skipTests: options.skipTests,
        verbose: options.verbose,
      });
    } else {
      output.error(`Ecosystem '${ecosystem}' verification not implemented yet`);
      process.exit(1);
    }

    // Write report to file
    const reportPath = options.outputFile || path.join(resolvedPath, 'agentgen.verify.json');
    const reportJson = JSON.stringify(report, null, 2);
    writeFileSafe(reportPath, reportJson);

    // Display results
    output.blank();
    output.subheading('Verification Summary');
    output.blank();

    report.steps.forEach((step) => {
      if (step.status === 'success') {
        output.success(`${step.name} (${step.duration}ms)`);
      } else if (step.status === 'failed') {
        output.error(`${step.name} (exit code ${step.exitCode})`);
        if (step.error && !options.verbose) {
          // Show first few lines of error
          const errorLines = step.error.split('\n').slice(0, 5);
          errorLines.forEach((line) => {
            console.log(`  ${line}`);
          });
          if (step.error.split('\n').length > 5) {
            console.log('  ... (use --verbose for full output)');
          }
        }
      } else if (step.status === 'skipped') {
        output.warn(`${step.name} (skipped)`);
      }
    });

    output.blank();
    console.log('─'.repeat(60));
    console.log(
      `Total: ${report.summary.total} | ` +
        `Passed: ${report.summary.passed} | ` +
        `Failed: ${report.summary.failed} | ` +
        `Skipped: ${report.summary.skipped}`
    );
    console.log(`Duration: ${(report.summary.duration / 1000).toFixed(2)}s`);
    console.log('─'.repeat(60));
    output.blank();

    if (report.status === 'success') {
      output.success('All verification steps passed!');
      output.info(`Report saved to: ${path.relative(process.cwd(), reportPath)}`);
    } else {
      output.error('Verification failed');
      output.info(`Report saved to: ${path.relative(process.cwd(), reportPath)}`);
      process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    output.error(`Verification failed: ${message}`);
    logger.error('Verification failed', err);
    process.exit(1);
  }
}
