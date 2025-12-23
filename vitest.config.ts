import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**', '**/tests/e2e/**'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts', '!src/index.ts', '!src/db.ts', '!src/types/**'],
            exclude: ['dist/**'],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80
            }
        },
        passWithNoTests: true // Allow initially empty
    }
});
