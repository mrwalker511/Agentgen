/**
 * Command: agentgen update-agent
 */

import * as path from 'path';
import { resolvePath, readFileString, writeFileSafe, pathExists } from '../../core/fs.js';
import { logger } from '../../core/logger.js';
import { updateManagedSections, generateManagedSections } from '../../renderer/agent-md.js';
import { Blueprint } from '../../core/types.js';
import { AgentgenError } from '../../core/errors.js';
import * as output from '../output.js';

export interface UpdateAgentOptions {
  verbose?: boolean;
}

/**
 * Execute the update-agent command
 */
export async function executeUpdateAgentCommand(
  projectPath: string,
  _options: UpdateAgentOptions
): Promise<void> {
  try {
    output.heading('🔄 Agentgen - Update AGENT.md');

    // Resolve project path
    const resolvedPath = resolvePath(projectPath);
    logger.info(`Project: ${resolvedPath}`);

    // Check for AGENT.md
    const agentMdPath = path.join(resolvedPath, 'AGENT.md');
    if (!pathExists(agentMdPath)) {
      output.error('AGENT.md not found in project directory');
      output.info('Run this command from within a project created by agentgen');
      process.exit(1);
    }

    // Check for blueprint
    const blueprintPath = path.join(resolvedPath, 'project.blueprint.json');
    if (!pathExists(blueprintPath)) {
      output.error('project.blueprint.json not found');
      output.info('This project may not have been created by agentgen');
      process.exit(1);
    }

    // Load existing AGENT.md
    const spinner = output.spinner('Reading AGENT.md...');
    const existingContent = readFileString(agentMdPath);
    spinner.succeed('Read AGENT.md');

    // Load blueprint
    output.info('Loading blueprint...');
    let blueprint: Blueprint;
    try {
      const blueprintContent = readFileString(blueprintPath);
      blueprint = JSON.parse(blueprintContent) as Blueprint;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new AgentgenError(`Failed to parse blueprint: ${message}`);
    }
    output.success('Loaded blueprint');

    // Generate new managed sections
    output.info('Generating managed sections...');
    const newSections = generateManagedSections(blueprint);
    output.success(`Generated ${newSections.length} managed sections`);

    // Update managed sections
    const updatingSpinner = output.spinner('Updating managed sections...');
    const updatedContent = updateManagedSections(existingContent, newSections);
    updatingSpinner.succeed('Updated managed sections');

    // Check if content changed
    if (updatedContent === existingContent) {
      output.blank();
      output.info('No changes needed - AGENT.md is up to date');
      return;
    }

    // Write updated AGENT.md
    const writingSpinner = output.spinner('Writing AGENT.md...');
    writeFileSafe(agentMdPath, updatedContent);
    writingSpinner.succeed('Wrote AGENT.md');

    // Success!
    output.blank();
    output.success('AGENT.md updated successfully!');
    output.info('Managed sections have been regenerated');
    output.info('Custom content has been preserved');
    output.blank();

    // Show what was updated
    output.subheading('Updated sections:');
    newSections.forEach((section) => {
      output.success(`- ${section.id}`);
    });
    output.blank();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    output.error(`Failed to update AGENT.md: ${message}`);
    logger.error('Update failed', err);
    process.exit(1);
  }
}
