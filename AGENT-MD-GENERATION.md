# AGENT.md Generation System

## Overview

The AGENT.md file is a **first-class artifact** in agentgen-generated projects. It serves as the authoritative guide for AI agents working in the codebase, defining project structure, dependencies, tooling, and behavioral rules.

**Key principles:**
- **Managed sections** - Auto-generated content between markers
- **Custom sections** - User-written content preserved across regenerations
- **Blueprint-driven** - All managed content derived from blueprint
- **Deterministic** - Same blueprint = same AGENT.md managed content
- **Regenerable** - Can update managed sections without losing custom content

---

## Canonical AGENT.md Structure

```markdown
# AI Agent Guidelines for {project-name}

<!-- agentgen:managed:start:metadata -->
[Auto-generated metadata: pack version, generation date, etc.]
<!-- agentgen:managed:end:metadata -->

## Project Overview

[User-editable project description - NOT managed]

<!-- agentgen:managed:start:stack -->
[Auto-generated stack information]
<!-- agentgen:managed:end:stack -->

<!-- agentgen:managed:start:dependencies -->
[Auto-generated dependency lists]
<!-- agentgen:managed:end:dependencies -->

<!-- agentgen:managed:start:features -->
[Auto-generated enabled features]
<!-- agentgen:managed:end:features -->

<!-- agentgen:managed:start:tooling -->
[Auto-generated tooling configuration]
<!-- agentgen:managed:end:tooling -->

<!-- agentgen:managed:start:verification -->
[Auto-generated dependency verification commands]
<!-- agentgen:managed:end:verification -->

<!-- agentgen:managed:start:development -->
[Auto-generated development commands]
<!-- agentgen:managed:end:development -->

<!-- agentgen:managed:start:testing -->
[Auto-generated testing information]
<!-- agentgen:managed:end:testing -->

<!-- agentgen:managed:start:infrastructure -->
[Auto-generated Docker, CI/CD, deployment info]
<!-- agentgen:managed:end:infrastructure -->

<!-- agentgen:managed:start:agent-rules -->
[Auto-generated AI agent behavioral rules]
<!-- agentgen:managed:end:agent-rules -->

---

## Custom Sections

[Everything below this line is preserved across regenerations]

### Architecture Notes

[User adds architecture decisions, patterns, etc.]

### Known Issues

[User documents bugs, workarounds, etc.]

### Development Workflow

[User describes team workflow, branching strategy, etc.]

### Additional Agent Guidelines

[User adds project-specific agent instructions]
```

---

## Managed Block Markers

### Marker Format

```markdown
<!-- agentgen:managed:start:{section-id} -->
Content that will be regenerated
<!-- agentgen:managed:end:{section-id} -->
```

**Rules:**
1. Markers are HTML comments (invisible in rendered markdown)
2. `section-id` must be unique within the file
3. Content between markers is **replaced** during regeneration
4. Content outside markers is **preserved**
5. Removing markers opts that section out of regeneration

### Standard Section IDs

| Section ID | Content | Rationale |
|------------|---------|-----------|
| `metadata` | Pack info, generation timestamp | Track provenance |
| `stack` | Language, framework, runtime | Core technical stack |
| `dependencies` | Package lists with versions | Keep deps in sync |
| `features` | Enabled feature flags | Document what's included |
| `tooling` | Linters, formatters, type checkers | Development tools |
| `verification` | Dependency check commands | How to verify deps |
| `development` | Dev server, build commands | How to run locally |
| `testing` | Test commands, coverage | How to test |
| `infrastructure` | Docker, CI/CD, deployment | Infrastructure setup |
| `agent-rules` | AI agent behavioral rules | Agent strictness, permissions |

### Custom Sections

Users can add their own managed sections:

```markdown
<!-- agentgen:managed:start:custom-section -->
Custom content managed by user's own tooling
<!-- agentgen:managed:end:custom-section -->
```

**Agentgen behavior:**
- Skips unknown section IDs during regeneration
- Preserves content in custom sections
- Warns if custom section ID conflicts with standard IDs

---

## Content Generation Rules

### 1. Metadata Section

**Input:** Blueprint metadata

**Output:**
```markdown
<!-- agentgen:managed:start:metadata -->
**Generated:** 2025-01-06T12:30:00Z
**Pack:** python-api@1.0.0
**Agentgen:** 0.1.0
**Blueprint:** payment-api (hash: a3f5b7c2)
<!-- agentgen:managed:end:metadata -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:metadata -->
**Generated:** {{ meta.generatedAt }}
**Pack:** {{ meta.packId }}@{{ meta.packVersion }}
**Agentgen:** {{ meta.agentgenVersion }}
**Blueprint:** {{ project.name }} (hash: {{ blueprintHash }})
<!-- agentgen:managed:end:metadata -->
```

### 2. Stack Section

**Input:** Blueprint stack configuration

**Output:**
```markdown
<!-- agentgen:managed:start:stack -->
## Technical Stack

- **Language:** Python 3.11
- **Framework:** FastAPI 0.104.1
- **Package Manager:** Poetry
- **Runtime:** >=3.11,<4.0
<!-- agentgen:managed:end:stack -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:stack -->
## Technical Stack

- **Language:** {{ capitalize stack.language }} {{ extractMajorMinor stack.runtime.version }}
- **Framework:** {{ capitalize stack.framework }} {{ stack.dependencies.[stack.framework] }}
- **Package Manager:** {{ capitalize stack.runtime.manager }}
- **Runtime:** {{ stack.runtime.version }}
<!-- agentgen:managed:end:stack -->
```

### 3. Dependencies Section

**Input:** Blueprint dependencies and devDependencies

**Output:**
```markdown
<!-- agentgen:managed:start:dependencies -->
## Dependencies

### Production
- `fastapi` ^0.104.1
- `uvicorn` ^0.24.0
- `pydantic` ^2.5.0
- `sqlalchemy` ^2.0.23
- `asyncpg` ^0.29.0

### Development
- `pytest` ^7.4.3
- `pytest-asyncio` ^0.21.1
- `ruff` ^0.1.8
- `mypy` ^1.7.1

**Total:** 9 dependencies
<!-- agentgen:managed:end:dependencies -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:dependencies -->
## Dependencies

### Production
{{#each stack.dependencies}}
- `{{ @key }}` {{ this }}
{{/each}}

{{#if stack.devDependencies}}
### Development
{{#each stack.devDependencies}}
- `{{ @key }}` {{ this }}
{{/each}}
{{/if}}

**Total:** {{ add (objectLength stack.dependencies) (objectLength stack.devDependencies) }} dependencies
<!-- agentgen:managed:end:dependencies -->
```

### 4. Features Section

**Input:** Blueprint features configuration

**Output:**
```markdown
<!-- agentgen:managed:start:features -->
## Enabled Features

- **Database:** PostgreSQL with SQLAlchemy
  - Using async driver (asyncpg)
  - Migrations via Alembic
- **Authentication:** JWT
- **CORS:** Enabled
- **OpenAPI Docs:** Available at `/docs`
- **Health Check:** Available at `/health`

**Disabled Features:**
- Rate Limiting
<!-- agentgen:managed:end:features -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:features -->
## Enabled Features

{{#if features.database.enabled}}
- **Database:** {{ capitalize features.database.type }} with {{ capitalize features.database.orm }}
  {{#if features.database.async}}- Using async driver{{/if}}
  {{#if features.database.migrations}}- Migrations via {{ getDatabaseMigrationTool features.database.orm }}{{/if}}
{{/if}}

{{#if features.authentication.enabled}}
- **Authentication:** {{ uppercase features.authentication.method }}
{{/if}}

{{#if features.cors}}
- **CORS:** Enabled
{{/if}}

{{#if features.rateLimiting}}
- **Rate Limiting:** Enabled
{{/if}}

{{#if features.openapi}}
- **OpenAPI Docs:** Available at `/docs`
{{/if}}

{{#if features.healthCheck}}
- **Health Check:** Available at `/health`
{{/if}}

{{#if (hasDisabledFeatures features)}}
**Disabled Features:**
{{#each (getDisabledFeatures features)}}
- {{ this }}
{{/each}}
{{/if}}
<!-- agentgen:managed:end:features -->
```

### 5. Tooling Section

**Input:** Blueprint tooling configuration

**Output:**
```markdown
<!-- agentgen:managed:start:tooling -->
## Development Tooling

### Code Quality
- **Linter:** Ruff (configured in `pyproject.toml`)
- **Formatter:** Ruff (configured in `pyproject.toml`)
- **Type Checker:** mypy (configured in `pyproject.toml`)

### Testing
- **Framework:** pytest
- **Coverage:** Enabled (threshold: 80%)
- **Async Support:** pytest-asyncio

### Commands
```bash
# Lint code
ruff check src

# Format code
ruff format src

# Type check
mypy src

# Run tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html
```
<!-- agentgen:managed:end:tooling -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:tooling -->
## Development Tooling

### Code Quality
- **Linter:** {{ capitalize tooling.linter.tool }} (configured in `{{ tooling.linter.configFile }}`)
{{#if tooling.formatter}}
- **Formatter:** {{ capitalize tooling.formatter.tool }} (configured in `{{ tooling.formatter.configFile }}`)
{{/if}}
{{#if tooling.typeChecker.tool}}
{{#unless (eq tooling.typeChecker.tool 'none')}}
- **Type Checker:** {{ tooling.typeChecker.tool }} (configured in `{{ tooling.typeChecker.configFile }}`)
{{/unless}}
{{/if}}

### Testing
- **Framework:** {{ tooling.testing.framework }}
{{#if tooling.testing.coverage}}
- **Coverage:** Enabled (threshold: {{ tooling.testing.coverageThreshold }}%)
{{/if}}
{{#if (hasPackage 'pytest-asyncio' stack.devDependencies)}}
- **Async Support:** pytest-asyncio
{{/if}}

### Commands
```bash
# Lint code
{{ getToolCommand tooling.linter.tool stack.language 'lint' }}

# Format code
{{ getToolCommand tooling.formatter.tool stack.language 'format' }}

{{#if tooling.typeChecker.tool}}
# Type check
{{ getToolCommand tooling.typeChecker.tool stack.language 'typecheck' }}
{{/if}}

# Run tests
{{ getToolCommand tooling.testing.framework stack.language 'test' }}

{{#if tooling.testing.coverage}}
# Run tests with coverage
{{ getToolCommand tooling.testing.framework stack.language 'test-coverage' }}
{{/if}}
```
<!-- agentgen:managed:end:tooling -->
```

### 6. Verification Section

**Input:** Blueprint stack and verification settings

**Output:**
```markdown
<!-- agentgen:managed:start:verification -->
## Dependency Verification

To verify all dependencies are compatible:

```bash
# Install Poetry if not already installed
curl -sSL https://install.python-poetry.org | python3 -

# Verify dependencies (dry run)
poetry lock --no-update --check

# Or use agentgen
agentgen verify blueprint.json
```

**What gets verified:**
- Python version compatibility (>=3.11,<4.0)
- Core dependency resolution (9 packages)
- Development dependency resolution (4 packages)
- Platform compatibility
- Version constraints

**Expected outcome:** All dependencies should resolve without conflicts.

**If verification fails:**
1. Check the error message for conflicting packages
2. Review version constraints in `pyproject.toml`
3. Update incompatible packages
4. Re-run verification

**Last verified:** 2025-01-06T12:30:00Z (✓ passed)
<!-- agentgen:managed:end:verification -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:verification -->
## Dependency Verification

To verify all dependencies are compatible:

```bash
{{#if (eq stack.language 'python')}}
# Install Poetry if not already installed
curl -sSL https://install.python-poetry.org | python3 -

# Verify dependencies (dry run)
poetry lock --no-update --check

# Or use agentgen
agentgen verify blueprint.json
{{else if (eq stack.language 'typescript')}}
# Verify dependencies
{{ stack.runtime.manager }} install --dry-run

# Or use agentgen
agentgen verify blueprint.json
{{/if}}
```

**What gets verified:**
- {{ capitalize stack.language }} version compatibility ({{ stack.runtime.version }})
- Core dependency resolution ({{ objectLength stack.dependencies }} packages)
{{#if stack.devDependencies}}
- Development dependency resolution ({{ objectLength stack.devDependencies }} packages)
{{/if}}
- Platform compatibility
- Version constraints

**Expected outcome:** All dependencies should resolve without conflicts.

**If verification fails:**
1. Check the error message for conflicting packages
2. Review version constraints in `{{ getManifestFile stack }}
3. Update incompatible packages
4. Re-run verification

{{#if verificationReport}}
**Last verified:** {{ verificationReport.timestamp }} ({{ verificationReport.status }})
{{/if}}
<!-- agentgen:managed:end:verification -->
```

### 7. Development Section

**Input:** Blueprint stack and infrastructure

**Output:**
```markdown
<!-- agentgen:managed:start:development -->
## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd payment-api

# Install dependencies
poetry install

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Start database (if using docker-compose)
docker-compose up -d postgres

# Run migrations
poetry run alembic upgrade head
```

### Running Locally

```bash
# Development server (with auto-reload)
poetry run uvicorn src.main:app --reload --port 8000

# Or using Python module
poetry run python -m uvicorn src.main:app --reload
```

**Server will be available at:** `http://localhost:8000`
**API documentation:** `http://localhost:8000/docs`
**Health check:** `http://localhost:8000/health`

### Common Commands

```bash
# Install new dependency
poetry add <package-name>

# Install dev dependency
poetry add --group dev <package-name>

# Update dependencies
poetry update

# Show dependency tree
poetry show --tree

# Activate virtual environment
poetry shell
```
<!-- agentgen:managed:end:development -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:development -->
## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd {{ project.name }}

{{#if (eq stack.language 'python')}}
# Install dependencies
{{ stack.runtime.manager }} install

{{#if features.database.enabled}}
# Copy environment template
cp .env.example .env
# Edit .env with your configuration

{{#if infrastructure.docker.compose}}
# Start database (if using docker-compose)
docker-compose up -d {{ getDockerServiceName features.database.type }}
{{/if}}

{{#if features.database.migrations}}
# Run migrations
{{ getM migrationCommand stack features }}
{{/if}}
{{/if}}

{{else if (eq stack.language 'typescript')}}
# Install dependencies
{{ stack.runtime.manager }} install

{{#if features.database.enabled}}
# Copy environment template
cp .env.example .env

{{#if infrastructure.docker.compose}}
# Start database
docker-compose up -d {{ getDockerServiceName features.database.type }}
{{/if}}

{{#if features.database.migrations}}
# Run migrations
{{ getMigrationCommand stack features }}
{{/if}}
{{/if}}
{{/if}}
```

### Running Locally

```bash
{{#if (eq stack.language 'python')}}
# Development server (with auto-reload)
{{ stack.runtime.manager }} run uvicorn src.main:app --reload --port 8000

# Or using Python module
{{ stack.runtime.manager }} run python -m uvicorn src.main:app --reload
{{else if (eq stack.language 'typescript')}}
# Development server
{{ stack.runtime.manager }} run dev

# Or
{{ stack.runtime.manager }} run start:dev
{{/if}}
```

**Server will be available at:** `http://localhost:{{ getDefaultPort stack }}`
{{#if features.openapi}}
**API documentation:** `http://localhost:{{ getDefaultPort stack }}/docs`
{{/if}}
{{#if features.healthCheck}}
**Health check:** `http://localhost:{{ getDefaultPort stack }}/health`
{{/if}}

### Common Commands

```bash
{{#if (eq stack.language 'python')}}
# Install new dependency
{{ stack.runtime.manager }} add <package-name>

# Install dev dependency
{{ stack.runtime.manager }} add --group dev <package-name>

# Update dependencies
{{ stack.runtime.manager }} update

# Show dependency tree
{{ stack.runtime.manager }} show --tree

# Activate virtual environment
{{ stack.runtime.manager }} shell
{{else}}
# Install new dependency
{{ stack.runtime.manager }} {{ getInstallCommand stack.runtime.manager }} <package-name>

# Install dev dependency
{{ stack.runtime.manager }} {{ getInstallCommand stack.runtime.manager }} -D <package-name>

# Update dependencies
{{ stack.runtime.manager }} update

# Show dependency tree
{{ stack.runtime.manager }} list --depth=0
{{/if}}
```
<!-- agentgen:managed:end:development -->
```

### 8. Testing Section

**Input:** Blueprint tooling.testing

**Output:**
```markdown
<!-- agentgen:managed:start:testing -->
## Testing

### Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_main.py             # Application tests
└── test_api/
    └── test_routes.py       # API endpoint tests
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html --cov-report=term

# Run specific test file
pytest tests/test_main.py

# Run tests matching pattern
pytest -k "test_health"

# Run with verbose output
pytest -v

# Stop on first failure
pytest -x
```

### Test Requirements

**Coverage threshold:** 80%

Tests **MUST** be written for:
- All new API endpoints
- Database models and queries
- Authentication logic
- Business logic functions

Tests **SHOULD** be written for:
- Edge cases and error handling
- Integration between modules
- External API interactions (mocked)

### CI Testing

Tests run automatically on:
- Every pull request
- Merge to main branch

**CI checks:**
- Linting (ruff)
- Type checking (mypy)
- Unit tests (pytest)
- Coverage threshold (≥80%)
<!-- agentgen:managed:end:testing -->
```

**Template:**
```handlebars
<!-- agentgen:managed:start:testing -->
## Testing

### Test Structure

```
{{ paths.testDir }}/
{{#if (eq stack.language 'python')}}
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_main.py             # Application tests
└── test_api/
    └── test_routes.py       # API endpoint tests
{{else}}
├── setup.ts                 # Test setup
├── integration/
│   └── api.test.ts
└── unit/
    └── services.test.ts
{{/if}}
```

### Running Tests

```bash
{{#if (eq tooling.testing.framework 'pytest')}}
# Run all tests
pytest

# Run with coverage
pytest --cov={{ paths.sourceDir }} --cov-report=html --cov-report=term

# Run specific test file
pytest {{ paths.testDir }}/test_main.py

# Run tests matching pattern
pytest -k "test_health"

# Run with verbose output
pytest -v

# Stop on first failure
pytest -x
{{else if (eq tooling.testing.framework 'vitest')}}
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test {{ paths.testDir }}/integration/api.test.ts
{{else if (eq tooling.testing.framework 'jest')}}
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Update snapshots
npm run test -- -u
{{/if}}
```

{{#if tooling.testing.coverage}}
### Test Requirements

**Coverage threshold:** {{ tooling.testing.coverageThreshold }}%

{{/if}}
{{#if (eq agent.testRequirements 'always')}}
Tests **MUST** be written for:
- All new API endpoints
- Database models and queries
- Authentication logic
- Business logic functions

Tests **SHOULD** be written for:
- Edge cases and error handling
- Integration between modules
- External API interactions (mocked)
{{else if (eq agent.testRequirements 'on-request')}}
Tests **SHOULD** be written for:
- New features when requested
- Critical authentication/auth logic
- Database operations
- Core business logic
{{/if}}

{{#if infrastructure.ci.checks}}
{{#if (arrayIncludes infrastructure.ci.checks 'test')}}
### CI Testing

Tests run automatically on:
- Every pull request
- Merge to main branch

**CI checks:**
{{#each infrastructure.ci.checks}}
- {{ capitalize this }}
{{/each}}
{{/if}}
{{/if}}
<!-- agentgen:managed:end:testing -->
```

### 9. Infrastructure Section

**Input:** Blueprint infrastructure configuration

**Output:**
```markdown
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

# Build and run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

**Registry:** docker.io

### CI/CD

**Provider:** GitHub Actions
**Workflow file:** `.github/workflows/ci.yml`

**Automated checks:**
- Code linting (ruff)
- Type checking (mypy)
- Unit tests (pytest)
- Security scanning

**Triggers:**
- Push to main branch
- Pull requests
- Manual workflow dispatch

### Deployment

**Target platform:** Kubernetes

**Deployment steps:**
1. CI/CD builds Docker image
2. Image pushed to registry
3. Kubernetes pulls latest image
4. Rolling update applied
5. Health checks verify deployment

**Environment variables required:**
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
<!-- agentgen:managed:end:infrastructure -->
```

**Template:** (See full template in AGENT.md.hbs example below)

### 10. Agent Rules Section

**Input:** Blueprint agent configuration

**Output:**
```markdown
<!-- agentgen:managed:start:agent-rules -->
## AI Agent Behavioral Rules

### Strictness Level: Balanced

The AI agent has **moderate autonomy**. It can make reasonable technical decisions but should ask before major architectural changes or potentially breaking modifications.

### Test Requirements: Always

When adding new features or endpoints, the agent **MUST** write corresponding tests. Code without tests should not be considered complete.

### Allowed Operations

The agent **MAY** perform these operations autonomously:
- ✅ Add new API endpoints
- ✅ Add database models
- ✅ Add unit tests
- ✅ Refactor existing code for clarity
- ✅ Update dependencies (within semver constraints)

### Prohibited Operations

The agent **MUST NOT** perform these operations without explicit approval:
- ❌ Modify authentication logic
- ❌ Disable type checking or linting
- ❌ Change database schema without migration
- ❌ Remove or skip tests
- ❌ Commit secrets or credentials

### Custom Rules

1. All database operations must use async SQLAlchemy
2. All endpoints must have corresponding tests
3. Never commit secrets or credentials to version control
4. Follow REST API naming conventions
5. Use Pydantic models for request/response validation

### Communication Style

- **Be explicit** about changes being made
- **Ask permission** for architectural decisions
- **Explain reasoning** when suggesting alternatives
- **Flag risks** in proposed changes
<!-- agentgen:managed:end:agent-rules -->
```

**Template:** (See full template in AGENT.md.hbs example below)

---

## Regeneration Algorithm

### 1. Parse Existing AGENT.md

```typescript
function parseAgentMd(content: string): ParsedAgentMd {
  const sections: Map<string, ManagedSection> = new Map();
  const customContent: string[] = [];

  // Regex to find managed sections
  const sectionRegex = /<!-- agentgen:managed:start:(\w+) -->([\s\S]*?)<!-- agentgen:managed:end:\1 -->/g;

  let lastIndex = 0;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    const [fullMatch, sectionId, sectionContent] = match;

    // Capture content before this section (custom content)
    if (match.index > lastIndex) {
      customContent.push(content.substring(lastIndex, match.index));
    }

    // Store managed section
    sections.set(sectionId, {
      id: sectionId,
      startMarker: `<!-- agentgen:managed:start:${sectionId} -->`,
      endMarker: `<!-- agentgen:managed:end:${sectionId} -->`,
      content: sectionContent,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length
    });

    lastIndex = match.index + fullMatch.length;
  }

  // Capture remaining custom content
  if (lastIndex < content.length) {
    customContent.push(content.substring(lastIndex));
  }

  return {
    sections,
    customContent,
    originalContent: content
  };
}
```

### 2. Generate New Managed Content

```typescript
function generateManagedSections(blueprint: Blueprint, pack: Pack): Map<string, string> {
  const template = loadTemplate(pack, 'AGENT.md.hbs');
  const sections: Map<string, string> = new Map();

  // Render full AGENT.md template
  const rendered = renderTemplate(template, blueprint);

  // Extract each managed section from rendered template
  const sectionRegex = /<!-- agentgen:managed:start:(\w+) -->([\s\S]*?)<!-- agentgen:managed:end:\1 -->/g;
  let match;

  while ((match = sectionRegex.exec(rendered)) !== null) {
    const [fullMatch, sectionId, content] = match;
    sections.set(sectionId, fullMatch); // Store full section with markers
  }

  return sections;
}
```

### 3. Merge Strategy

```typescript
function regenerateAgentMd(
  existingContent: string,
  blueprint: Blueprint,
  pack: Pack
): string {
  // Parse existing file
  const parsed = parseAgentMd(existingContent);

  // Generate new managed sections
  const newSections = generateManagedSections(blueprint, pack);

  // Build new content
  const parts: string[] = [];
  let currentIndex = 0;

  // Sort sections by their appearance in original file
  const sortedSections = Array.from(parsed.sections.values())
    .sort((a, b) => a.startIndex - b.startIndex);

  for (const section of sortedSections) {
    // Add any custom content before this section
    if (section.startIndex > currentIndex) {
      parts.push(existingContent.substring(currentIndex, section.startIndex));
    }

    // Add new managed content (or keep old if section no longer generated)
    const newContent = newSections.get(section.id);
    if (newContent) {
      parts.push(newContent);
      newSections.delete(section.id); // Mark as used
    } else {
      // Section no longer in template, preserve old content
      parts.push(
        section.startMarker +
        section.content +
        section.endMarker
      );
    }

    currentIndex = section.endIndex;
  }

  // Add remaining custom content
  if (currentIndex < existingContent.length) {
    parts.push(existingContent.substring(currentIndex));
  }

  // Add any new sections that didn't exist before
  for (const [id, content] of newSections) {
    parts.push('\n' + content + '\n');
  }

  return parts.join('');
}
```

### 4. Safety Checks

```typescript
function safeRegenerateAgentMd(
  filePath: string,
  blueprint: Blueprint,
  pack: Pack
): RegenerationResult {
  // Backup existing file
  const backup = fs.readFileSync(filePath, 'utf-8');
  const backupPath = `${filePath}.backup`;
  fs.writeFileSync(backupPath, backup);

  try {
    // Regenerate
    const newContent = regenerateAgentMd(backup, blueprint, pack);

    // Validation
    const validation = validateAgentMd(newContent);
    if (!validation.valid) {
      throw new Error(`Invalid AGENT.md: ${validation.errors.join(', ')}`);
    }

    // Check for accidental deletions
    const customContentLost = checkCustomContentPreserved(backup, newContent);
    if (customContentLost > 0.1) { // >10% lost
      throw new Error('Excessive custom content lost. Aborting.');
    }

    // Write new content
    fs.writeFileSync(filePath, newContent);

    // Cleanup backup
    fs.unlinkSync(backupPath);

    return {
      success: true,
      sectionsUpdated: getSectionsUpdated(backup, newContent),
      customContentPreserved: true
    };

  } catch (error) {
    // Restore backup
    fs.writeFileSync(filePath, backup);
    fs.unlinkSync(backupPath);

    return {
      success: false,
      error: error.message
    };
  }
}
```

---

## Complete Template Example

See `AGENT.md.hbs` template in next section.

---

## Example Generated AGENT.md Files

### Example 1: Python API with PostgreSQL

**(See full example in docs/examples/agent-md-python-api.md)**

### Example 2: Node API with MongoDB

**(See full example in docs/examples/agent-md-node-api.md)**

---

## CLI Commands

### Generate AGENT.md

```bash
# Generate during project init
agentgen init
# → Creates AGENT.md as part of project

# Generate standalone from blueprint
agentgen generate-agent ./blueprint.json --output AGENT.md
```

### Regenerate Managed Sections

```bash
# Update existing AGENT.md from blueprint
agentgen update-agent ./AGENT.md --blueprint blueprint.json

# Preview changes without writing
agentgen update-agent ./AGENT.md --blueprint blueprint.json --dry-run

# Update with backup
agentgen update-agent ./AGENT.md --blueprint blueprint.json --backup
```

**Output:**
```
→ Reading existing AGENT.md...
→ Loading blueprint...
→ Generating new managed sections...

Sections to be updated:
  ✓ metadata (changed)
  ✓ dependencies (changed: 2 additions, 1 removal)
  ✓ features (unchanged)
  ✓ tooling (changed)
  ✓ agent-rules (unchanged)

Custom content: 245 lines preserved

Apply changes? [Y/n]: y

✓ AGENT.md updated successfully
✓ Backup saved to AGENT.md.backup
```

### Validate AGENT.md

```bash
# Check for valid managed sections
agentgen validate-agent ./AGENT.md

# Check compatibility with blueprint
agentgen validate-agent ./AGENT.md --blueprint blueprint.json
```

---

## Best Practices

### For Pack Authors

1. **Include all standard sections** in AGENT.md template
2. **Use descriptive section IDs** (lowercase, hyphenated)
3. **Keep managed sections focused** (single concern per section)
4. **Provide helpful comments** in custom content areas
5. **Test regeneration** to ensure custom content preserved

### For Users

1. **Add custom content outside managed blocks**
2. **Don't edit within managed markers** (will be overwritten)
3. **Use descriptive headings** for custom sections
4. **Commit AGENT.md** to version control
5. **Review diffs** when regenerating

### For AI Agents

1. **Read AGENT.md first** before making changes
2. **Follow strictness level** (strict/balanced/permissive)
3. **Check allowed/prohibited operations**
4. **Respect test requirements** (always/on-request/never)
5. **Ask before regenerating** managed sections

---

## Error Handling

### Missing Markers

**Scenario:** Managed section markers are malformed or missing

**Detection:**
```typescript
if (!content.includes('<!-- agentgen:managed:start:metadata -->')) {
  warnings.push('Missing metadata section markers');
}
```

**Handling:**
- Warn user
- Skip regeneration for that section
- Suggest adding markers manually

### Marker Mismatch

**Scenario:** Start and end markers don't match

```markdown
<!-- agentgen:managed:start:dependencies -->
...
<!-- agentgen:managed:end:features -->  ❌ Wrong end marker
```

**Detection:**
```typescript
if (startId !== endId) {
  throw new Error(`Marker mismatch: start=${startId}, end=${endId}`);
}
```

**Handling:**
- Abort regeneration
- Show error with line numbers
- Suggest fixing markers

### Nested Markers

**Scenario:** User accidentally nests managed sections

**Detection:**
```typescript
if (detectNestedMarkers(content)) {
  throw new Error('Nested managed sections are not supported');
}
```

**Handling:**
- Abort regeneration
- Show nested marker locations
- Suggest flattening structure

---

## Summary

### Key Features

✅ **Managed sections** - Auto-generated, regenerable content
✅ **Custom sections** - User content preserved across regenerations
✅ **Blueprint-driven** - All managed content from blueprint
✅ **Deterministic** - Same blueprint = same output
✅ **Safe regeneration** - Backups and validation
✅ **CLI support** - Generate, update, validate commands

### Managed Section Benefits

1. **Always in sync** with blueprint
2. **Accurate documentation** (derived from source of truth)
3. **Reduced maintenance** (auto-updated)
4. **Clear boundaries** (managed vs. custom)
5. **Version control friendly** (clear diffs)

### Custom Content Benefits

1. **Preserved across regenerations**
2. **Full markdown flexibility**
3. **Team collaboration** (no conflicts with automation)
4. **Project-specific documentation**
5. **Architecture decisions captured**

---

## Implementation Checklist

- [ ] Parse existing AGENT.md (extract managed sections)
- [ ] Generate new managed sections from blueprint
- [ ] Merge strategy (preserve custom content)
- [ ] Safety checks (backup, validation, diff)
- [ ] CLI commands (generate, update, validate)
- [ ] Error handling (missing markers, mismatches)
- [ ] Template helpers (getToolCommand, getMigrationCommand, etc.)
- [ ] Example templates (Python, Node)
- [ ] Example generated files
- [ ] Documentation and guides
