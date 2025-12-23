import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../../src/app';
import { ComparisonRepository } from '../../src/repositories/ComparisonRepository';

// No module mock needed if we spy on prototype
// but we might need to mock db if we want to be safe, 
// though spying on getComparison prevents db calls from that method.

describe('Integration: Comparison Routes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        app = buildApp();
        await app.ready();
    });

    afterEach(async () => {
        await app.close();
    });

    it('GET /api/v1/compare should return 200 with data', async () => {
        // Spy on the prototype method
        const getComparisonSpy = vi.spyOn(ComparisonRepository.prototype, 'getComparison')
            .mockResolvedValue({ surah: 2, ayah: 255, variants: { hafs: 'test' } as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '2', ayah: '255' }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ surah: 2, ayah: 255, variants: { hafs: 'test' } });
        expect(getComparisonSpy).toHaveBeenCalledWith(2, 255);
    });

    it('GET /api/v1/compare should return 400 for invalid input', async () => {
        // Validation happens before Repo call, but strictly speaking we don't need to mock repo here if validation fails first.
        // But good practice to mock just in case.
        const getComparisonSpy = vi.spyOn(ComparisonRepository.prototype, 'getComparison');

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: 'invalid', ayah: '255' }
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toHaveProperty('error');
        expect(getComparisonSpy).not.toHaveBeenCalled();
    });

    it('GET /api/v1/compare should return 404 when verse not found', async () => {
        vi.spyOn(ComparisonRepository.prototype, 'getComparison').mockResolvedValue(null);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '114', ayah: '10' }
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toHaveProperty('error');
    });

    it('GET /api/v1/compare should return 500 on unexpected error', async () => {
        vi.spyOn(ComparisonRepository.prototype, 'getComparison').mockRejectedValue(new Error('Unexpected DB Error'));

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '2', ayah: '255' }
        });

        // Fastify global error handler should catch it.
        // In app.ts: error.statusCode || 500
        expect(response.statusCode).toBe(500);
        expect(response.json()).toHaveProperty('error');
    });
});
