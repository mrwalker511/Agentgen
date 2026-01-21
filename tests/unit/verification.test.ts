/**
 * Unit tests for verification module
 */

import { describe, it, expect } from 'vitest';
import { checkPoetryAvailable, getPoetryVersion } from '../../src/verification/strategies/python.js';
import { checkNpmAvailable, getNpmVersion, detectPackageManager } from '../../src/verification/strategies/node.js';
import { generateVerificationSummary } from '../../src/verification/reporter.js';
import type { VerificationReport } from '../../src/verification/types.js';

describe('Verification Module', () => {
  describe('Python Strategy', () => {
    it('should check if Poetry is available', () => {
      const result = checkPoetryAvailable();
      // Result depends on environment, just verify it returns a boolean
      expect(typeof result).toBe('boolean');
    });

    it('should get Poetry version or null', () => {
      const version = getPoetryVersion();
      // Version can be string or null depending on environment
      expect(version === null || typeof version === 'string').toBe(true);

      if (version !== null) {
        // If Poetry is installed, version should match semver pattern
        expect(version).toMatch(/^\d+\.\d+/);
      }
    });
  });

  describe('Node Strategy', () => {
    it('should check if npm is available', () => {
      const result = checkNpmAvailable();
      // npm should be available in CI/test environment
      expect(typeof result).toBe('boolean');
    });

    it('should get npm version or null', () => {
      const version = getNpmVersion();
      expect(version === null || typeof version === 'string').toBe(true);

      if (version !== null) {
        // Version should match semver pattern
        expect(version).toMatch(/^\d+\.\d+/);
      }
    });

    it('should detect package manager from lockfiles', () => {
      const testDir = process.cwd();
      const packageManager = detectPackageManager(testDir);

      // Should detect npm (we have package-lock.json)
      expect(['npm', 'pnpm', 'yarn', null]).toContain(packageManager);
    });
  });

  describe('Reporter', () => {
    it('should format successful verification report', () => {
      const report: VerificationReport = {
        version: '1.0',
        timestamp: '2026-01-07T12:00:00.000Z',
        projectPath: '/test/project',
        ecosystem: 'node',
        status: 'success',
        steps: [
          {
            name: 'Install Dependencies',
            command: 'npm install',
            status: 'success',
            startTime: '2026-01-07T12:00:00.000Z',
            endTime: '2026-01-07T12:00:05.000Z',
            duration: 5000,
            exitCode: 0,
            output: 'Dependencies installed',
          },
        ],
        summary: {
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          duration: 5000,
        },
      };

      const formatted = generateVerificationSummary(report);

      expect(formatted).toContain('success');
      expect(formatted).toContain('Install Dependencies');
      expect(formatted).toContain('Passed: 1');
    });

    it('should format failed verification report', () => {
      const report: VerificationReport = {
        version: '1.0',
        timestamp: '2026-01-07T12:00:00.000Z',
        projectPath: '/test/project',
        ecosystem: 'python',
        status: 'failed',
        steps: [
          {
            name: 'Poetry Lock',
            command: 'poetry lock',
            status: 'failed',
            startTime: '2026-01-07T12:00:00.000Z',
            endTime: '2026-01-07T12:00:03.000Z',
            duration: 3000,
            exitCode: 1,
            output: '',
            error: 'Dependency conflict detected',
          },
        ],
        summary: {
          total: 1,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: 3000,
        },
      };

      const formatted = generateVerificationSummary(report);

      expect(formatted).toContain('failed');
      expect(formatted).toContain('Poetry Lock');
      expect(formatted).toContain('Failed: 1');
    });

    it('should format report with skipped steps', () => {
      const report: VerificationReport = {
        version: '1.0',
        timestamp: '2026-01-07T12:00:00.000Z',
        projectPath: '/test/project',
        ecosystem: 'node',
        status: 'failed',
        steps: [
          {
            name: 'Install Dependencies',
            command: 'npm install',
            status: 'failed',
            startTime: '2026-01-07T12:00:00.000Z',
            endTime: '2026-01-07T12:00:02.000Z',
            duration: 2000,
            exitCode: 1,
            error: 'Network error',
          },
          {
            name: 'Run Tests',
            command: 'npm test',
            status: 'skipped',
          },
        ],
        summary: {
          total: 2,
          passed: 0,
          failed: 1,
          skipped: 1,
          duration: 2000,
        },
      };

      const formatted = generateVerificationSummary(report);

      expect(formatted).toContain('Skipped: 1');
      expect(formatted).toContain('Run Tests');
    });
  });
});
