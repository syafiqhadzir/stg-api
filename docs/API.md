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

## Endpoints

### Compare Verse Variants

Retrieve all Qira'at (recitation) variants for a specific Quranic verse.

```http
GET /api/v1/compare
```

#### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `surah` | number | ✅ | 1-114 | Surah (chapter) number |
| `ayah` | number | ✅ | ≥1 | Ayah (verse) number within the surah |

#### Success Response

**Status:** `200 OK`

```json
{
  "surah": 1,
  "ayah": 1,
  "variants": {
    "hafs": {
      "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "page": 1,
      "juz": 1
    },
    "warsh": {
      "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "page": 1,
      "juz": 1
    }
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `surah` | number | Surah number (1-114) |
| `ayah` | number | Ayah number |
| `variants` | object | Map of recitation slug to variant data |
| `variants[slug].text` | string | Arabic text in Uthmani script |
| `variants[slug].page` | number | Page number in standard Mushaf |
| `variants[slug].juz` | number | Juz (part) number (1-30) |

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

### Error Codes

| Status | Error | Cause | Resolution |
|--------|-------|-------|------------|
| `400` | Bad Request | Invalid query parameters | Ensure `surah` is 1-114 and `ayah` ≥ 1 |
| `404` | Not Found | Verse doesn't exist | Verify the surah/ayah combination exists |
| `429` | Too Many Requests | Rate limit exceeded | Wait and retry after cooldown period |
| `500` | Internal Server Error | Server-side failure | Check server logs; report if persistent |

### Validation Errors

When query parameters fail Zod validation:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "querystring/surah must be >= 1"
}
```

---

## Rate Limiting

| Limit | Value |
|-------|-------|
| Requests per window | 100 |
| Window duration | 1 minute |
| Scope | Per client IP |

When exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Request Examples

### cURL

```bash
curl "http://localhost:3000/api/v1/compare?surah=1&ayah=1"
```

### JavaScript (Fetch)

```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/compare?surah=1&ayah=1'
);
const data = await response.json();
console.log(data.variants.hafs.text);
```

### Python (requests)

```python
import requests

response = requests.get(
    'http://localhost:3000/api/v1/compare',
    params={'surah': 1, 'ayah': 1}
)
data = response.json()
print(data['variants']['hafs']['text'])
```

---

## Available Recitations

The following Qira'at are available in the `variants` object:

| Slug | Reciter | Transmitter |
|------|---------|-------------|
| `hafs` | Asim | Hafs |
| `warsh` | Nafi' | Warsh |
| `qalun` | Nafi' | Qalun |
| `douri` | Abu Amr | Ad-Duri |

> **Note**: Available recitations depend on ingested data.

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

- **JSON**: [http://localhost:3000/docs/json](http://localhost:3000/docs/json)
- **YAML**: [http://localhost:3000/docs/yaml](http://localhost:3000/docs/yaml)

---

← [Back to Documentation](README.md)
