# Blueprint Schema & Interview Flow

## Overview

This document defines:
1. **Interview flow**: Adaptive questionnaire that collects project requirements
2. **Blueprint schema**: Deterministic, serializable representation of project configuration
3. **Examples**: Real-world interview flow and completed blueprint

---

## Interview Flow Design

### Principles

1. **Adaptive**: Questions branch based on previous answers
2. **Declarative**: Interview defined in JSON, not hardcoded
3. **Validating**: Answer constraints enforced at input time
4. **Progressive**: Start broad (language), get specific (tooling)
5. **Skippable**: Conditional questions only asked when relevant

### Interview Definition Format

```json
{
  "version": "1.0",
  "questions": [
    {
      "id": "project_name",
      "type": "text",
      "prompt": "Project name",
      "default": "my-project",
      "validate": {
        "pattern": "^[a-z0-9-]+$",
        "message": "Lowercase letters, numbers, and hyphens only"
      }
    },
    {
      "id": "use_docker",
      "type": "confirm",
      "prompt": "Include Docker support?",
      "default": true
    },
    {
      "id": "docker_registry",
      "type": "text",
      "prompt": "Docker registry",
      "default": "docker.io",
      "when": "answers.use_docker === true"
    }
  ]
}
```

### Question Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Free-form text input | Project name, author email |
| `select` | Single choice from list | Python version (3.10, 3.11, 3.12) |
| `multiselect` | Multiple choices | Features to enable |
| `confirm` | Yes/no boolean | Include Docker? |
| `number` | Numeric input | Port number |

### Conditional Logic

Questions can have a `when` field with a JavaScript expression:

```json
{
  "id": "postgres_version",
  "type": "select",
  "prompt": "PostgreSQL version",
  "choices": ["14", "15", "16"],
  "when": "answers.database === 'postgresql'"
}
```

**Supported expressions:**
- `answers.field === value` - Equality check
- `answers.field !== value` - Inequality
- `answers.array.includes(value)` - Array contains
- `answers.field && answers.other` - Logical AND
- `answers.field || answers.other` - Logical OR

### Validation

Validators run when user submits an answer:

```json
{
  "validate": {
    "pattern": "^[0-9]+$",
    "message": "Must be a number"
  }
}
```

**Built-in validators:**
- `pattern`: Regex pattern
- `minLength`, `maxLength`: String length
- `min`, `max`: Numeric range
- `oneOf`: Value must be in list
- `custom`: Reference to custom validator function (in pack)

---

## Example Interview Flow: Python API Pack

```json
{
  "version": "1.0",
  "pack": "python-api",
  "questions": [
    {
      "id": "project_name",
      "type": "text",
      "prompt": "Project name",
      "default": "my-api",
      "validate": {
        "pattern": "^[a-z0-9-]+$",
        "message": "Lowercase letters, numbers, and hyphens only"
      }
    },
    {
      "id": "description",
      "type": "text",
      "prompt": "Project description",
      "default": "A FastAPI application"
    },
    {
      "id": "author",
      "type": "text",
      "prompt": "Author name",
      "default": ""
    },
    {
      "id": "python_version",
      "type": "select",
      "prompt": "Python version",
      "choices": ["3.10", "3.11", "3.12"],
      "default": "3.11"
    },
    {
      "id": "package_manager",
      "type": "select",
      "prompt": "Package manager",
      "choices": ["poetry", "pip-tools"],
      "default": "poetry"
    },
    {
      "id": "database",
      "type": "select",
      "prompt": "Database",
      "choices": ["none", "postgresql", "mysql", "sqlite"],
      "default": "postgresql"
    },
    {
      "id": "orm",
      "type": "select",
      "prompt": "ORM/database library",
      "choices": ["sqlalchemy", "tortoise", "none"],
      "default": "sqlalchemy",
      "when": "answers.database !== 'none'"
    },
    {
      "id": "async_driver",
      "type": "confirm",
      "prompt": "Use async database driver?",
      "default": true,
      "when": "answers.database !== 'none' && answers.orm === 'sqlalchemy'"
    },
    {
      "id": "migrations",
      "type": "confirm",
      "prompt": "Include database migrations (Alembic)?",
      "default": true,
      "when": "answers.database !== 'none' && answers.orm === 'sqlalchemy'"
    },
    {
      "id": "features",
      "type": "multiselect",
      "prompt": "Additional features (space to select, enter to continue)",
      "choices": [
        "authentication",
        "cors",
        "rate-limiting",
        "openapi-docs",
        "health-check"
      ],
      "default": ["openapi-docs", "health-check"]
    },
    {
      "id": "auth_method",
      "type": "select",
      "prompt": "Authentication method",
      "choices": ["jwt", "oauth2", "api-key"],
      "default": "jwt",
      "when": "answers.features.includes('authentication')"
    },
    {
      "id": "linter",
      "type": "select",
      "prompt": "Linter",
      "choices": ["ruff", "pylint", "flake8", "none"],
      "default": "ruff"
    },
    {
      "id": "formatter",
      "type": "select",
      "prompt": "Code formatter",
      "choices": ["ruff", "black", "none"],
      "default": "ruff"
    },
    {
      "id": "type_checker",
      "type": "select",
      "prompt": "Type checker",
      "choices": ["mypy", "pyright", "none"],
      "default": "mypy"
    },
    {
      "id": "test_framework",
      "type": "select",
      "prompt": "Test framework",
      "choices": ["pytest", "unittest", "none"],
      "default": "pytest"
    },
    {
      "id": "test_coverage",
      "type": "confirm",
      "prompt": "Include test coverage reporting?",
      "default": true,
      "when": "answers.test_framework !== 'none'"
    },
    {
      "id": "use_docker",
      "type": "confirm",
      "prompt": "Include Docker support?",
      "default": true
    },
    {
      "id": "docker_compose",
      "type": "confirm",
      "prompt": "Include docker-compose for local development?",
      "default": true,
      "when": "answers.use_docker === true && answers.database !== 'none'"
    },
    {
      "id": "ci_provider",
      "type": "select",
      "prompt": "CI/CD provider",
      "choices": ["github-actions", "gitlab-ci", "circleci", "none"],
      "default": "github-actions"
    },
    {
      "id": "ci_checks",
      "type": "multiselect",
      "prompt": "CI checks to run",
      "choices": ["lint", "type-check", "test", "security-scan"],
      "default": ["lint", "type-check", "test"],
      "when": "answers.ci_provider !== 'none'"
    },
    {
      "id": "deploy_target",
      "type": "select",
      "prompt": "Deployment target (for docs only)",
      "choices": ["kubernetes", "docker", "serverless", "vps", "other"],
      "default": "docker"
    },
    {
      "id": "agent_strictness",
      "type": "select",
      "prompt": "AI agent strictness level",
      "choices": ["strict", "balanced", "permissive"],
      "default": "balanced",
      "help": "Strict: Agent must ask before major changes. Balanced: Agent can make reasonable decisions. Permissive: Agent has broad autonomy."
    },
    {
      "id": "agent_test_requirements",
      "type": "select",
      "prompt": "Agent test requirements",
      "choices": ["always", "on-request", "never"],
      "default": "always",
      "help": "Whether AI agents should write tests for new features"
    }
  ]
}
```

### Interview Flow Execution

```
1. project_name: "payment-api"
   ↓
2. description: "Payment processing API"
   ↓
3. author: "Jane Developer"
   ↓
4. python_version: "3.11"
   ↓
5. package_manager: "poetry"
   ↓
6. database: "postgresql"
   ↓
7. orm: "sqlalchemy" (shown because database !== 'none')
   ↓
8. async_driver: true (shown because orm === 'sqlalchemy')
   ↓
9. migrations: true (shown because orm === 'sqlalchemy')
   ↓
10. features: ["authentication", "cors", "openapi-docs"]
    ↓
11. auth_method: "jwt" (shown because 'authentication' in features)
    ↓
12. linter: "ruff"
    ↓
... (continues)
```

---

## Blueprint Schema

### Schema Version 1.0

The blueprint is a JSON object that captures all project configuration. It is:
- **Deterministic**: Same blueprint always produces same output
- **Serializable**: Valid JSON, can be saved and loaded
- **Diffable**: Can use standard JSON diff tools
- **Versionable**: Includes schema version for migration

### JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "meta", "project", "stack", "tooling", "agent"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Blueprint schema version",
      "pattern": "^\\d+\\.\\d+$"
    },
    "meta": {
      "type": "object",
      "required": ["packId", "packVersion", "generatedAt"],
      "properties": {
        "packId": {
          "type": "string",
          "description": "Template pack identifier"
        },
        "packVersion": {
          "type": "string",
          "description": "Template pack version (semver)"
        },
        "generatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp"
        },
        "agentgenVersion": {
          "type": "string",
          "description": "Version of agentgen that created this"
        }
      }
    },
    "project": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "description": {
          "type": "string"
        },
        "author": {
          "type": "string"
        },
        "license": {
          "type": "string"
        },
        "repository": {
          "type": "string",
          "format": "uri"
        }
      }
    },
    "stack": {
      "type": "object",
      "required": ["language", "framework", "runtime"],
      "properties": {
        "language": {
          "type": "string",
          "enum": ["python", "javascript", "typescript", "go", "rust"]
        },
        "framework": {
          "type": "string"
        },
        "runtime": {
          "type": "object",
          "properties": {
            "version": {
              "type": "string",
              "description": "Runtime version constraint (e.g., >=3.11,<4.0)"
            },
            "manager": {
              "type": "string",
              "description": "Package manager (e.g., poetry, npm, cargo)"
            }
          }
        },
        "dependencies": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "description": "Main dependencies with version constraints"
        },
        "devDependencies": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "description": "Development dependencies"
        }
      }
    },
    "features": {
      "type": "object",
      "description": "Feature flags and configuration",
      "properties": {
        "database": {
          "type": "object",
          "properties": {
            "enabled": {"type": "boolean"},
            "type": {"type": "string"},
            "orm": {"type": "string"},
            "migrations": {"type": "boolean"},
            "async": {"type": "boolean"}
          }
        },
        "authentication": {
          "type": "object",
          "properties": {
            "enabled": {"type": "boolean"},
            "method": {"type": "string"}
          }
        },
        "cors": {"type": "boolean"},
        "rateLimiting": {"type": "boolean"},
        "openapi": {"type": "boolean"},
        "healthCheck": {"type": "boolean"}
      }
    },
    "tooling": {
      "type": "object",
      "properties": {
        "linter": {
          "type": "object",
          "properties": {
            "tool": {"type": "string"},
            "configFile": {"type": "string"}
          }
        },
        "formatter": {
          "type": "object",
          "properties": {
            "tool": {"type": "string"},
            "configFile": {"type": "string"}
          }
        },
        "typeChecker": {
          "type": "object",
          "properties": {
            "tool": {"type": "string"},
            "configFile": {"type": "string"}
          }
        },
        "testing": {
          "type": "object",
          "properties": {
            "framework": {"type": "string"},
            "coverage": {"type": "boolean"},
            "coverageThreshold": {"type": "number"}
          }
        }
      }
    },
    "infrastructure": {
      "type": "object",
      "properties": {
        "docker": {
          "type": "object",
          "properties": {
            "enabled": {"type": "boolean"},
            "compose": {"type": "boolean"},
            "registry": {"type": "string"}
          }
        },
        "ci": {
          "type": "object",
          "properties": {
            "provider": {"type": "string"},
            "checks": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        },
        "deployment": {
          "type": "object",
          "properties": {
            "target": {"type": "string"}
          }
        }
      }
    },
    "agent": {
      "type": "object",
      "required": ["strictness"],
      "properties": {
        "strictness": {
          "type": "string",
          "enum": ["strict", "balanced", "permissive"],
          "description": "How much autonomy the AI agent has"
        },
        "testRequirements": {
          "type": "string",
          "enum": ["always", "on-request", "never"],
          "description": "When agent should write tests"
        },
        "allowedOperations": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Specific operations agent is allowed to perform"
        },
        "prohibitedOperations": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Operations agent must never perform"
        },
        "customRules": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Project-specific rules for AI agents"
        }
      }
    },
    "paths": {
      "type": "object",
      "properties": {
        "outputDir": {
          "type": "string",
          "description": "Where to generate the project"
        },
        "sourceDir": {
          "type": "string",
          "description": "Source code directory (relative to output)"
        },
        "testDir": {
          "type": "string",
          "description": "Test directory (relative to output)"
        }
      }
    }
  }
}
```

---

## Example Completed Blueprint

### Python API with PostgreSQL, JWT Auth, Docker, GitHub Actions

```json
{
  "version": "1.0",
  "meta": {
    "packId": "python-api",
    "packVersion": "1.0.0",
    "generatedAt": "2025-01-06T10:30:00Z",
    "agentgenVersion": "0.1.0"
  },
  "project": {
    "name": "payment-api",
    "description": "Payment processing API with FastAPI",
    "author": "Jane Developer",
    "license": "MIT",
    "repository": ""
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
      "pydantic-settings": "^2.1.0",
      "sqlalchemy": "^2.0.23",
      "asyncpg": "^0.29.0",
      "alembic": "^1.13.0",
      "python-jose": "^3.3.0",
      "passlib": "^1.7.4",
      "python-multipart": "^0.0.6",
      "fastapi-cors": "^0.0.6"
    },
    "devDependencies": {
      "pytest": "^7.4.3",
      "pytest-asyncio": "^0.21.1",
      "pytest-cov": "^4.1.0",
      "httpx": "^0.25.2",
      "ruff": "^0.1.8",
      "mypy": "^1.7.1"
    }
  },
  "features": {
    "database": {
      "enabled": true,
      "type": "postgresql",
      "orm": "sqlalchemy",
      "migrations": true,
      "async": true
    },
    "authentication": {
      "enabled": true,
      "method": "jwt"
    },
    "cors": true,
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
      "coverage": true,
      "coverageThreshold": 80
    }
  },
  "infrastructure": {
    "docker": {
      "enabled": true,
      "compose": true,
      "registry": "docker.io"
    },
    "ci": {
      "provider": "github-actions",
      "checks": ["lint", "type-check", "test", "security-scan"]
    },
    "deployment": {
      "target": "kubernetes"
    }
  },
  "agent": {
    "strictness": "balanced",
    "testRequirements": "always",
    "allowedOperations": [
      "add-endpoint",
      "add-model",
      "add-test",
      "refactor-code",
      "update-dependencies"
    ],
    "prohibitedOperations": [
      "modify-auth-logic",
      "change-database-schema-without-migration",
      "disable-type-checking"
    ],
    "customRules": [
      "All database operations must use async SQLAlchemy",
      "All endpoints must have corresponding tests",
      "Never commit secrets or credentials",
      "Follow REST API naming conventions",
      "Use Pydantic models for request/response validation"
    ]
  },
  "paths": {
    "outputDir": "./payment-api",
    "sourceDir": "src",
    "testDir": "tests"
  }
}
```

---

## Interview Engine Behavior

### Question Resolution Order

1. **Load interview definition** from pack
2. **Filter questions** by `when` conditions
3. **Present question** to user
4. **Validate answer** against constraints
5. **Store answer** in AnswerSet
6. **Re-evaluate conditions** for remaining questions
7. **Repeat** until all applicable questions answered

### Answer Storage

Answers are stored in a flat key-value object during the interview:

```typescript
type AnswerSet = {
  project_name: string;
  python_version: string;
  database: string;
  features: string[];  // multiselect results
  // ... etc
};
```

### Blueprint Construction

After interview completes, the `BlueprintBuilder` transforms `AnswerSet` into a `Blueprint`:

```typescript
function buildBlueprint(answers: AnswerSet, pack: Pack): Blueprint {
  // 1. Start with pack defaults
  const blueprint = pack.defaultBlueprint;

  // 2. Map answers to blueprint fields
  blueprint.project.name = answers.project_name;
  blueprint.stack.runtime.version = mapPythonVersion(answers.python_version);

  // 3. Resolve dependencies
  blueprint.stack.dependencies = resolveDependencies(answers, pack);

  // 4. Apply feature flags
  blueprint.features.database.enabled = answers.database !== 'none';
  blueprint.features.database.type = answers.database;

  // 5. Validate completeness
  validateBlueprint(blueprint);

  return blueprint;
}
```

### Dependency Resolution

Pack provides dependency mapping:

```typescript
// In pack's blueprint builder
function resolveDependencies(answers: AnswerSet): DependencyMap {
  const deps: DependencyMap = {
    fastapi: '^0.104.1',
    uvicorn: '^0.24.0',
  };

  if (answers.database === 'postgresql') {
    deps.sqlalchemy = '^2.0.23';
    if (answers.async_driver) {
      deps.asyncpg = '^0.29.0';
    } else {
      deps.psycopg2 = '^2.9.9';
    }
  }

  if (answers.features.includes('authentication')) {
    if (answers.auth_method === 'jwt') {
      deps['python-jose'] = '^3.3.0';
      deps['passlib'] = '^1.7.4';
    }
  }

  return deps;
}
```

---

## Blueprint Diffing

Blueprints can be compared to see what changed:

```bash
# Generate blueprint A
agentgen init --blueprint-only --output blueprint-v1.json

# Make different choices
agentgen init --blueprint-only --output blueprint-v2.json

# Diff them
diff -u blueprint-v1.json blueprint-v2.json
```

Example diff output:
```diff
--- blueprint-v1.json
+++ blueprint-v2.json
@@ -15,7 +15,7 @@
   "stack": {
     "language": "python",
     "framework": "fastapi",
-    "runtime": {"version": ">=3.10,<4.0"},
+    "runtime": {"version": ">=3.11,<4.0"},
     "dependencies": {
       "fastapi": "^0.104.1",
-      "sqlalchemy": "^1.4.0"
+      "sqlalchemy": "^2.0.23"
     }
   }
```

---

## Blueprint Versioning

The `version` field enables schema evolution:

```typescript
function loadBlueprint(data: any): Blueprint {
  const version = data.version;

  if (version === '1.0') {
    return data as Blueprint;
  } else if (version === '0.9') {
    // Migrate from old schema
    return migrateBlueprintFrom0_9(data);
  } else {
    throw new Error(`Unsupported blueprint version: ${version}`);
  }
}
```

---

## Agent Behavior Rules

The `agent` section in the blueprint feeds directly into `AGENT.md`:

```markdown
<!-- agentgen:managed:start:agent-rules -->
## AI Agent Guidelines

### Strictness Level: Balanced
The AI agent has moderate autonomy. It can make reasonable technical decisions
but should ask before major architectural changes.

### Test Requirements: Always
When adding new features, the agent MUST write corresponding tests.

### Allowed Operations
- Add new API endpoints
- Add database models
- Add tests
- Refactor existing code
- Update dependencies (within semver constraints)

### Prohibited Operations
- Modify authentication logic without explicit approval
- Change database schema without creating a migration
- Disable type checking or linting
- Commit secrets or credentials

### Custom Rules
1. All database operations must use async SQLAlchemy
2. All endpoints must have corresponding tests
3. Never commit secrets or credentials
4. Follow REST API naming conventions
5. Use Pydantic models for request/response validation
<!-- agentgen:managed:end:agent-rules -->
```

---

## Validation

### Answer Validation (at input time)

```typescript
function validateAnswer(question: Question, answer: any): boolean | string {
  if (question.validate?.pattern) {
    const regex = new RegExp(question.validate.pattern);
    if (!regex.test(answer)) {
      return question.validate.message || 'Invalid format';
    }
  }

  if (question.validate?.minLength) {
    if (answer.length < question.validate.minLength) {
      return `Minimum length: ${question.validate.minLength}`;
    }
  }

  // Custom validators from pack
  if (question.validate?.custom) {
    return pack.validators[question.validate.custom](answer);
  }

  return true;
}
```

### Blueprint Validation (after construction)

```typescript
function validateBlueprint(blueprint: Blueprint): void {
  // Required fields present
  if (!blueprint.project.name) {
    throw new Error('project.name is required');
  }

  // Version constraints valid
  for (const [dep, version] of Object.entries(blueprint.stack.dependencies)) {
    if (!isValidSemver(version)) {
      throw new Error(`Invalid version constraint for ${dep}: ${version}`);
    }
  }

  // Feature consistency
  if (blueprint.features.database.migrations && !blueprint.features.database.enabled) {
    throw new Error('Cannot enable migrations without database');
  }

  // Agent rules valid
  if (!['strict', 'balanced', 'permissive'].includes(blueprint.agent.strictness)) {
    throw new Error(`Invalid agent strictness: ${blueprint.agent.strictness}`);
  }
}
```

---

## Summary

### Interview Flow
- **Declarative** questions defined in JSON per pack
- **Adaptive** questions shown/hidden based on previous answers
- **Validated** at input time to prevent invalid states
- **Progressive** from broad (language) to specific (tooling)

### Blueprint Schema
- **Complete** captures all project configuration
- **Deterministic** same blueprint = same output
- **Serializable** valid JSON, saveable, loadable
- **Diffable** can compare with standard tools
- **Versioned** schema can evolve over time

### Key Benefits
1. **Reproducibility**: Save blueprint, regenerate project anytime
2. **Transparency**: See exactly what will be generated before files are written
3. **Debugging**: Compare blueprints to understand differences
4. **Testing**: Easy to create fixture blueprints for tests
5. **Documentation**: Blueprint serves as project manifest

---

## Next Steps

1. Implement `interview/engine.ts` based on this spec
2. Implement `blueprint/builder.ts` to transform AnswerSet → Blueprint
3. Create JSON Schema validator for blueprint validation
4. Build example packs (python-api, node-api) with interview definitions
5. Add blueprint serialization/deserialization utilities
