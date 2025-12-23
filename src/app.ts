import Fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import compression from '@fastify/compress';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
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
  app.register(helmet);
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Core Plugins
  app.register(cors);
  app.register(compression);

  // Documentation Plugins
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Quranic Recitations API',
        description:
          "A RESTful API for comparing Quranic text variants across different Qira'at (recitation traditions). Access verse texts from Hafs, Warsh, Qalun, and other authentic recitations.",
        version: '1.0.0',
        contact: {
          name: 'API Support',
          url: 'https://github.com/syafiqhadzir/stg-api',
          email: 'support@example.com',
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
      ],
      tags: [
        {
          name: 'Comparison',
          description: 'Endpoints for comparing Quranic verse variants across recitations',
        },
      ],
      externalDocs: {
        description: 'GitHub Repository',
        url: 'https://github.com/syafiqhadzir/stg-api',
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
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
