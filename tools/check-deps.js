const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Dependency Checker');
console.log('====================');

// Check if package.json exists
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('✓ package.json found');
  
  const bcryptVersion = packageJson.dependencies?.bcryptjs;
  if (bcryptVersion) {
    console.log(`✓ bcryptjs is listed in dependencies: ${bcryptVersion}`);
  } else {
    console.log('✗ bcryptjs is not listed in package.json dependencies');
  }
  
  // Check node_modules
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✓ node_modules directory exists');
    
    const bcryptPath = path.join(nodeModulesPath, 'bcryptjs');
    if (fs.existsSync(bcryptPath)) {
      console.log('✓ bcryptjs module is installed');
      try {
        const bcryptPackageJson = JSON.parse(fs.readFileSync(path.join(bcryptPath, 'package.json'), 'utf8'));
        console.log(`  Version: ${bcryptPackageJson.version}`);
      } catch (e) {
        console.log('  Could not read bcryptjs package.json');
      }
    } else {
      console.log('✗ bcryptjs module is not installed');
    }
  } else {
    console.log('✗ node_modules directory does not exist');
  }
  
  // Try to require the module
  try {
    require('bcryptjs');
    console.log('✓ bcryptjs can be required successfully');
  } catch (e) {
    console.log('✗ bcryptjs cannot be required:', e.message);
  }
  
  // Check package manager
  if (fs.existsSync(path.join(__dirname, '..', 'pnpm-lock.yaml'))) {
    console.log('ℹ Package manager: pnpm detected');
    console.log('\nTry running: pnpm install bcryptjs');
  } else if (fs.existsSync(path.join(__dirname, '..', 'package-lock.json'))) {
    console.log('ℹ Package manager: npm detected');
    console.log('\nTry running: npm install bcryptjs');
  } else if (fs.existsSync(path.join(__dirname, '..', 'yarn.lock'))) {
    console.log('ℹ Package manager: yarn detected');
    console.log('\nTry running: yarn add bcryptjs');
  }

} catch (err) {
  console.error('Error reading package.json:', err);
}
