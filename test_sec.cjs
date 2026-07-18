const fs = require('fs');
const mainJsContent = fs.readFileSync('src/main.js', 'utf8');

const aiPatterns = [
  { regex: /\.innerHTML\s*=\s*(?!['"]|''|"")/i, msg: 'Unsafe innerHTML assignment found in main.js' },
  { regex: /innerHTML\s*\+?=\s*[^"']/i, msg: 'Unsafe innerHTML concatenation found in main.js' }
];

for (const pattern of aiPatterns) {
  if (pattern.regex.test(mainJsContent)) {
    const matches = mainJsContent.match(new RegExp(pattern.regex, 'g')) || [];
    const unsafe = matches.filter(m => !m.includes('innerHTML = \'\'') && !m.includes('innerHTML = ""'));
    if (unsafe.length > 0) {
      console.log('FAILED on:', pattern.msg);
      console.log('Matches:', unsafe);
    }
  }
}
