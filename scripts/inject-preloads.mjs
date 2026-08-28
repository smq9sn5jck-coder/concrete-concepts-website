/**
 * Post-build script: Injects <link rel="modulepreload"> for the Home chunk
 * into the built index.html so the browser downloads it in parallel with
 * the main entry chunk (eliminates the waterfall).
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist/public');
const htmlPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

// Find critical chunks for homepage
const files = fs.readdirSync(assetsDir);
const homeJs = files.find(f => f.startsWith('Home-') && f.endsWith('.js'));
const homeCSS = files.find(f => f.startsWith('Home-') && f.endsWith('.css'));
// Find the shared vendor chunk (largest index-*.js that isn't the entry)
const indexJsFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
const vendorJs = indexJsFiles.find(f => fs.statSync(path.join(assetsDir, f)).size > 100000);
// Find proxy chunk (wouter/radix shared code)
const proxyJs = files.find(f => f.startsWith('proxy-') && f.endsWith('.js'));

if (!homeJs) {
  console.log('⚠️  No Home chunk found, skipping preload injection');
  process.exit(0);
}

let html = fs.readFileSync(htmlPath, 'utf-8');

// Build preload tags - order matters: vendor first (largest), then Home, then smaller deps
const preloads = [];
if (vendorJs) {
  preloads.push(`<link rel="modulepreload" href="/assets/${vendorJs}" />`);
}
preloads.push(`<link rel="modulepreload" href="/assets/${homeJs}" />`);
if (proxyJs) {
  preloads.push(`<link rel="modulepreload" href="/assets/${proxyJs}" />`);
}
if (homeCSS) {
  preloads.push(`<link rel="preload" href="/assets/${homeCSS}" as="style" />`);
}

// Also preload the small entry chunk if it exists separately
const entryJs = indexJsFiles.find(f => fs.statSync(path.join(assetsDir, f)).size < 10000);
if (entryJs) {
  preloads.push(`<link rel="modulepreload" href="/assets/${entryJs}" />`);
}

// Add data-cfasync="false" to all script tags to bypass Cloudflare Rocket Loader
// Rocket Loader defers all JS and adds 2-3s delay for React SPAs
html = html.replace(/<script type="module"/g, '<script data-cfasync="false" type="module"');
html = html.replace(/<script>(\s*\/\/ Remove skeleton)/g, '<script data-cfasync="false">$1');
console.log('✅ Added data-cfasync="false" to bypass Rocket Loader');

// Inject after the existing preload for the hero image
const insertPoint = '</head>';
const preloadBlock = `    <!-- Preload critical JS chunks for parallel download -->\n    ${preloads.join('\n    ')}\n  `;

html = html.replace(insertPoint, preloadBlock + insertPoint);

fs.writeFileSync(htmlPath, html);
console.log(`✅ Injected ${preloads.length} preload hints: ${homeJs}${homeCSS ? ', ' + homeCSS : ''}${entryJs ? ', ' + entryJs : ''}`);
