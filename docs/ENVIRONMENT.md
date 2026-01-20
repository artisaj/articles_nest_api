# Environment Configuration Guide

## Overview

This project uses environment-specific configuration files to manage different deployment scenarios.

## Environment Files

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Template with all available variables

## Setup

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Fill in your values

Edit `.env` with your actual configuration values.

### 3. Validation

All environment variables are validated using Joi schema on application startup. If any required variable is missing or invalid, the application will fail to start with a descriptive error message.

## Required Variables

| Variable       | Description                   | Example                                |
| -------------- | ----------------------------- | -------------------------------------- |
| `NODE_ENV`     | Application environment       | `development`, `staging`, `production` |
| `PORT`         | Application port              | `3000`                                 |
| `DATABASE_URL` | PostgreSQL connection string  | `postgresql://user:pass@host:port/db`  |
| `JWT_SECRET`   | JWT secret key (min 32 chars) | `your-secret-key-min-32-characters`    |

## Optional Variables

| Variable          | Description                 | Default     |
| ----------------- | --------------------------- | ----------- |
| `JWT_EXPIRES_IN`  | JWT token expiration        | `1h`        |
| `THROTTLE_TTL`    | Rate limit time window (ms) | `60000`     |
| `THROTTLE_LIMIT`  | Rate limit max requests     | `10`        |
| `LOG_LEVEL`       | Logging level               | `info`      |
| `REDIS_HOST`      | Redis host                  | `localhost` |
| `REDIS_PORT`      | Redis port                  | `6379`      |
| `SWAGGER_ENABLED` | Enable Swagger UI           | `true`      |

## Environment-Specific Settings

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
SWAGGER_ENABLED=true
```

### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=info
SWAGGER_ENABLED=true
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
SWAGGER_ENABLED=false
```

## Security Notes

1. **Never commit `.env` files** - They are in `.gitignore`
2. **Change JWT_SECRET in production** - Use a strong, random key
3. **Use SSL for database** - Add `sslmode=require` to production DATABASE_URL
4. **Disable Swagger in production** - Set `SWAGGER_ENABLED=false`
5. **Use Azure Key Vault** - Store secrets in Azure Key Vault for production

## Validation Schema

The validation schema is defined in `src/config/env.validation.ts`. It ensures:

- Required variables are present
- Values are of correct type
- String values match allowed patterns
- Numbers are within valid ranges

## Troubleshooting

### Application won't start

Check the error message. Common issues:

- Missing required variable
- Invalid JWT_SECRET (less than 32 characters)
- Invalid DATABASE_URL format
- Invalid NODE_ENV value

### Validation errors

```
Error: Config validation error: "JWT_SECRET" length must be at least 32 characters long
```

Fix: Update the JWT_SECRET in your `.env` file to be at least 32 characters.

## Running with Different Environments

```bash
# Development
npm run start:dev

# Production
NODE_ENV=production npm run start:prod

# Staging
NODE_ENV=staging npm run start:prod
```

## Docker

When using Docker, pass environment variables via:

1. **docker-compose.yml**:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=${DATABASE_URL}
```

2. **env_file**:

```yaml
env_file:
  - .env.production
```

## Azure Deployment

For Azure App Service, set environment variables in:

1. **Portal**: Configuration → Application settings
2. **Azure CLI**:

```bash
az webapp config appsettings set --name <app-name> --resource-group <rg> --settings JWT_SECRET=<value>
```

3. **Azure Key Vault** (recommended):

```bash
# Reference a secret from Key Vault
@Microsoft.KeyVault(SecretUri=https://<vault-name>.vault.azure.net/secrets/<secret-name>/)
```
