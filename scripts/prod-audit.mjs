import https from 'https';
import http from 'http';
import { parse } from 'node-html-parser';

const urls = [
  'https://abdullahcyber.dev/',
  'https://abdullahcyber.dev/about/',
  'https://abdullahcyber.dev/education/',
  'https://abdullahcyber.dev/projects/',
  'https://abdullahcyber.dev/experience/',
  'https://abdullahcyber.dev/certifications/',
  'https://abdullahcyber.dev/achievements/',
  'https://abdullahcyber.dev/robots.txt',
  'https://abdullahcyber.dev/sitemap.xml',
  'https://abdullahcyber.dev/llms.txt',
  'https://abdullahcyber.dev/404.html',
  'https://abdullahcyber.dev/8c3b4a2d1e0f49c5b6a7d8e9f0c1b2a3.txt',
  'https://abdullahcyber.dev/projects/modular-recon-tool/',
  'https://abdullahcyber.dev/projects/phishing/',
  'https://abdullahcyber.dev/projects/honeypot/',
  'https://abdullahcyber.dev/projects/ctf-practice/'
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'],
        finalUrl: res.url || url,
        data
      }));
    }).on('error', reject);
  });
}

async function audit() {
  for (const url of urls) {
    try {
      const res = await fetchUrl(url);
      console.log(`\nURL: ${url}`);
      console.log(`Status: ${res.status}`);
      console.log(`Content-Type: ${res.contentType}`);
      
      if (res.contentType && res.contentType.includes('text/html')) {
        const root = parse(res.data);
        const title = root.querySelector('title')?.text || 'None';
        const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'None';
        const h1 = root.querySelector('h1')?.text || 'None';
        const desc = root.querySelector('meta[name="description"]')?.getAttribute('content') || 'None';
        const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || 'None';
        const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'None';
        const ogDesc = root.querySelector('meta[property="og:description"]')?.getAttribute('content') || 'None';
        const ogUrl = root.querySelector('meta[property="og:url"]')?.getAttribute('content') || 'None';
        const ogType = root.querySelector('meta[property="og:type"]')?.getAttribute('content') || 'None';
        const ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'None';
        const twitterCard = root.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || 'None';
        
        console.log(`Title: ${title}`);
        console.log(`Description: ${desc}`);
        console.log(`Canonical: ${canonical}`);
        console.log(`H1: ${h1}`);
        console.log(`Robots: ${robots}`);
        console.log(`OG Title: ${ogTitle}`);
        console.log(`OG Desc: ${ogDesc}`);
        console.log(`OG URL: ${ogUrl}`);
        console.log(`OG Type: ${ogType}`);
        console.log(`OG Image: ${ogImage}`);
        console.log(`Twitter Card: ${twitterCard}`);

        const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]');
        console.log(`JSON-LD blocks: ${jsonLdScripts.length}`);
        
        let types = new Set();
        jsonLdScripts.forEach(script => {
          try {
            const data = JSON.parse(script.text);
            if (Array.isArray(data)) {
              data.forEach(item => types.add(item['@type']));
            } else {
              if (data['@graph']) {
                data['@graph'].forEach(item => types.add(item['@type']));
              } else {
                types.add(data['@type']);
              }
            }
          } catch (e) {}
        });
        console.log(`JSON-LD Types: ${Array.from(types).join(', ')}`);
      }
    } catch (e) {
      console.log(`Error fetching ${url}: ${e.message}`);
    }
  }
}

audit();
