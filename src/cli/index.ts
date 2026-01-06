#!/usr/bin/env node

/**
 * Agentgen CLI entry point
 */

import { Command } from 'commander';
import { executeNewCommand } from './commands/new.js';
import { logger } from '../core/logger.js';

const program = new Command();

program
  .name('agentgen')
  .description('AI-first project scaffolding with AGENT.md as a first-class artifact')
  .version('0.1.0');

// Command: new
program
  .command('new <output-path>')
  .description('Generate a new project')
  .requiredOption('--pack <pack-id>', 'Template pack to use (e.g., python-api, node-api)')
  .requiredOption('--name <project-name>', 'Project name')
  .option('--non-interactive', 'Skip interactive prompts', false)
  .option('--description <description>', 'Project description')
  .option('--author <author>', 'Project author')
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

// Parse arguments
program.parse();
