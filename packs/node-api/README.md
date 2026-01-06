# Node API Pack

Template pack for generating Express + TypeScript REST APIs.

## Features

- **Express** - Fast, minimalist web framework
- **TypeScript** - Type-safe JavaScript
- **Package managers** - npm, pnpm, or yarn
- **Database** - PostgreSQL, MySQL, MongoDB, SQLite, or none
- **ORM** - Prisma, TypeORM, Sequelize, Mongoose
- **Authentication** - JWT, OAuth2, Passport
- **Testing** - Vitest or Jest with optional coverage
- **Linting** - ESLint with TypeScript support
- **Formatting** - Prettier
- **Docker** - Optional containerization
- **CI/CD** - GitHub Actions, GitLab CI, or CircleCI

## Prerequisites

### System Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0 (or pnpm >= 8.0.0, or yarn >= 3.0.0)

## Generated Structure

```
{project-name}/
├── src/
│   ├── index.ts             # Application entry point
│   ├── config.ts            # Configuration management
│   ├── routes/
│   │   └── index.ts         # Route definitions
│   ├── middleware/
│   │   └── error.ts         # Error handling
│   ├── db/                  # (if database enabled)
│   │   ├── client.ts        # Database client
│   │   └── models/
│   └── auth/                # (if authentication enabled)
│       ├── jwt.ts
│       └── middleware.ts
├── prisma/                  # (if Prisma selected)
│   └── schema.prisma
├── tests/
│   ├── setup.ts
│   └── api.test.ts
├── Dockerfile               # (if Docker enabled)
├── docker-compose.yml       # (if Docker Compose enabled)
├── .github/workflows/       # (if CI enabled)
│   └── ci.yml
├── package.json
├── tsconfig.json
├── README.md
├── AGENT.md
├── .env.example
└── .gitignore
```

## Configuration Options

### Database

**Supported databases:**
- PostgreSQL (with pg or Prisma)
- MySQL (with mysql2 or Prisma)
- MongoDB (with mongoose or Prisma)
- SQLite (with better-sqlite3 or Prisma)
- None

**ORMs:**
- Prisma (includes migrations by default)
- TypeORM
- Sequelize
- Mongoose (for MongoDB)
- None

### Authentication

- JWT (using jsonwebtoken)
- OAuth2
- Passport (various strategies)
- None

### Package Managers

- **npm** - Default Node package manager
- **pnpm** - Fast, disk space efficient
- **yarn** - Feature-rich package manager

### Tooling

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Testing**: Vitest or Jest with TypeScript support
- **Type checking**: Built-in TypeScript compiler

## Constraints

### Feature Compatibility

1. **Database + ORM**: If database is enabled, an ORM must be selected
2. **MongoDB**: Requires Mongoose, TypeORM, or Prisma
3. **Prisma**: Automatically enables migrations (built-in feature)
4. **Coverage**: Test coverage requires a test framework
5. **Docker Compose**: Requires Docker to be enabled
6. **CI checks**: Require a CI provider

### Version Constraints

- Node 20.x with Prisma >= 5.0.0
- Express 4.18+ for all Node versions

## Dependency Verification

Uses npm/pnpm/yarn (based on your selection) to verify dependencies:

1. Creates temporary `package.json`
2. Runs `--package-lock-only` (or equivalent) to check resolution
3. Reports peer dependency warnings
4. Only generates files if verification passes

## Usage

```bash
agentgen init

# Select Node API pack
? Select template pack: Node API (Express + TypeScript)

# Answer questions
? Project name: user-service
? Node version: 20 LTS
? Package manager: pnpm
? Database: postgresql
? ORM: prisma
...
```

## AGENT.md

Includes managed sections for:
- Dependencies and dev dependencies
- Enabled features
- Tooling configuration
- Infrastructure setup
- AI agent rules

## Customization

### Add Custom Templates

```typescript
// templates/src/custom.ts.hbs
{{#if features.myFeature}}
export const myFeature = () => {
  console.log('{{ project.name }}');
};
{{/if}}
```

### Add Constraints

```yaml
# constraints.yml
feature_compatibility:
  - name: "custom_rule"
    condition: "features.myFeature === true"
    requires:
      - field: "stack.dependencies"
        contains_key: "required-package"
    error: "My feature requires required-package"
```

## License

MIT
