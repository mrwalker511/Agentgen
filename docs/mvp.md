# Agentgen MVP Contract

**Version:** 1.0
**Status:** Frozen
**Target:** Shippable MVP - Interview-driven project scaffolding with AGENT.md as first-class artifact

---

## Supported Commands

### `agentgen init`
**Purpose:** Generate new project from interactive interview
**Behavior:**
- Run adaptive questionnaire from selected pack
- Build and validate blueprint
- Verify dependencies using ecosystem tools (Poetry/npm)
- Render project files from templates
- Create AGENT.md with managed sections
- Report success with next steps

**Flags:**
- `--pack <id>` - Skip pack selection, use specified pack
- `--output <dir>` - Output directory (default: `./{project-name}`)
- `--blueprint-only` - Generate blueprint JSON without rendering files
- `--dry-run` - Show what would be generated without writing files

**Exit codes:**
- `0` - Success
- `1` - Validation failure (constraints violated)
- `2` - Verification failure (dependency conflicts)
- `3` - User abort

---

### `agentgen verify`
**Purpose:** Verify blueprint dependencies without generating files
**Behavior:**
- Load blueprint from file
- Extract dependencies
- Run pack-specific verifier (Poetry/npm dry-run)
- Report conflicts or success
- Optionally save JSON report

**Flags:**
- `--output <file>` - Save verification report JSON
- `--verbose` - Show detailed solver output

**Exit codes:**
- `0` - All dependencies compatible
- `1` - Conflicts detected
- `2` - Tool not installed (Poetry/npm/pnpm/yarn)

---

## Supported Packs

### Pack: `python-api`
**ID:** `python-api`
**Version:** `1.0.0`
**Description:** FastAPI-based REST API with Poetry

**Language:** Python
**Framework:** FastAPI
**Package Manager:** Poetry

**Supported Options:**
- **Python versions:** 3.10, 3.11, 3.12
- **Databases:** PostgreSQL, MySQL, SQLite, None
- **ORMs:** SQLAlchemy, Tortoise, None
- **Auth methods:** JWT, OAuth2, API Key, None
- **Linters:** Ruff, Pylint, Flake8, None
- **Formatters:** Ruff, Black, None
- **Type checkers:** mypy, pyright, None
- **Test frameworks:** pytest, unittest, None
- **CI providers:** GitHub Actions, GitLab CI, CircleCI, None

**Generated Files:**
```
{project-name}/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── db/              (if database enabled)
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── models.py
│   └── auth/            (if auth enabled)
│       ├── __init__.py
│       └── jwt.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_main.py
├── alembic/             (if migrations enabled)
│   └── env.py
├── pyproject.toml
├── README.md
├── AGENT.md             ← First-class artifact
├── .env.example
├── .gitignore
├── Dockerfile           (if Docker enabled)
├── docker-compose.yml   (if Docker Compose enabled)
└── .github/
    └── workflows/
        └── ci.yml       (if CI enabled)
```

**Features:**
- Async database support (asyncpg/aiomysql)
- Database migrations (Alembic)
- JWT/OAuth2 authentication
- CORS middleware
- OpenAPI documentation
- Health check endpoint
- Docker support
- Docker Compose with database services
- GitHub Actions CI

---

### Pack: `node-api`
**ID:** `node-api`
**Version:** `1.0.0`
**Description:** Express + TypeScript REST API

**Language:** TypeScript
**Framework:** Express
**Package Managers:** npm, pnpm, yarn

**Supported Options:**
- **Node versions:** 18.x, 20.x, 21.x
- **Databases:** PostgreSQL, MySQL, MongoDB, SQLite, None
- **ORMs:** Prisma, TypeORM, Sequelize, None
- **Auth methods:** JWT, OAuth2, API Key, None
- **Linters:** ESLint, Biome, None
- **Formatters:** Prettier, Biome, None
- **Type checkers:** TypeScript (built-in)
- **Test frameworks:** Vitest, Jest, None
- **CI providers:** GitHub Actions, GitLab CI, CircleCI, None

**Generated Files:**
```
{project-name}/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── routes/
│   │   └── api.ts
│   ├── db/              (if database enabled)
│   │   └── client.ts
│   └── auth/            (if auth enabled)
│       └── jwt.ts
├── tests/
│   ├── setup.ts
│   └── integration/
│       └── api.test.ts
├── prisma/              (if Prisma enabled)
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── README.md
├── AGENT.md             ← First-class artifact
├── .env.example
├── .gitignore
├── Dockerfile           (if Docker enabled)
├── docker-compose.yml   (if Docker Compose enabled)
└── .github/
    └── workflows/
        └── ci.yml       (if CI enabled)
```

**Features:**
- TypeScript strict mode
- Database migrations (Prisma Migrate/TypeORM)
- JWT/OAuth2 authentication
- CORS middleware
- Helmet security headers
- Express rate limiting
- Health check endpoint
- Docker support
- Docker Compose with database services
- GitHub Actions CI

---

## Tooling Choices

### Implementation Language
**Choice:** TypeScript (Node.js)
**Rationale:**
- Fast development iteration
- Rich ecosystem for CLI tools (Commander, Inquirer, Handlebars)
- Easy to distribute via npm (`npm install -g agentgen`)
- Native JSON handling
- Cross-platform (Windows, macOS, Linux)

### Template Engine
**Choice:** Handlebars
**Rationale:**
- Widely adopted, stable
- Logic-less templates (enforces separation)
- Good tooling and IDE support
- Supports custom helpers
- Familiar to most developers

### CLI Framework
**Choice:** Commander.js
**Rationale:**
- De facto standard for Node.js CLIs
- Clean API for command routing
- Built-in help generation
- Argument parsing and validation

### Interview Prompts
**Choice:** Inquirer.js
**Rationale:**
- Rich prompt types (text, select, multiselect, confirm)
- Validation and filtering built-in
- Conditional prompts (when clause)
- Great UX (autocomplete, fuzzy search)

### Schema Validation
**Choice:** Zod
**Rationale:**
- TypeScript-first validation
- Infer types from schema
- Clear error messages
- Composable validators

### Dependency Verification
**Choice:** Ecosystem-native tools
**Python:** Poetry (`poetry lock --no-update --dry-run`)
**Node:** npm/pnpm/yarn lockfile generation
**Rationale:**
- Don't reinvent dependency solvers
- Use same tools developers use
- Accurate, battle-tested
- Clear error messages

### Blueprint Format
**Choice:** JSON
**Rationale:**
- Diffable, versionable
- Standard tooling (jq, diff)
- Easy to parse and generate
- Schema validation via JSON Schema

### Constraint Definitions
**Choice:** YAML
**Rationale:**
- Human-readable for pack authors
- Supports comments
- Easier to write than JSON for complex rules
- Standard parsers available

---

## AGENT.md Managed Sections

### Standard Section IDs (MVP)
1. **`metadata`** - Pack info, generation timestamp
2. **`stack`** - Language, framework, runtime
3. **`dependencies`** - Package lists with versions
4. **`features`** - Enabled feature flags
5. **`tooling`** - Linters, formatters, type checkers
6. **`development`** - Dev server, build commands
7. **`testing`** - Test commands, coverage
8. **`infrastructure`** - Docker, CI/CD info
9. **`agent-rules`** - AI agent behavioral rules

### Managed Block Format
```markdown
<!-- agentgen:managed:start:{section-id} -->
Auto-generated content (replaced on regeneration)
<!-- agentgen:managed:end:{section-id} -->
```

### Custom Content
**Everything outside managed blocks is preserved across regenerations.**

Users can add:
- Architecture notes
- Known issues
- Development workflow
- Project-specific agent guidelines
- Team conventions

---

## Explicit Non-Goals (MVP)

### Not Included
❌ **GUI or web interface** - CLI only
❌ **Remote template packs** - Built-in packs only (no URL loading)
❌ **Plugin system** - No dynamic plugin loading
❌ **Pack registry** - No npm/PyPI-style pack distribution
❌ **Update existing projects** - Only new project generation
❌ **Incremental feature addition** - No `agentgen add-feature`
❌ **Multi-language projects** - One language per project
❌ **Monorepo support** - Single project only
❌ **Custom constraint DSL** - YAML-based constraints only
❌ **Pack authoring CLI** - Manual pack creation
❌ **Interactive blueprint editing** - Edit JSON manually
❌ **Diff preview before rendering** - No `--preview` with visual diff
❌ **Rollback mechanism** - No project uninstall
❌ **Telemetry or analytics** - No usage tracking
❌ **Auto-update checker** - No version update notifications

### Deferred to Post-MVP
🔜 **`agentgen update-agent`** - Regenerate AGENT.md managed sections
🔜 **Additional packs** - Go, Rust, Java
🔜 **Pack versioning** - Multiple versions per pack
🔜 **Custom pack locations** - `--pack-dir ./my-packs`
🔜 **Blueprint import/export** - Save/load blueprint workflow
🔜 **Constraint validation caching** - Speed up re-verification
🔜 **Verbose logging modes** - Debug output
🔜 **Shell completion** - Bash/Zsh autocompletion
🔜 **Config file** - `.agentgenrc` for defaults

---

## What Is NOT Implemented Yet

### Core Functionality (Must Implement for MVP)
- [ ] CLI entry point and command routing
- [ ] Interview engine with adaptive questions
- [ ] Blueprint builder and validator
- [ ] Constraint evaluation engine
- [ ] Pack loader and registry
- [ ] Template renderer (Handlebars integration)
- [ ] Dependency verifier (Poetry/npm integration)
- [ ] File writer with managed section support
- [ ] AGENT.md generator
- [ ] Error handling and user-friendly messages

### Template Packs (Must Implement for MVP)
- [ ] `python-api` pack complete
  - [ ] Interview questions JSON
  - [ ] Constraints YAML
  - [ ] Defaults JSON
  - [ ] All template files (`.hbs`)
  - [ ] Verifier script (Poetry integration)
  - [ ] AGENT.md template
- [ ] `node-api` pack complete
  - [ ] Interview questions JSON
  - [ ] Constraints YAML
  - [ ] Defaults JSON
  - [ ] All template files (`.hbs`)
  - [ ] Verifier script (npm/pnpm/yarn integration)
  - [ ] AGENT.md template

### Testing (Must Implement for MVP)
- [ ] Unit tests for each module (>80% coverage)
- [ ] Integration tests (end-to-end workflows)
- [ ] Pack validation tests
- [ ] Constraint evaluation tests
- [ ] Template rendering tests
- [ ] Dependency verification tests (mock Poetry/npm)

### Documentation (Must Implement for MVP)
- [ ] README with quick start
- [ ] Installation guide
- [ ] Usage examples
- [ ] Blueprint schema documentation
- [ ] Pack authoring guide (for contributors)
- [ ] Troubleshooting guide

### Distribution (Must Implement for MVP)
- [ ] npm package configuration
- [ ] Executable binary (`#!/usr/bin/env node`)
- [ ] Bundle packs with distribution
- [ ] Version management
- [ ] License file
- [ ] Changelog

---

## Success Criteria

### Functional Requirements
✅ User can run `agentgen init` and answer questions
✅ Tool generates valid, runnable project
✅ Generated project matches blueprint
✅ Dependencies verified before file creation
✅ AGENT.md generated with correct managed sections
✅ Files render correctly with conditional logic
✅ Constraints prevent invalid combinations
✅ Error messages are clear and actionable

### Quality Requirements
✅ Zero hallucinated commands or dependencies
✅ Deterministic output (same blueprint = same files)
✅ Fast execution (<30s for full generation)
✅ Works on macOS, Linux, Windows
✅ Requires only Node.js + Poetry/npm (no other dependencies)
✅ Handles network errors gracefully
✅ User can abort at any time

### Developer Experience
✅ Clear progress indicators
✅ Helpful error messages with suggestions
✅ Verification errors show package names and constraints
✅ Success message with next steps
✅ Generated README explains how to run project

---

## Out of Scope (Explicit)

### Will Not Support in MVP
- GUI, web dashboard, or IDE plugin
- SaaS backend or cloud hosting
- User accounts or authentication
- Remote pack loading (HTTP/Git URLs)
- Pack marketplace or registry
- Dynamic code execution in packs (beyond verifier scripts)
- Project updates or migrations
- Multi-project workspaces
- Live reload during interview
- Undo/redo during interview
- Natural language question input
- AI-generated pack suggestions
- Telemetry, crash reporting, or analytics

---

## Constraints

### Technical Constraints
- **Node.js:** >=18.0.0 (LTS)
- **Package size:** <10MB installed
- **Startup time:** <500ms for `--help`
- **Memory usage:** <200MB during generation
- **Dependency count:** <50 npm packages

### Pack Constraints
- **Python pack:** Requires Poetry >=1.5.0
- **Node pack:** Requires npm >=9.0.0 OR pnpm >=8.0.0 OR yarn >=3.0.0
- **Templates:** Handlebars only (no Jinja, EJS, etc.)
- **Constraint language:** YAML with predefined schema

### User Environment Constraints
- **Internet required:** For dependency verification (package registry access)
- **Disk space:** ~500MB for generated project + dependencies
- **Filesystem:** Case-sensitive recommended
- **Git:** Optional (for version control of generated project)

---

## Release Checklist

Before MVP release:
- [ ] All core modules implemented and tested
- [ ] Both packs (Python, Node) complete and tested
- [ ] End-to-end tests passing
- [ ] Documentation complete
- [ ] npm package published
- [ ] GitHub repository public
- [ ] License file included (MIT)
- [ ] Contributing guide
- [ ] Issue templates
- [ ] Examples in `docs/examples/`

---

## Version

**MVP Version:** `0.1.0`
**Blueprint Schema Version:** `1.0`
**Pack API Version:** `1.0`

---

**Frozen as of:** 2025-01-06
**Next review:** Post-MVP (after initial user feedback)
