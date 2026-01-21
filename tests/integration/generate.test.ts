/**
 * Integration tests for project generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { executeNewCommand } from '../../src/cli/commands/new.js';
import { executeVerifyDepsCommand } from '../../src/cli/commands/verify.js';

// Mock date for deterministic output
const MOCK_DATE = '2026-01-07T12:00:00.000Z';

describe('Project Generation Integration', () => {
  const testOutputDir = path.join(process.cwd(), 'tests', 'tmp');

  beforeEach(() => {
    // Mock Date for deterministic timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_DATE));

    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    vi.useRealTimers();

    // Clean up test output
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('python-api pack', () => {
    it('should generate minimal Python API project', async () => {
      const projectPath = path.join(testOutputDir, 'minimal-api');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'minimal-api',
        nonInteractive: true,
        description: 'Test API',
      });

      // Verify project structure
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'pyproject.toml'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'AGENT.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'project.blueprint.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);

      // Verify source structure
      expect(fs.existsSync(path.join(projectPath, 'src', 'minimal_api', '__init__.py'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src', 'minimal_api', 'main.py'))).toBe(true);

      // Verify test structure
      expect(fs.existsSync(path.join(projectPath, 'tests', '__init__.py'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tests', 'conftest.py'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tests', 'test_smoke.py'))).toBe(true);
    });

    it('should generate project with database support', async () => {
      const projectPath = path.join(testOutputDir, 'db-api');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'db-api',
        nonInteractive: true,
        description: 'API with database',
      });

      const blueprintPath = path.join(projectPath, 'project.blueprint.json');
      const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));

      expect(blueprint.project.name).toBe('db-api');
      expect(blueprint.stack.language).toBe('python');
      expect(blueprint.stack.framework).toBe('fastapi');
      expect(blueprint.meta.generatedAt).toBe(MOCK_DATE);
    });

    it('should generate valid pyproject.toml', async () => {
      const projectPath = path.join(testOutputDir, 'toml-test');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'toml-test',
        nonInteractive: true,
        description: 'TOML validation test',
      });

      const pyprojectPath = path.join(projectPath, 'pyproject.toml');
      const content = fs.readFileSync(pyprojectPath, 'utf-8');

      // Check for proper TOML structure
      expect(content).toContain('[tool.poetry]');
      expect(content).toContain('name = "toml-test"');
      expect(content).toContain('description = "TOML validation test"');
      expect(content).toContain('[tool.poetry.dependencies]');
      expect(content).toContain('python = ">=3.11,<4.0"');
      expect(content).toContain('fastapi = "^0.104.1"');

      // Ensure no HTML entities
      expect(content).not.toContain('&gt;');
      expect(content).not.toContain('&lt;');
    });

    it('should generate valid AGENT.md with managed sections', async () => {
      const projectPath = path.join(testOutputDir, 'agent-test');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'agent-test',
        nonInteractive: true,
        description: 'AGENT.md test',
      });

      const agentMdPath = path.join(projectPath, 'AGENT.md');
      const content = fs.readFileSync(agentMdPath, 'utf-8');

      // Check for managed section markers
      expect(content).toContain('<!-- agentgen:managed:start:quickstart -->');
      expect(content).toContain('<!-- agentgen:managed:end:quickstart -->');
      expect(content).toContain('<!-- agentgen:managed:start:verification -->');
      expect(content).toContain('<!-- agentgen:managed:end:verification -->');
      expect(content).toContain('<!-- agentgen:managed:start:structure -->');
      expect(content).toContain('<!-- agentgen:managed:end:structure -->');

      // Check for content
      expect(content).toContain('# AI Agent Guidelines for agent-test');
      expect(content).toContain('## Quickstart');
      expect(content).toContain('poetry install');
      expect(content).toContain('## Dependency Verification');
      expect(content).toContain('agentgen verify-deps');
      expect(content).toContain('## Repository Structure');
    });

    it('should generate working Python project structure', async () => {
      const projectPath = path.join(testOutputDir, 'python-structure');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'python-structure',
        nonInteractive: true,
        description: 'Structure test',
      });

      const mainPath = path.join(projectPath, 'src', 'python_structure', 'main.py');
      const content = fs.readFileSync(mainPath, 'utf-8');

      // Check for FastAPI imports and setup
      expect(content).toContain('from fastapi import FastAPI');
      expect(content).toContain('app = FastAPI(');
      expect(content).toContain('title="python-structure"');
      expect(content).toContain('description="Structure test"');

      // Check for health check endpoint
      expect(content).toContain('@app.get("/health")');
    });
  });

  describe('node-api pack', () => {
    it('should generate minimal Node API project', async () => {
      const projectPath = path.join(testOutputDir, 'minimal-node-api');

      await executeNewCommand(projectPath, {
        pack: 'node-api',
        name: 'minimal-node-api',
        nonInteractive: true,
        description: 'Test Node API',
      });

      // Verify project structure
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'AGENT.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'project.blueprint.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);

      // Verify source structure
      expect(fs.existsSync(path.join(projectPath, 'src', 'index.ts'))).toBe(true);

      // Verify test structure
      expect(fs.existsSync(path.join(projectPath, 'tests', 'api.test.ts'))).toBe(true);
    });

    it('should generate valid package.json', async () => {
      const projectPath = path.join(testOutputDir, 'package-test');

      await executeNewCommand(projectPath, {
        pack: 'node-api',
        name: 'package-test',
        nonInteractive: true,
        description: 'Package.json test',
      });

      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      // Check for proper structure
      expect(packageJson.name).toBe('package-test');
      expect(packageJson.description).toBe('Package.json test');
      expect(packageJson.version).toBe('0.1.0');
      expect(packageJson.type).toBe('module');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
    });

    it('should generate valid tsconfig.json', async () => {
      const projectPath = path.join(testOutputDir, 'tsconfig-test');

      await executeNewCommand(projectPath, {
        pack: 'node-api',
        name: 'tsconfig-test',
        nonInteractive: true,
        description: 'TSConfig test',
      });

      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      // Check for TypeScript config
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.outDir).toBe('./dist');
      expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    });

    it('should generate valid AGENT.md with managed sections', async () => {
      const projectPath = path.join(testOutputDir, 'node-agent-test');

      await executeNewCommand(projectPath, {
        pack: 'node-api',
        name: 'node-agent-test',
        nonInteractive: true,
        description: 'Node AGENT.md test',
      });

      const agentMdPath = path.join(projectPath, 'AGENT.md');
      const content = fs.readFileSync(agentMdPath, 'utf-8');

      // Check for managed section markers
      expect(content).toContain('<!-- agentgen:managed:start:quickstart -->');
      expect(content).toContain('<!-- agentgen:managed:end:quickstart -->');
      expect(content).toContain('<!-- agentgen:managed:start:verification -->');
      expect(content).toContain('<!-- agentgen:managed:end:verification -->');
      expect(content).toContain('<!-- agentgen:managed:start:structure -->');
      expect(content).toContain('<!-- agentgen:managed:end:structure -->');

      // Check for content
      expect(content).toContain('# AI Agent Guidelines for node-agent-test');
      expect(content).toContain('## Quickstart');
      expect(content).toContain('npm install');
      expect(content).toContain('## Dependency Verification');
      expect(content).toContain('agentgen verify-deps');
    });

    it('should generate working Node project structure', async () => {
      const projectPath = path.join(testOutputDir, 'node-structure');

      await executeNewCommand(projectPath, {
        pack: 'node-api',
        name: 'node-structure',
        nonInteractive: true,
        description: 'Node structure test',
      });

      const indexPath = path.join(projectPath, 'src', 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Check for Express imports and setup
      expect(content).toContain('import express');
      expect(content).toContain('const app = express()');
      expect(content).toContain('app.listen(PORT');
    });
  });

  describe('Snapshot tests', () => {
    it('should generate consistent pyproject.toml', async () => {
      const projectPath = path.join(testOutputDir, 'snapshot-test');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'snapshot-test',
        nonInteractive: true,
        description: 'Snapshot test project',
        author: 'Test Author',
      });

      const pyprojectPath = path.join(projectPath, 'pyproject.toml');
      const content = fs.readFileSync(pyprojectPath, 'utf-8');

      expect(content).toMatchSnapshot();
    });

    it('should generate consistent blueprint', async () => {
      const projectPath = path.join(testOutputDir, 'blueprint-snapshot');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'blueprint-snapshot',
        nonInteractive: true,
        description: 'Blueprint snapshot test',
      });

      const blueprintPath = path.join(projectPath, 'project.blueprint.json');
      const content = fs.readFileSync(blueprintPath, 'utf-8');
      const blueprint = JSON.parse(content);

      expect(blueprint).toMatchSnapshot();
    });

    it('should generate consistent AGENT.md structure', async () => {
      const projectPath = path.join(testOutputDir, 'agent-snapshot');

      await executeNewCommand(projectPath, {
        pack: 'python-api',
        name: 'agent-snapshot',
        nonInteractive: true,
        description: 'AGENT snapshot test',
      });

      const agentMdPath = path.join(projectPath, 'AGENT.md');
      const content = fs.readFileSync(agentMdPath, 'utf-8');

      expect(content).toMatchSnapshot();
    });
  });
});
