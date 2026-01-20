# Development Guide

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent and meaningful commit messages.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description                  | Example                              |
| ---------- | ---------------------------- | ------------------------------------ |
| `feat`     | New feature                  | `feat: add user profile endpoint`    |
| `fix`      | Bug fix                      | `fix: correct email validation`      |
| `docs`     | Documentation only           | `docs: update API documentation`     |
| `style`    | Code style (formatting, etc) | `style: format auth controller`      |
| `refactor` | Code refactoring             | `refactor: extract validation logic` |
| `perf`     | Performance improvements     | `perf: optimize database queries`    |
| `test`     | Add or update tests          | `test: add user service unit tests`  |
| `build`    | Build system or dependencies | `build: upgrade to Node 20`          |
| `ci`       | CI configuration             | `ci: add GitHub Actions workflow`    |
| `chore`    | Other changes                | `chore: update .gitignore`           |
| `revert`   | Revert a commit              | `revert: revert "feat: add feature"` |

### Examples

#### Feature

```bash
git commit -m "feat: implement JWT refresh token"
```

#### Bug Fix

```bash
git commit -m "fix: resolve race condition in auth service"
```

#### Documentation

```bash
git commit -m "docs: add API versioning documentation"
```

#### Breaking Change

```bash
git commit -m "feat!: change user endpoint from /user to /users

BREAKING CHANGE: The /user endpoint has been renamed to /users"
```

## Pre-commit Hooks

This project uses Husky to run pre-commit hooks. Before each commit:

1. **Lint-staged** runs on staged files:
   - ESLint with auto-fix
   - Prettier formatting

2. **Build check**:
   - TypeScript compilation

### Skip Hooks (Not Recommended)

```bash
git commit --no-verify -m "emergency fix"
```

## Pre-push Hooks

Before pushing code:

1. All tests must pass
2. No TypeScript errors

## Code Style

### TypeScript

- Use strict mode
- No implicit `any`
- Prefer interfaces over types for object shapes
- Use `readonly` for immutable properties

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Import Order

1. Node.js built-ins
2. External packages
3. Internal modules
4. Relative imports

```typescript
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
```

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

## Workflow

### Starting a New Feature

```bash
# Create a new branch
git checkout -b feat/user-authentication

# Make changes
# ...

# Stage changes
git add .

# Commit (hooks will run automatically)
git commit -m "feat: add user authentication"

# Push
git push origin feat/user-authentication
```

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Environment variables are documented
- [ ] Commit messages follow conventions
- [ ] No sensitive data in code

## API Versioning

All endpoints are versioned using URI versioning:

```
/v1/users
/v1/articles
/v1/auth
```

### Adding a New Version

1. Create new controllers with updated logic
2. Update routes to `/v2/...`
3. Maintain `/v1/...` for backward compatibility
4. Document breaking changes

## Environment Variables

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed configuration guide.

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/main.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Logging

Use structured logging with Pino:

```typescript
this.logger.info({ userId, action: 'login' }, 'User logged in');
this.logger.error({ error, userId }, 'Failed to create user');
```

## Performance

### Database Queries

- Use Prisma's `select` to fetch only needed fields
- Implement pagination for list endpoints
- Use database indexes for frequently queried fields

### Caching

- Cache frequently accessed data with Redis
- Set appropriate TTL values
- Invalidate cache on updates

## Security

### Best Practices

- Never log sensitive data (passwords, tokens)
- Use parameterized queries (Prisma does this)
- Validate all inputs
- Sanitize outputs
- Use helmet for security headers
- Implement rate limiting
- Use HTTPS in production

### Dependencies

Keep dependencies updated:

```bash
npm audit
npm update
```

## Deployment

### Build

```bash
npm run build
```

### Production

```bash
NODE_ENV=production npm run start:prod
```

### Docker

```bash
docker build -t articles-api .
docker run -p 3000:3000 articles-api
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
