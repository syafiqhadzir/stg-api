import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app';
import { ComparisonRepository } from '../../src/repositories/ComparisonRepository';

// Spy on prototype BEFORE any tests run
const getComparisonSpy = vi.spyOn(ComparisonRepository.prototype, 'getComparison');

describe('Integration: Comparison Routes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        getComparisonSpy.mockReset();
    });

    it('GET /api/v1/compare should return 200 with data', async () => {
        const mockResponse = {
            surah: 2,
            ayah: 255,
            variants: {
                hafs: { text: 'Test verse text', page: 42, juz: 3 }
            }
        };
        getComparisonSpy.mockResolvedValue(mockResponse);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '2', ayah: '255' }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(mockResponse);
        expect(getComparisonSpy).toHaveBeenCalledWith(2, 255);
    });

    it('GET /api/v1/compare should return 400 for invalid input', async () => {
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
        getComparisonSpy.mockResolvedValue(null);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '114', ayah: '10' }
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toHaveProperty('error');
    });

    it('GET /api/v1/compare should return 500 on unexpected error', async () => {
        getComparisonSpy.mockRejectedValue(new Error('Unexpected DB Error'));

        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/compare',
            query: { surah: '2', ayah: '255' }
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toHaveProperty('error');
    });
});
