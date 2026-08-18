# M-Scholar

School Management System — multi-portal platform for Super Admin, Account Officer, Class Teacher, and Parent/Student roles.

## Documentation

See [`M-SCHOLAR_COMPLETE_TECHNICAL_SPECIFICATION.txt`](./M-SCHOLAR_COMPLETE_TECHNICAL_SPECIFICATION.txt) for the full technical specification.

## Live Site

- **Production:** [https://mscholar.web.app](https://mscholar.web.app)

## Repository

- **GitHub:** [Musa-Salami/M-Scholar](https://github.com/Musa-Salami/M-Scholar)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a demo account on the login page.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@mscholar.app | admin123 |
| Account Officer | finance@mscholar.app | finance123 |
| Class Teacher | teacher@mscholar.app | teacher123 |
| Parent | parent@mscholar.app | parent123 |

## Build & Deploy

```bash
npm run build
firebase deploy --only hosting:mscholar
```

## Project structure

```
apps/web/          Next.js 15 frontend (static export)
packages/shared/   Shared types, roles, navigation config
public/            Legacy static landing (pre-build)
```
