# Agentgen Architecture

## Overview

Agentgen is a CLI tool that generates project scaffolds with AGENT.md files as first-class artifacts. It uses an interview-driven approach to collect requirements, then generates a complete, verified project structure.

**Core workflow:**
```
Interview → Blueprint → Template Selection → Rendering → Verification → Output
```

---

## Repository Structure

```
agentgen/
├── src/
│   ├── cli/              # CLI entry point and command handlers
│   ├── interview/        # Question engine and answer collection
│   ├── blueprint/        # Blueprint creation and validation
│   ├── packs/            # Template pack system
│   ├── renderer/         # File generation from templates
│   ├── verification/     # Dependency verification
│   ├── core/             # Shared types, utilities, errors
│   └── index.ts          # Main export
├── packs/                # Built-in template packs
│   ├── python-api/
│   │   ├── pack.json     # Pack metadata
│   │   ├── interview.json # Questions for this pack
│   │   ├── templates/    # Template files
│   │   └── verifier.ts   # Pack-specific verification logic
│   └── node-api/
│       ├── pack.json
│       ├── interview.json
│       ├── templates/
│       └── verifier.ts
├── tests/
│   ├── unit/             # Unit tests per module
│   ├── integration/      # End-to-end workflow tests
│   └── fixtures/         # Test data and mock packs
├── docs/
│   ├── architecture.md   # This file (or move to root)
│   ├── creating-packs.md # Guide for pack authors
│   └── examples/         # Example blueprints and outputs
├── scripts/              # Build and development scripts
├── package.json          # (or pyproject.toml if Python)
├── tsconfig.json         # (or appropriate config)
├── README.md
└── LICENSE
```

**Rationale:**
- **`src/` organized by capability**: Each subdirectory is a cohesive module with clear responsibility
- **`packs/` separate from `src/`**: Template packs are data/content, not code. Makes it easy to add new packs without touching core logic
- **Tests mirror source structure**: Easy to find tests for any module
- **Docs are first-class**: Architecture and pack authoring guides live alongside code

---

## Module Breakdown

### 1. `cli/` - Command Line Interface

**Responsibility:**
- Parse command-line arguments
- Route commands (`init`, `verify`, `update-agent`, etc.)
- Handle global flags (verbose, output directory, etc.)
- Coordinate high-level workflow

**Key files:**
- `cli/index.ts` - CLI framework setup (e.g., Commander.js, yargs)
- `cli/commands/init.ts` - Main generation command
- `cli/commands/verify.ts` - Verify existing project dependencies
- `cli/commands/update-agent.ts` - Regenerate managed AGENT.md sections
- `cli/output.ts` - Formatted console output (spinners, colors, etc.)

**Rationale:**
- Thin layer - business logic lives in other modules
- Separating commands makes testing easier (mock CLI args, test command handlers)
- `output.ts` centralizes UI concerns so other modules stay UI-agnostic

---

### 2. `interview/` - Question Engine

**Responsibility:**
- Load question definitions from template packs
- Present questions to user in correct order
- Handle conditional questions (skip if not applicable)
- Validate answers against constraints
- Return structured answer set

**Key files:**
- `interview/engine.ts` - Core interview orchestration
- `interview/prompts.ts` - User input prompts (text, select, confirm, etc.)
- `interview/validator.ts` - Answer validation logic
- `interview/types.ts` - Question and Answer type definitions

**Key types:**
```typescript
type Question = {
  id: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  prompt: string;
  default?: any;
  choices?: string[];
  validate?: (answer: any) => boolean | string;
  when?: (answers: AnswerSet) => boolean;  // Conditional logic
};

type AnswerSet = Record<string, any>;
```

**Rationale:**
- Interview is completely decoupled from template content
- Questions come from pack definitions, making the engine reusable
- Conditional logic (`when`) allows complex flows without hardcoding
- Validation at input time prevents bad blueprints downstream

---

### 3. `blueprint/` - Blueprint Management

**Responsibility:**
- Transform AnswerSet into a validated Blueprint
- Provide schema for blueprint structure
- Merge defaults from template pack
- Validate blueprint completeness and consistency

**Key files:**
- `blueprint/builder.ts` - Construct blueprint from answers
- `blueprint/schema.ts` - Blueprint type definitions and validation
- `blueprint/validator.ts` - Business rule validation
- `blueprint/serializer.ts` - Save/load blueprint (for debugging, future features)

**Key type:**
```typescript
type Blueprint = {
  meta: {
    packId: string;
    packVersion: string;
    generatedAt: string;
  };
  project: {
    name: string;
    description: string;
    author?: string;
  };
  stack: {
    language: string;
    framework: string;
    dependencies: Record<string, string>;  // name -> version constraint
  };
  features: Record<string, any>;  // Pack-specific feature flags
  paths: {
    outputDir: string;
  };
};
```

**Rationale:**
- Blueprint is the single source of truth for generation
- Separating from AnswerSet allows transformation logic (e.g., mapping "latest" to actual version)
- Blueprints can be saved for reproducibility
- Future: Could support loading a blueprint and regenerating

---

### 4. `packs/` - Template Pack System

**Responsibility:**
- Define pack metadata (name, version, supported languages)
- Load interview questions for a pack
- Provide template files (with variable substitution markers)
- Define pack-specific verification logic
- Expose hooks for customization

**Key files (in module):**
- `packs/loader.ts` - Discover and load packs from filesystem
- `packs/registry.ts` - Manage available packs
- `packs/types.ts` - Pack metadata types

**Pack structure (in `packs/` directory):**
```
packs/python-api/
├── pack.json              # Metadata
├── interview.json         # Questions
├── templates/
│   ├── pyproject.toml.hbs
│   ├── src/
│   │   └── main.py.hbs
│   ├── tests/
│   │   └── test_main.py.hbs
│   └── AGENT.md.hbs       # AGENT.md template with managed sections
└── verifier.ts            # Verify using Poetry/pip-tools
```

**`pack.json` example:**
```json
{
  "id": "python-api",
  "version": "1.0.0",
  "name": "Python API (FastAPI)",
  "description": "FastAPI-based REST API with Poetry",
  "language": "python",
  "framework": "fastapi"
}
```

**Rationale:**
- Packs are self-contained - can be developed and versioned independently
- JSON interview definitions are easy to author and validate
- Handlebars (or similar) for templates - widely understood, good tooling
- Custom verifier per pack allows using ecosystem-native tools (Poetry, npm, etc.)

---

### 5. `renderer/` - File Generation

**Responsibility:**
- Take Blueprint + Template Pack
- Render all template files with blueprint data
- Handle managed sections in AGENT.md (generation markers)
- Write files to output directory
- Preserve file permissions, structure

**Key files:**
- `renderer/engine.ts` - Template rendering (Handlebars integration)
- `renderer/writer.ts` - Write files to disk with safety checks
- `renderer/agent-md.ts` - Special handling for AGENT.md managed sections
- `renderer/types.ts` - Render context types

**Managed sections in AGENT.md:**
```markdown
<!-- agentgen:managed:start:dependencies -->
This section auto-generated. Do not edit between markers.
## Dependencies
- fastapi==0.104.1
- uvicorn==0.24.0
<!-- agentgen:managed:end:dependencies -->

<!-- Custom section - preserved across regenerations -->
## Project-specific notes
Developer can write anything here.
```

**Rationale:**
- Renderer is stateless - pure function from (blueprint, pack) → files
- Managed sections allow safe regeneration without losing human edits
- Special handling for AGENT.md acknowledges its importance
- Separation from CLI allows testing rendering without file I/O

---

### 6. `verification/` - Dependency Verification

**Responsibility:**
- Check that selected dependencies are compatible
- Use ecosystem-native tools (don't reinvent solvers)
- Report conflicts clearly
- Support pack-specific verification strategies

**Key files:**
- `verification/runner.ts` - Orchestrate verification
- `verification/strategies/python.ts` - Poetry dry-run, pip-compile
- `verification/strategies/node.ts` - npm/yarn/pnpm dry-run
- `verification/reporter.ts` - Format verification results

**Flow:**
```
Blueprint → Extract dependencies → Call pack verifier → Report results
```

**Example (Python):**
```typescript
// In pack's verifier.ts
export async function verify(deps: Record<string, string>): Promise<VerifyResult> {
  // Create temp pyproject.toml
  // Run: poetry lock --dry-run
  // Parse output for conflicts
  return { success: true, conflicts: [] };
}
```

**Rationale:**
- Delegating to real tools (Poetry, npm) ensures accuracy
- Avoids implementing complex solver logic
- Pack-specific strategies allow using the right tool for each ecosystem
- Verification can run at generation time or standalone (useful for debugging)

---

### 7. `core/` - Shared Utilities

**Responsibility:**
- Common types used across modules
- Error definitions
- Logging
- File system utilities
- Validation helpers

**Key files:**
- `core/types.ts` - Shared type definitions
- `core/errors.ts` - Custom error classes
- `core/logger.ts` - Structured logging
- `core/fs.ts` - File system helpers (safe writes, directory creation)
- `core/validation.ts` - Common validators (semver, project names, etc.)

**Rationale:**
- Prevents circular dependencies (common sink for shared code)
- Centralized error handling makes debugging easier
- Logger can be swapped for testing (silent mode) or production (verbose mode)

---

## Data Flow

```
┌──────────┐
│   CLI    │  (parse args, select command)
└────┬─────┘
     │
     v
┌──────────────┐
│  Interview   │  (ask questions)
│   Engine     │
└──────┬───────┘
       │
       v  AnswerSet
┌──────────────┐
│  Blueprint   │  (validate, transform)
│   Builder    │
└──────┬───────┘
       │
       v  Blueprint
       ├─────────────────┐
       │                 │
       v                 v
┌──────────────┐   ┌──────────────┐
│   Renderer   │   │ Verification │  (run in parallel or sequence)
└──────┬───────┘   └──────┬───────┘
       │                  │
       v                  v
   Files written     Conflicts checked
       │                  │
       └────────┬─────────┘
                v
          Success report
```

**Key decision points:**
1. **Pack selection**: Can be CLI arg or first interview question
2. **Verification timing**: After blueprint creation, before rendering (fail fast) OR after rendering (verify actual files)
3. **Error handling**: Fail at first error OR collect all errors and report batch

**Recommended flow:**
1. CLI parses args
2. Load template pack
3. Run interview for that pack
4. Build blueprint from answers
5. **Verify dependencies** (fail fast if incompatible)
6. Render files to disk
7. Output success message with next steps

---

## Module Interaction Contracts

### Interview → Blueprint
```typescript
// interview/engine.ts
export function runInterview(questions: Question[]): Promise<AnswerSet>;

// blueprint/builder.ts
export function buildBlueprint(answers: AnswerSet, pack: Pack): Blueprint;
```

### Blueprint → Renderer
```typescript
// renderer/engine.ts
export function renderPack(blueprint: Blueprint, pack: Pack): RenderedFile[];

type RenderedFile = {
  path: string;      // Relative path in output dir
  content: string;
  executable?: boolean;
};
```

### Blueprint → Verification
```typescript
// verification/runner.ts
export function verifyDependencies(blueprint: Blueprint, pack: Pack): Promise<VerifyResult>;

type VerifyResult = {
  success: boolean;
  conflicts: Conflict[];
  warnings: string[];
};
```

### Pack System
```typescript
// packs/loader.ts
export function loadPack(packId: string): Promise<Pack>;
export function listPacks(): Promise<PackMetadata[]>;

type Pack = {
  metadata: PackMetadata;
  questions: Question[];
  templates: Map<string, string>;  // path -> template source
  verifier: (deps: Record<string, string>) => Promise<VerifyResult>;
};
```

---

## Key Design Decisions

### 1. Blueprint as intermediate format
**Decision:** Separate AnswerSet from Blueprint.

**Rationale:**
- Answers are UI-layer concerns (strings, choices)
- Blueprint is domain model (typed, validated, semantic)
- Allows transformations (e.g., resolve "latest" version)
- Blueprint can be serialized for reproducibility

### 2. Packs are data, not code (mostly)
**Decision:** Packs are JSON + templates + small verifier script.

**Rationale:**
- Easy to author without deep tool knowledge
- Version packs independently of CLI tool
- Future: Could load packs from remote URLs or package registry
- Verifier is code because dependency solving is complex (can't be JSON)

### 3. Managed sections in AGENT.md
**Decision:** Use HTML-style comment markers to denote managed regions.

**Rationale:**
- Allows regeneration without losing human edits
- Familiar pattern (like code generators, Terraform, etc.)
- Simple to parse and replace
- Fails gracefully if user removes markers (warn, don't regenerate)

### 4. Verification uses real tools
**Decision:** Shell out to Poetry, npm, etc. Don't implement solvers.

**Rationale:**
- Dependency resolution is complex and ecosystem-specific
- Real tools are battle-tested
- Avoids version lag (using current tool versions)
- Tradeoff: Requires tools installed (document prerequisites)

### 5. No plugin system (initially)
**Decision:** Packs are built-in, no dynamic plugin loading.

**Rationale:**
- Simpler security model
- Easier to test and version
- Users can fork and add packs, then build their own CLI
- Future: Add plugin system once core is stable

---

## Testing Strategy

### Unit Tests
- Each module tested in isolation
- Mock dependencies (e.g., mock file system for renderer)
- Focus on business logic, not I/O

### Integration Tests
- Full workflow: interview → blueprint → render → verify
- Use fixture packs (minimal test packs)
- Assert on file outputs and verification results

### Pack Tests
- Each built-in pack has test suite
- Verify rendered output is valid (e.g., `pyproject.toml` parses)
- Verify AGENT.md contains expected sections

---

## Build and Distribution

### For Node.js implementation:
- TypeScript compiled to CommonJS (widest compatibility)
- Bundle with esbuild or tsup for fast builds
- Distribute via npm: `npm install -g agentgen`
- Binary entry point: `#!/usr/bin/env node`

### For Python implementation:
- Use Poetry for dependency management
- Distribute via PyPI: `pip install agentgen`
- Entry point in `pyproject.toml`: `[tool.poetry.scripts]`

### Include packs in distribution:
- Packs directory bundled with package
- Located relative to installed module (use `__dirname` or `importlib.resources`)

---

## Future Extensibility

**Potential future features** (out of initial scope but architecture should allow):

1. **Pack registry**: Download packs from npm/PyPI
2. **Update command**: Regenerate managed sections of existing projects
3. **Custom pack locations**: `--pack-dir ./my-packs`
4. **Blueprint export/import**: Save blueprint, regenerate later
5. **Interactive pack authoring**: CLI to create new pack scaffolds
6. **Diff preview**: Show what files will be generated before writing
7. **Incremental generation**: Add new features to existing project

**Architecture considerations:**
- Keep pack loading abstracted (easy to swap file system for HTTP)
- Blueprint serialization already planned (enables import/export)
- Managed sections in AGENT.md enable update command
- Renderer is pure function (easy to preview without writing)

---

## Conclusion

This architecture prioritizes:
- **Modularity**: Clear boundaries, easy to test and extend
- **Determinism**: No guesswork, use real tools for verification
- **Simplicity**: Minimal abstractions, straightforward flow
- **Future-ready**: Designed for initial scope but extensible

The tool is structured to be a **production-grade CLI**, not a prototype. Each module has a single, clear responsibility and well-defined interfaces.
