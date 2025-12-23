# API Reference

Complete documentation for all API endpoints.

> **Interactive Docs**: Visit [http://localhost:3000/docs](http://localhost:3000/docs) for Swagger UI.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API is open and does not require authentication. Rate limiting is enforced per client IP.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | [/compare](#compare-verse-variants) | Compare verse variants across Qiraat |
| GET | [/surahs](#list-all-surahs) | List all 114 surahs |
| GET | [/surahs/:surah](#get-surah) | Get a surah with all verses |
| GET | [/qiraat](#list-qiraat) | List available Qiraat |
| GET | [/juz/:juz](#get-verses-by-juz) | Get verses by Juz |
| GET | [/page/:page](#get-verses-by-page) | Get verses by page |
| GET | [/search](#search-text) | Search Quranic text |

---

## Compare Verse Variants

Retrieve all Qiraat (recitation) variants for a specific Quranic verse.

```http
GET /api/v1/compare?surah={surah}&ayah={ayah}
```

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `surah` | number | ✅ | 1-114 | Surah number |
| `ayah` | number | ✅ | ≥1 | Ayah number |

**Response:**
```json
{
  "surah": 1,
  "ayah": 1,
  "variants": {
    "hafs": { "text": "بِسْمِ ٱللَّهِ...", "page": 1, "juz": 1 },
    "warsh": { "text": "بِسْمِ ٱللَّهِ...", "page": 1, "juz": 1 }
  }
}
```

---

## List All Surahs

Returns metadata for all 114 surahs.

```http
GET /api/v1/surahs
```

**Response:**
```json
[
  { "number": 1, "name": "Al-Fātiḥah", "arabicName": "الفَاتِحة", "ayahCount": 7 },
  { "number": 2, "name": "Al-Baqarah", "arabicName": "البَقَرَة", "ayahCount": 286 }
]
```

---

## Get Surah

Returns all verses for a specific surah.

```http
GET /api/v1/surahs/{surah}?qiraat={qiraat}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surah` | path | ✅ | Surah number (1-114) |
| `qiraat` | query | ❌ | Qiraat slug (default: hafs) |

**Response:**
```json
{
  "surah": 1,
  "name": "Al-Fātiḥah",
  "arabicName": "الفَاتِحة",
  "ayahCount": 7,
  "verses": [
    { "ayah": 1, "page": 1, "juz": 1, "text": "بِسْمِ ٱللَّهِ..." }
  ]
}
```

---

## List Qiraat

Returns metadata for all available recitation traditions.

```http
GET /api/v1/qiraat
```

**Response:**
```json
[
  { "slug": "hafs", "name": "Hafs", "description": null },
  { "slug": "warsh", "name": "Warsh", "description": null }
]
```

---

## Get Verses by Juz

Returns all verses in a specific Juz (1-30).

```http
GET /api/v1/juz/{juz}?qiraat={qiraat}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juz` | path | ✅ | Juz number (1-30) |
| `qiraat` | query | ❌ | Qiraat slug (default: hafs) |

**Response:**
```json
{
  "juz": 1,
  "verses": [
    { "surah": 1, "ayah": 1, "page": 1, "juz": 1, "text": "..." }
  ]
}
```

---

## Get Verses by Page

Returns all verses on a specific Mushaf page.

```http
GET /api/v1/page/{page}?qiraat={qiraat}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | path | ✅ | Page number |
| `qiraat` | query | ❌ | Qiraat slug (default: hafs) |

**Response:**
```json
{
  "page": 1,
  "verses": [
    { "surah": 1, "ayah": 1, "page": 1, "juz": 1, "text": "..." }
  ]
}
```

---

## Search Text

Search across Quranic text using Arabic trigram matching.

```http
GET /api/v1/search?q={query}&qiraat={qiraat}&limit={limit}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | query | ✅ | Search query in Arabic |
| `qiraat` | query | ❌ | Filter by Qiraat |
| `limit` | query | ❌ | Max results (default: 20, max: 100) |

**Response:**
```json
{
  "query": "الرحمن",
  "count": 5,
  "results": [
    { "surah": 1, "ayah": 1, "text": "...", "qiraat": "hafs" }
  ]
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Descriptive error message"
}
```

| Status | Error | Description |
|--------|-------|-------------|
| `400` | Bad Request | Invalid parameters |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## Rate Limiting

| Setting | Value |
|---------|-------|
| Requests | 100 per minute |
| Scope | Per client IP |

---

## Available Qiraat

| Slug | Reciter | Transmitter |
|------|---------|-------------|
| `hafs` | Asim | Hafs |
| `warsh` | Nafi' | Warsh |
| `qalun` | Nafi' | Qalun |
| `douri` | Abu Amr | Ad-Duri |
| `shuba` | Asim | Shuba |
| `sousi` | Abu Amr | As-Sousi |

---

## OpenAPI Specification

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **JSON**: [http://localhost:3000/docs/json](http://localhost:3000/docs/json)
- **YAML**: [http://localhost:3000/docs/yaml](http://localhost:3000/docs/yaml)

---

← [Back to Documentation](README.md)
