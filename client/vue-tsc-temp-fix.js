#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run vue-tsc with specific options to avoid any dev server interference
const result = spawnSync('npx', ['vue-tsc', '--noEmit', '--skipLibCheck'], { 
  stdio: 'inherit',
  cwd: __dirname
});

process.exit(result.status);
