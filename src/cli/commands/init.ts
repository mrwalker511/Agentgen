/**
 * Command: agentgen init
 * This is an alias for the 'new' command for better user experience
 */

import { executeNewCommand } from './new.js';
import { logger } from '../../core/logger.js';

/**
 * Execute the init command (alias for new)
 */
export async function executeInitCommand(
  outputPath: string,
  options: any
): Promise<void> {
  logger.info('Executing init command (alias for new)');
  
  // Map init options to new command options
  const newOptions = {
    pack: options.pack,
    name: options.name,
    nonInteractive: options.nonInteractive,
    description: options.description,
    author: options.author,
  };
  
  // Execute the new command
  await executeNewCommand(outputPath, newOptions);
}