import path from 'path';
import fs from 'fs';
import Fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import apiRoutes from './routes';

export function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Validation Compilers for Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Security Plugins
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Core Plugins
  app.register(cors);
  app.register(compression);

  // Static Files - Serve Fonts
  const rootDir = process.cwd();
  app.register(fastifyStatic, {
    root: path.join(rootDir, 'fonts'),
    prefix: '/fonts/',
  });

  // Documentation Plugins
  app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Quranic Recitations API',
        description: `
A comprehensive RESTful API for accessing and comparing Quranic text variants across different Qiraat (recitation traditions).

## Features
- **Compare Variants**: View the same verse in different recitations side-by-side
- **Browse Surahs**: List all 114 surahs with metadata
- **Navigation**: Browse by Juz (1-30) or Mushaf page number
- **Search**: Full-text Arabic search using trigram matching
- **Multiple Qiraat**: Access Hafs, Warsh, Qalun, Douri, Shuba, Sousi

## Quick Start
\`\`\`bash
curl "http://localhost:3000/api/v1/compare?surah=1&ayah=1"
\`\`\`
        `.trim(),
        version: '1.0.0',
        termsOfService: 'https://github.com/syafiqhadzir/stg-api/blob/main/LICENSE',
        contact: {
          name: 'API Support',
          url: 'https://github.com/syafiqhadzir/stg-api/issues',
          email: 'syafiq@example.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development Server',
        },
        {
          url: 'https://api.example.com',
          description: 'Production Server',
        },
      ],
      tags: [
        {
          name: 'Comparison',
          description: 'Compare Quranic verse variants across recitations',
        },
        {
          name: 'Surahs',
          description: 'Browse and retrieve surah data with verses',
        },
        {
          name: 'Qiraat',
          description: 'Available recitation traditions (Qiraat)',
        },
        {
          name: 'Navigation',
          description: 'Browse verses by Juz or Mushaf page',
        },
        {
          name: 'Search',
          description: 'Full-text Arabic search with trigram matching',
        },
      ],
      externalDocs: {
        description: 'Full API Documentation',
        url: 'https://github.com/syafiqhadzir/stg-api/blob/main/docs/API.md',
      },
    },
    transform: jsonSchemaTransform,
  });

  // Read custom CSS
  let customCss = '';
  /* v8 ignore start */
  try {
    const cssPath = path.join(__dirname, '../public/css/swagger.css');
    if (fs.existsSync(cssPath)) {
      customCss = fs.readFileSync(cssPath, 'utf-8');
    }
  } catch (err) {
    console.error('Failed to read swagger.css', err);
  }
  /* v8 ignore stop */

  app.register(swaggerUi, {
    routePrefix: '/docs',
    theme: {
      css: [
        {
          filename: 'swagger.css',
          content: customCss,
        },
      ],
    },
  });

  // Routes
  app.register(apiRoutes, { prefix: '/api/v1' });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    // Fastify handles validation errors with statusCode 400 automatically via schema
    // or we can customize it here if needed, but the default fallback generic handler works.

    const status = error.statusCode ?? 500;
    reply.status(status).send({
      statusCode: status,
      error: error.name,
      message: error.message,
    });
  });

  return app;
}
