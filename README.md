# Agentgen

**AI-first project scaffolding with AGENT.md as a first-class artifact**

## Overview

Agentgen is a CLI tool that generates complete, runnable project scaffolds with **AGENT.md files built in**. Instead of writing guidance for AI agents as an afterthought, agentgen makes it a core part of project creation.

### The Problem

- Developers benefit from AGENT.md files that define how AI agents should work inside a repository
- Writing these files manually for every project is slow and inconsistent
- Most project generators create code first and guidance later

### The Solution

Agentgen asks structured questions **before any files exist**, then:

1. Generates a complete, verified project scaffold
2. Creates an AGENT.md file as a first-class artifact
3. Verifies dependencies are compatible using ecosystem-native tools
4. Supports managed sections in AGENT.md that can be regenerated safely

## Key Features

✅ **Interview-driven**: Ask questions first, generate after
✅ **Deterministic**: No hallucinated commands or dependencies
✅ **Stack-aware**: Template packs for different ecosystems (Python, Node, etc.)
✅ **Verified**: Uses real dependency solvers (Poetry, npm) not guesswork
✅ **Managed sections**: Regenerate parts of AGENT.md without losing human edits
✅ **Blueprint-based**: Transparent, diffable, reproducible project configs

## Initial Scope

**CLI tool** with:
- Interactive questionnaire
- Two template packs: **Python API** (FastAPI) and **Node API** (Express)
- Blueprint creation and validation
- Dependency verification
- AGENT.md generation with managed sections

**Non-goals** (for now):
- No GUI
- No SaaS backend
- No dynamic remote templates

## Quick Start (Planned)

```bash
# Install
npm install -g agentgen
# or
pip install agentgen

# Create new project
agentgen init

# Follow interactive prompts
? Select template pack: Python API (FastAPI)
? Project name: my-api
? Python version: 3.11
? Database: postgresql
...

# Generated project structure:
my-api/
├── src/
├── tests/
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/
└── AGENT.md          # ← AI agent guidance built in
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, module breakdown, data flow
- **[BLUEPRINT-SCHEMA.md](./BLUEPRINT-SCHEMA.md)** - Interview flow and blueprint schema
- **[docs/examples/](./docs/examples/)** - Example blueprints and interview flows

## Architecture

Agentgen is organized into 7 core modules:

```
┌──────────┐
│   CLI    │  Parse args, route commands
└────┬─────┘
     │
     v
┌──────────────┐
│  Interview   │  Ask adaptive questions
└──────┬───────┘
       │
       v  AnswerSet
┌──────────────┐
│  Blueprint   │  Validate, transform
└──────┬───────┘
       │
       v  Blueprint
       ├─────────────────┐
       │                 │
       v                 v
┌──────────────┐   ┌──────────────┐
│   Renderer   │   │ Verification │
└──────┬───────┘   └──────┬───────┘
       │                  │
       v                  v
   Files                Checks
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

## Blueprint System

Every project starts with a **blueprint** - a deterministic, serializable representation of project configuration.

**Benefits:**
- **Reproducible**: Same blueprint = same output
- **Transparent**: See exactly what will be generated
- **Diffable**: Compare blueprints with standard JSON diff tools
- **Testable**: Easy to create fixture blueprints for tests

Example blueprint excerpt:
```json
{
  "version": "1.0",
  "project": {
    "name": "payment-api"
  },
  "stack": {
    "language": "python",
    "framework": "fastapi",
    "dependencies": {
      "fastapi": "^0.104.1",
      "sqlalchemy": "^2.0.23"
    }
  },
  "agent": {
    "strictness": "balanced",
    "testRequirements": "always",
    "customRules": [
      "All endpoints must have corresponding tests",
      "Use async SQLAlchemy for database operations"
    ]
  }
}
```

See [BLUEPRINT-SCHEMA.md](./BLUEPRINT-SCHEMA.md) for full schema and examples.

## Managed Sections in AGENT.md

Agentgen uses comment markers to denote **managed sections** in AGENT.md:

```markdown
<!-- agentgen:managed:start:dependencies -->
## Dependencies
- fastapi==0.104.1
- sqlalchemy==2.0.23
<!-- agentgen:managed:end:dependencies -->

<!-- Custom section - preserved across regenerations -->
## Project-specific notes
Developers can write anything here and it won't be overwritten.
```

**Benefits:**
- Safe regeneration without losing human edits
- AI agents know which rules are auto-generated vs. hand-written
- Familiar pattern (like Terraform, code generators, etc.)

## Template Packs

Packs are self-contained bundles of:
- **Metadata** (`pack.json`)
- **Interview questions** (`interview.json`)
- **Templates** (Handlebars files)
- **Verifier** (dependency checking logic)

```
packs/python-api/
├── pack.json              # Name, version, description
├── interview.json         # Adaptive questions
├── templates/
│   ├── pyproject.toml.hbs
│   ├── src/main.py.hbs
│   └── AGENT.md.hbs
└── verifier.ts            # Use Poetry to verify deps
```

Packs are **data, not code** (except the small verifier script), making them easy to author and version independently.

## Development Status

🚧 **Design Phase** - Architecture and schemas defined, implementation not yet started

**Completed:**
- ✅ Architecture design
- ✅ Module breakdown and responsibilities
- ✅ Blueprint schema definition
- ✅ Interview flow design
- ✅ Example blueprints

**Next Steps:**
- Implement core modules (CLI, interview engine, blueprint builder)
- Create Python API and Node API template packs
- Build renderer with managed section support
- Add dependency verification
- Write comprehensive tests

## Contributing

This project is in early design phase. Once implementation begins, we'll welcome contributions!

## License

MIT (or Apache-2.0, TBD)