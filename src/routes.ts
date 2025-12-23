import { FastifyInstance } from 'fastify';

// Repositories
import { ComparisonRepository } from './repositories/ComparisonRepository';
import { SurahRepository } from './repositories/SurahRepository';
import { QiraatRepository } from './repositories/QiraatRepository';
import { SearchRepository } from './repositories/SearchRepository';

// Use Cases
import { GetComparisonUseCase } from './usecases/GetComparisonUseCase';
import { GetSurahsUseCase } from './usecases/GetSurahsUseCase';
import { GetSurahUseCase } from './usecases/GetSurahUseCase';
import { GetQiraatUseCase } from './usecases/GetQiraatUseCase';
import { GetJuzUseCase } from './usecases/GetJuzUseCase';
import { GetPageUseCase } from './usecases/GetPageUseCase';
import { SearchUseCase } from './usecases/SearchUseCase';

// Controllers
import { ComparisonController } from './controllers/ComparisonController';
import { SurahController } from './controllers/SurahController';
import { QiraatController } from './controllers/QiraatController';
import { SearchController } from './controllers/SearchController';

// Schemas
import { ComparisonQuerySchema, ComparisonResponseSchema, ErrorResponseSchema } from './types';
import {
  SurahListResponseSchema,
  SurahResponseSchema,
  SurahParamsSchema,
  SurahQuerySchema,
} from './types/surah';
import { QiraatListResponseSchema } from './types/qiraat';
import {
  JuzParamsSchema,
  PageParamsSchema,
  VersesQuerySchema,
  JuzResponseSchema,
  PageResponseSchema,
  SearchQuerySchema,
  SearchResponseSchema,
} from './types/search';

export default function apiRoutes(fastify: FastifyInstance) {
  // ==========================================================================
  // Dependency Injection Layer
  // ==========================================================================

  // Repositories
  const comparisonRepo = new ComparisonRepository();
  const surahRepo = new SurahRepository();
  const qiraatRepo = new QiraatRepository();
  const searchRepo = new SearchRepository();

  // Use Cases
  const getComparisonUseCase = new GetComparisonUseCase(comparisonRepo);
  const getSurahsUseCase = new GetSurahsUseCase(surahRepo);
  const getSurahUseCase = new GetSurahUseCase(surahRepo);
  const getQiraatUseCase = new GetQiraatUseCase(qiraatRepo);
  const getJuzUseCase = new GetJuzUseCase(searchRepo);
  const getPageUseCase = new GetPageUseCase(searchRepo);
  const searchUseCase = new SearchUseCase(searchRepo);

  // Controllers
  const comparisonController = new ComparisonController(getComparisonUseCase);
  const surahController = new SurahController(getSurahsUseCase, getSurahUseCase);
  const qiraatController = new QiraatController(getQiraatUseCase);
  const searchController = new SearchController(getJuzUseCase, getPageUseCase, searchUseCase);

  // ==========================================================================
  // Routes: Comparison
  // ==========================================================================

  fastify.get(
    '/compare',
    {
      schema: {
        tags: ['Comparison'],
        summary: 'Compare Quranic verse variants',
        description:
          'Retrieves the text of a specific verse (ayah) from multiple Qiraat (recitation variants). Returns the text, page number, and juz for each available recitation.',
        operationId: 'getComparison',
        querystring: ComparisonQuerySchema,
        response: {
          200: ComparisonResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return comparisonController.getComparison(req as any, reply);
    },
  );

  // ==========================================================================
  // Routes: Surahs
  // ==========================================================================

  fastify.get(
    '/surahs',
    {
      schema: {
        tags: ['Surahs'],
        summary: 'List all surahs',
        description:
          'Returns metadata for all 114 surahs including name, Arabic name, and ayah count.',
        operationId: 'getSurahs',
        response: {
          200: SurahListResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      return surahController.getAllSurahs(req, reply);
    },
  );

  fastify.get(
    '/surahs/:surah',
    {
      schema: {
        tags: ['Surahs'],
        summary: 'Get a surah with all verses',
        description: 'Returns all verses for a specific surah. Optionally filter by Qiraat.',
        operationId: 'getSurah',
        params: SurahParamsSchema,
        querystring: SurahQuerySchema,
        response: {
          200: SurahResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return surahController.getSurah(req as any, reply);
    },
  );

  // ==========================================================================
  // Routes: Qiraat
  // ==========================================================================

  fastify.get(
    '/qiraat',
    {
      schema: {
        tags: ['Qiraat'],
        summary: 'List available Qiraat',
        description: 'Returns metadata for all available recitation traditions (Qiraat).',
        operationId: 'getQiraat',
        response: {
          200: QiraatListResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      return qiraatController.getAllQiraat(req, reply);
    },
  );

  // ==========================================================================
  // Routes: Juz & Page
  // ==========================================================================

  fastify.get(
    '/juz/:juz',
    {
      schema: {
        tags: ['Navigation'],
        summary: 'Get verses by Juz',
        description: 'Returns all verses in a specific Juz (1-30). Optionally filter by Qiraat.',
        operationId: 'getJuz',
        params: JuzParamsSchema,
        querystring: VersesQuerySchema,
        response: {
          200: JuzResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return searchController.getJuz(req as any, reply);
    },
  );

  fastify.get(
    '/page/:page',
    {
      schema: {
        tags: ['Navigation'],
        summary: 'Get verses by page',
        description: 'Returns all verses on a specific Mushaf page. Optionally filter by Qiraat.',
        operationId: 'getPage',
        params: PageParamsSchema,
        querystring: VersesQuerySchema,
        response: {
          200: PageResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return searchController.getPage(req as any, reply);
    },
  );

  // ==========================================================================
  // Routes: Search
  // ==========================================================================

  fastify.get(
    '/search',
    {
      schema: {
        tags: ['Search'],
        summary: 'Search Quranic text',
        description:
          'Search across Quranic text using Arabic trigram matching. Optionally filter by Qiraat.',
        operationId: 'search',
        querystring: SearchQuerySchema,
        response: {
          200: SearchResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return searchController.search(req as any, reply);
    },
  );
}
