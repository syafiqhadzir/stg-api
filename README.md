# Quranic Recitations API (Qira'at Comparison)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-22.x-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

A high-performance, containerized REST API designed to normalize, ingest, and serve comparative text data for the ten canonical Quranic recitations (Qiraat). Built with **Fastify**, **PostgreSQL**, and **Clean Architecture**.

## 🚀 Overview

This system solves the complexity of aligning varying Quranic verse structures (e.g., Warsh vs. Hafs numbering) into a unified, queryable format. It provides a highly optimized `GET /compare` endpoint that returns all textual variants for a specific verse in O(1) time using materialized views.

## 🏗️ Architecture

- **Runtime**: Node.js 22 (LTS) with Fastify (for low overhead).
- **Database**: PostgreSQL 16+ with `pg_trgm` extension and `JSONB` storage.
- **Pattern**: Strict Clean Architecture (Controllers → Use Cases → Repositories).
- **Infrastructure**: Docker Multi-stage builds (Distroless production image).

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local dev)

### Using Docker (Recommended)
1. **Start Services**:
   ```bash
   docker-compose up --build -d
   # Migrations run automatically via Docker command (if configured) or manually:
   # docker-compose exec api npm run migrate up
   ```
   *This spins up the API on port 3000 and the Database on port 5432.*

2. **Ingest Data** (First Run Only):
   The database starts empty. Run the ingestion script to populate it from the CSVs.
   ```bash
   # Install Python dependencies locally if needed, or use a container
   pip install pandas psycopg2-binary
   
   # Run ingestion (ensure DB_HOST=localhost)
   python ingest.py
   ```

3. **Verify**:
   ```bash
   curl "http://localhost:3000/api/v1/compare?surah=1&ayah=1"
   ```

### Local Development
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start DB**:
   ```bash
   docker-compose up db -d
   ```

3. **Start API**:
   ```bash
   npm run build
   npm start
   ```

## 📚 API Reference

**Interactive Documentation**: Visit `http://localhost:3000/docs` for the Swagger UI.

### `GET /api/v1/compare`

Fetch all recitation variants for a specific verse.

**Query Parameters**:
- `surah` (number, 1-114): Surah number.
- `ayah` (number, >0): Ayah number.

**Response**:
```json
{
  "surah": 1,
  "ayah": 1,
  "variants": {
    "hafs": { "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "page": 1, "juz": 1 },
    "warsh": { "text": "...", "page": 1, "juz": 1 }
  }
}
```

## 🧪 Testing

We use **Vitest** for integration testing.

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on setting up your environment, coding standards, and submission process.

## 📄 License

This project is licensed under the MIT License.