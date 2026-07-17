const fs = require('fs');
const path = require('path');

const certs = JSON.parse(fs.readFileSync('content/certificates.json', 'utf8'));
const profile = JSON.parse(fs.readFileSync('content/profile.json', 'utf8'));

console.log('Title | JSON Path | Source Path | Source Size | PDF Signature');
console.log('---|---|---|---|---');

function checkFile(title, fileUrl) {
  // e.g. fileUrl is '/assets/certificates/web-rta.pdf'
  const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  const sourcePath = path.join('public', relativePath);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`${title} | ${fileUrl} | ${sourcePath} | MISSING | MISSING`);
    return;
  }
  
  const stats = fs.statSync(sourcePath);
  const fd = fs.openSync(sourcePath, 'r');
  const buffer = Buffer.alloc(4);
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);
  
  const isPdf = buffer.toString() === '%PDF';
  console.log(`${title} | ${fileUrl} | ${sourcePath} | ${stats.size} | ${isPdf}`);
}

for (const c of certs) {
  checkFile(c.title, c.certificateFile);
}

checkFile('CV', '/assets/Muhammad-Abdullah-CV.pdf');
