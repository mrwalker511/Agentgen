/**
 * Command: agentgen new
 */

import * as path from 'path';
import { loadPack } from '../../packs/loader.js';
import { buildBlueprint, buildBlueprintFromAnswers } from '../../blueprint/builder.js';
import { renderPack } from '../../renderer/engine.js';
import { writeFiles, writeFile } from '../../renderer/writer.js';
import { resolvePath } from '../../core/fs.js';
import { logger } from '../../core/logger.js';
import { runInterview } from '../../interview/engine.js';
import * as output from '../output.js';

export interface NewCommandOptions {
  pack: string;
  name?: string;
  nonInteractive: boolean;
  description?: string;
  author?: string;
}

/**
 * Execute the new command
 */
export async function executeNewCommand(
  outputPath: string,
  options: NewCommandOptions
): Promise<void> {
  try {
    output.heading('🚀 Agentgen - Generate New Project');

    // Resolve output directory
    const outputDir = resolvePath(outputPath);
    logger.info(`Output directory: ${outputDir}`);

    // Load pack
    const loadingSpinner = output.spinner(`Loading pack '${options.pack}'...`);
    const pack = await loadPack(options.pack);
    loadingSpinner.succeed(`Loaded pack '${pack.metadata.name}' v${pack.metadata.version}`);

    // Build blueprint - either from interview or from CLI flags
    let blueprint;

    if (options.nonInteractive) {
      // Non-interactive mode: use CLI flags
      if (!options.name) {
        output.error('--name is required in non-interactive mode');
        process.exit(1);
      }

      output.info('Building project blueprint...');
      blueprint = buildBlueprint(pack, {
        projectName: options.name,
        outputDir,
        description: options.description,
        author: options.author,
      });
      output.success('Blueprint created');
    } else {
      // Interactive mode: run interview
      output.blank();
      output.info('Starting interactive interview...');
      output.blank();

      const answers = await runInterview(pack);

      output.blank();
      output.info('Building project blueprint...');
      blueprint = buildBlueprintFromAnswers(pack, answers, outputDir);
      output.success('Blueprint created');
    }

    // Write blueprint JSON
    const blueprintFile = {
      path: 'project.blueprint.json',
      content: JSON.stringify(blueprint, null, 2),
    };
    writeFile(blueprintFile, outputDir);
    output.success('Wrote project.blueprint.json');

    // Render templates
    const renderingSpinner = output.spinner('Rendering templates...');
    const renderedFiles = await renderPack(pack, blueprint);
    renderingSpinner.succeed(`Rendered ${renderedFiles.length} files`);

    // Write files
    const writingSpinner = output.spinner('Writing files...');
    await writeFiles(renderedFiles, outputDir);
    writingSpinner.succeed(`Wrote ${renderedFiles.length} files`);

    // Success!
    output.blank();
    output.success(`Project '${blueprint.project.name}' created successfully!`);

    // Show next steps
    output.nextSteps([
      `cd ${path.basename(outputDir)}`,
      'poetry install',
      'poetry run uvicorn src.main:app --reload',
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    output.error(`Failed to generate project: ${message}`);
    logger.error('Generation failed', err);
    throw err;
  }
}
