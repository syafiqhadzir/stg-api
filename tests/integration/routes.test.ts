import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app';
import { ComparisonRepository } from '../../src/repositories/ComparisonRepository';
import { SurahRepository } from '../../src/repositories/SurahRepository';
import { QiraatRepository } from '../../src/repositories/QiraatRepository';
import { SearchRepository } from '../../src/repositories/SearchRepository';

// Spies
const getComparisonSpy = vi.spyOn(ComparisonRepository.prototype, 'getComparison');
const getAllSurahsSpy = vi.spyOn(SurahRepository.prototype, 'getAllSurahs');
const getSurahSpy = vi.spyOn(SurahRepository.prototype, 'getSurah');
const getAllQiraatSpy = vi.spyOn(QiraatRepository.prototype, 'getAllQiraat');
const getVersesByJuzSpy = vi.spyOn(SearchRepository.prototype, 'getVersesByJuz');
const getVersesByPageSpy = vi.spyOn(SearchRepository.prototype, 'getVersesByPage');
const searchTextSpy = vi.spyOn(SearchRepository.prototype, 'searchText');

describe('Integration: API Routes', () => {
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
        vi.clearAllMocks();
    });

    // --- Comparison ---
    describe('GET /api/v1/compare', () => {
        it('should return comparison data', async () => {
            const mockData = { surah: 1, ayah: 1, variants: {} };
            getComparisonSpy.mockResolvedValue(mockData as any);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/compare',
                query: { surah: '1', ayah: '1' },
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockData);
        });

        it('should return 404 if not found', async () => {
            getComparisonSpy.mockResolvedValue(null);
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/compare',
                query: { surah: '1', ayah: '1' },
            });
            expect(response.statusCode).toBe(404);
        });

        it('should return 500 on unexpected error', async () => {
            getComparisonSpy.mockRejectedValue(new Error('Unexpected DB Error'));

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/compare',
                query: { surah: '1', ayah: '1' },
            });

            expect(response.statusCode).toBe(500);
            expect(response.json()).toHaveProperty('error');
        });

        it('should handle custom error status codes', async () => {
            const customError = new Error('I am a teapot');
            (customError as any).statusCode = 418;
            getComparisonSpy.mockRejectedValue(customError);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/compare',
                query: { surah: '1', ayah: '1' },
            });

            expect(response.statusCode).toBe(418);
        });
    });

    // --- Surahs ---
    describe('GET /api/v1/surahs', () => {
        it('should return list of surahs', async () => {
            const mockSurahs = [{ number: 1, name: 'Fatiha', arabicName: 'الفاتحة', ayahCount: 7 }];
            getAllSurahsSpy.mockResolvedValue(mockSurahs);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/surahs',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockSurahs);
        });
    });

    describe('GET /api/v1/surahs/:surah', () => {
        it('should return surah details', async () => {
            const mockSurah = {
                surah: 1,
                name: 'Fatiha',
                arabicName: 'الفاتحة',
                ayahCount: 7,
                verses: []
            };
            getSurahSpy.mockResolvedValue(mockSurah as any);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/surahs/1',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockSurah);
        });

        it('should return 404 if surah not found', async () => {
            getSurahSpy.mockResolvedValue(null);
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/surahs/114',
            });
            expect(response.statusCode).toBe(404);
        });

        it('should return 400 for invalid surah number', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/surahs/invalid',
            });
            expect(response.statusCode).toBe(400);
        });

        it('should return 500 on unexpected error', async () => {
            getSurahSpy.mockRejectedValue(new Error('Unexpected DB Error'));
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/surahs/1',
            });
            expect(response.statusCode).toBe(500);
        });
    });

    // --- Qiraat ---
    describe('GET /api/v1/qiraat', () => {
        it('should return list of qiraat', async () => {
            const mockQiraat = [{ slug: 'hafs', name: 'Hafs', description: 'Hafs description' }];
            getAllQiraatSpy.mockResolvedValue(mockQiraat as any);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/qiraat',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockQiraat);
        });
    });

    // --- Navigation (Juz/Page) ---
    describe('GET /api/v1/juz/:juz', () => {
        it('should return verses by juz', async () => {
            const mockResult = { juz: 1, verses: [] };
            getVersesByJuzSpy.mockResolvedValue(mockResult);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/juz/1',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockResult);
        });

        it('should return 404 if juz not found', async () => {
            getVersesByJuzSpy.mockResolvedValue(null);
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/juz/30',
            });
            expect(response.statusCode).toBe(404);
        });

        it('should return 400 for invalid juz', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/juz/31', // Max is 30
            });
            expect(response.statusCode).toBe(400);
        });

        it('should return 500 on unexpected error', async () => {
            getVersesByJuzSpy.mockRejectedValue(new Error('Unexpected DB Error'));
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/juz/1',
            });
            expect(response.statusCode).toBe(500);
        });
    });

    describe('GET /api/v1/page/:page', () => {
        it('should return verses by page', async () => {
            const mockResult = { page: 1, verses: [] };
            getVersesByPageSpy.mockResolvedValue(mockResult);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/page/1',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockResult);
        });

        it('should return 404 if page not found', async () => {
            getVersesByPageSpy.mockResolvedValue(null);
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/page/605',
            });
            expect(response.statusCode).toBe(404);
        });

        it('should return 500 on unexpected error', async () => {
            getVersesByPageSpy.mockRejectedValue(new Error('Unexpected DB Error'));
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/page/1',
            });
            expect(response.statusCode).toBe(500);
        });
    });

    // --- Search ---
    describe('GET /api/v1/search', () => {
        it('should return search results', async () => {
            const mockResult = { query: 'test', count: 1, results: [] };
            searchTextSpy.mockResolvedValue(mockResult);

            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/search',
                query: { q: 'test' },
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockResult);
        });

        it('should return 400 if query missing', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/search',
            });
            expect(response.statusCode).toBe(400);
        });
    });
});
