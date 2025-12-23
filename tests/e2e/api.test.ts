import { describe, it, expect } from 'vitest';

describe('E2E: API', () => {
    const BASE_URL = 'http://localhost:3000';

    it('should return 400 when parameters are missing', async () => {
        // This confirms the server is reachable and routing works
        const response = await fetch(`${BASE_URL}/api/v1/compare`);
        expect(response.status).toBe(400);
    });
});
