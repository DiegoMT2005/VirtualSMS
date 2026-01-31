/**
 * Simple wrapper to run test-tools.ts with environment variables loaded
 * Run with: node scripts/test-tools.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Now run the test
require('child_process').execSync('npx tsx test-tools.ts', {
  stdio: 'inherit',
  env: process.env
});
