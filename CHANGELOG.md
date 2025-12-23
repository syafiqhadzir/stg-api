# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GET `/api/v1/surahs` - List all 114 surahs
- GET `/api/v1/surahs/:surah` - Get surah with all verses
- GET `/api/v1/qiraat` - List available Qiraat
- GET `/api/v1/juz/:juz` - Get verses by Juz
- GET `/api/v1/page/:page` - Get verses by page
- GET `/api/v1/search` - Arabic text search with pg_trgm
- Comprehensive documentation in `docs/` directory
- GitHub community standards files

### Changed
- Updated API documentation with all 7 endpoints
- Improved README with endpoints overview table

## [1.0.0] - 2024-12-23

### Added
- Initial release
- GET `/api/v1/compare` - Compare Qiraat variants
- PostgreSQL database with materialized view
- Fastify with Zod validation
- Security: Helmet, rate limiting
- Swagger UI documentation
- Docker containerization
- CI/CD with GitHub Actions
- 100% test coverage

[Unreleased]: https://github.com/syafiqhadzir/stg-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/syafiqhadzir/stg-api/releases/tag/v1.0.0
