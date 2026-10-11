export const EXTERNAL_TEST_FILES = ['server/anthropic.test.ts','server/bfl.test.ts','server/cloudflare-deploy-credential.live.test.ts','server/googleAds.test.ts','server/live-quote-route-guard.test.ts','server/photo-upload-r2.test.ts','server/resend.test.ts','server/content-expansion.test.ts','server/seo-features.test.ts','server/seo-conversion.test.ts'] as const;
export function selectSafeTestFiles(files: string[]): string[] {
  return [...new Set(files.map(file => file.replace(/^\.\//, '')).filter(file => /^server\/.+\.(test|spec)\.ts$/.test(file) && !(EXTERNAL_TEST_FILES as readonly string[]).includes(file)))].sort();
}
