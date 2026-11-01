# Secure Auth API

A TypeScript, Node.js and Express authentication API backed by MongoDB. The project demonstrates authentication flows, user management, role-based access control and common API security controls.

## Features documented in this project

- Registration and login
- JWT access tokens and refresh-token rotation
- Logout and token invalidation
- Password reset and email verification flows
- Password hashing with bcrypt
- Request validation and rate limiting
- Helmet security headers and configurable CORS
- User profile and admin user-management routes
- Centralised error handling and structured logging
- Swagger / OpenAPI documentation
- Graceful shutdown handling

Review the implementation and configuration before using this project as a production authentication service. Security-sensitive systems require independent testing, secure deployment configuration and ongoing maintenance.

## Tech stack

- Node.js 20+
- TypeScript
- Express
- MongoDB and Mongoose
- JWT
- bcrypt
- express-validator
- Swagger / OpenAPI
- Winston

## Run locally

Requirements: Node.js 20+, npm and a MongoDB instance.

```bash
git clone https://github.com/rishabh-kori-05/secure-auth-api.git
cd secure-auth-api
npm install
cp .env.example .env
```

Set the required values in `.env`, then run:

```bash
npm run dev
```

For a production build, use the scripts defined in `package.json`.

## Environment variables

See `.env.example` for the current configuration. The application requires a MongoDB connection string and JWT secrets. Never commit real credentials, tokens, SMTP passwords or production environment files.

## API overview

Routes are versioned under `/api/v1`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh token pair |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/verify-email` | Verify email |
| GET | `/health` | Health check |
| GET / PUT | `/user/profile` | Read or update profile |
| GET | `/admin/users` | List users (admin) |
| DELETE | `/admin/users/:id` | Delete user (admin) |

Swagger UI is available at `/api-docs` when the server is running.

## Project structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  types/
  utils/
  app.ts
  server.ts
```

## Tests

Run the test command defined in `package.json`:

```bash
npm test
```

## Deployment

The repository includes deployment configuration for supported Node.js hosting platforms. Configure all secrets through the hosting provider's secret/environment settings. Do not assume a deployment is secure solely because the application starts successfully.

## License

MIT. See [LICENSE](./LICENSE).
