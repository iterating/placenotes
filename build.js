import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure we're in production mode
process.env.NODE_ENV = 'production';

try {
  console.log('🚀 Starting build process...');

  // Install root dependencies
  console.log('\n📦 Installing root dependencies...');
  execSync('pnpm install', { stdio: 'inherit' });

  // Build client
  console.log('\n🏗️ Building client...');
  process.chdir('./client');
  execSync('pnpm install', { stdio: 'inherit' });
  execSync('pnpm build', { stdio: 'inherit' });
  process.chdir('..');

  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
}
