import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**', '**/tests/e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts', '!src/index.ts', '!src/db.ts', '!src/types/**'],
            exclude: ['dist/**'],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100
            }
        },
        passWithNoTests: true // Allow initially empty
    }
});
