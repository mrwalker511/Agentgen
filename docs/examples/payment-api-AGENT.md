# AI Agent Guidelines for payment-api

<!-- agentgen:managed:start:metadata -->
**Generated:** 2025-01-06T12:30:00Z
**Pack:** python-api@1.0.0
**Agentgen:** 0.1.0
**Blueprint Hash:** a3f5b7c29d4e1f8a
<!-- agentgen:managed:end:metadata -->

## Project Overview

Payment processing API with FastAPI, PostgreSQL, and JWT authentication

<!-- agentgen:managed:start:stack -->
## Technical Stack

- **Language:** Python 3.11
- **Framework:** FastAPI
- **Package Manager:** Poetry
- **Runtime Version:** >=3.11,<4.0
<!-- agentgen:managed:end:stack -->

<!-- agentgen:managed:start:dependencies -->
## Dependencies

### Production Dependencies
- `fastapi` ^0.104.1
- `uvicorn` ^0.24.0
- `pydantic` ^2.5.0
- `pydantic-settings` ^2.1.0
- `sqlalchemy` ^2.0.23
- `asyncpg` ^0.29.0
- `alembic` ^1.13.0
- `python-jose` ^3.3.0
- `passlib` ^1.7.4

### Development Dependencies
- `pytest` ^7.4.3
- `pytest-asyncio` ^0.21.1
- `httpx` ^0.25.2
- `ruff` ^0.1.8
- `mypy` ^1.7.1

**Total:** 14 packages
<!-- agentgen:managed:end:dependencies -->

<!-- agentgen:managed:start:features -->
## Enabled Features

### Database
- **Type:** PostgreSQL
- **ORM:** SQLAlchemy
- **Driver:** Async (asyncpg)
- **Migrations:** Alembic

### Authentication
- **Method:** JWT
- **Library:** python-jose / passlib

### CORS
- **Status:** Enabled
- **Configuration:** See `src/config.py`

### OpenAPI Documentation
- **Available at:** `/docs`
- **ReDoc:** `/redoc`

### Health Check
- **Endpoint:** `/health`
- **Returns:** Service status and version
<!-- agentgen:managed:end:features -->

<!-- agentgen:managed:start:tooling -->
## Development Tooling

### Code Quality
- **Linter:** Ruff
  - Config: `pyproject.toml`
- **Formatter:** Ruff
  - Config: `pyproject.toml`
- **Type Checker:** mypy
  - Config: `pyproject.toml`

### Testing
- **Framework:** pytest
- **Coverage:** Required (minimum 80%)
- **Report:** HTML report in `htmlcov/`

### Tool Commands
```bash
# Linting
ruff check src

# Formatting
ruff format src

# Type checking
mypy src

# Testing
pytest

# Coverage report
pytest --cov=src --cov-report=html --cov-report=term
```
<!-- agentgen:managed:end:tooling -->

<!-- agentgen:managed:start:verification -->
## Dependency Verification

### How to Verify Dependencies

```bash
# Install Poetry (if needed)
curl -sSL https://install.python-poetry.org | python3 -

# Verify dependencies resolve correctly
cd payment-api
poetry lock --no-update --check

# Alternative: use agentgen
agentgen verify blueprint.json
```

### What Gets Verified
- Python runtime version: `>=3.11,<4.0`
- Production dependencies (9 packages)
- Development dependencies (5 packages)
- Version constraint compatibility
- Platform requirements

### Expected Outcome
✅ All dependencies should resolve without conflicts

### If Verification Fails
1. Review the error message for conflicting packages
2. Check version constraints in pyproject.toml
3. Update incompatible package versions
4. Re-run verification
5. Update blueprint if needed

### Last Verification
- **Date:** 2025-01-06T12:30:00Z
- **Status:** success
- **Tool:** poetry 1.7.1
<!-- agentgen:managed:end:verification -->

<!-- agentgen:managed:start:development -->
## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/example/payment-api
cd payment-api

# Install dependencies
poetry install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Start database with Docker
docker-compose up -d postgres

# Run database migrations
poetry run alembic upgrade head
```

### Running Locally

```bash
# Start development server (auto-reload enabled)
poetry run uvicorn src.main:app --reload --port 8000

# Alternative: using Python module
poetry run python -m uvicorn src.main:app --reload
```

**Access points:**
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Common Commands

```bash
# Add dependency
poetry add <package-name>

# Add dev dependency
poetry add --group dev <package-name>

# Update all dependencies
poetry update

# Show dependency tree
poetry show --tree

# Enter virtual environment
poetry shell
```
<!-- agentgen:managed:end:development -->

<!-- agentgen:managed:start:testing -->
## Testing

### Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared pytest fixtures
├── test_main.py             # Application-level tests
└── test_api/
    ├── test_routes.py       # API endpoint tests
    └── test_models.py       # Database model tests
```

### Running Tests

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=src --cov-report=html --cov-report=term

# Run specific test file
poetry run pytest tests/test_main.py

# Run tests matching pattern
poetry run pytest -k "test_health"

# Verbose output
poetry run pytest -v

# Stop on first failure
poetry run pytest -x
```

### Coverage Requirements

**Minimum coverage:** 80%

Coverage reports are generated in `htmlcov/` directory.
View the report by opening `htmlcov/index.html` in a browser.

### Testing Policy

Tests are **REQUIRED** for:
- ✅ All new API endpoints
- ✅ Database models and queries
- ✅ Authentication and authorization logic
- ✅ Business logic functions
- ✅ Data validation and transformations

Tests are **RECOMMENDED** for:
- Edge cases and error scenarios
- Integration between modules
- External API interactions (with mocks)

### Continuous Integration

Tests run automatically on:
- Every pull request
- Pushes to main branch
- Manual workflow triggers

**CI pipeline checks:**
- Lint
- Type-check
- Test
- Security-scan

**Coverage threshold enforced:** 80%
<!-- agentgen:managed:end:testing -->

<!-- agentgen:managed:start:infrastructure -->
## Infrastructure

### Docker

**Dockerfile:** `Dockerfile`
**Compose file:** `docker-compose.yml`

```bash
# Build image
docker build -t payment-api:latest .

# Run container
docker run -p 8000:8000 --env-file .env payment-api:latest

# Using docker-compose
docker-compose up

# Build and run in background
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

**Registry:** docker.io

### CI/CD

**Provider:** GitHub Actions
**Workflow:** `.github/workflows/ci.yml`

**Automated checks:**
- Lint
- Type-check
- Test
- Security-scan

**Triggers:**
- Push to main branch
- Pull request opened/updated
- Manual workflow dispatch

### Deployment

**Target platform:** Kubernetes

**Deployment strategy:**
1. CI/CD builds Docker image
2. Image pushed to container registry
3. Kubernetes deployment updated
4. Rolling update applied
5. Health checks verify deployment success

**Required secrets:**
- Database credentials
- API keys
- TLS certificates

**Environment variables required:**
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - Application secret key
- `CORS_ORIGINS` - Allowed CORS origins
- `JWT_SECRET` - JWT signing key
<!-- agentgen:managed:end:infrastructure -->

<!-- agentgen:managed:start:agent-rules -->
## AI Agent Behavioral Rules

### Strictness Level: Balanced

The AI agent has **moderate autonomy**. It can make reasonable technical decisions but should ask before major architectural changes or potentially breaking modifications.

**Expected behavior:**
- Make routine changes autonomously (bug fixes, refactoring)
- Ask permission for architectural decisions
- Explain reasoning for non-trivial changes
- Flag risks in proposed modifications
- Document significant decisions

### Test Requirements: Always

When adding new features or modifying existing code, the agent **MUST** write corresponding tests. Code without tests should not be considered complete.

**Testing expectations:**
- Every new function has unit tests
- Every new endpoint has integration tests
- Edge cases are covered
- Error scenarios are tested
- Coverage meets 80% threshold

### Allowed Operations

The agent **MAY** perform these operations autonomously:
- ✅ add-endpoint
- ✅ add-model
- ✅ add-test
- ✅ refactor-code
- ✅ update-dependencies

### Prohibited Operations

The agent **MUST NOT** perform these operations without explicit approval:
- ❌ modify-auth-logic
- ❌ change-database-schema-without-migration
- ❌ disable-type-checking

### Custom Project Rules

1. All database operations must use async SQLAlchemy
2. All endpoints must have corresponding tests
3. Never commit secrets or credentials
4. Follow REST API naming conventions
5. Use Pydantic models for request/response validation

### Communication Guidelines

When working on this project, the agent should:
- **Be explicit** about changes being made and why
- **Ask questions** when requirements are ambiguous
- **Explain trade-offs** when suggesting alternatives
- **Flag risks** in proposed changes or existing code
- **Respect conventions** established in the codebase
- **Document decisions** that affect future development

### Error Handling

When encountering errors or blockers:
1. **Analyze the root cause** before suggesting fixes
2. **Propose solutions** with clear reasoning
3. **Consider side effects** of proposed changes
4. **Test thoroughly** before marking as complete
5. **Document workarounds** if applicable
<!-- agentgen:managed:end:agent-rules -->

---

## Custom Project Documentation

### Architecture Notes

#### Payment Processing Flow
1. Client sends payment request to `/api/payments`
2. Request validated using Pydantic models
3. Payment processor called (Stripe API)
4. Transaction record stored in PostgreSQL
5. Webhook confirmation processed asynchronously
6. Client notified of result

#### Database Schema
- `users` - User accounts with hashed passwords
- `payments` - Payment transactions
- `payment_methods` - Stored payment methods (tokenized)
- `webhooks` - Incoming webhook events for processing

#### Security Considerations
- All passwords hashed with bcrypt (via passlib)
- JWT tokens expire after 24 hours
- Refresh tokens stored in secure HTTP-only cookies
- Rate limiting on authentication endpoints (5 req/min)
- Database connections use SSL in production

### Known Issues

1. **Race condition in concurrent payments**
   - Workaround: Use database-level locks for account balance updates
   - TODO: Implement idempotency keys

2. **Webhook retry logic**
   - Current: Linear backoff (1s, 2s, 3s...)
   - Better: Exponential backoff with jitter

### Development Workflow

#### Branching Strategy
- `main` - production code
- `develop` - integration branch
- `feature/*` - new features
- `bugfix/*` - bug fixes
- `hotfix/*` - production hotfixes

#### Code Review Process
1. Create PR with descriptive title and body
2. Ensure CI passes (all checks green)
3. Request review from at least one team member
4. Address feedback and update PR
5. Squash and merge when approved

#### Release Process
1. Create release branch from `develop`
2. Update version in `pyproject.toml`
3. Update CHANGELOG.md
4. Merge to `main` and tag release
5. Deploy to staging → production

### Additional Agent Guidelines

#### Payment Logic
- Never process payments without validating user authentication
- Always log payment attempts (success and failure)
- Use idempotency keys for all payment operations
- Implement proper error handling and user-friendly messages

#### External API Calls
- Wrap all Stripe API calls in try-except blocks
- Log all API responses (redact sensitive data)
- Implement retry logic with exponential backoff
- Set reasonable timeouts (10s for payment operations)

#### Database Migrations
- Always create migrations for schema changes
- Test migrations on a copy of production data
- Include both upgrade and downgrade paths
- Document any data transformations in migration
