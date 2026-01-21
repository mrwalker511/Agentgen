# Contributing to Agentgen

Thank you for your interest in contributing to Agentgen! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Adding Template Packs](#adding-template-packs)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your changes
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Poetry** >= 1.5.0 (for testing Python pack generation)
- **Git**

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Agentgen.git
cd Agentgen

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Commands

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Run all checks
npm run lint && npm run typecheck && npm test
```

## Making Changes

### Branching Strategy

- Create a feature branch from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Use descriptive branch names:
  - `feature/` - New features
  - `fix/` - Bug fixes
  - `docs/` - Documentation updates
  - `refactor/` - Code refactoring
  - `test/` - Test additions or fixes

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test additions or changes
- `chore` - Build process or tooling changes

**Examples:**
```
feat(packs): add Go API template pack

fix(renderer): handle special characters in project names

docs(readme): update installation instructions

test(blueprint): add validation tests for custom rules
```

## Testing

### Writing Tests

All new features and bug fixes should include tests:

- **Unit tests** - Test individual functions and modules
  - Location: `tests/unit/`
  - Use Vitest: `describe`, `it`, `expect`

- **Integration tests** - Test complete workflows
  - Location: `tests/integration/`
  - Test end-to-end generation flows

### Test Coverage

- Aim for >80% test coverage
- Run `npm run test:coverage` to check coverage
- Cover edge cases and error conditions
- Mock external dependencies when appropriate

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/blueprint.test.ts

# Run tests matching pattern
npm test -- --grep "blueprint"

# Run with coverage
npm run test:coverage
```

## Pull Request Process

1. **Before submitting:**
   - Run all checks: `npm run lint && npm run typecheck && npm test`
   - Ensure tests pass and coverage meets threshold
   - Update documentation if needed
   - Add yourself to contributors if it's your first contribution

2. **PR Description:**
   - Clearly describe the changes and motivation
   - Reference related issues (e.g., "Fixes #123")
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process:**
   - Maintainers will review your PR
   - Address feedback and requested changes
   - Keep PR focused on a single concern
   - Be patient and respectful

4. **After Approval:**
   - Maintainers will merge your PR
   - Your changes will be included in the next release

## Style Guidelines

### TypeScript

- Use **TypeScript** for all new code
- Enable `strict` mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Keep functions small and focused

### Code Style

- Follow the existing code style
- Use Prettier for formatting (runs on save)
- Use ESLint for linting
- Maximum line length: 120 characters

### Documentation

- Add JSDoc comments for public APIs
- Document complex logic with inline comments
- Update README and docs for user-facing changes
- Keep examples up-to-date

## Adding Template Packs

Template packs are a major contribution area! Here's how to add a new pack:

### Pack Structure

```
packs/your-pack-name/
├── pack.json              # Pack metadata
├── interview.json         # Questions for user
├── templates/             # Template files (.hbs)
│   ├── README.md.hbs
│   ├── AGENT.md.hbs
│   └── ...
└── README.md             # Pack documentation
```

### Steps to Add a Pack

1. **Create pack directory** in `packs/`

2. **Create `pack.json`:**
```json
{
  "id": "your-pack-id",
  "version": "1.0.0",
  "name": "Your Pack Name",
  "description": "Brief description",
  "language": "go",
  "framework": "gin",
  "tags": ["api", "rest"]
}
```

3. **Create `interview.json`** with questions

4. **Add templates** with `.hbs` extension
   - Use Handlebars syntax: `{{project.name}}`
   - Include AGENT.md template
   - Use managed sections for regenerable content

5. **Test your pack:**
```bash
npm run build
npm run cli -- new ./test-output --pack your-pack-id --non-interactive
```

6. **Add tests** in `tests/integration/generate.test.ts`

7. **Document your pack** in pack's README.md

### Pack Guidelines

- Follow existing pack patterns (see `python-api`, `node-api`)
- Ensure all dependencies are valid and compatible
- Include health check endpoint
- Generate working project out of the box
- Provide clear error messages

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Read the documentation in `docs/`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Agentgen! 🚀
