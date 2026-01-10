# AI Agent Guidelines for Agentgen

## Project Overview

Agentgen is a project scaffolding tool that generates AI-agent-ready codebases. It uses template packs and blueprints to create deterministic, well-documented projects with AGENT.md files that guide AI agents in understanding and working with the generated code.

**Key Features:**
- Blueprint-driven project generation
- Managed sections system for regenerable documentation
- Template pack architecture
- Dependency verification
- Interview-based configuration

## Technical Stack

- **Language:** TypeScript 5.3+
- **Runtime:** Node.js >=20.0.0
- **Package Manager:** pnpm
- **Testing:** Vitest
- **Build Tool:** TypeScript compiler (tsc)
- **Template Engine:** Handlebars

## Project Structure

```
src/
├── blueprint/          # Blueprint schema and builder
│   ├── schema.ts       # Zod schema for blueprint validation
│   └── builder.ts      # Blueprint construction logic
├── cli/                # CLI commands and interface
│   └── commands/       # Command implementations
├── core/               # Core types and errors
│   ├── types.ts        # Shared type definitions
│   └── errors.ts       # Custom error classes
├── interview/          # Interactive interview system
│   └── types.ts        # Interview question types
├── packs/              # Template pack system
│   └── types.ts        # Pack metadata and structure
├── renderer/           # Template rendering engine
│   ├── engine.ts       # Handlebars template renderer
│   └── types.ts        # Renderer type definitions
└── verification/       # Dependency verification
    └── verifier.ts     # Package manager verification

tests/
├── unit/               # Unit tests
│   ├── blueprint.test.ts
│   └── managed-sections.test.ts
└── integration/        # Integration tests
    ├── generate.test.ts
    └── update-agent.test.ts

docs/                   # Documentation
├── examples/           # Example blueprints and templates
├── ARCHITECTURE.md     # System architecture
├── BLUEPRINT-SCHEMA.md # Blueprint specification
├── TEMPLATE-PACKS.md   # Pack authoring guide
└── AGENT-MD-GENERATION.md  # AGENT.md system docs
```

## Development Tooling

### Code Quality
- **Linter:** ESLint (configured in `.eslintrc.json`)
- **Formatter:** Prettier (configured in `.prettierrc`)
- **Type Checker:** TypeScript (configured in `tsconfig.json`)

### Testing
- **Framework:** Vitest
- **Coverage:** Required (minimum 80%)
- **Test Types:** Unit tests, Integration tests, Snapshot tests

### Tool Commands

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run typecheck

# Run all checks (lint + typecheck + test)
pnpm run check
```

## Core Concepts

### 1. Blueprints

Blueprints are JSON configuration files that deterministically describe a project:
- Stack configuration (language, framework, dependencies)
- Feature flags (database, auth, CORS, etc.)
- Tooling setup (linters, formatters, test frameworks)
- Infrastructure (Docker, CI/CD)
- Agent behavioral rules

**Location:** `src/blueprint/schema.ts`

### 2. Template Packs

Packs are collections of templates and logic for generating specific project types:
- Python API pack (FastAPI)
- Node API pack (Express)
- Each pack provides templates and blueprint builders

**Location:** `src/packs/`

### 3. Managed Sections

AGENT.md files use managed sections that can be regenerated while preserving custom content:
- Markers: `<!-- agentgen:managed:start:section-id -->` and `<!-- agentgen:managed:end:section-id -->`
- Content between markers is regenerated from blueprint
- Content outside markers is preserved

**Location:** `src/renderer/engine.ts`

### 4. Interview System

Interactive questionnaire that collects project requirements:
- Adaptive questions based on previous answers
- Validation at input time
- Transforms answers into blueprint

**Location:** `src/interview/`

## Development Workflow

### Adding a New Feature

1. **Design:** Document the feature in relevant docs (ARCHITECTURE.md, etc.)
2. **Types:** Add/update TypeScript types in `src/core/types.ts`
3. **Implementation:** Implement the feature with proper error handling
4. **Tests:** Write unit tests and integration tests
5. **Documentation:** Update relevant documentation
6. **Validation:** Run `pnpm run check` to ensure all checks pass

### Modifying Blueprint Schema

1. **Update Schema:** Modify `src/blueprint/schema.ts` with Zod validators
2. **Update Types:** TypeScript types are inferred from Zod schema
3. **Update Builder:** Modify `src/blueprint/builder.ts` if needed
4. **Update Templates:** Adjust Handlebars templates to use new fields
5. **Update Tests:** Add tests for new schema fields
6. **Update Docs:** Document changes in `BLUEPRINT-SCHEMA.md`

### Adding a New Template Pack

1. **Create Pack Directory:** `src/packs/<pack-name>/`
2. **Define Metadata:** Create pack metadata with id, version, language, framework
3. **Create Templates:** Add Handlebars templates in `templates/` subdirectory
4. **Implement Builder:** Custom blueprint builder for pack-specific logic
5. **Add Interview:** Define interview questions for pack configuration
6. **Write Tests:** Integration tests for pack generation
7. **Document:** Add pack to `TEMPLATE-PACKS.md`

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
- Every new CLI command has integration tests
- Edge cases are covered
- Error scenarios are tested
- Coverage meets 80% threshold

### Allowed Operations

The agent **MAY** perform these operations autonomously:
- ✅ Add new CLI commands
- ✅ Add new template pack features
- ✅ Add unit tests and integration tests
- ✅ Refactor code for clarity and maintainability
- ✅ Fix bugs with tests
- ✅ Update documentation
- ✅ Add new blueprint schema fields (with proper validation)
- ✅ Improve error messages and handling
- ✅ Add Handlebars helpers for templates

### Prohibited Operations

The agent **MUST NOT** perform these operations without explicit approval:
- ❌ Change core architecture (blueprint schema structure, renderer design)
- ❌ Modify managed section marker format (breaking change for users)
- ❌ Remove or significantly change existing CLI commands (breaking change)
- ❌ Disable type checking or linting
- ❌ Remove tests or reduce coverage
- ❌ Change blueprint version format (requires migration strategy)
- ❌ Modify verification algorithm without thorough testing

### Custom Project Rules

1. **All blueprint schema fields must use Zod validators** - Never use plain TypeScript types for blueprint schema
2. **All CLI commands must have --help text** - Help text should be clear and include examples
3. **All template packs must validate before generation** - Never generate invalid projects
4. **Error messages must be actionable** - Include suggestions for fixing the error
5. **Breaking changes require deprecation path** - Never break existing blueprints without migration
6. **Templates must be deterministic** - Same blueprint = same output every time
7. **Never commit generated test artifacts** - Keep the repo clean
8. **Documentation stays in sync with code** - Update docs when changing behavior
9. **Follow semantic versioning strictly** - Breaking changes = major version bump
10. **All file operations must handle errors** - Check for permissions, disk space, etc.

### Communication Guidelines

When working on this project, the agent should:
- **Be explicit** about changes being made and why
- **Ask questions** when requirements are ambiguous
- **Explain trade-offs** when suggesting alternatives
- **Flag risks** in proposed changes or existing code
- **Respect conventions** established in the codebase
- **Document decisions** that affect future development
- **Reference issue numbers** when applicable
- **Consider backwards compatibility** for all changes

### Error Handling

When encountering errors or blockers:
1. **Analyze the root cause** before suggesting fixes
2. **Propose solutions** with clear reasoning
3. **Consider side effects** of proposed changes
4. **Test thoroughly** before marking as complete
5. **Document workarounds** if applicable
6. **Update error messages** to help future users

## Testing Strategy

### Unit Tests

Focus on individual functions and modules:
- Blueprint schema validation
- Template rendering logic
- Blueprint builder functions
- Helper utilities

**Location:** `tests/unit/`

### Integration Tests

Test complete workflows:
- Project generation from blueprint
- AGENT.md regeneration with managed sections
- CLI command execution
- Dependency verification

**Location:** `tests/integration/`

### Snapshot Tests

Ensure generated output stays consistent:
- Generated AGENT.md files
- Generated project files
- Rendered templates

**Use carefully** - only for deterministic output

## Common Pitfalls

### 1. Modifying Managed Section Markers

❌ **Don't change the marker format** - Users depend on it
✅ **Extend the system** - Add new section IDs, not new marker formats

### 2. Adding Required Blueprint Fields

❌ **Don't add required fields** - Breaks existing blueprints
✅ **Add optional fields** - Provide sensible defaults

### 3. Non-Deterministic Templates

❌ **Don't use `Date.now()` or random values** in templates
✅ **Use blueprint.meta.generatedAt** for timestamps

### 4. Breaking Zod Schema Changes

❌ **Don't change Zod validators without migration**
✅ **Add refinements** or **optional fields** instead

### 5. Ignoring Error Cases

❌ **Don't assume file operations succeed**
✅ **Handle ENOENT, EACCES, ENOSPC** and other file system errors

## Continuous Integration

Tests run automatically on:
- Every pull request
- Pushes to main branch
- Manual workflow triggers

**CI pipeline checks:**
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Vitest)
- Integration tests (Vitest)
- Coverage threshold (≥80%)
- Build verification

**Workflow file:** `.github/workflows/ci.yml`

## Release Process

1. **Update version** in `package.json` (follow semver)
2. **Update CHANGELOG.md** with notable changes
3. **Run full test suite** - `pnpm run check && pnpm test`
4. **Build** - `pnpm run build`
5. **Tag release** - `git tag v<version>`
6. **Push to main** - Creates GitHub release automatically
7. **Publish to npm** - `pnpm publish` (if applicable)

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/blueprint/schema.ts` | Blueprint Zod schema and validation |
| `src/blueprint/builder.ts` | Blueprint construction from options/answers |
| `src/renderer/engine.ts` | Handlebars template rendering |
| `src/cli/commands/new.ts` | `agentgen new` command implementation |
| `src/cli/commands/update-agent.ts` | `agentgen update-agent` command |
| `src/core/types.ts` | Shared TypeScript types |
| `src/core/errors.ts` | Custom error classes |
| `docs/BLUEPRINT-SCHEMA.md` | Complete blueprint specification |
| `docs/TEMPLATE-PACKS.md` | Pack authoring guide |
| `docs/AGENT-MD-GENERATION.md` | AGENT.md system documentation |

## Dependencies

### Production Dependencies
- `zod` - Schema validation
- `handlebars` - Template engine
- `commander` - CLI framework
- `chalk` - Terminal colors
- `inquirer` - Interactive prompts
- `fs-extra` - File system utilities

### Development Dependencies
- `typescript` - Type checking
- `vitest` - Testing framework
- `@vitest/coverage-v8` - Coverage reporting
- `eslint` - Linting
- `prettier` - Code formatting
- `tsx` - TypeScript execution

## Additional Resources

- **Architecture:** See `ARCHITECTURE.md` for system design
- **Blueprint Spec:** See `BLUEPRINT-SCHEMA.md` for complete schema
- **Pack Authoring:** See `TEMPLATE-PACKS.md` for creating packs
- **AGENT.md System:** See `AGENT-MD-GENERATION.md` for managed sections
- **Verification:** See `VERIFICATION.md` for dependency checking

---

## Custom Project Notes

### Current Development Focus (2026-01)

- Blueprint schema validation improvements
- Cross-field validation with Zod refinements
- Semver validation for dependencies
- Agent configuration enhancements

### Known Issues

- None currently documented

### Future Enhancements

- Additional template packs (Go, Rust, Java)
- Web UI for blueprint creation
- Blueprint migration tool for version upgrades
- Visual diff tool for blueprint comparison
- Pack marketplace/registry
