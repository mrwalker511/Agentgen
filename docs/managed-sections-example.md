# Managed Sections Example

This document demonstrates how managed sections work in AGENT.md and how `agentgen update-agent` preserves custom content.

## Concept

Managed sections are delimited by HTML comment markers:

```markdown
<!-- agentgen:managed:start:section-id -->
Content that will be regenerated
<!-- agentgen:managed:end:section-id -->
```

**Key principle:** Only content between managed section markers is rewritten. All other content is preserved byte-for-byte.

## Managed Sections

Agentgen manages three sections in AGENT.md:

1. **`quickstart`** - Installation and run commands
2. **`verification`** - Dependency verification commands
3. **`structure`** - Repository structure tree

## Example: Before Custom Edits

When first generated, AGENT.md looks like:

```markdown
# AI Agent Guidelines for my-api

**Generated:** 2026-01-07T01:00:00.000Z
**Pack:** python-api@1.0.0
**Agentgen:** 0.1.0

## Project Overview

A FastAPI application

**Stack:** fastapi (python >=3.11,<4.0)

<!-- agentgen:managed:start:quickstart -->
## Quickstart

\`\`\`bash
# Install dependencies
poetry install

# Run development server
poetry run uvicorn my_api.main:app --reload
\`\`\`

**Server will be available at:** `http://localhost:8000`

**API documentation:**
- OpenAPI (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Health check:** `http://localhost:8000/health`
<!-- agentgen:managed:end:quickstart -->

<!-- agentgen:managed:start:verification -->
## Dependency Verification

Run dependency verification to ensure all packages are compatible:

\`\`\`bash
# Verify dependencies
agentgen verify-deps .
\`\`\`

This will:
1. Lock dependencies with Poetry
2. Install all packages
3. Run `pip check` to verify compatibility
4. Run the test suite

Results are saved to `agentgen.verify.json`.
<!-- agentgen:managed:end:verification -->

<!-- agentgen:managed:start:structure -->
## Repository Structure

\`\`\`
my-api/
├── src/
│   └── my_api/
│       ├── __init__.py
│       └── main.py              # FastAPI application
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_smoke.py
├── pyproject.toml              # Dependencies and config
├── poetry.lock                 # Locked dependencies
├── README.md
├── AGENT.md                    # This file
└── .gitignore
\`\`\`
<!-- agentgen:managed:end:structure -->

## Dependencies

### Production
- `fastapi` ^0.104.1
- `uvicorn` ^0.24.0
- `pydantic` ^2.5.0

...

---

## Custom Project Notes

Add project-specific guidance below. This section is preserved across regenerations.

### Architecture Notes

(Document your architecture decisions here)

### Known Issues

(Document any known issues or workarounds)

### Development Workflow

(Describe your team's development workflow, branching strategy, etc.)
```

## After Custom Edits

Developer adds custom content:

```markdown
# AI Agent Guidelines for my-api

**Generated:** 2026-01-07T01:00:00.000Z
**Pack:** python-api@1.0.0
**Agentgen:** 0.1.0

## Project Overview

A FastAPI application

**Stack:** fastapi (python >=3.11,<4.0)

**IMPORTANT:** This API serves production traffic. Always run tests before deploying!

<!-- agentgen:managed:start:quickstart -->
## Quickstart

\`\`\`bash
# Install dependencies
poetry install

# Run development server
poetry run uvicorn my_api.main:app --reload
\`\`\`

**Server will be available at:** `http://localhost:8000`

**API documentation:**
- OpenAPI (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Health check:** `http://localhost:8000/health`
<!-- agentgen:managed:end:quickstart -->

<!-- agentgen:managed:start:verification -->
## Dependency Verification

Run dependency verification to ensure all packages are compatible:

\`\`\`bash
# Verify dependencies
agentgen verify-deps .
\`\`\`

This will:
1. Lock dependencies with Poetry
2. Install all packages
3. Run `pip check` to verify compatibility
4. Run the test suite

Results are saved to `agentgen.verify.json`.
<!-- agentgen:managed:end:verification -->

<!-- agentgen:managed:start:structure -->
## Repository Structure

\`\`\`
my-api/
├── src/
│   └── my_api/
│       ├── __init__.py
│       └── main.py              # FastAPI application
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_smoke.py
├── pyproject.toml              # Dependencies and config
├── poetry.lock                 # Locked dependencies
├── README.md
├── AGENT.md                    # This file
└── .gitignore
\`\`\`
<!-- agentgen:managed:end:structure -->

## Custom Setup Notes

Before running the API locally:
1. Copy `.env.example` to `.env`
2. Set DATABASE_URL in `.env`
3. Run migrations: `alembic upgrade head`

## Dependencies

### Production
- `fastapi` ^0.104.1
- `uvicorn` ^0.24.0
- `pydantic` ^2.5.0

...

---

## Custom Project Notes

Add project-specific guidance below. This section is preserved across regenerations.

### Architecture Notes

We use a layered architecture:
- **API Layer:** FastAPI routers in `src/my_api/api/`
- **Service Layer:** Business logic in `src/my_api/services/`
- **Data Layer:** Database models in `src/my_api/db/models.py`

Always keep business logic in the service layer, not in API endpoints.

### Known Issues

- Rate limiting doesn't work with nginx reverse proxy (see issue #42)
- PostgreSQL connection pool needs tuning for production load

### Development Workflow

1. Create feature branch from `main`
2. Make changes and add tests
3. Run `poetry run pytest` locally
4. Push and create PR
5. Wait for CI checks to pass
6. Get code review
7. Merge to `main`
```

## After Running `agentgen update-agent`

Now developer adds database support via interview, then runs `update-agent`:

```bash
$ agentgen update-agent ./my-api

🔄 Agentgen - Update AGENT.md

ℹ Project: /home/user/my-api
✔ Read AGENT.md
ℹ Loading blueprint...
✓ Loaded blueprint
ℹ Generating managed sections...
✓ Generated 3 managed sections
✔ Updated managed sections
✔ Wrote AGENT.md

✓ AGENT.md updated successfully!
ℹ Managed sections have been regenerated
ℹ Custom content has been preserved

Updated sections:
✓ - quickstart
✓ - verification
✓ - structure
```

Result - managed sections updated, custom content preserved:

```markdown
# AI Agent Guidelines for my-api

**Generated:** 2026-01-07T01:00:00.000Z
**Pack:** python-api@1.0.0
**Agentgen:** 0.1.0

## Project Overview

A FastAPI application

**Stack:** fastapi (python >=3.11,<4.0)

**IMPORTANT:** This API serves production traffic. Always run tests before deploying!

<!-- agentgen:managed:start:quickstart -->
## Quickstart

\`\`\`bash
# Install dependencies
poetry install

# Run development server
poetry run uvicorn my_api.main:app --reload
\`\`\`

**Server will be available at:** `http://localhost:8000`

**API documentation:**
- OpenAPI (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Health check:** `http://localhost:8000/health`
<!-- agentgen:managed:end:quickstart -->

<!-- agentgen:managed:start:verification -->
## Dependency Verification

Run dependency verification to ensure all packages are compatible:

\`\`\`bash
# Verify dependencies
agentgen verify-deps .
\`\`\`

This will:
1. Lock dependencies with Poetry
2. Install all packages
3. Run `pip check` to verify compatibility
4. Run the test suite

Results are saved to `agentgen.verify.json`.
<!-- agentgen:managed:end:verification -->

<!-- agentgen:managed:start:structure -->
## Repository Structure

\`\`\`
my-api/
├── src/
│   └── my_api/
│       ├── __init__.py
│       └── main.py              # FastAPI application
│       ├── db/                  # Database configuration
│       │   ├── __init__.py
│       │   ├── session.py
│       │   └── models.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_smoke.py
├── alembic/                    # Database migrations
│   └── env.py
├── pyproject.toml              # Dependencies and config
├── poetry.lock                 # Locked dependencies
├── README.md
├── AGENT.md                    # This file
└── .gitignore
\`\`\`
<!-- agentgen:managed:end:structure -->

## Custom Setup Notes

Before running the API locally:
1. Copy `.env.example` to `.env`
2. Set DATABASE_URL in `.env`
3. Run migrations: `alembic upgrade head`

## Dependencies

### Production
- `fastapi` ^0.104.1
- `uvicorn` ^0.24.0
- `pydantic` ^2.5.0
- `sqlalchemy` ^2.0.23
- `asyncpg` ^0.29.0

...

---

## Custom Project Notes

Add project-specific guidance below. This section is preserved across regenerations.

### Architecture Notes

We use a layered architecture:
- **API Layer:** FastAPI routers in `src/my_api/api/`
- **Service Layer:** Business logic in `src/my_api/services/`
- **Data Layer:** Database models in `src/my_api/db/models.py`

Always keep business logic in the service layer, not in API endpoints.

### Known Issues

- Rate limiting doesn't work with nginx reverse proxy (see issue #42)
- PostgreSQL connection pool needs tuning for production load

### Development Workflow

1. Create feature branch from `main`
2. Make changes and add tests
3. Run `poetry run pytest` locally
4. Push and create PR
5. Wait for CI checks to pass
6. Get code review
7. Merge to `main`
```

## What Changed

### ✅ Preserved (Custom Content)

- "**IMPORTANT:** This API serves production traffic..."
- "## Custom Setup Notes" section
- Architecture notes about layered architecture
- Known issues
- Development workflow

### 🔄 Updated (Managed Sections)

- Repository Structure now shows `db/` directory and `alembic/` migrations
- Dependencies section shows new `sqlalchemy` and `asyncpg` packages

### 📌 Key Takeaway

**Only managed sections between comment markers are updated. Everything else is preserved exactly as written.**

This allows developers to:
1. Add custom documentation
2. Update project configuration via `agentgen update-agent`
3. Have managed sections reflect new configuration
4. Keep all custom content intact
