import fs from 'fs';
import path from 'path';
import https from 'https';

const rootDir = process.cwd();
const sitemapPath = path.join(rootDir, 'dist', 'sitemap.xml');
const key = '8c3b4a2d1e0f49c5b6a7d8e9f0c1b2a3';
const host = 'abdullahcyber.dev';

const dryRun = process.argv.includes('--dry-run');

if (!fs.existsSync(sitemapPath)) {
  console.error("sitemap.xml not found in dist/. Please run build first.");
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const urlMatches = [...sitemapContent.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)];
const urlList = urlMatches.map(m => m[1]).filter(url => !url.includes('localhost') && !url.includes('netlify.app'));

if (urlList.length === 0) {
  console.log("No valid URLs found in sitemap.");
  process.exit(0);
}

const payload = JSON.stringify({
  host: host,
  key: key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: urlList
});

if (dryRun) {
  console.log("[DRY RUN] IndexNow payload that would be sent:");
  console.log(JSON.stringify(JSON.parse(payload), null, 2));
  process.exit(0);
}

console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

const req = https.request('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log(`IndexNow response status: ${res.statusCode}`);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => {
  console.error(`IndexNow submission failed: ${e.message}`);
});

req.write(payload);
req.end();
