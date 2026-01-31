/**
 * Simple runner for the audit tool
 * Compiles TypeScript and runs the audit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Compiling audit tool...\n');

try {
  // Compile TypeScript file
  execSync('npx tsx audit-requirements.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('❌ Error running audit:', error.message);
  process.exit(1);
}
