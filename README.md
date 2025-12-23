# Quranic Recitations API

[![CI](https://github.com/syafiqhadzir/stg-api/actions/workflows/ci.yml/badge.svg)](https://github.com/syafiqhadzir/stg-api/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-orange.svg)](https://fastify.io/)

A high-performance, containerized REST API for comparing Quranic text variants across the ten canonical recitations (Qira'at). Built with **Fastify**, **PostgreSQL**, and **Clean Architecture**.

## ✨ Features

- **Verse Comparison**: Query any verse and retrieve all recitation variants in a single response
- **OpenAPI Documentation**: Interactive Swagger UI at `/docs`
- **Type-Safe**: Full TypeScript with Zod validation
- **Production-Ready**: Distroless Docker image, rate limiting, and security headers
- **100% Test Coverage**: Comprehensive unit and integration testing

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 22 (LTS) |
| **Framework** | Fastify 5.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL 16+ |
| **Validation** | Zod 4.x |
| **Documentation** | OpenAPI 3.0 / Swagger UI |
| **Testing** | Vitest |
| **Container** | Docker (Distroless) |

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js 22+](https://nodejs.org/) (for local development)

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up --build -d

# Verify the API is running
curl "http://localhost:3000/api/v1/compare?surah=1&ayah=1"

# View API documentation
open http://localhost:3000/docs
```

### Local Development

```bash
# Install dependencies
npm ci

# Start database
docker-compose up db -d

# Build and start API
npm run build
npm start
```

## 📚 API Reference

### Interactive Documentation

Visit **[http://localhost:3000/docs](http://localhost:3000/docs)** for the Swagger UI.

### `GET /api/v1/compare`

Fetch all recitation variants for a specific verse.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surah` | number | ✅ | Surah number (1-114) |
| `ayah` | number | ✅ | Ayah number (≥1) |

**Example Response:**

```json
{
  "surah": 1,
  "ayah": 1,
  "variants": {
    "hafs": { "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "page": 1, "juz": 1 },
    "warsh": { "text": "...", "page": 1, "juz": 1 }
  }
}
```

## 🧪 Testing

We use **Vitest** with 100% code coverage enforcement.

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run linting
npm run lint

# Check formatting
npx prettier --check "src/**/*.ts"
```

## 🔧 Development

### Project Structure

```
src/
├── app.ts                 # Fastify application setup
├── config.ts              # Environment configuration
├── routes.ts              # API route definitions
├── controllers/           # Request handlers
├── usecases/              # Business logic
├── repositories/          # Data access layer
└── types/                 # TypeScript types & Zod schemas
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up your development environment
- Coding standards and conventions
- Pull request process

## 📄 License

This project is licensed under the [MIT License](LICENSE).