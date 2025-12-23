# Testing Guide

Complete guide to testing strategy, running tests, and coverage requirements.

## Overview

| Framework | Purpose |
|-----------|---------|
| **Vitest** | Unit and integration testing |
| **@vitest/coverage-v8** | Code coverage reporting |

## Running Tests

### All Tests

```bash
npm test
```

### With Coverage Report

```bash
npm run test:coverage
```

### Watch Mode (Development)

```bash
npm test -- --watch
```

### E2E Tests Only

```bash
npm run test:e2e
```

### Specific Test File

```bash
npx vitest run tests/unit/ComparisonRepository.test.ts
```

---

## Test Structure

```
tests/
├── unit/                      # Unit tests (isolated components)
│   ├── ComparisonRepository.test.ts
│   ├── GetComparisonUseCase.test.ts
│   └── ComparisonController.test.ts
├── integration/               # Integration tests (component interactions)
│   └── ...
├── e2e/                       # End-to-end tests
│   └── ...
└── fixtures/                  # Test data and mocks
    └── ...
```

---

## Writing Tests

### Unit Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GetComparisonUseCase } from '../../src/usecases/GetComparisonUseCase';

describe('GetComparisonUseCase', () => {
  it('should return comparison data for valid verse', async () => {
    // Arrange
    const mockRepo = {
      getComparison: vi.fn().mockResolvedValue({
        surah: 1,
        ayah: 1,
        variants: { hafs: { text: '...', page: 1, juz: 1 } }
      })
    };
    const useCase = new GetComparisonUseCase(mockRepo);
    
    // Act
    const result = await useCase.execute(1, 1);
    
    // Assert
    expect(result.surah).toBe(1);
    expect(mockRepo.getComparison).toHaveBeenCalledWith(1, 1);
  });

  it('should throw for non-existent verse', async () => {
    // Arrange
    const mockRepo = { getComparison: vi.fn().mockResolvedValue(null) };
    const useCase = new GetComparisonUseCase(mockRepo);
    
    // Act & Assert
    await expect(useCase.execute(999, 999)).rejects.toThrow('Verse not found');
  });
});
```

### Mocking Dependencies

```typescript
import { vi } from 'vitest';

// Mock database module
vi.mock('../../src/db', () => ({
  query: vi.fn()
}));

// Import after mock
import { query } from '../../src/db';
import { ComparisonRepository } from '../../src/repositories/ComparisonRepository';
```

---

## Coverage Requirements

The project enforces **100% code coverage**:

| Metric | Threshold |
|--------|-----------|
| Lines | 100% |
| Functions | 100% |
| Branches | 100% |
| Statements | 100% |

### Viewing Coverage

After running `npm run test:coverage`:

1. **Terminal**: Summary displayed in console
2. **HTML Report**: Open `coverage/index.html` in browser
3. **LCOV**: `coverage/lcov.info` for CI integration

### Excluding Files from Coverage

In `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/index.ts',      // Entry point
        '**/*.d.ts',         // Type declarations
        'tests/**/*'         // Test files themselves
      ]
    }
  }
});
```

Use `/* v8 ignore file */` comment for entire files.

---

## Testing Clean Architecture Layers

### Controller Tests

Test HTTP request/response handling:
- Query parameter parsing
- Response formatting
- Error handling

### UseCase Tests

Test business logic:
- Valid input → expected output
- Edge cases and error conditions
- Repository method calls

### Repository Tests

Test data access:
- SQL query construction
- Result mapping
- Null/empty handling

---

## CI Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: npm run test:coverage
```

---

## Debugging Tests

### VS Code Integration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
npx vitest run --reporter=verbose
```

---

← [Back to Documentation](README.md)
