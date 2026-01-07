/**
 * Managed sections unit tests
 */

import { describe, it, expect } from 'vitest';
import { parseManagedSections, updateManagedSections, generateManagedSections } from '../../src/renderer/agent-md.js';
import { Blueprint } from '../../src/core/types.js';

describe('Managed Sections', () => {
  describe('parseManagedSections', () => {
    it('should extract managed sections from content', () => {
      const content = `
# Title

Some content

<!-- agentgen:managed:start:section1 -->
Old section 1 content
<!-- agentgen:managed:end:section1 -->

More content

<!-- agentgen:managed:start:section2 -->
Old section 2 content
<!-- agentgen:managed:end:section2 -->

Final content
`;

      const sections = parseManagedSections(content);

      expect(sections.size).toBe(2);
      expect(sections.get('section1')).toBe('Old section 1 content');
      expect(sections.get('section2')).toBe('Old section 2 content');
    });

    it('should handle content with no managed sections', () => {
      const content = `
# Title

Just regular content without any managed sections.
`;

      const sections = parseManagedSections(content);

      expect(sections.size).toBe(0);
    });

    it('should handle nested content correctly', () => {
      const content = `
<!-- agentgen:managed:start:test -->
## Section Title

- Item 1
- Item 2

Some code:
\`\`\`bash
echo "test"
\`\`\`
<!-- agentgen:managed:end:test -->
`;

      const sections = parseManagedSections(content);

      expect(sections.size).toBe(1);
      const testContent = sections.get('test') || '';
      expect(testContent).toContain('## Section Title');
      expect(testContent).toContain('- Item 1');
      expect(testContent).toContain('echo "test"');
    });
  });

  describe('updateManagedSections', () => {
    it('should replace managed section content', () => {
      const original = `
# Document

<!-- agentgen:managed:start:test -->
Old content
<!-- agentgen:managed:end:test -->

End
`;

      const newSections = [
        { id: 'test', content: 'New content\n' },
      ];

      const updated = updateManagedSections(original, newSections);

      expect(updated).toContain('New content');
      expect(updated).not.toContain('Old content');
      expect(updated).toContain('<!-- agentgen:managed:start:test -->');
      expect(updated).toContain('<!-- agentgen:managed:end:test -->');
    });

    it('should preserve content outside managed sections', () => {
      const original = `
# Custom Title

This is custom content before.

<!-- agentgen:managed:start:test -->
Old content
<!-- agentgen:managed:end:test -->

This is custom content after.

## Custom Section

More custom content here.
`;

      const newSections = [
        { id: 'test', content: 'New content\n' },
      ];

      const updated = updateManagedSections(original, newSections);

      expect(updated).toContain('# Custom Title');
      expect(updated).toContain('This is custom content before.');
      expect(updated).toContain('This is custom content after.');
      expect(updated).toContain('## Custom Section');
      expect(updated).toContain('More custom content here.');
    });

    it('should preserve content between multiple managed sections', () => {
      const original = `
Start

<!-- agentgen:managed:start:section1 -->
Old 1
<!-- agentgen:managed:end:section1 -->

Middle content

<!-- agentgen:managed:start:section2 -->
Old 2
<!-- agentgen:managed:end:section2 -->

End
`;

      const newSections = [
        { id: 'section1', content: 'New 1\n' },
        { id: 'section2', content: 'New 2\n' },
      ];

      const updated = updateManagedSections(original, newSections);

      expect(updated).toContain('Start');
      expect(updated).toContain('Middle content');
      expect(updated).toContain('End');
      expect(updated).toContain('New 1');
      expect(updated).toContain('New 2');
      expect(updated).not.toContain('Old 1');
      expect(updated).not.toContain('Old 2');
    });

    it('should return original content if no sections to update', () => {
      const original = `
# Document

No managed sections here.
`;

      const updated = updateManagedSections(original, []);

      expect(updated).toBe(original);
    });

    it('should handle sections not present in original', () => {
      const original = `
# Document

<!-- agentgen:managed:start:existing -->
Old content
<!-- agentgen:managed:end:existing -->
`;

      const newSections = [
        { id: 'existing', content: 'New content\n' },
        { id: 'nonexistent', content: 'This should be ignored\n' },
      ];

      const updated = updateManagedSections(original, newSections);

      expect(updated).toContain('New content');
      expect(updated).not.toContain('This should be ignored');
    });
  });

  describe('generateManagedSections', () => {
    const mockBlueprint: Blueprint = {
      version: '1.0',
      meta: {
        packId: 'python-api',
        packVersion: '1.0.0',
        agentgenVersion: '0.1.0',
        generatedAt: '2026-01-07T12:00:00.000Z',
      },
      project: {
        name: 'test-api',
        description: 'Test API',
      },
      stack: {
        language: 'python',
        framework: 'fastapi',
        runtime: {
          version: '>=3.11,<4.0',
          manager: 'poetry',
        },
        dependencies: {
          fastapi: '^0.104.1',
          uvicorn: '^0.24.0',
        },
        devDependencies: {
          pytest: '^7.4.3',
        },
      },
      features: {
        openapi: true,
        healthCheck: true,
        database: {
          enabled: false,
        },
        authentication: {
          enabled: false,
        },
      },
      tooling: {
        packageManager: {
          tool: 'poetry',
          version: '^1.7.0',
        },
        linter: {
          tool: 'ruff',
          config: {},
        },
        formatter: {
          tool: 'ruff',
          config: {},
        },
        typeChecker: {
          tool: 'mypy',
          enabled: true,
          config: {},
        },
        testing: {
          framework: 'pytest',
          coverage: true,
          coverageThreshold: 80,
        },
      },
      infrastructure: {
        docker: {
          enabled: false,
        },
        ci: {
          provider: 'none',
          checks: [],
        },
      },
      agent: {
        strictness: 'balanced',
        testRequirements: 'on-request',
        allowedOperations: ['read', 'write', 'execute'],
        prohibitedOperations: ['delete-database'],
      },
      paths: {
        sourceDir: 'src',
        testDir: 'tests',
      },
    };

    it('should generate quickstart section', () => {
      const sections = generateManagedSections(mockBlueprint);

      const quickstart = sections.find((s) => s.id === 'quickstart');
      expect(quickstart).toBeDefined();
      expect(quickstart?.content).toContain('poetry install');
      expect(quickstart?.content).toContain('poetry run uvicorn test_api.main:app --reload');
      expect(quickstart?.content).toContain('http://localhost:8000');
    });

    it('should generate verification section', () => {
      const sections = generateManagedSections(mockBlueprint);

      const verification = sections.find((s) => s.id === 'verification');
      expect(verification).toBeDefined();
      expect(verification?.content).toContain('agentgen verify-deps');
      expect(verification?.content).toContain('Lock dependencies with Poetry');
      expect(verification?.content).toContain('pip check');
    });

    it('should generate structure section', () => {
      const sections = generateManagedSections(mockBlueprint);

      const structure = sections.find((s) => s.id === 'structure');
      expect(structure).toBeDefined();
      expect(structure?.content).toContain('test-api/');
      expect(structure?.content).toContain('src/');
      expect(structure?.content).toContain('tests/');
      expect(structure?.content).toContain('pyproject.toml');
    });

    it('should include database in structure when enabled', () => {
      const blueprintWithDb = {
        ...mockBlueprint,
        features: {
          ...mockBlueprint.features,
          database: {
            enabled: true,
            type: 'postgresql',
            orm: 'sqlalchemy',
            migrations: true,
          },
        },
      };

      const sections = generateManagedSections(blueprintWithDb);

      const structure = sections.find((s) => s.id === 'structure');
      expect(structure?.content).toContain('db/');
      expect(structure?.content).toContain('# Database configuration');
      expect(structure?.content).toContain('alembic/');
    });

    it('should generate exactly 3 sections', () => {
      const sections = generateManagedSections(mockBlueprint);

      expect(sections).toHaveLength(3);
      expect(sections.map((s) => s.id)).toEqual(['quickstart', 'verification', 'structure']);
    });
  });
});
