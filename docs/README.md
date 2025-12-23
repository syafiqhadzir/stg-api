# Documentation

Welcome to the Quranic Recitations API documentation.

## 📚 Guides

| Guide | Description |
|-------|-------------|
| [Architecture](ARCHITECTURE.md) | System design, data model, and Clean Architecture |
| [API Reference](API.md) | Complete endpoint documentation |
| [Database](DATABASE.md) | Schema, migrations, and query patterns |
| [Testing](TESTING.md) | Test strategy and coverage requirements |
| [Security](SECURITY.md) | Security measures and configuration |

## 🚀 Quick Links

- [README](../README.md) - Project overview and quick start
- [Contributing](../CONTRIBUTING.md) - Development setup and guidelines
- [License](../LICENSE) - MIT License

## 📁 Repository Structure

```
stg-api/
├── src/                    # Application source code
│   ├── app.ts              # Fastify application setup
│   ├── config.ts           # Environment configuration
│   ├── routes.ts           # API route definitions
│   ├── controllers/        # HTTP request handlers
│   ├── usecases/           # Business logic layer
│   ├── repositories/       # Data access layer
│   └── types/              # TypeScript types & Zod schemas
├── tests/                  # Test suites
├── migrations/             # Database migrations
├── docs/                   # Documentation (you are here)
└── csv/                    # Source data files
```

## 🔗 External Resources

- [Fastify Documentation](https://fastify.io/docs/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [node-pg-migrate](https://salsita.github.io/node-pg-migrate/)
