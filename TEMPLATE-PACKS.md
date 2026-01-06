# Template Pack System

## Overview

Template packs are self-contained bundles that define everything needed to generate a specific type of project. Each pack includes file templates, interview questions, dependency constraints, and validation logic.

**Key principle**: Packs **prevent invalid combinations before scaffolding** by encoding compatibility rules and validating answers against constraints.

---

## Pack Directory Structure

```
packs/{pack-id}/
├── pack.json               # Pack metadata and configuration
├── interview.json          # Interview questions for this pack
├── constraints.yml         # Compatibility rules and validation
├── defaults.json           # Default blueprint values
├── templates/              # File templates (Handlebars)
│   ├── pyproject.toml.hbs
│   ├── README.md.hbs
│   ├── AGENT.md.hbs
│   ├── src/
│   │   ├── main.py.hbs
│   │   ├── config.py.hbs
│   │   └── api/
│   │       └── routes.py.hbs
│   ├── tests/
│   │   └── test_main.py.hbs
│   ├── docker/
│   │   ├── Dockerfile.hbs
│   │   └── docker-compose.yml.hbs
│   └── ci/
│       └── github-actions.yml.hbs
├── verifier.js             # Dependency verification script
├── hooks/                  # Optional lifecycle hooks
│   ├── pre-render.js       # Run before rendering templates
│   └── post-render.js      # Run after files written
└── README.md               # Pack documentation
```

### File Purposes

| File | Required | Purpose |
|------|----------|---------|
| `pack.json` | ✅ | Pack metadata, version, supported features |
| `interview.json` | ✅ | Questions to ask users |
| `constraints.yml` | ✅ | Compatibility rules and validation |
| `defaults.json` | ✅ | Default blueprint values for this pack |
| `templates/` | ✅ | File templates with variable substitution |
| `verifier.js` | ⚠️ | Dependency verification (required if pack has deps) |
| `hooks/` | ❌ | Optional pre/post processing |
| `README.md` | ⚠️ | Pack documentation (recommended) |

---

## pack.json - Pack Metadata

```json
{
  "id": "python-api",
  "version": "1.0.0",
  "name": "Python API (FastAPI)",
  "description": "FastAPI-based REST API with modern Python tooling",
  "author": "Agentgen Team",
  "license": "MIT",

  "language": "python",
  "framework": "fastapi",

  "tags": ["api", "rest", "web", "async"],

  "requirements": {
    "agentgen": ">=0.1.0",
    "system": {
      "python": ">=3.10",
      "poetry": ">=1.5.0"
    }
  },

  "supports": {
    "databases": ["postgresql", "mysql", "sqlite", "none"],
    "orms": ["sqlalchemy", "tortoise", "none"],
    "authentication": ["jwt", "oauth2", "api-key", "none"],
    "testing": ["pytest", "unittest"],
    "ci": ["github-actions", "gitlab-ci", "circleci", "none"]
  },

  "features": {
    "database": {
      "default": true,
      "required": false
    },
    "docker": {
      "default": true,
      "required": false
    },
    "ci": {
      "default": true,
      "required": false
    }
  }
}
```

**Key fields:**
- `supports`: Lists all valid choices for each configurable aspect
- `features`: Default enablement and requirement flags
- `requirements.system`: Prerequisites that must be installed

---

## constraints.yml - Compatibility Rules

This file defines **validation rules** that prevent invalid combinations.

```yaml
version: "1.0"

# Dependency compatibility constraints
dependencies:
  # Python version constraints
  python:
    "3.10":
      compatible: ["fastapi@^0.104.0", "uvicorn@^0.24.0"]
      incompatible: ["pydantic@^1.0"]  # Too old
    "3.11":
      compatible: ["fastapi@^0.104.0", "uvicorn@^0.24.0", "pydantic@^2.0"]
    "3.12":
      compatible: ["fastapi@^0.104.0", "uvicorn@^0.24.0", "pydantic@^2.0"]
      # Note: Some packages may not support 3.12 yet

  # ORM + Database driver compatibility
  database_drivers:
    postgresql:
      sqlalchemy_sync: "psycopg2@^2.9"
      sqlalchemy_async: "asyncpg@^0.29"
      tortoise: "asyncpg@^0.29"
    mysql:
      sqlalchemy_sync: "mysqlclient@^2.2"
      sqlalchemy_async: "aiomysql@^0.2"
      tortoise: "aiomysql@^0.2"
    sqlite:
      sqlalchemy_sync: null  # Built into Python
      sqlalchemy_async: "aiosqlite@^0.19"
      tortoise: "aiosqlite@^0.19"

  # Framework version ranges
  framework:
    fastapi:
      min_version: "0.100.0"
      max_version: "1.0.0"
      requires: ["pydantic@^2.0", "uvicorn@^0.20"]

# Feature compatibility rules
feature_compatibility:
  # Database + ORM rules
  - name: "database_requires_orm"
    condition: "features.database.enabled === true && features.database.type !== 'none'"
    requires:
      - field: "features.database.orm"
        not_equal: "none"
    error: "Database is enabled but no ORM selected"

  # Async driver requires async ORM
  - name: "async_driver_requires_async_orm"
    condition: "features.database.async === true"
    requires:
      - field: "features.database.orm"
        one_of: ["sqlalchemy", "tortoise"]
      - field: "stack.dependencies"
        contains_key: "asyncpg|aiomysql|aiosqlite"
    error: "Async database driver requires async-capable ORM"

  # Migrations require specific ORM
  - name: "migrations_require_sqlalchemy"
    condition: "features.database.migrations === true"
    requires:
      - field: "features.database.orm"
        equals: "sqlalchemy"
    error: "Database migrations require SQLAlchemy (Alembic)"

  # JWT auth requires specific packages
  - name: "jwt_auth_requires_packages"
    condition: "features.authentication.enabled === true && features.authentication.method === 'jwt'"
    requires:
      - field: "stack.dependencies"
        contains_keys: ["python-jose", "passlib"]
    error: "JWT authentication requires python-jose and passlib"

  # OAuth2 incompatible with API key auth
  - name: "oauth2_and_apikey_conflict"
    condition: "features.authentication.method === 'oauth2'"
    conflicts:
      - field: "features.authentication.method"
        equals: "api-key"
    error: "Cannot use both OAuth2 and API key authentication"

  # Test coverage requires test framework
  - name: "coverage_requires_tests"
    condition: "tooling.testing.coverage === true"
    requires:
      - field: "tooling.testing.framework"
        not_equal: "none"
    error: "Test coverage requires a test framework"

  # Docker Compose requires Docker
  - name: "compose_requires_docker"
    condition: "infrastructure.docker.compose === true"
    requires:
      - field: "infrastructure.docker.enabled"
        equals: true
    error: "Docker Compose requires Docker to be enabled"

  # CI checks require CI provider
  - name: "ci_checks_require_provider"
    condition: "infrastructure.ci.checks.length > 0"
    requires:
      - field: "infrastructure.ci.provider"
        not_equal: "none"
    error: "CI checks specified but no CI provider selected"

# Version constraints
version_constraints:
  # Python version + dependency compatibility
  python_pydantic:
    - python: "3.10"
      pydantic: ">=1.10,<3.0"
    - python: "3.11"
      pydantic: ">=2.0,<3.0"
    - python: "3.12"
      pydantic: ">=2.5,<3.0"  # Requires newer Pydantic

  python_fastapi:
    - python: "3.10"
      fastapi: ">=0.100,<1.0"
    - python: "3.11"
      fastapi: ">=0.100,<1.0"
    - python: "3.12"
      fastapi: ">=0.104,<1.0"  # Requires newer FastAPI

# Mutually exclusive options
exclusions:
  - name: "single_orm"
    fields: ["features.database.orm"]
    max_selections: 1
    error: "Can only select one ORM"

  - name: "single_formatter"
    fields: ["tooling.formatter.tool"]
    max_selections: 1
    error: "Can only select one code formatter"

  - name: "single_package_manager"
    fields: ["stack.runtime.manager"]
    max_selections: 1
    error: "Can only select one package manager"

# Required combinations
required_together:
  - name: "alembic_requires_sqlalchemy"
    when: "stack.dependencies contains 'alembic'"
    requires: ["sqlalchemy"]
    error: "Alembic requires SQLAlchemy"

  - name: "asyncpg_requires_sqlalchemy"
    when: "stack.dependencies contains 'asyncpg'"
    requires: ["sqlalchemy|tortoise"]
    error: "asyncpg requires an async ORM (SQLAlchemy or Tortoise)"

# File inclusion rules
file_inclusion:
  # Database files
  - pattern: "src/db/**/*.hbs"
    condition: "features.database.enabled === true"

  - pattern: "alembic/**/*.hbs"
    condition: "features.database.migrations === true"

  # Auth files
  - pattern: "src/auth/**/*.hbs"
    condition: "features.authentication.enabled === true"

  # Docker files
  - pattern: "docker/**/*.hbs"
    condition: "infrastructure.docker.enabled === true"

  - pattern: "docker/docker-compose.yml.hbs"
    condition: "infrastructure.docker.compose === true"

  # CI files
  - pattern: "ci/**/*.hbs"
    condition: "infrastructure.ci.provider !== 'none'"

  - pattern: "ci/github-actions.yml.hbs"
    condition: "infrastructure.ci.provider === 'github-actions'"

  - pattern: "ci/gitlab-ci.yml.hbs"
    condition: "infrastructure.ci.provider === 'gitlab-ci'"

  # Config files based on tooling
  - pattern: ".ruff.toml.hbs"
    condition: "tooling.linter.tool === 'ruff' || tooling.formatter.tool === 'ruff'"

  - pattern: "mypy.ini.hbs"
    condition: "tooling.typeChecker.tool === 'mypy'"

  - pattern: "pytest.ini.hbs"
    condition: "tooling.testing.framework === 'pytest'"

# Dependency resolution order
resolution_order:
  - "language_version"    # Resolve Python/Node version first
  - "framework"           # Then framework
  - "database"            # Then database type
  - "database_driver"     # Then specific driver
  - "features"            # Then feature flags
  - "tooling"             # Finally tooling
```

---

## defaults.json - Default Blueprint Values

Provides default values for blueprint fields when pack is selected.

```json
{
  "project": {
    "license": "MIT"
  },
  "stack": {
    "language": "python",
    "framework": "fastapi",
    "runtime": {
      "version": ">=3.11,<4.0",
      "manager": "poetry"
    },
    "dependencies": {
      "fastapi": "^0.104.1",
      "uvicorn": "^0.24.0",
      "pydantic": "^2.5.0",
      "pydantic-settings": "^2.1.0"
    },
    "devDependencies": {
      "pytest": "^7.4.3",
      "pytest-asyncio": "^0.21.1"
    }
  },
  "features": {
    "database": {
      "enabled": false,
      "type": "none",
      "orm": "none",
      "migrations": false,
      "async": false
    },
    "authentication": {
      "enabled": false,
      "method": "none"
    },
    "cors": false,
    "rateLimiting": false,
    "openapi": true,
    "healthCheck": true
  },
  "tooling": {
    "linter": {
      "tool": "ruff",
      "configFile": "pyproject.toml"
    },
    "formatter": {
      "tool": "ruff",
      "configFile": "pyproject.toml"
    },
    "typeChecker": {
      "tool": "mypy",
      "configFile": "pyproject.toml"
    },
    "testing": {
      "framework": "pytest",
      "coverage": false,
      "coverageThreshold": 80
    }
  },
  "infrastructure": {
    "docker": {
      "enabled": true,
      "compose": false,
      "registry": "docker.io"
    },
    "ci": {
      "provider": "none",
      "checks": []
    },
    "deployment": {
      "target": "docker"
    }
  },
  "agent": {
    "strictness": "balanced",
    "testRequirements": "on-request",
    "allowedOperations": [
      "add-endpoint",
      "add-model",
      "add-test",
      "refactor-code"
    ],
    "prohibitedOperations": [
      "modify-auth-logic",
      "disable-type-checking"
    ],
    "customRules": []
  },
  "paths": {
    "sourceDir": "src",
    "testDir": "tests"
  }
}
```

**These defaults are merged** with user answers during blueprint construction.

---

## How Compatibility Enforcement Works

### 1. Validation Pipeline

```
User Answers (AnswerSet)
    ↓
[Answer Validation] ← interview/validator.ts
    ↓ (validated answers)
[Blueprint Construction] ← blueprint/builder.ts
    ↓ (draft blueprint)
[Constraint Checking] ← packs/validator.ts
    ↓ (load constraints.yml)
    ├─→ [Feature Compatibility]
    ├─→ [Dependency Compatibility]
    ├─→ [Version Constraints]
    ├─→ [Exclusions]
    └─→ [Required Together]
    ↓
[Dependency Resolution] ← verification/runner.ts
    ↓ (call verifier.js)
    ↓
[Valid Blueprint] ✓
```

### 2. When Validation Runs

**Stage 1: Answer Time** (During interview)
- Basic input validation (pattern, length, choices)
- Immediate feedback to user

**Stage 2: Blueprint Construction** (After interview)
- Load `constraints.yml` for selected pack
- Check feature compatibility rules
- Validate exclusions and required combinations
- **FAIL FAST** if constraints violated

**Stage 3: Dependency Verification** (Before rendering)
- Run pack's `verifier.js` script
- Use ecosystem tools (Poetry, npm) to check actual resolution
- Report conflicts with specific version details

### 3. Constraint Evaluation Engine

**Pseudocode:**

```typescript
function validateConstraints(blueprint: Blueprint, constraints: Constraints): ValidationResult {
  const errors: string[] = [];

  // Check feature compatibility
  for (const rule of constraints.feature_compatibility) {
    if (evaluateCondition(rule.condition, blueprint)) {
      // Condition met, check requirements
      for (const req of rule.requires) {
        if (!checkRequirement(req, blueprint)) {
          errors.push(rule.error);
        }
      }
      // Check conflicts
      for (const conflict of rule.conflicts || []) {
        if (checkRequirement(conflict, blueprint)) {
          errors.push(rule.error);
        }
      }
    }
  }

  // Check exclusions
  for (const exclusion of constraints.exclusions) {
    const selectedCount = countSelections(exclusion.fields, blueprint);
    if (selectedCount > exclusion.max_selections) {
      errors.push(exclusion.error);
    }
  }

  // Check required together
  for (const requirement of constraints.required_together) {
    if (evaluateCondition(requirement.when, blueprint)) {
      for (const dep of requirement.requires) {
        if (!hasDependency(blueprint, dep)) {
          errors.push(requirement.error);
        }
      }
    }
  }

  // Check version constraints
  const versionErrors = checkVersionConstraints(
    blueprint,
    constraints.version_constraints
  );
  errors.push(...versionErrors);

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 4. Dependency Verification (verifier.js)

Each pack provides a verifier script that uses ecosystem-native tools:

**Python Pack Example (`verifier.js`):**

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Verify Python dependencies using Poetry
 */
async function verifyPythonDependencies(blueprint) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-'));

  try {
    // Create temporary pyproject.toml
    const pyproject = generatePyprojectToml(blueprint);
    fs.writeFileSync(path.join(tempDir, 'pyproject.toml'), pyproject);

    // Try to lock dependencies (dry run)
    const result = execSync('poetry lock --no-update --dry-run', {
      cwd: tempDir,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    return {
      success: true,
      conflicts: [],
      warnings: []
    };

  } catch (error) {
    // Parse Poetry error output
    const conflicts = parsePoetryErrors(error.stderr);

    return {
      success: false,
      conflicts,
      warnings: []
    };

  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function generatePyprojectToml(blueprint) {
  const deps = blueprint.stack.dependencies;
  const devDeps = blueprint.stack.devDependencies;
  const pythonVersion = blueprint.stack.runtime.version;

  return `
[tool.poetry]
name = "temp-verify"
version = "0.1.0"
description = ""
authors = []

[tool.poetry.dependencies]
python = "${pythonVersion}"
${Object.entries(deps).map(([name, ver]) => `${name} = "${ver}"`).join('\n')}

[tool.poetry.group.dev.dependencies]
${Object.entries(devDeps).map(([name, ver]) => `${name} = "${ver}"`).join('\n')}

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
`.trim();
}

function parsePoetryErrors(stderr) {
  const conflicts = [];

  // Example Poetry error:
  // "Because no versions of foo match >2.0,<3.0 and bar depends on foo ^1.0, bar is forbidden."

  const lines = stderr.split('\n');
  for (const line of lines) {
    if (line.includes('depends on') || line.includes('requires')) {
      conflicts.push({
        message: line.trim(),
        packages: extractPackageNames(line)
      });
    }
  }

  return conflicts;
}

function extractPackageNames(errorLine) {
  // Simple regex to extract package names
  const matches = errorLine.match(/\b[a-z0-9-]+\b/g);
  return matches || [];
}

// CLI interface
if (require.main === module) {
  const blueprintPath = process.argv[2];
  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));

  verifyPythonDependencies(blueprint).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { verifyPythonDependencies };
```

**Node Pack Example (`verifier.js`):**

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Verify Node dependencies using npm/pnpm/yarn
 */
async function verifyNodeDependencies(blueprint) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentgen-verify-'));
  const manager = blueprint.stack.runtime.manager; // 'npm' | 'pnpm' | 'yarn'

  try {
    // Create temporary package.json
    const packageJson = generatePackageJson(blueprint);
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Dry run install
    let command;
    switch (manager) {
      case 'pnpm':
        command = 'pnpm install --lockfile-only';
        break;
      case 'yarn':
        command = 'yarn install --mode update-lockfile';
        break;
      default:
        command = 'npm install --package-lock-only';
    }

    execSync(command, {
      cwd: tempDir,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    // Check for peer dependency warnings
    const warnings = checkPeerDependencies(tempDir, manager);

    return {
      success: true,
      conflicts: [],
      warnings
    };

  } catch (error) {
    const conflicts = parseNpmErrors(error.stderr, manager);

    return {
      success: false,
      conflicts,
      warnings: []
    };

  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function generatePackageJson(blueprint) {
  return {
    name: 'temp-verify',
    version: '0.1.0',
    private: true,
    dependencies: blueprint.stack.dependencies,
    devDependencies: blueprint.stack.devDependencies,
    engines: {
      node: blueprint.stack.runtime.version
    }
  };
}

function parseNpmErrors(stderr, manager) {
  const conflicts = [];

  // npm error patterns vary by manager
  const lines = stderr.split('\n');

  for (const line of lines) {
    if (line.includes('ERESOLVE') || line.includes('conflict')) {
      conflicts.push({
        message: line.trim(),
        packages: extractPackageNames(line)
      });
    }
  }

  return conflicts;
}

function checkPeerDependencies(tempDir, manager) {
  // Read lockfile and check for unmet peer dependencies
  // Implementation depends on manager (npm, pnpm, yarn)
  return [];
}

function extractPackageNames(errorLine) {
  const matches = errorLine.match(/\b[@a-z0-9/-]+\b/g);
  return matches || [];
}

// CLI interface
if (require.main === module) {
  const blueprintPath = process.argv[2];
  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));

  verifyNodeDependencies(blueprint).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { verifyNodeDependencies };
```

---

## Example: Python API Pack

Complete pack structure with all files.

### Directory Structure

```
packs/python-api/
├── pack.json
├── interview.json
├── constraints.yml
├── defaults.json
├── verifier.js
├── templates/
│   ├── pyproject.toml.hbs
│   ├── README.md.hbs
│   ├── AGENT.md.hbs
│   ├── .env.example.hbs
│   ├── .gitignore.hbs
│   ├── src/
│   │   ├── __init__.py.hbs
│   │   ├── main.py.hbs
│   │   ├── config.py.hbs
│   │   ├── api/
│   │   │   ├── __init__.py.hbs
│   │   │   ├── routes.py.hbs
│   │   │   └── dependencies.py.hbs
│   │   ├── db/
│   │   │   ├── __init__.py.hbs
│   │   │   ├── session.py.hbs
│   │   │   └── models.py.hbs
│   │   └── auth/
│   │       ├── __init__.py.hbs
│   │       ├── jwt.py.hbs
│   │       └── dependencies.py.hbs
│   ├── alembic/
│   │   ├── env.py.hbs
│   │   ├── script.py.mako.hbs
│   │   └── versions/.gitkeep
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py.hbs
│   │   ├── test_main.py.hbs
│   │   └── test_api/
│   │       └── test_routes.py.hbs
│   ├── docker/
│   │   ├── Dockerfile.hbs
│   │   └── docker-compose.yml.hbs
│   └── .github/
│       └── workflows/
│           └── ci.yml.hbs
└── README.md
```

### Template Example: `templates/src/main.py.hbs`

```python
"""
{{ project.description }}
"""
from fastapi import FastAPI
{{#if features.cors}}
from fastapi.middleware.cors import CORSMiddleware
{{/if}}
{{#if features.database.enabled}}
from .db import models
from .db.session import engine
{{/if}}
{{#if features.authentication.enabled}}
from .auth import router as auth_router
{{/if}}
from .api import routes
from .config import settings

{{#if features.database.enabled}}
# Create database tables
models.Base.metadata.create_all(bind=engine)
{{/if}}

app = FastAPI(
    title="{{ project.name }}",
    description="{{ project.description }}",
    version="0.1.0",
    {{#unless features.openapi}}
    docs_url=None,
    redoc_url=None,
    {{/unless}}
)

{{#if features.cors}}
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
{{/if}}

{{#if features.rateLimiting}}
# Rate limiting middleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
{{/if}}

# Include routers
{{#if features.authentication.enabled}}
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
{{/if}}
app.include_router(routes.router, prefix="/api", tags=["api"])

{{#if features.healthCheck}}
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "{{ project.name }}",
        "version": "0.1.0"
    }
{{/if}}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to {{ project.name }}",
        "docs": "/docs" if {{ features.openapi }} else None
    }
```

### Template Example: `templates/AGENT.md.hbs`

```markdown
# AI Agent Guidelines for {{ project.name }}

<!-- agentgen:managed:start:metadata -->
**Generated**: {{ meta.generatedAt }}
**Pack**: {{ meta.packId }}@{{ meta.packVersion }}
**Agentgen**: {{ meta.agentgenVersion }}
<!-- agentgen:managed:end:metadata -->

## Project Overview

{{ project.description }}

**Stack**: {{ stack.framework }} ({{ stack.language }} {{ stack.runtime.version }})

<!-- agentgen:managed:start:dependencies -->
## Dependencies

### Core
{{#each stack.dependencies}}
- {{ @key }}@{{ this }}
{{/each}}

### Development
{{#each stack.devDependencies}}
- {{ @key }}@{{ this }}
{{/each}}
<!-- agentgen:managed:end:dependencies -->

<!-- agentgen:managed:start:features -->
## Enabled Features

{{#if features.database.enabled}}
- **Database**: {{ features.database.type }} with {{ features.database.orm }}
  {{#if features.database.async}}- Using async driver{{/if}}
  {{#if features.database.migrations}}- Migrations via Alembic{{/if}}
{{/if}}

{{#if features.authentication.enabled}}
- **Authentication**: {{ features.authentication.method }}
{{/if}}

{{#if features.cors}}
- **CORS**: Enabled
{{/if}}

{{#if features.rateLimiting}}
- **Rate Limiting**: Enabled
{{/if}}

{{#if features.openapi}}
- **OpenAPI Docs**: Available at /docs
{{/if}}

{{#if features.healthCheck}}
- **Health Check**: Available at /health
{{/if}}
<!-- agentgen:managed:end:features -->

<!-- agentgen:managed:start:tooling -->
## Development Tooling

- **Linter**: {{ tooling.linter.tool }}
- **Formatter**: {{ tooling.formatter.tool }}
{{#if tooling.typeChecker.tool}}
- **Type Checker**: {{ tooling.typeChecker.tool }}
{{/if}}
- **Tests**: {{ tooling.testing.framework }}
{{#if tooling.testing.coverage}}
  - Coverage threshold: {{ tooling.testing.coverageThreshold }}%
{{/if}}
<!-- agentgen:managed:end:tooling -->

<!-- agentgen:managed:start:infrastructure -->
## Infrastructure

{{#if infrastructure.docker.enabled}}
- **Docker**: Enabled
{{#if infrastructure.docker.compose}}
  - Docker Compose for local development
{{/if}}
{{/if}}

{{#if infrastructure.ci.provider}}
{{#unless (eq infrastructure.ci.provider 'none')}}
- **CI/CD**: {{ infrastructure.ci.provider }}
  - Checks: {{ join infrastructure.ci.checks ', ' }}
{{/unless}}
{{/if}}

- **Deployment Target**: {{ infrastructure.deployment.target }}
<!-- agentgen:managed:end:infrastructure -->

<!-- agentgen:managed:start:agent-rules -->
## AI Agent Rules

### Strictness Level: {{ titleCase agent.strictness }}

{{#if (eq agent.strictness 'strict')}}
The AI agent must ask for approval before making any significant changes. It should be conservative and explicit about proposed modifications.
{{else if (eq agent.strictness 'balanced')}}
The AI agent has moderate autonomy. It can make reasonable technical decisions but should ask before major architectural changes or potentially breaking modifications.
{{else}}
The AI agent has broad autonomy. It can make technical decisions independently, though it should still communicate changes clearly.
{{/if}}

### Test Requirements: {{ titleCase agent.testRequirements }}

{{#if (eq agent.testRequirements 'always')}}
When adding new features or endpoints, the agent **MUST** write corresponding tests. Code without tests should not be considered complete.
{{else if (eq agent.testRequirements 'on-request')}}
The agent should write tests when explicitly requested or when making critical changes to authentication, data persistence, or core business logic.
{{else}}
Tests are optional. The agent may write tests at its discretion.
{{/if}}

### Allowed Operations

{{#each agent.allowedOperations}}
- {{ this }}
{{/each}}

### Prohibited Operations

{{#each agent.prohibitedOperations}}
- {{ this }}
{{/each}}

{{#if agent.customRules}}
### Custom Rules

{{#each agent.customRules}}
{{ add @index 1 }}. {{ this }}
{{/each}}
{{/if}}
<!-- agentgen:managed:end:agent-rules -->

---

## Custom Project Notes

<!-- Add project-specific guidance below. This section will NOT be overwritten. -->

### Architecture Notes

(Add notes about your specific architecture decisions)

### Known Issues

(Document any known issues or workarounds)

### Development Workflow

(Describe your team's development workflow, branching strategy, etc.)
```

---

## Example: Node API Pack

Abbreviated structure showing key differences.

### Key Files

**pack.json**:
```json
{
  "id": "node-api",
  "version": "1.0.0",
  "name": "Node API (Express + TypeScript)",
  "language": "typescript",
  "framework": "express",
  "requirements": {
    "system": {
      "node": ">=18.0.0",
      "npm": ">=9.0.0"
    }
  },
  "supports": {
    "databases": ["postgresql", "mysql", "mongodb", "sqlite", "none"],
    "orms": ["prisma", "typeorm", "sequelize", "none"],
    "packageManagers": ["npm", "pnpm", "yarn"]
  }
}
```

**constraints.yml** (excerpt):
```yaml
feature_compatibility:
  - name: "prisma_migrations_built_in"
    condition: "features.database.orm === 'prisma'"
    sets:
      - field: "features.database.migrations"
        value: true
    note: "Prisma includes migrations by default"

  - name: "mongodb_requires_compatible_orm"
    condition: "features.database.type === 'mongodb'"
    requires:
      - field: "features.database.orm"
        one_of: ["mongoose", "typeorm", "prisma"]
    error: "MongoDB requires Mongoose, TypeORM, or Prisma"
```

**templates/src/index.ts.hbs**:
```typescript
import express from 'express';
{{#if features.cors}}
import cors from 'cors';
{{/if}}
{{#if features.rateLimiting}}
import rateLimit from 'express-rate-limit';
{{/if}}
import helmet from 'helmet';
{{#if features.database.enabled}}
import { {{ features.database.orm }}Client } from './db/client';
{{/if}}
import { config } from './config';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());

{{#if features.cors}}
// CORS
app.use(cors(config.cors));
{{/if}}

{{#if features.rateLimiting}}
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
{{/if}}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

{{#if features.healthCheck}}
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '{{ project.name }}',
    timestamp: new Date().toISOString()
  });
});
{{/if}}

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`{{ project.name }} listening on port ${PORT}`);
});
```

---

## File Inclusion Logic

Templates are conditionally included based on `file_inclusion` rules in `constraints.yml`.

**Implementation**:

```typescript
function getTemplateFiles(pack: Pack, blueprint: Blueprint): string[] {
  const allTemplates = listTemplatesInPack(pack);
  const included: string[] = [];

  for (const templatePath of allTemplates) {
    // Check if this template should be included
    const inclusionRule = pack.constraints.file_inclusion.find(
      rule => matchesPattern(templatePath, rule.pattern)
    );

    if (inclusionRule) {
      // Evaluate condition
      if (evaluateCondition(inclusionRule.condition, blueprint)) {
        included.push(templatePath);
      }
    } else {
      // No rule = always include
      included.push(templatePath);
    }
  }

  return included;
}
```

**Example logic**:
- User selects `database: "none"` → Skip `src/db/**/*.hbs` templates
- User selects `ci_provider: "none"` → Skip all `.github/workflows/*.hbs`
- User enables `docker.compose: true` → Include `docker-compose.yml.hbs`

---

## Validation Error Messages

When constraints are violated, users see clear error messages:

```
✗ Blueprint validation failed

Error: Async database driver requires async-capable ORM
  → You selected async_driver: true
  → But features.database.orm is set to: "none"
  → Valid options: sqlalchemy, tortoise

Error: Database migrations require SQLAlchemy
  → You enabled features.database.migrations: true
  → But features.database.orm is: "tortoise"
  → Change ORM to "sqlalchemy" or disable migrations

Error: JWT authentication requires python-jose and passlib
  → You selected auth_method: "jwt"
  → Missing dependencies: python-jose, passlib
  → These will be added automatically

Fix these issues and try again.
```

---

## Summary

### Pack Ownership

Each pack owns:
1. **File templates** - What files to generate
2. **Inclusion rules** - When to include each file
3. **Dependency constraints** - What versions are compatible
4. **Feature validation** - What combinations are allowed
5. **Verification logic** - How to check actual resolution

### Invalid Combination Prevention

**Three layers of protection**:

1. **Constraint rules** (`constraints.yml`) - Declarative logic prevents impossible combinations
2. **Dependency verification** (`verifier.js`) - Ecosystem tools check actual resolution
3. **Clear error messages** - Users know exactly what's wrong and how to fix it

### Benefits

✅ **Deterministic** - Same answers = same valid project
✅ **Fast feedback** - Errors caught before any files written
✅ **Ecosystem-native** - Uses Poetry/npm/pnpm for real verification
✅ **Extensible** - Easy to add new packs with their own rules
✅ **Transparent** - Constraints are data (YAML), not buried in code
