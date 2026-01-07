# Interview Engine Example

## Interview Definition

From `packs/python-api/interview.json`:

```json
{
  "version": "1.0",
  "questions": [
    {
      "id": "projectName",
      "type": "text",
      "message": "Project name",
      "default": "my-api",
      "validate": "required"
    },
    {
      "id": "description",
      "type": "text",
      "message": "Project description",
      "default": "A FastAPI application"
    },
    {
      "id": "pythonVersion",
      "type": "select",
      "message": "Python version",
      "default": "3.11",
      "choices": [
        {"name": "Python 3.10", "value": "3.10"},
        {"name": "Python 3.11", "value": "3.11"},
        {"name": "Python 3.12", "value": "3.12"}
      ]
    },
    {
      "id": "enableDatabase",
      "type": "confirm",
      "message": "Enable database support?",
      "default": false
    },
    {
      "id": "databaseType",
      "type": "select",
      "message": "Database type",
      "default": "postgresql",
      "choices": [
        {"name": "PostgreSQL", "value": "postgresql"},
        {"name": "MySQL", "value": "mysql"},
        {"name": "SQLite", "value": "sqlite"}
      ],
      "when": {
        "field": "enableDatabase",
        "equals": true
      }
    },
    {
      "id": "enableAuth",
      "type": "confirm",
      "message": "Enable authentication?",
      "default": false
    },
    {
      "id": "authMethod",
      "type": "select",
      "message": "Authentication method",
      "default": "jwt",
      "choices": [
        {"name": "JWT (JSON Web Tokens)", "value": "jwt"},
        {"name": "OAuth2", "value": "oauth2"},
        {"name": "API Key", "value": "api-key"}
      ],
      "when": {
        "field": "enableAuth",
        "equals": true
      }
    },
    {
      "id": "enableDocker",
      "type": "confirm",
      "message": "Include Docker configuration?",
      "default": false
    },
    {
      "id": "enableCI",
      "type": "confirm",
      "message": "Include CI/CD configuration?",
      "default": false
    },
    {
      "id": "ciProvider",
      "type": "select",
      "message": "CI/CD provider",
      "default": "github-actions",
      "choices": [
        {"name": "GitHub Actions", "value": "github-actions"},
        {"name": "GitLab CI", "value": "gitlab-ci"},
        {"name": "CircleCI", "value": "circleci"}
      ],
      "when": {
        "field": "enableCI",
        "equals": true
      }
    }
  ]
}
```

## Interactive Session Example

```
$ agentgen new ./my-auth-api --pack python-api

🚀 Agentgen - Generate New Project

✔ Loaded pack 'Python API (FastAPI)' v1.0.0

ℹ Starting interactive interview...

? Project name (my-api) my-auth-api
? Project description (A FastAPI application) User authentication API with JWT
? Author name (optional) Jane Developer
? Python version › Python 3.11
? Enable database support? (y/N) y
? Database type › PostgreSQL
? Enable authentication? (y/N) y
? Authentication method › JWT (JSON Web Tokens)
? Include Docker configuration? (y/N) y
? Include CI/CD configuration? (y/N) y
? CI/CD provider › GitHub Actions

ℹ Building project blueprint...
✓ Blueprint created
✓ Wrote project.blueprint.json
✔ Rendered 6 files
✔ Wrote 6 files

✓ Project 'my-auth-api' created successfully!

Next steps:

  1. cd my-auth-api
  2. poetry install
  3. poetry run uvicorn src.main:app --reload
```

## Collected AnswerSet

```json
{
  "projectName": "my-auth-api",
  "description": "User authentication API with JWT",
  "author": "Jane Developer",
  "pythonVersion": "3.11",
  "enableDatabase": true,
  "databaseType": "postgresql",
  "enableAuth": true,
  "authMethod": "jwt",
  "enableDocker": true,
  "enableCI": true,
  "ciProvider": "github-actions"
}
```

## Generated Blueprint

```json
{
  "version": "1.0",
  "meta": {
    "packId": "python-api",
    "packVersion": "1.0.0",
    "generatedAt": "2026-01-07T01:00:00.000Z",
    "agentgenVersion": "0.1.0"
  },
  "project": {
    "name": "my-auth-api",
    "description": "User authentication API with JWT",
    "author": "Jane Developer",
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
      "sqlalchemy": "^2.0.23",
      "asyncpg": "^0.29.0",
      "python-jose": "^3.3.0",
      "passlib": "^1.7.4"
    },
    "devDependencies": {
      "pytest": "^7.4.3",
      "httpx": "^0.25.2",
      "ruff": "^0.1.8"
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
      "compose": true,
      "registry": "docker.io"
    },
    "ci": {
      "provider": "github-actions",
      "checks": ["lint", "typecheck", "test"]
    },
    "deployment": {
      "target": "docker"
    }
  },
  "agent": {
    "strictness": "balanced",
    "testRequirements": "on-request",
    "allowedOperations": ["add-endpoint", "add-test", "refactor-code"],
    "prohibitedOperations": ["disable-type-checking"],
    "customRules": ["All endpoints should have docstrings"]
  },
  "paths": {
    "outputDir": "/path/to/my-auth-api",
    "sourceDir": "src",
    "testDir": "tests"
  }
}
```

## Key Features

### Conditional Questions

Questions with `when` conditions are only asked if the condition is met:

```json
{
  "id": "databaseType",
  "message": "Database type",
  "when": {
    "field": "enableDatabase",
    "equals": true
  }
}
```

This question is only asked if `enableDatabase` is `true`.

### Validation

Questions can have validation rules:

```json
{
  "id": "projectName",
  "type": "text",
  "validate": "required"
}
```

Supported validations:
- `required` - Field cannot be empty
- `min:N` - Minimum length
- `email` - Valid email address

### Question Types

- `text` - Free text input
- `select` - Single choice from list
- `multiselect` - Multiple choices from list
- `confirm` - Yes/No question
- `number` - Numeric input

## Blueprint Construction

The `buildBlueprintFromAnswers` function in `src/blueprint/builder.ts` converts the AnswerSet to a complete Blueprint:

- Maps Python version to version constraint
- Adds database-specific dependencies based on database type
- Adds authentication dependencies based on auth method
- Configures Docker Compose if both Docker and database are enabled
- Adds CI checks if CI is enabled

The blueprint is validated against the Zod schema before being returned.
