# Dependency Verification Pipeline

## Overview

The verification pipeline ensures that selected dependencies are compatible **before any files are written**. It uses ecosystem-native tools (Poetry, npm, pnpm, yarn) to perform actual dependency resolution, avoiding guesswork and hallucinated commands.

**Key principle**: Never generate a project with incompatible dependencies.

---

## Architecture

```
Blueprint (with dependencies)
    ↓
[Verification Runner]
    ↓
    ├─→ Detect ecosystem (python, node)
    ├─→ Load pack verifier
    ├─→ Create temporary workspace
    ├─→ Generate manifest file (pyproject.toml, package.json)
    ├─→ Run ecosystem solver
    ├─→ Parse solver output
    ├─→ Generate verification report
    └─→ Cleanup temporary files
    ↓
Verification Report (JSON)
    ↓
    ├─→ success: true  → Proceed to rendering
    └─→ success: false → Show errors, abort
```

### Core Components

1. **Verification Runner** (`verification/runner.ts`)
   - Orchestrates verification process
   - Selects appropriate verifier based on ecosystem
   - Manages temporary workspaces
   - Produces structured reports

2. **Ecosystem Verifiers** (`verification/strategies/`)
   - `python.ts` - Poetry/pip-tools verification
   - `node.ts` - npm/pnpm/yarn verification
   - Each implements standard `Verifier` interface

3. **Report Generator** (`verification/reporter.ts`)
   - Formats verification results
   - Produces machine-readable JSON
   - Generates human-readable summaries

---

## Verification Report Format

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "timestamp", "ecosystem", "status", "result"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Verification report schema version",
      "const": "1.0"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When verification was run (ISO 8601)"
    },
    "ecosystem": {
      "type": "string",
      "enum": ["python", "node"],
      "description": "Language ecosystem"
    },
    "tool": {
      "type": "string",
      "description": "Verification tool used (poetry, npm, pnpm, yarn)"
    },
    "toolVersion": {
      "type": "string",
      "description": "Version of verification tool"
    },
    "status": {
      "type": "string",
      "enum": ["success", "failure", "warning"],
      "description": "Overall verification status"
    },
    "result": {
      "type": "object",
      "properties": {
        "compatible": {
          "type": "boolean",
          "description": "Are all dependencies compatible?"
        },
        "conflicts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": ["version_conflict", "peer_dependency", "missing_dependency", "platform_incompatibility"]
              },
              "severity": {
                "type": "string",
                "enum": ["error", "warning"]
              },
              "message": {
                "type": "string",
                "description": "Human-readable error message"
              },
              "packages": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Packages involved in the conflict"
              },
              "constraints": {
                "type": "object",
                "description": "Conflicting version constraints",
                "additionalProperties": {
                  "type": "string"
                }
              },
              "suggestion": {
                "type": "string",
                "description": "Suggested fix"
              }
            },
            "required": ["type", "severity", "message", "packages"]
          }
        },
        "warnings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              },
              "message": {
                "type": "string"
              },
              "packages": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "resolved": {
          "type": "object",
          "description": "Successfully resolved dependency versions",
          "additionalProperties": {
            "type": "string"
          }
        },
        "runtimeVersion": {
          "type": "string",
          "description": "Python/Node version verified against"
        }
      },
      "required": ["compatible"]
    },
    "duration": {
      "type": "number",
      "description": "Verification duration in milliseconds"
    },
    "blueprint": {
      "type": "object",
      "description": "Reference to blueprint that was verified",
      "properties": {
        "projectName": {
          "type": "string"
        },
        "packId": {
          "type": "string"
        },
        "packVersion": {
          "type": "string"
        }
      }
    }
  }
}
```

### TypeScript Types

```typescript
type VerificationReport = {
  version: '1.0';
  timestamp: string; // ISO 8601
  ecosystem: 'python' | 'node';
  tool: string; // 'poetry' | 'npm' | 'pnpm' | 'yarn'
  toolVersion: string;
  status: 'success' | 'failure' | 'warning';
  result: VerificationResult;
  duration: number; // milliseconds
  blueprint?: {
    projectName: string;
    packId: string;
    packVersion: string;
  };
};

type VerificationResult = {
  compatible: boolean;
  conflicts: Conflict[];
  warnings: Warning[];
  resolved?: Record<string, string>; // package -> resolved version
  runtimeVersion?: string;
};

type Conflict = {
  type: 'version_conflict' | 'peer_dependency' | 'missing_dependency' | 'platform_incompatibility';
  severity: 'error' | 'warning';
  message: string;
  packages: string[];
  constraints?: Record<string, string>; // package -> constraint
  suggestion?: string;
};

type Warning = {
  type: string;
  message: string;
  packages?: string[];
};

interface Verifier {
  verify(blueprint: Blueprint): Promise<VerificationReport>;
  checkToolInstalled(): Promise<boolean>;
  getToolVersion(): Promise<string>;
}
```

---

## Python Verification Strategy

### Using Poetry

**Why Poetry:**
- Industry-standard dependency resolver for Python
- Handles complex constraint solving
- Produces deterministic lock files
- Clear error messages

**Verification Steps:**

1. **Check Poetry installed**
   ```bash
   poetry --version
   ```

2. **Create temporary directory**
   ```typescript
   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-py-'));
   ```

3. **Generate `pyproject.toml`** from blueprint
   ```toml
   [tool.poetry]
   name = "temp-verify"
   version = "0.1.0"
   description = ""
   authors = []

   [tool.poetry.dependencies]
   python = ">=3.11,<4.0"
   fastapi = "^0.104.1"
   sqlalchemy = "^2.0.23"

   [tool.poetry.group.dev.dependencies]
   pytest = "^7.4.3"

   [build-system]
   requires = ["poetry-core"]
   build-backend = "poetry.core.masonry.api"
   ```

4. **Run Poetry lock (dry run)**
   ```bash
   cd {tempDir}
   poetry lock --no-update --dry-run
   ```

5. **Parse output**
   - Success: No conflicts, dependencies resolved
   - Failure: Parse error messages for conflicts

6. **Cleanup**
   ```typescript
   fs.rmSync(tempDir, { recursive: true, force: true });
   ```

### Error Patterns

**Version Conflict:**
```
Because no versions of fastapi match >0.105.0,<1.0
 and bar (2.0.0) depends on fastapi (^0.105.0),
 bar is forbidden.
So, because temp-verify depends on both bar and fastapi (^0.104.1), version solving failed.
```

**Platform Incompatibility:**
```
The current project's Python requirement (>=3.12,<4.0) is not compatible with some of the required packages Python requirement:
  - pydantic requires Python >=3.10,<3.12
```

**Missing Dependency:**
```
The following packages are required but not found in the registry:
  - unknown-package
```

### Implementation

```typescript
// verification/strategies/python.ts

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class PythonVerifier implements Verifier {
  async verify(blueprint: Blueprint): Promise<VerificationReport> {
    const startTime = Date.now();

    // Check Poetry installed
    if (!await this.checkToolInstalled()) {
      throw new Error('Poetry is not installed. Install from https://python-poetry.org/');
    }

    const toolVersion = await this.getToolVersion();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-py-'));

    try {
      // Generate pyproject.toml
      const pyproject = this.generatePyprojectToml(blueprint);
      fs.writeFileSync(path.join(tempDir, 'pyproject.toml'), pyproject);

      // Run Poetry lock
      const result = execSync('poetry lock --no-update --dry-run', {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });

      // Success - parse resolved versions
      const resolved = this.parseResolvedVersions(result.toString());

      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ecosystem: 'python',
        tool: 'poetry',
        toolVersion,
        status: 'success',
        result: {
          compatible: true,
          conflicts: [],
          warnings: [],
          resolved,
          runtimeVersion: blueprint.stack.runtime.version
        },
        duration: Date.now() - startTime,
        blueprint: {
          projectName: blueprint.project.name,
          packId: blueprint.meta.packId,
          packVersion: blueprint.meta.packVersion
        }
      };

    } catch (error: any) {
      // Parse Poetry errors
      const conflicts = this.parsePoetryErrors(error.stderr || error.stdout || '');

      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ecosystem: 'python',
        tool: 'poetry',
        toolVersion,
        status: 'failure',
        result: {
          compatible: false,
          conflicts,
          warnings: []
        },
        duration: Date.now() - startTime,
        blueprint: {
          projectName: blueprint.project.name,
          packId: blueprint.meta.packId,
          packVersion: blueprint.meta.packVersion
        }
      };

    } finally {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  async checkToolInstalled(): Promise<boolean> {
    try {
      execSync('poetry --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async getToolVersion(): Promise<string> {
    const output = execSync('poetry --version', { encoding: 'utf-8' });
    const match = output.match(/Poetry \(version ([^\)]+)\)/);
    return match ? match[1] : 'unknown';
  }

  private generatePyprojectToml(blueprint: Blueprint): string {
    const deps = blueprint.stack.dependencies;
    const devDeps = blueprint.stack.devDependencies || {};
    const pythonVersion = blueprint.stack.runtime.version;

    const depsSection = Object.entries(deps)
      .map(([name, version]) => `${name} = "${version}"`)
      .join('\n');

    const devDepsSection = Object.entries(devDeps)
      .map(([name, version]) => `${name} = "${version}"`)
      .join('\n');

    return `
[tool.poetry]
name = "temp-verify"
version = "0.1.0"
description = ""
authors = []

[tool.poetry.dependencies]
python = "${pythonVersion}"
${depsSection}

[tool.poetry.group.dev.dependencies]
${devDepsSection}

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
    `.trim();
  }

  private parsePoetryErrors(stderr: string): Conflict[] {
    const conflicts: Conflict[] = [];
    const lines = stderr.split('\n');

    // Pattern: "Because X and Y, Z is forbidden"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('version solving failed') || line.includes('is forbidden')) {
        // Extract package names
        const packages = this.extractPackageNames(line);

        conflicts.push({
          type: 'version_conflict',
          severity: 'error',
          message: line,
          packages,
          suggestion: 'Try adjusting version constraints or removing conflicting dependencies'
        });
      }

      if (line.includes('not compatible with') && line.includes('Python requirement')) {
        const packages = this.extractPackageNames(line);

        conflicts.push({
          type: 'platform_incompatibility',
          severity: 'error',
          message: line,
          packages,
          suggestion: 'Check Python version requirements for all dependencies'
        });
      }

      if (line.includes('not found in the registry')) {
        const packages = this.extractPackageNames(line);

        conflicts.push({
          type: 'missing_dependency',
          severity: 'error',
          message: line,
          packages,
          suggestion: 'Check package name spelling and availability on PyPI'
        });
      }
    }

    return conflicts;
  }

  private extractPackageNames(text: string): string[] {
    // Extract package names (lowercase alphanumeric with hyphens/underscores)
    const matches = text.match(/\b[a-z0-9_-]+\b/gi) || [];
    // Filter out common words
    const stopWords = new Set(['because', 'version', 'depends', 'requires', 'python', 'and', 'or']);
    return [...new Set(matches.filter(m => !stopWords.has(m.toLowerCase())))];
  }

  private parseResolvedVersions(output: string): Record<string, string> {
    // Parse Poetry output for resolved versions
    // This is a simplified implementation
    // In production, would parse poetry.lock if generated
    return {};
  }
}
```

---

## Node Verification Strategy

### Using npm/pnpm/yarn

**Why ecosystem package managers:**
- Native to Node.js ecosystem
- Handle peer dependencies correctly
- Support multiple lock file formats
- Well-understood error messages

**Verification Steps:**

1. **Detect package manager**
   ```typescript
   const manager = blueprint.stack.runtime.manager; // 'npm' | 'pnpm' | 'yarn'
   ```

2. **Check tool installed**
   ```bash
   npm --version
   # or
   pnpm --version
   # or
   yarn --version
   ```

3. **Create temporary directory**
   ```typescript
   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-node-'));
   ```

4. **Generate `package.json`**
   ```json
   {
     "name": "temp-verify",
     "version": "0.1.0",
     "private": true,
     "dependencies": {
       "express": "^4.18.2",
       "prisma": "^5.7.1"
     },
     "devDependencies": {
       "typescript": "^5.3.3",
       "vitest": "^1.0.4"
     },
     "engines": {
       "node": ">=20.0.0"
     }
   }
   ```

5. **Run package manager (lockfile only)**
   ```bash
   # npm
   npm install --package-lock-only --no-audit --no-fund

   # pnpm
   pnpm install --lockfile-only --no-optional

   # yarn
   yarn install --mode update-lockfile
   ```

6. **Parse output and lockfile**
   - Check for `ERESOLVE` errors (npm)
   - Check for peer dependency warnings
   - Verify all packages resolved

7. **Cleanup**

### Error Patterns

**Version Conflict (npm):**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
npm ERR!
npm ERR! While resolving: express@4.18.2
npm ERR! Found: body-parser@1.20.0
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer body-parser@"^1.19.0" from express@4.17.0
```

**Peer Dependency Warning:**
```
npm WARN ERESOLVE overriding peer dependency
npm WARN While resolving: react-dom@18.0.0
npm WARN Found: react@17.0.0
npm WARN Could not resolve peer react@"^18.0.0" from react-dom@18.0.0
```

**Missing Package:**
```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/unknown-package
npm ERR! 404 'unknown-package@^1.0.0' is not in this registry.
```

### Implementation

```typescript
// verification/strategies/node.ts

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class NodeVerifier implements Verifier {
  async verify(blueprint: Blueprint): Promise<VerificationReport> {
    const startTime = Date.now();
    const manager = blueprint.stack.runtime.manager || 'npm';

    // Check tool installed
    if (!await this.checkToolInstalled(manager)) {
      throw new Error(`${manager} is not installed`);
    }

    const toolVersion = await this.getToolVersion(manager);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-node-'));

    try {
      // Generate package.json
      const packageJson = this.generatePackageJson(blueprint);
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Run package manager
      const command = this.getLockCommand(manager);

      const result = execSync(command, {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
        env: {
          ...process.env,
          NO_UPDATE_NOTIFIER: '1'
        }
      });

      // Check for warnings in output
      const warnings = this.parseWarnings(result.toString(), manager);

      // Read lockfile to get resolved versions
      const resolved = this.parseResolvedVersions(tempDir, manager);

      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ecosystem: 'node',
        tool: manager,
        toolVersion,
        status: warnings.length > 0 ? 'warning' : 'success',
        result: {
          compatible: true,
          conflicts: [],
          warnings,
          resolved,
          runtimeVersion: blueprint.stack.runtime.version
        },
        duration: Date.now() - startTime,
        blueprint: {
          projectName: blueprint.project.name,
          packId: blueprint.meta.packId,
          packVersion: blueprint.meta.packVersion
        }
      };

    } catch (error: any) {
      // Parse errors
      const conflicts = this.parseNpmErrors(
        error.stderr || error.stdout || '',
        manager
      );

      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ecosystem: 'node',
        tool: manager,
        toolVersion,
        status: 'failure',
        result: {
          compatible: false,
          conflicts,
          warnings: []
        },
        duration: Date.now() - startTime,
        blueprint: {
          projectName: blueprint.project.name,
          packId: blueprint.meta.packId,
          packVersion: blueprint.meta.packVersion
        }
      };

    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  async checkToolInstalled(manager: string): Promise<boolean> {
    try {
      execSync(`${manager} --version`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async getToolVersion(manager: string): Promise<string> {
    try {
      const output = execSync(`${manager} --version`, { encoding: 'utf-8' });
      return output.trim();
    } catch {
      return 'unknown';
    }
  }

  private getLockCommand(manager: string): string {
    switch (manager) {
      case 'pnpm':
        return 'pnpm install --lockfile-only --no-optional';
      case 'yarn':
        return 'yarn install --mode update-lockfile';
      default:
        return 'npm install --package-lock-only --no-audit --no-fund';
    }
  }

  private generatePackageJson(blueprint: Blueprint): any {
    return {
      name: 'temp-verify',
      version: '0.1.0',
      private: true,
      dependencies: blueprint.stack.dependencies,
      devDependencies: blueprint.stack.devDependencies || {},
      engines: {
        node: blueprint.stack.runtime.version
      }
    };
  }

  private parseNpmErrors(output: string, manager: string): Conflict[] {
    const conflicts: Conflict[] = [];
    const lines = output.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // ERESOLVE errors
      if (line.includes('ERESOLVE')) {
        const packages = this.extractPackageNames(output.substring(i, i + 10));

        conflicts.push({
          type: 'version_conflict',
          severity: 'error',
          message: 'Dependency version conflict detected',
          packages,
          suggestion: 'Review version constraints and consider using compatible versions'
        });
      }

      // 404 errors
      if (line.includes('E404') || line.includes('404 Not Found')) {
        const packages = this.extractPackageNames(line);

        conflicts.push({
          type: 'missing_dependency',
          severity: 'error',
          message: 'Package not found in registry',
          packages,
          suggestion: 'Check package name spelling and availability'
        });
      }

      // Peer dependency errors
      if (line.includes('peer dep missing') || line.includes('unmet peer dependency')) {
        const packages = this.extractPackageNames(line);

        conflicts.push({
          type: 'peer_dependency',
          severity: 'error',
          message: 'Unmet peer dependency requirement',
          packages,
          suggestion: 'Install required peer dependencies'
        });
      }
    }

    return conflicts;
  }

  private parseWarnings(output: string, manager: string): Warning[] {
    const warnings: Warning[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('WARN') && line.includes('peer')) {
        warnings.push({
          type: 'peer_dependency',
          message: line.trim(),
          packages: this.extractPackageNames(line)
        });
      }
    }

    return warnings;
  }

  private extractPackageNames(text: string): string[] {
    // Extract package names (may include @scope/)
    const matches = text.match(/(@[a-z0-9-]+\/)?[a-z0-9-]+/gi) || [];
    return [...new Set(matches)];
  }

  private parseResolvedVersions(tempDir: string, manager: string): Record<string, string> {
    try {
      const lockfilePath = this.getLockfilePath(tempDir, manager);

      if (!fs.existsSync(lockfilePath)) {
        return {};
      }

      // Simplified - in production would parse lockfile format
      // npm: package-lock.json
      // pnpm: pnpm-lock.yaml
      // yarn: yarn.lock

      return {};
    } catch {
      return {};
    }
  }

  private getLockfilePath(dir: string, manager: string): string {
    switch (manager) {
      case 'pnpm':
        return path.join(dir, 'pnpm-lock.yaml');
      case 'yarn':
        return path.join(dir, 'yarn.lock');
      default:
        return path.join(dir, 'package-lock.json');
    }
  }
}
```

---

## Failure Modes

### 1. Tool Not Installed

**Scenario**: Poetry/npm/pnpm/yarn not available on system

**Detection**:
```typescript
const isInstalled = await verifier.checkToolInstalled();
if (!isInstalled) {
  throw new VerificationError('Tool not installed');
}
```

**Error Message**:
```
✗ Verification failed

Error: Poetry is not installed

To install Poetry:
  curl -sSL https://install.python-poetry.org | python3 -

Or visit: https://python-poetry.org/docs/#installation
```

**Handling**:
- Abort verification
- Show installation instructions
- Exit with code 1

### 2. Version Conflicts

**Scenario**: Two packages require incompatible versions of a dependency

**Detection**: Parse solver output for conflict messages

**Error Message**:
```
✗ Dependency verification failed

Conflict: fastapi and pydantic version mismatch
  → fastapi@0.104.1 requires pydantic >=2.0,<3.0
  → selected pydantic@1.10.0 does not satisfy this

Suggestion: Update pydantic to ^2.0
```

**Handling**:
- Report conflict in JSON
- Suggest version adjustments
- Allow user to modify blueprint

### 3. Missing Dependencies

**Scenario**: Package doesn't exist in registry

**Detection**: 404 errors from package managers

**Error Message**:
```
✗ Dependency not found

Error: Package 'unknow-package' not found
  → Check spelling: did you mean 'unknown-package'?
  → Verify package exists on PyPI/npm
```

**Handling**:
- Report as missing_dependency
- Suggest similar package names (fuzzy match)
- Abort generation

### 4. Platform Incompatibility

**Scenario**: Dependency doesn't support selected runtime version

**Detection**: Python/Node version requirement errors

**Error Message**:
```
✗ Platform incompatibility

Error: Python version conflict
  → Selected Python >=3.12,<4.0
  → pydantic requires Python >=3.10,<3.12

Suggestion: Use Python 3.11 or upgrade pydantic to version that supports 3.12
```

**Handling**:
- Report as platform_incompatibility
- Suggest runtime version adjustment
- Or suggest dependency upgrade

### 5. Timeout

**Scenario**: Verification takes too long (>2 minutes)

**Detection**: execSync timeout

**Error Message**:
```
✗ Verification timeout

Dependency resolution timed out after 120 seconds

This may indicate:
  - Network connectivity issues
  - Very large dependency tree
  - Package registry unavailable

Try again or reduce number of dependencies
```

**Handling**:
- Kill subprocess
- Report timeout error
- Suggest retry or reducing dependencies

### 6. Network Errors

**Scenario**: Cannot reach package registry

**Detection**: Connection errors in output

**Error Message**:
```
✗ Network error

Cannot connect to package registry
  → Check internet connection
  → Verify registry is accessible: https://pypi.org
  → Check firewall/proxy settings
```

**Handling**:
- Report as network error
- Suggest connectivity checks
- Allow retry

---

## Example Verification Reports

### Success - Python Project

```json
{
  "version": "1.0",
  "timestamp": "2025-01-06T12:30:00Z",
  "ecosystem": "python",
  "tool": "poetry",
  "toolVersion": "1.7.1",
  "status": "success",
  "result": {
    "compatible": true,
    "conflicts": [],
    "warnings": [],
    "resolved": {
      "fastapi": "0.104.1",
      "uvicorn": "0.24.0",
      "pydantic": "2.5.2",
      "sqlalchemy": "2.0.23",
      "asyncpg": "0.29.0"
    },
    "runtimeVersion": ">=3.11,<4.0"
  },
  "duration": 3420,
  "blueprint": {
    "projectName": "payment-api",
    "packId": "python-api",
    "packVersion": "1.0.0"
  }
}
```

### Failure - Version Conflict

```json
{
  "version": "1.0",
  "timestamp": "2025-01-06T12:35:00Z",
  "ecosystem": "python",
  "tool": "poetry",
  "toolVersion": "1.7.1",
  "status": "failure",
  "result": {
    "compatible": false,
    "conflicts": [
      {
        "type": "version_conflict",
        "severity": "error",
        "message": "Because no versions of fastapi match >0.105.0,<1.0 and pydantic (2.0.0) depends on fastapi (^0.105.0), pydantic is forbidden. So, because temp-verify depends on both pydantic and fastapi (^0.104.1), version solving failed.",
        "packages": ["fastapi", "pydantic"],
        "constraints": {
          "fastapi": "^0.104.1",
          "pydantic": "^2.0.0"
        },
        "suggestion": "Try adjusting version constraints or removing conflicting dependencies"
      }
    ],
    "warnings": []
  },
  "duration": 2150,
  "blueprint": {
    "projectName": "my-api",
    "packId": "python-api",
    "packVersion": "1.0.0"
  }
}
```

### Warning - Node Peer Dependencies

```json
{
  "version": "1.0",
  "timestamp": "2025-01-06T12:40:00Z",
  "ecosystem": "node",
  "tool": "pnpm",
  "toolVersion": "8.14.0",
  "status": "warning",
  "result": {
    "compatible": true,
    "conflicts": [],
    "warnings": [
      {
        "type": "peer_dependency",
        "message": "WARN  react-dom@18.2.0 requires a peer of react@^18.2.0 but version 17.0.2 was installed",
        "packages": ["react-dom", "react"]
      }
    ],
    "resolved": {
      "express": "4.18.2",
      "prisma": "5.7.1",
      "react": "17.0.2",
      "react-dom": "18.2.0"
    },
    "runtimeVersion": ">=20.0.0"
  },
  "duration": 5230,
  "blueprint": {
    "projectName": "user-service",
    "packId": "node-api",
    "packVersion": "1.0.0"
  }
}
```

### Failure - Missing Package

```json
{
  "version": "1.0",
  "timestamp": "2025-01-06T12:45:00Z",
  "ecosystem": "node",
  "tool": "npm",
  "toolVersion": "10.2.4",
  "status": "failure",
  "result": {
    "compatible": false,
    "conflicts": [
      {
        "type": "missing_dependency",
        "severity": "error",
        "message": "Package not found in registry: unknow-fastify-plugin@^1.0.0",
        "packages": ["unknow-fastify-plugin"],
        "suggestion": "Check package name spelling and availability. Did you mean 'fastify-plugin'?"
      }
    ],
    "warnings": []
  },
  "duration": 1820,
  "blueprint": {
    "projectName": "api-service",
    "packId": "node-api",
    "packVersion": "1.0.0"
  }
}
```

---

## CLI Interface

### Standalone Verification

Users can verify a blueprint without generating files:

```bash
# Verify blueprint file
agentgen verify ./blueprint.json

# Verify and save report
agentgen verify ./blueprint.json --output report.json

# Verbose output
agentgen verify ./blueprint.json --verbose

# Specify verifier
agentgen verify ./blueprint.json --tool poetry
```

**Output (success)**:
```
✓ Verifying dependencies with Poetry...

Python >=3.11,<4.0
  ✓ fastapi@0.104.1
  ✓ uvicorn@0.24.0
  ✓ pydantic@2.5.2
  ✓ sqlalchemy@2.0.23
  ✓ asyncpg@0.29.0

Development dependencies
  ✓ pytest@7.4.3
  ✓ pytest-asyncio@0.21.1
  ✓ ruff@0.1.8
  ✓ mypy@1.7.1

✓ All dependencies compatible

Verification completed in 3.4s
Report saved to: report.json
```

**Output (failure)**:
```
✗ Verifying dependencies with Poetry...

Error: Version conflict

  fastapi and pydantic version mismatch
    → fastapi@0.104.1 requires pydantic >=2.0,<3.0
    → selected pydantic@1.10.0 does not satisfy this

  Suggestion: Update pydantic to ^2.0

✗ Dependency verification failed

Fix the issues above and run verification again.
Report saved to: report.json
```

### Integration with `agentgen init`

Verification runs automatically during project generation:

```bash
agentgen init

# ... interview questions ...

✓ Interview complete
✓ Blueprint created
✓ Validating constraints...
→ Verifying dependencies with Poetry...

  Resolving dependencies... (this may take a minute)

  ✓ Python dependencies verified
  ✓ No conflicts found

✓ Generating project files...
```

**If verification fails**:
```bash
✗ Dependency verification failed

Conflicts detected:
  1. fastapi@0.104.1 and pydantic@1.10.0 are incompatible

Would you like to:
  1. Adjust dependency versions automatically
  2. Edit blueprint manually
  3. Abort generation

Choice [1]:
```

---

## CI/CD Usage

### GitHub Actions Example

```yaml
name: Verify Blueprint

on:
  pull_request:
    paths:
      - 'blueprints/**/*.json'

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Poetry
        run: |
          curl -sSL https://install.python-poetry.org | python3 -
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Install agentgen
        run: npm install -g agentgen

      - name: Verify blueprints
        run: |
          for blueprint in blueprints/*.json; do
            echo "Verifying $blueprint"
            agentgen verify "$blueprint" --output "reports/$(basename $blueprint .json)-report.json"
          done

      - name: Upload verification reports
        uses: actions/upload-artifact@v3
        with:
          name: verification-reports
          path: reports/*.json
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Verify blueprint changes
for file in $(git diff --cached --name-only | grep 'blueprint.*\.json'); do
  echo "Verifying $file..."

  if ! agentgen verify "$file"; then
    echo "❌ Blueprint verification failed for $file"
    echo "Fix conflicts and try again"
    exit 1
  fi
done

echo "✓ All blueprints verified"
exit 0
```

---

## Performance Optimization

### Caching

Cache verification results to avoid re-running:

```typescript
type VerificationCache = {
  blueprintHash: string;
  report: VerificationReport;
  expiresAt: number;
};

function getCachedVerification(blueprint: Blueprint): VerificationReport | null {
  const hash = hashBlueprint(blueprint);
  const cached = cache.get(hash);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.report;
  }

  return null;
}

function cacheVerification(blueprint: Blueprint, report: VerificationReport): void {
  const hash = hashBlueprint(blueprint);
  const ttl = 1000 * 60 * 60; // 1 hour

  cache.set(hash, {
    blueprintHash: hash,
    report,
    expiresAt: Date.now() + ttl
  });
}
```

### Parallel Verification

For multiple blueprints:

```typescript
async function verifyMultiple(blueprints: Blueprint[]): Promise<VerificationReport[]> {
  return Promise.all(
    blueprints.map(bp => verifier.verify(bp))
  );
}
```

---

## Summary

### Verification Pipeline Features

✅ **Ecosystem-native** - Uses Poetry, npm, pnpm, yarn (not custom solvers)
✅ **Machine-readable** - JSON reports with structured data
✅ **Actionable errors** - Clear messages with suggestions
✅ **Fast feedback** - Fails before file generation
✅ **CI/CD ready** - Can run in automated environments
✅ **Cached results** - Avoid redundant verification

### Benefits

1. **No bad projects generated** - All dependencies verified compatible
2. **Clear error messages** - Users know exactly what's wrong
3. **Ecosystem trust** - Uses same tools developers use
4. **Reproducible** - Same blueprint = same verification result
5. **Debuggable** - Detailed JSON reports for troubleshooting

### Integration Points

- Called from `agentgen init` after blueprint creation
- Standalone `agentgen verify` command
- Pre-commit hooks for blueprint changes
- CI/CD pipelines for blueprint validation
- IDE integrations (future: show errors in editor)
