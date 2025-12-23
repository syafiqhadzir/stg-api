# Database Guide

Complete documentation for the PostgreSQL database schema, migrations, and query patterns.

## Schema Overview

```mermaid
erDiagram
    quran_verses ||--o{ recitation_texts : "has variants"
    qiraat_metadata ||--o{ recitation_texts : "defines"
    
    quran_verses {
        int id PK
        int surah_number
        int ayah_number
        int juz_number
        int page_number
        timestamp created_at
    }
    
    qiraat_metadata {
        int id PK
        varchar name
        varchar slug UK
        text description
        timestamp created_at
    }
    
    recitation_texts {
        int id PK
        int verse_id FK
        int qiraat_id FK
        text text_uthmani
        text text_emlaey
        jsonb metadata
        timestamp created_at
    }
    
    mv_comparison_matrix {
        int surah_number
        int ayah_number
        jsonb variants
    }
```

## Tables

### `quran_verses` (Dimension)

Canonical list of 6,236 verses based on the Hafs count.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `surah_number` | INT | Surah number (1-114) |
| `ayah_number` | INT | Ayah number within surah |
| `juz_number` | INT | Juz (part) number (1-30) |
| `page_number` | INT | Page in standard Mushaf |
| `created_at` | TIMESTAMPTZ | Record creation time |

**Constraints:**
- `UNIQUE (surah_number, ayah_number)`

---

### `qiraat_metadata` (Dimension)

Metadata for each recitation tradition (Qira'at).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(255) | Full reciter name |
| `slug` | VARCHAR(50) | URL-friendly identifier |
| `description` | TEXT | Optional description |
| `created_at` | TIMESTAMPTZ | Record creation time |

**Constraints:**
- `UNIQUE (name)`
- `UNIQUE (slug)`

---

### `recitation_texts` (Fact)

Stores the actual text for each verse-recitation combination.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `verse_id` | INT | Foreign key to `quran_verses` |
| `qiraat_id` | INT | Foreign key to `qiraat_metadata` |
| `text_uthmani` | TEXT | Arabic text in Uthmani script |
| `text_emlaey` | TEXT | Simplified script (optional) |
| `metadata` | JSONB | Extra attributes (line numbers, etc.) |
| `created_at` | TIMESTAMPTZ | Record creation time |

**Constraints:**
- `UNIQUE (verse_id, qiraat_id)`
- `FOREIGN KEY verse_id REFERENCES quran_verses(id) ON DELETE CASCADE`
- `FOREIGN KEY qiraat_id REFERENCES qiraat_metadata(id) ON DELETE CASCADE`

---

### `mv_comparison_matrix` (Materialized View)

Pre-computed pivot table for fast comparison queries.

| Column | Type | Description |
|--------|------|-------------|
| `surah_number` | INT | Surah number |
| `ayah_number` | INT | Ayah number |
| `variants` | JSONB | Aggregated variant data |

**Refresh Command:**
```sql
REFRESH MATERIALIZED VIEW mv_comparison_matrix;
```

**Query Performance:** O(1) via unique index on `(surah_number, ayah_number)`.

---

## Migrations

We use **node-pg-migrate** for version-controlled schema changes.

### Running Migrations

```bash
# Apply all pending migrations
npm run migrate up

# Rollback last migration
npm run migrate down

# Create a new migration
npm run migrate:create -- my_migration_name
```

### Migration Files

Located in `/migrations/`:

| File | Description |
|------|-------------|
| `1703328000000_init_schema.js` | Initial schema setup |

### Environment Variables

Migrations require the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/quran_db
```

Or individual variables from `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=quran_db
```

---

## Indexes

| Index | Table | Columns | Type |
|-------|-------|---------|------|
| `idx_recitation_text_uthmani_gin` | recitation_texts | text_uthmani | GIN (pg_trgm) |
| `idx_mv_comparison_matrix_surah_ayah` | mv_comparison_matrix | surah_number, ayah_number | UNIQUE |

---

## Data Ingestion

The Python ETL pipeline loads Quranic text data into the database.

### Prerequisites

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Full Setup (First Time)

```bash
# 1. Start the database container
docker-compose up db -d

# 2. Initialize the schema (if not using migrations)
docker exec -i stg-api-db-1 psql -U postgres -d quran_db < init.sql

# 3. Run the ingestion pipeline
python ingest.py

# 4. Verify data was loaded
docker exec -i stg-api-db-1 psql -U postgres -d quran_db -c "SELECT COUNT(*) FROM quran_verses;"
```

### Pipeline Steps

| Pass | Action | Description |
|------|--------|-------------|
| 1 | Load Hafs data | Base layer from `csv/hafsData.csv` |
| 2 | Load variants | Other Qira'at aligned to Hafs |
| 3 | Refresh view | Update `mv_comparison_matrix` |

### Troubleshooting

<details>
<summary><strong>API returns 404 for all verses</strong></summary>

This means the database is empty. Run the full setup:

```bash
docker exec -i stg-api-db-1 psql -U postgres -d quran_db < init.sql
python ingest.py
```

Verify data exists:
```bash
docker exec -i stg-api-db-1 psql -U postgres -d quran_db -c "SELECT COUNT(*) FROM mv_comparison_matrix;"
```
</details>

<details>
<summary><strong>Materialized view is empty</strong></summary>

Refresh the materialized view:
```bash
docker exec -i stg-api-db-1 psql -U postgres -d quran_db -c "REFRESH MATERIALIZED VIEW mv_comparison_matrix;"
```
</details>

<details>
<summary><strong>Connection refused to database</strong></summary>

Ensure Docker is running and the database container is up:
```bash
docker-compose up db -d
docker-compose ps
```
</details>

---

## Common Queries

### Get All Variants for a Verse

```sql
SELECT * FROM mv_comparison_matrix 
WHERE surah_number = 1 AND ayah_number = 1;
```

### Count Verses per Surah

```sql
SELECT surah_number, COUNT(*) as verse_count 
FROM quran_verses 
GROUP BY surah_number 
ORDER BY surah_number;
```

### List All Recitations

```sql
SELECT slug, name FROM qiraat_metadata ORDER BY slug;
```

---

← [Back to Documentation](README.md)
