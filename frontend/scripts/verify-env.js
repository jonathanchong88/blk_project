const fs = require('fs');
const path = require('path');

/**
 * Script to verify environment variables before building the frontend.
 */

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Simple helper to load .env file manually if it exists
const loadEnv = (file) => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
};

// Load common env files
loadEnv('.env');
loadEnv('.env.local');
loadEnv('.env.production'); // Since this is for 'build'

const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('\n' + '='.repeat(60));
  console.error('ERROR: Missing required environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  console.error('='.repeat(60));
  console.error('\nEnsure these are set in your Render dashboard or .env file before building.');
  process.exit(1);
}

console.log('Environment variables verified successfully.');
