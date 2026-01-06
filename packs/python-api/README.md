# Python API Pack

Template pack for generating FastAPI-based REST APIs with modern Python tooling.

## Features

- **FastAPI** - Modern, fast web framework
- **Poetry** - Dependency management
- **Async support** - Optional async database drivers
- **Database** - PostgreSQL, MySQL, SQLite, or none
- **ORM** - SQLAlchemy or Tortoise ORM
- **Authentication** - JWT, OAuth2, or API key
- **Testing** - pytest with optional coverage
- **Linting** - Ruff or other linters
- **Type checking** - mypy or pyright
- **Docker** - Optional containerization
- **CI/CD** - GitHub Actions, GitLab CI, or CircleCI

## Prerequisites

### System Requirements

- Python >= 3.10
- Poetry >= 1.5.0

### Install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

## Generated Structure

```
{project-name}/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API routes
│   │   └── dependencies.py  # Route dependencies
│   ├── db/                  # (if database enabled)
│   │   ├── __init__.py
│   │   ├── session.py       # Database session
│   │   └── models.py        # Database models
│   └── auth/                # (if authentication enabled)
│       ├── __init__.py
│       ├── jwt.py
│       └── dependencies.py
├── alembic/                 # (if migrations enabled)
│   ├── env.py
│   └── versions/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_main.py
├── docker/                  # (if Docker enabled)
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/workflows/       # (if CI enabled)
│   └── ci.yml
├── pyproject.toml
├── README.md
├── AGENT.md
├── .env.example
└── .gitignore
```

## Configuration Options

### Database

**Supported databases:**
- PostgreSQL (with psycopg2 or asyncpg)
- MySQL (with mysqlclient or aiomysql)
- SQLite (built-in or aiosqlite)
- None (no database)

**ORMs:**
- SQLAlchemy (supports migrations via Alembic)
- Tortoise ORM
- None

### Authentication

- JWT (using python-jose)
- OAuth2
- API Key
- None

### Tooling

- **Linters**: ruff, pylint, flake8
- **Formatters**: ruff, black
- **Type checkers**: mypy, pyright
- **Test frameworks**: pytest, unittest

### Infrastructure

- Docker with optional docker-compose
- CI/CD: GitHub Actions, GitLab CI, CircleCI

## Constraints

The pack enforces several compatibility rules:

### Feature Compatibility

1. **Database + ORM**: If database is enabled, an ORM must be selected
2. **Async driver**: Async database drivers require async-capable ORM (SQLAlchemy or Tortoise)
3. **Migrations**: Database migrations require SQLAlchemy (uses Alembic)
4. **Coverage**: Test coverage requires a test framework
5. **Docker Compose**: Requires Docker to be enabled
6. **CI checks**: Require a CI provider to be selected

### Version Constraints

- Python 3.12 requires Pydantic >= 2.5
- Python 3.12 requires FastAPI >= 0.104
- Alembic requires SQLAlchemy

## Dependency Verification

The pack includes a `verifier.js` script that uses Poetry to verify dependency compatibility before generating files.

**How it works:**
1. Creates a temporary `pyproject.toml` with your selected dependencies
2. Runs `poetry lock --dry-run` to check for conflicts
3. Reports any incompatibilities with specific error messages
4. Only proceeds to file generation if verification passes

This ensures you never generate a project with incompatible dependencies.

## Usage with agentgen

```bash
# Initialize new project
agentgen init

# Select "Python API (FastAPI)" when prompted
? Select template pack: Python API (FastAPI)

# Answer interview questions
? Project name: my-api
? Python version: 3.11
? Database: postgresql
...

# agentgen will:
# 1. Validate your answers against constraints
# 2. Verify dependencies with Poetry
# 3. Generate project files
# 4. Create AGENT.md with managed sections
```

## AGENT.md

The generated `AGENT.md` includes managed sections that can be safely regenerated:

- **Metadata** - Pack version, generation timestamp
- **Dependencies** - Core and dev dependencies
- **Features** - Enabled features and their configuration
- **Tooling** - Linter, formatter, type checker, testing setup
- **Infrastructure** - Docker, CI/CD configuration
- **Agent Rules** - AI agent strictness, test requirements, custom rules

Custom sections outside managed markers are preserved across regenerations.

## Customization

### Add Custom Templates

Add new templates to `templates/` directory. Use Handlebars syntax:

```handlebars
{{#if features.myFeature}}
# This will only appear if myFeature is enabled
{{/if}}

{{ project.name }} - {{ project.description }}
```

### Add Constraints

Edit `constraints.yml` to add new compatibility rules:

```yaml
feature_compatibility:
  - name: "my_custom_rule"
    condition: "features.myFeature === true"
    requires:
      - field: "stack.dependencies"
        contains_key: "required-package"
    error: "My feature requires required-package"
```

### Modify Default Dependencies

Edit `defaults.json` to change default dependency versions or add new defaults.

## License

MIT
