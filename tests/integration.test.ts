import { describe, it, expect, beforeAll, vi } from 'vitest';
import { buildApp } from '../src/app';

// Mock DB to prevent connection attempts
vi.mock('../src/db', () => ({
    query: vi.fn(),
    getClient: vi.fn(),
}));

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
    });

    it('GET /api/v1/compare should return validation error for invalid param types', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare?surah=abc&ayah=1',
        });

        expect(response.statusCode).toBe(400);
    });
});
