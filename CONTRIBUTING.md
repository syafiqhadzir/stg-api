# Contributing to Quranic Recitations API

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to this repository. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🛠 Prerequisites

- **Node.js**: v22 LTS or higher
- **Docker**: For running the database and integration environment
- **Python**: v3.12+ (for data engineering scripts)

## 💻 Development Setup

1. **Fork and Clone** the repo.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Setup Environment**:
   Copy `.env.example` (if exists) or use defaults:
   ```bash
   # Defaults
   PORT=3000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=quran_db
   ```
4. **Start Database**:
   ```bash
   docker-compose up db -d
   ```

## 📏 Clean Architecture

This project follows strict Clean Architecture principles:
- **`src/controllers`**: Handle HTTP requests/responses. No business logic.
- **`src/usecases`**: Application business rules.
- **`src/repositories`**: Data access interface (SQL queries).
- **`src/types`**: Shared domain entities and interfaces.

**Do not import Repositories directly into Controllers.** Always go through a UseCase.

## 🧪 Quality Gates

Before submitting a PR, ensure all checks pass:

1. **Linting**:
   ```bash
   npm run lint
   ```
2. **Formatting**:
   ```bash
   npm run format
   ```
3. **Tests**:
   ```bash
   npm test
   ```

## 📦 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools and libraries such as documentation generation

**Example**:
`feat: implement rate limiting using redis`

## 🚀 Deployment

The project is designed to be stateless and containerized. The `Dockerfile` is a multi-stage build optimized for production.
