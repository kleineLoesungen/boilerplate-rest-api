# Boilerplate for REST-API
## Current App Features
- [Modern modulare architecture](#modern-modulare-architecture)
- [API with CRUD functions](#crud-functions-without-user-accounts)
- [Optimized Container image](#dockerfile)
- [Data stored in Database](#database)
- [Typechecks of inputs](#middleware-type-check)
- [Auth with user accounts](#auth-users)
- Management of user sessions

## Use of Repository
- Use docker compose in `/run`
- Docker compose includes this app, postgres and db-web-interface

### ENVIRONMENT VARIABLES
all variables are required
- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB` schema *public* is used
- `REDIS_HOST`
- `REDIS_PASSWORD`
- `SESSION_SECRET`
- `APP_ADMIN_USER` is used, if no admin exists
- `APP_ADMIN_PASSWORD` is used, if no admin exists

## Details of Features
### Modern Modulare Architecture
- Build of different architecture layers for better maintaining, testing and understanding
- Related layers have always same beginning like `/*/node*.ts` or `/*/user*.ts`
- `/models` defines data structures for code, database and checks
- `/services` methods for data structure
- `/controllers` implements/uses services in current application
- `/routes` describes api structure 

More folders:
- `/databases` includes database connectors
- `/middlewares` includes middlewares for described routes

### Middleware: Type Checks
- Using [Joi](https://www.npmjs.com/package/joi) and [Joi Class Decorators](https://github.com/whefter/joi-class-decorators#readme)
- Joi definitions are inside data classes in `/models`
- Validation checks over middleware in `/middlewares/JoiValidate*Middleware.ts`

### Database
- Using [TypeORM](https://typeorm.io/) and [ioredis](https://www.npmjs.com/package/ioredis)
- Table definitions are inside data classes in `/models`
- Database connector definition is in `/databases` . Current set up with postgres database and redis caching

### CRUD Functions (without user accounts)
in `/routes`, e.g.
- `POST /api/v1/nodes/create` Create a Node (only for users)
- `GET /api/v1/nodes/` Get all Nodes
- `GET /api/v1/nodes/:id` Get all informations of a Node
- `POST /api/v1/nodes/:id/update` Update Node (only for users)
- `DELETE /api/v1/nodes/:id/delete` Delete Node (only for users)

### Auth Users
- Using [cookie-session](https://github.com/expressjs/cookie-session#readme) and [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme)
- Session (http-only, age 1 week) is always set/checked over middleware in `server.ts`
- Middleware in `middlewares/authMiddleware.ts` checks sessions values in caching 
- Protected routes must implement **isLoggedIn** (only for users) or **isAdmin** (only for admins)
- Database user table definition is in `/models/userModel.ts` and session values in `/models/sessionModel.ts`

### Dockerfile
- Multi-Stage image creation
- Build on top of smallest node image
- First stage: Compile from Typescript to Javascript
- Second stage: Shift only Javascript and install only production packages

## Next for Boilerplate
- Support authentification for apps (API Tokens)

## Next for Running Boilerplate
### Docker Compose
- Using SSL/TLS

### Kubernetes
- Run on Kubernetes (k3s)
- SSL/TLS over Kubernetes (k3s)

### Host
Minimal Host Security (over scripts?)
- Root user (linux)
- SSH (linux)
- Firewall (ufw)
- Attack prevention (CrowdSec/Fail2ban)
- k3s host protection

### Optional
- Support for SSO
