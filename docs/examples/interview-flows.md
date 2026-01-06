# Interview Flow Examples

This document shows concrete examples of how the interview flow works for different scenarios.

---

## Example 1: Minimal Python API

**User wants**: Simple FastAPI app, no database, no Docker, minimal tooling

### Interview Session

```
$ agentgen init

? Select template pack: Python API (FastAPI)

? Project name: hello-api
? Project description: Minimal FastAPI example
? Author name: (leave empty)

? Python version: 3.11
? Package manager: poetry

? Database: none

? Additional features (space to select, enter to continue):
  ○ authentication
  ○ cors
  ○ rate-limiting
  ● openapi-docs
  ● health-check

? Linter: ruff
? Code formatter: ruff
? Type checker: none

? Test framework: pytest
? Include test coverage reporting? No

? Include Docker support? No

? CI/CD provider: none

? Deployment target (for docs only): vps

? AI agent strictness level: balanced
? Agent test requirements: on-request

✓ Interview complete
✓ Blueprint created
✓ Verifying dependencies with Poetry... OK
✓ Generating project files...

Project created at: ./hello-api

Next steps:
  cd hello-api
  poetry install
  poetry run uvicorn src.main:app --reload
```

### Conditional Questions Skipped

These questions were **not asked** because conditions weren't met:

- `orm` - skipped because `database === 'none'`
- `async_driver` - skipped because `database === 'none'`
- `migrations` - skipped because `database === 'none'`
- `auth_method` - skipped because `authentication` not in `features`
- `test_coverage` - asked but user said No
- `docker_compose` - skipped because `use_docker === false`
- `ci_checks` - skipped because `ci_provider === 'none'`

---

## Example 2: Production-Ready Payment API

**User wants**: Full-featured API with PostgreSQL, JWT auth, Docker, CI/CD

### Interview Session

```
$ agentgen init

? Select template pack: Python API (FastAPI)

? Project name: payment-api
? Project description: Payment processing API with FastAPI
? Author name: Jane Developer

? Python version: 3.11
? Package manager: poetry

? Database: postgresql
? ORM/database library: sqlalchemy
? Use async database driver? Yes
? Include database migrations (Alembic)? Yes

? Additional features:
  ● authentication
  ● cors
  ○ rate-limiting
  ● openapi-docs
  ● health-check

? Authentication method: jwt

? Linter: ruff
? Code formatter: ruff
? Type checker: mypy

? Test framework: pytest
? Include test coverage reporting? Yes

? Include Docker support? Yes
? Include docker-compose for local development? Yes

? CI/CD provider: github-actions
? CI checks to run:
  ● lint
  ● type-check
  ● test
  ● security-scan

? Deployment target (for docs only): kubernetes

? AI agent strictness level: balanced
? Agent test requirements: always

✓ Interview complete
✓ Blueprint created
✓ Verifying dependencies with Poetry...
  ✓ Core dependencies resolved
  ✓ Database drivers compatible
  ✓ Dev dependencies resolved
✓ Generating project files...
  ✓ pyproject.toml
  ✓ src/main.py
  ✓ src/api/
  ✓ src/db/
  ✓ src/auth/
  ✓ alembic/
  ✓ tests/
  ✓ Dockerfile
  ✓ docker-compose.yml
  ✓ .github/workflows/ci.yml
  ✓ AGENT.md

Project created at: ./payment-api

Next steps:
  cd payment-api
  cp .env.example .env
  # Edit .env with your database credentials
  docker-compose up -d
  poetry install
  poetry run alembic upgrade head
  poetry run uvicorn src.main:app --reload
```

### All Conditional Questions Asked

Because the user selected features that triggered conditions:

- `orm` → shown because `database !== 'none'`
- `async_driver` → shown because `orm === 'sqlalchemy'`
- `migrations` → shown because `orm === 'sqlalchemy'`
- `auth_method` → shown because `'authentication' in features`
- `docker_compose` → shown because `use_docker === true && database !== 'none'`
- `ci_checks` → shown because `ci_provider !== 'none'`

---

## Example 3: Node/TypeScript Microservice

**User wants**: Express API with Prisma, strict typing, high test coverage

### Interview Session

```
$ agentgen init

? Select template pack: Node API (Express + TypeScript)

? Project name: user-service
? Project description: User management microservice with Express
? Author name: John Smith

? Node version: 20 LTS
? Package manager: pnpm

? Database: postgresql
? ORM/database library: prisma
? Include database migrations? Yes

? Additional features:
  ● authentication
  ● cors
  ● rate-limiting
  ● openapi-docs
  ● health-check

? Authentication method: jwt

? Linter: eslint
? Code formatter: prettier
? Type checker: typescript (strict mode)

? Test framework: vitest
? Include test coverage reporting? Yes
? Coverage threshold: 85%

? Include Docker support? Yes
? Include docker-compose for local development? Yes

? CI/CD provider: github-actions
? CI checks to run:
  ● lint
  ● type-check
  ● test
  ● security-scan

? Deployment target (for docs only): docker

? AI agent strictness level: strict
? Agent test requirements: always

✓ Interview complete
✓ Blueprint created
✓ Verifying dependencies with pnpm...
  ✓ All dependencies resolved
  ✓ No peer dependency conflicts
✓ Generating project files...
  ✓ package.json
  ✓ tsconfig.json
  ✓ src/
  ✓ prisma/schema.prisma
  ✓ tests/
  ✓ Dockerfile
  ✓ docker-compose.yml
  ✓ .github/workflows/ci.yml
  ✓ AGENT.md

Project created at: ./user-service

Next steps:
  cd user-service
  cp .env.example .env
  # Edit .env with your database credentials
  pnpm install
  pnpm prisma generate
  pnpm prisma migrate dev
  pnpm dev
```

---

## Example 4: Changing Answers Mid-Interview

Shows how conditional logic updates in real-time.

### Interview Session

```
$ agentgen init

? Select template pack: Python API (FastAPI)

? Project name: my-api
? Python version: 3.11
? Package manager: poetry

? Database: postgresql
? ORM/database library: sqlalchemy
  ^ User selects SQLAlchemy

? Use async database driver? Yes
  ^ This question appeared because orm === 'sqlalchemy'

? Include database migrations (Alembic)? Yes
  ^ This question appeared because orm === 'sqlalchemy'

[User presses Ctrl+C and restarts]

$ agentgen init

? Project name: my-api
? Python version: 3.11
? Package manager: poetry

? Database: postgresql
? ORM/database library: none
  ^ User selects 'none' this time

? Additional features: [...]
  ^ Skipped async_driver and migrations questions!
  ^ Because orm === 'none', conditions not met
```

---

## Example 5: Multiselect Feature Flags

Shows how multiselect answers affect later questions.

```
? Additional features:
  ● authentication     <- user selected
  ○ cors
  ● rate-limiting      <- user selected
  ● openapi-docs       <- user selected
  ● health-check       <- user selected

  [Selected 4 features]

? Authentication method: jwt
  ^ Asked because 'authentication' in features

? Rate limit requests per minute: 100
  ^ Asked because 'rate-limiting' in features

? API documentation title: My API
  ^ Asked because 'openapi-docs' in features
```

If user had NOT selected "authentication":

```
? Additional features:
  ○ authentication     <- user did NOT select
  ○ cors
  ● rate-limiting
  ● openapi-docs
  ● health-check

  [Selected 3 features]

? Rate limit requests per minute: 100
  ^ No auth_method question!
```

---

## Example 6: Complex Conditional Chain

Shows nested conditional logic.

```
? Database: postgresql
  ↓ (condition: database !== 'none')

? ORM/database library: sqlalchemy
  ↓ (condition: orm === 'sqlalchemy')

? Use async database driver? Yes
  ↓ (condition: async_driver === true)

? Connection pool size: 10
  ^ Only asked if async driver selected
```

Decision tree:
```
database === 'none'
  ↓ NO
  → Ask: ORM choice
    orm === 'sqlalchemy'
      ↓ YES
      → Ask: async_driver?
        async_driver === true
          ↓ YES
          → Ask: connection pool size
```

---

## Example 7: Validation Failures

Shows answer validation in action.

```
? Project name: My Project
  ✗ Lowercase letters, numbers, and hyphens only

? Project name: my-project
  ✓ Valid

? Python version: 3.13
  ✗ Must be one of: 3.10, 3.11, 3.12

? Python version: 3.11
  ✓ Valid

? Author name: developer@example.com
  ✓ Valid (no restrictions)
```

---

## Example 8: Default Values

Shows how defaults work.

```
? Project name: [my-project]
  <user presses Enter>
  → Uses default: "my-project"

? Include Docker support? [Yes]
  <user presses Enter>
  → Uses default: true

? CI/CD provider: [github-actions]
  <user presses Enter>
  → Uses default: "github-actions"
```

---

## Blueprint Transformation Examples

### From AnswerSet to Blueprint

**AnswerSet** (raw answers):
```json
{
  "project_name": "payment-api",
  "python_version": "3.11",
  "database": "postgresql",
  "features": ["authentication", "cors"],
  "auth_method": "jwt"
}
```

**Blueprint** (transformed):
```json
{
  "project": {
    "name": "payment-api"
  },
  "stack": {
    "language": "python",
    "runtime": {
      "version": ">=3.11,<4.0"
    },
    "dependencies": {
      "fastapi": "^0.104.1",
      "sqlalchemy": "^2.0.23",
      "asyncpg": "^0.29.0",
      "python-jose": "^3.3.0",
      "passlib": "^1.7.4"
    }
  },
  "features": {
    "database": {
      "enabled": true,
      "type": "postgresql"
    },
    "authentication": {
      "enabled": true,
      "method": "jwt"
    },
    "cors": true
  }
}
```

**Transformations applied:**
1. `python_version: "3.11"` → `runtime.version: ">=3.11,<4.0"` (semver constraint)
2. `database: "postgresql"` → Adds SQLAlchemy + asyncpg dependencies
3. `features: ["authentication"]` + `auth_method: "jwt"` → Adds python-jose + passlib
4. Flat feature array → Structured feature objects with enabled flags

---

## Summary

The interview flow is:
1. **Adaptive**: Questions appear/disappear based on answers
2. **Validated**: Wrong inputs rejected immediately
3. **Smart defaults**: Common choices pre-selected
4. **Progressive**: Broad → specific
5. **Deterministic**: Same answers = same blueprint

The blueprint transformation:
1. **Enriches** answers with pack knowledge (dependency versions)
2. **Validates** consistency (can't have migrations without database)
3. **Structures** flat answers into hierarchical blueprint
4. **Resolves** references (feature flags → dependency lists)
