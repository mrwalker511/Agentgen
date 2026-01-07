/**
 * Integration tests for update-agent command
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { executeNewCommand } from '../../src/cli/commands/new.js';
import { executeUpdateAgentCommand } from '../../src/cli/commands/update-agent.js';

const MOCK_DATE = '2026-01-07T12:00:00.000Z';

describe('Update Agent Integration', () => {
  const testOutputDir = path.join(process.cwd(), 'tests', 'tmp-update');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_DATE));

    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    vi.useRealTimers();

    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should update managed sections while preserving custom content', async () => {
    const projectPath = path.join(testOutputDir, 'update-test');

    // Generate initial project
    await executeNewCommand(projectPath, {
      pack: 'python-api',
      name: 'update-test',
      nonInteractive: true,
      description: 'Update test project',
    });

    const agentMdPath = path.join(projectPath, 'AGENT.md');
    const originalContent = fs.readFileSync(agentMdPath, 'utf-8');

    // Add custom content before managed section
    const customSection = '\n**CUSTOM NOTE:** This is important!\n';
    const updatedContent = originalContent.replace(
      '## Project Overview',
      '## Project Overview' + customSection
    );

    // Add custom content after managed sections
    const customNotes = '\n### My Custom Notes\n\nThis is custom documentation that should be preserved.\n';
    const finalContent = updatedContent + customNotes;

    fs.writeFileSync(agentMdPath, finalContent);

    // Run update-agent
    await executeUpdateAgentCommand(projectPath, {});

    // Read updated AGENT.md
    const afterUpdate = fs.readFileSync(agentMdPath, 'utf-8');

    // Verify custom content is preserved
    expect(afterUpdate).toContain('**CUSTOM NOTE:** This is important!');
    expect(afterUpdate).toContain('### My Custom Notes');
    expect(afterUpdate).toContain('This is custom documentation that should be preserved.');

    // Verify managed sections still exist
    expect(afterUpdate).toContain('<!-- agentgen:managed:start:quickstart -->');
    expect(afterUpdate).toContain('<!-- agentgen:managed:end:quickstart -->');
    expect(afterUpdate).toContain('poetry install');
  });

  it('should regenerate managed sections with updated blueprint', async () => {
    const projectPath = path.join(testOutputDir, 'blueprint-update');

    // Generate initial project
    await executeNewCommand(projectPath, {
      pack: 'python-api',
      name: 'blueprint-update',
      nonInteractive: true,
      description: 'Blueprint update test',
    });

    const agentMdPath = path.join(projectPath, 'AGENT.md');
    const blueprintPath = path.join(projectPath, 'project.blueprint.json');

    // Modify blueprint to add database support
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));
    blueprint.features.database.enabled = true;
    blueprint.features.database.type = 'postgresql';
    blueprint.features.database.orm = 'sqlalchemy';
    blueprint.stack.dependencies.sqlalchemy = '^2.0.23';
    blueprint.stack.dependencies.asyncpg = '^0.29.0';

    fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2));

    // Run update-agent
    await executeUpdateAgentCommand(projectPath, {});

    // Read updated AGENT.md
    const content = fs.readFileSync(agentMdPath, 'utf-8');

    // Verify structure section now includes database directory
    const structureStart = content.indexOf('<!-- agentgen:managed:start:structure -->');
    const structureEnd = content.indexOf('<!-- agentgen:managed:end:structure -->');
    const structureSection = content.substring(structureStart, structureEnd);

    expect(structureSection).toContain('db/');
    expect(structureSection).toContain('# Database configuration');
  });

  it('should handle no changes gracefully', async () => {
    const projectPath = path.join(testOutputDir, 'no-change');

    // Generate initial project
    await executeNewCommand(projectPath, {
      pack: 'python-api',
      name: 'no-change',
      nonInteractive: true,
      description: 'No change test',
    });

    const agentMdPath = path.join(projectPath, 'AGENT.md');
    const beforeUpdate = fs.readFileSync(agentMdPath, 'utf-8');

    // Run update-agent without any blueprint changes
    await executeUpdateAgentCommand(projectPath, {});

    const afterUpdate = fs.readFileSync(agentMdPath, 'utf-8');

    // Content should be identical (or nearly identical with whitespace differences)
    // Just verify key sections are still present
    expect(afterUpdate).toContain('# AI Agent Guidelines for no-change');
    expect(afterUpdate).toContain('poetry install');
    expect(afterUpdate).toContain('agentgen verify-deps');

    // Verify managed sections are present
    expect(afterUpdate).toContain('<!-- agentgen:managed:start:quickstart -->');
    expect(afterUpdate).toContain('<!-- agentgen:managed:end:quickstart -->');
  });

  it('should preserve content between managed sections', async () => {
    const projectPath = path.join(testOutputDir, 'between-sections');

    await executeNewCommand(projectPath, {
      pack: 'python-api',
      name: 'between-sections',
      nonInteractive: true,
      description: 'Between sections test',
    });

    const agentMdPath = path.join(projectPath, 'AGENT.md');
    let content = fs.readFileSync(agentMdPath, 'utf-8');

    // Add content between managed sections
    const customBetween = '\n## Custom Section Between Managed Sections\n\nThis should be preserved.\n';
    content = content.replace(
      '<!-- agentgen:managed:end:quickstart -->',
      '<!-- agentgen:managed:end:quickstart -->' + customBetween
    );

    fs.writeFileSync(agentMdPath, content);

    // Run update-agent
    await executeUpdateAgentCommand(projectPath, {});

    const afterUpdate = fs.readFileSync(agentMdPath, 'utf-8');

    // Verify custom content between sections is preserved
    expect(afterUpdate).toContain('## Custom Section Between Managed Sections');
    expect(afterUpdate).toContain('This should be preserved.');
  });
});
