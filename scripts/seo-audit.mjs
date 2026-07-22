import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error("dist/ directory not found. Please run npm run build first.");
  process.exit(1);
}

let errors = 0;

function check(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    errors++;
  } else {
    // console.log(`✅ [PASS] ${message}`);
  }
}

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = findHtmlFiles(distDir);
const seenTitles = new Set();
const seenDescriptions = new Set();

const sitemapPath = path.join(distDir, 'sitemap.xml');
const robotsPath = path.join(distDir, 'robots.txt');

check(fs.existsSync(sitemapPath), "sitemap.xml exists in dist");
check(fs.existsSync(robotsPath), "robots.txt exists in dist");

let sitemapContent = "";
if (fs.existsSync(sitemapPath)) {
  sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
}

let robotsContent = "";
if (fs.existsSync(robotsPath)) {
  robotsContent = fs.readFileSync(robotsPath, 'utf8');
  check(robotsContent.includes('User-agent: OAI-SearchBot'), "OAI-SearchBot is explicitly handled");
  check(robotsContent.includes('User-agent: PerplexityBot'), "PerplexityBot is explicitly handled");
  check(robotsContent.includes('Sitemap: https://abdullahcyber.dev/sitemap.xml'), "Sitemap is referenced in robots.txt");
}

const generatedRoutes = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(distDir, file).replace(/\\/g, '/');
  
  let routeUrl = relativePath;
  if (routeUrl === 'index.html') {
    routeUrl = '';
  } else if (routeUrl.endsWith('/index.html')) {
    routeUrl = routeUrl.slice(0, -10); // remove index.html
  }
  
  const expectedCanonical = `https://abdullahcyber.dev/${routeUrl}`;
  generatedRoutes.push(expectedCanonical);

  // Exclude 404 from some checks
  const is404 = relativePath === '404.html';
  
  if (is404) {
    check(content.includes('<meta name="robots" content="noindex, follow" />'), "404 page has noindex");
    check(!sitemapContent.includes('404.html'), "404 page is excluded from sitemap");
    continue;
  }
  
  // Title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  check(!!titleMatch, `Title exists for ${relativePath}`);
  if (titleMatch) {
    const title = titleMatch[1];
    check(!seenTitles.has(title), `Title is unique: ${title} (${relativePath})`);
    seenTitles.add(title);
  }
  
  // Description
  const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
  check(!!descMatch, `Meta description exists for ${relativePath}`);
  
  // Canonical
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
  check(!!canonicalMatch, `Canonical exists for ${relativePath}`);
  if (canonicalMatch) {
    check(canonicalMatch[1] === expectedCanonical, `Canonical matches route: ${canonicalMatch[1]} === ${expectedCanonical}`);
  }
  
  // H1
  const h1Matches = content.match(/<h1[^>]*>/g);
  check(h1Matches && h1Matches.length === 1, `Exactly one H1 per page for ${relativePath}`);
  
  // Noindex
  check(!content.includes('content="noindex"'), `No noindex on production page ${relativePath}`);
  
  // JSON-LD
  const jsonLdMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  check(!!jsonLdMatch, `JSON-LD exists for ${relativePath}`);
  if (jsonLdMatch) {
    try {
      JSON.parse(jsonLdMatch[1]);
    } catch (e) {
      check(false, `JSON-LD parses successfully for ${relativePath} - Error: ${e.message}`);
    }
  }

  // Duplicate IDs
  const idMatches = content.match(/ id="([^"]+)"/g);
  if (idMatches) {
    const ids = idMatches.map(m => m.match(/id="([^"]+)"/)[1]);
    const uniqueIds = new Set(ids);
    check(ids.length === uniqueIds.size, `No duplicate IDs found in ${relativePath}`);
  }

  // Localhost or preview URLs
  check(!content.includes('http://localhost'), `No localhost URLs in ${relativePath}`);
  check(!content.includes('netlify.app'), `No netlify backup URLs in ${relativePath}`);
}

// Check sitemap URLs match generated routes
for (const route of generatedRoutes) {
  if (route === 'https://abdullahcyber.dev/404.html') continue;
  check(sitemapContent.includes(`<loc>${route}</loc>`), `Sitemap includes ${route}`);
}

if (errors > 0) {
  console.error(`\\nSEO Audit Failed with ${errors} errors.`);
  process.exit(1);
} else {
  console.log("\\nSEO Audit Passed.");
}
