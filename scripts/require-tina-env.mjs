const missing = [];

const checkVar = (name) => {
  const val = process.env[name];
  if (!val || val === 'undefined' || val === 'null' || val.trim() === '') {
    missing.push(name);
  }
};

checkVar('NEXT_PUBLIC_TINA_CLIENT_ID');
checkVar('TINA_TOKEN');
checkVar('NEXT_PUBLIC_TINA_BRANCH');

if (missing.length > 0) {
  console.error(`\n[ERROR] Production TinaCloud credentials are required for this build.`);
  console.error(`Missing or invalid variables: ${missing.join(', ')}`);
  console.error(`Please provide real non-empty values or use 'npm run build:local' for local testing.\n`);
  process.exit(1);
}

console.log('Production TinaCloud credentials found. Proceeding with build...');
