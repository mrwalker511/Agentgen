#!/usr/bin/env node

/**
 * Agentgen CLI entry point
 */

import { Command } from 'commander';
import { executeNewCommand } from './commands/new.js';
import { executeVerifyDepsCommand } from './commands/verify.js';
import { logger } from '../core/logger.js';

const program = new Command();

program
  .name('agentgen')
  .description('AI-first project scaffolding with AGENT.md as a first-class artifact')
  .version('0.1.0');

// Command: new
program
  .command('new <output-path>')
  .description('Generate a new project (interactive by default)')
  .requiredOption('--pack <pack-id>', 'Template pack to use (e.g., python-api, node-api)')
  .option('--name <project-name>', 'Project name (required for --non-interactive)')
  .option('--non-interactive', 'Skip interactive prompts', false)
  .option('--description <description>', 'Project description (non-interactive only)')
  .option('--author <author>', 'Project author (non-interactive only)')
  .option('--verbose', 'Enable verbose logging', false)
  .action(async (outputPath: string, options) => {
    if (options.verbose) {
      logger.setLevel('debug');
    }

    try {
      await executeNewCommand(outputPath, {
        pack: options.pack,
        name: options.name,
        nonInteractive: options.nonInteractive,
        description: options.description,
        author: options.author,
      });
    } catch (error) {
      process.exit(1);
    }
  });

// Command: verify-deps
program
  .command('verify-deps <project-path>')
  .description('Verify project dependencies using ecosystem tools')
  .option('--skip-tests', 'Skip running tests', false)
  .option('--verbose', 'Enable verbose logging and show full command output', false)
  .option('--output <file>', 'Custom output file for verification report')
  .action(async (projectPath: string, options) => {
    if (options.verbose) {
      logger.setLevel('debug');
    }

    try {
      await executeVerifyDepsCommand(projectPath, {
        skipTests: options.skipTests,
        verbose: options.verbose,
        outputFile: options.output,
      });
    } catch (error) {
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
