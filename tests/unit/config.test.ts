import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock process.env before import.
// Using vi.hoisted or clearing modules.

describe('Config', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env = { ...process.env }; // Clone
    });

    it('should parse valid environment variables', async () => {
        process.env.NODE_ENV = 'test';
        process.env.DB_PASS = 'pass';

        const { env } = await import('../../src/config');
        expect(env.NODE_ENV).toBe('test');
        expect(env.DB_PORT).toBe(5432); // Default
    });

    it('should exit on invalid environment variables', async () => {
        process.env.PORT = 'invalid';
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('process.exit'); }) as unknown as never);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* intentionally empty */ });

        await expect(import('../../src/config')).rejects.toThrow('process.exit');

        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(errorSpy).toHaveBeenCalled();
    });
});
