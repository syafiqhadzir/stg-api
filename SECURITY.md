# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue,
please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue
2. Email the maintainer directly with details
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Response time**: Within 48 hours
- **Resolution timeline**: Depends on severity
- **Credit**: We credit reporters in release notes (unless you prefer anonymity)

### Security Measures

This API implements the following security measures:

- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Rate Limiting**: 100 requests/minute per IP
- **Input Validation**: All inputs validated via Zod schemas
- **Response Serialization**: Schema-validated outputs
- **Environment Validation**: Startup config validation

For detailed security documentation, see [docs/SECURITY.md](docs/SECURITY.md).
