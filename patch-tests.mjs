import fs from 'fs';
const main = fs.readFileSync('tests/site-smoke.spec.mjs', 'utf8');
const newAi = fs.readFileSync('C:/Users/Dell/.gemini/antigravity/brain/49f4ef3d-ada6-43a4-aae9-3ff26782a368/scratch/new-tests.mjs', 'utf8');
const safeStartIndex = main.indexOf('  test("Shehzadas AI advanced features", async');
const idx2 = main.indexOf("  test('Shehzadas AI advanced features', async");
const realIdx = safeStartIndex !== -1 ? safeStartIndex : idx2;
if (realIdx !== -1) {
  fs.writeFileSync('tests/site-smoke.spec.mjs', main.substring(0, realIdx) + newAi + '});\n');
  console.log('Replaced successfully');
} else {
  console.log('Marker not found');
}
