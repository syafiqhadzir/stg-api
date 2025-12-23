import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';

describe('Integration Tests: Comparison API', () => {
    const app = buildApp();

    beforeAll(async () => {
        await app.ready();
    });

    it('GET /api/v1/compare should return validation error for missing params', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
        });

        expect(response.statusCode).toBe(400);
        const body = response.json();
        expect(body.error).toBe('Validation Error');
    });

    it('GET /api/v1/compare should return validation error for invalid param types', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare?surah=abc&ayah=1',
        });

        expect(response.statusCode).toBe(400);
    });

    // Note: This test requires a running DB or mocked repository. 
    // For strict "unit/logic" testing without DB, we should mock. 
    // But for "Integration", we ideally hit the DB.
    // Since we cannot guarantee DB is running in this environment, this test might fail if run locally without DB.
    // We can mock the repository logic here if we want to test just the Controller-UseCase flow.

    // Tests below assume the DB connection will fail or return default responses if not mocked.
    // Ideally, we would mock 'ComparisonRepository' for this test file.
});
