import Fastify from 'fastify';
import cors from '@fastify/cors';
import compression from '@fastify/compress';
import apiRoutes from './routes';
import { ZodError } from 'zod';

export function buildApp() {
    const app = Fastify({
        logger: true
    });

    // Plugins
    app.register(cors);
    app.register(compression);

    // Routes
    app.register(apiRoutes, { prefix: '/api/v1' });

    // Global Error Handler
    app.setErrorHandler((error, request, reply) => {
        app.log.error(error);

        if (error instanceof ZodError) {
            reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                issues: error.issues
            });
            return;
        }

        reply.status(error.statusCode || 500).send({
            statusCode: error.statusCode || 500,
            error: error.name || 'Internal Server Error',
            message: error.message
        });
    });

    return app;
}
