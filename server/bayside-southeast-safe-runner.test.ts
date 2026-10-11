import { describe, expect, it } from 'vitest';
import { selectSafeTestFiles, EXTERNAL_TEST_FILES } from '../scripts/safeTestSelection';

describe('safe deterministic selection', () => {
  it('excludes exactly the documented live files while keeping new and mocked suites', () => {
    const files = [...EXTERNAL_TEST_FILES, 'server/bayside-southeast-worker.test.ts', 'server/pages-worker-booking.test.ts', 'server/comprehensive-quote.test.ts'];
    expect(selectSafeTestFiles(files)).toEqual(['server/bayside-southeast-worker.test.ts','server/comprehensive-quote.test.ts','server/pages-worker-booking.test.ts']);
    expect(EXTERNAL_TEST_FILES).toHaveLength(10);
  });
  it('deduplicates and normalises paths and never selects non-test files', () => {
    expect(selectSafeTestFiles(['./server/a.test.ts','server/a.test.ts','server/b.spec.ts','server/helper.ts','client/a.test.ts'])).toEqual(['server/a.test.ts','server/b.spec.ts']);
  });
});
