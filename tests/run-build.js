import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';

// --- Environment Setup ---
const TEST_DIR = path.join(os.tmpdir(), 'smelt-test-build');
const MOCK_PROJECT_NAME = 'mock-project';
const MOCK_PROJECT_DIR = path.join(TEST_DIR, MOCK_PROJECT_NAME);

console.log('--- Setting up local mock environment for Build Action ---');
console.log(`TEST_DIR: ${TEST_DIR}`);
console.log(`MOCK_PROJECT_DIR: ${MOCK_PROJECT_DIR}`);

// 1. Create a temporary testing directory
if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEST_DIR, { recursive: true });

// 2. Create a mock Daml project
console.log('Creating mock Daml project (empty-skeleton)...');
try {
  // Relying on the previously installed ~/.daml/bin/daml
  execSync(`~/.daml/bin/daml new ${MOCK_PROJECT_NAME} empty-skeleton`, { cwd: TEST_DIR, stdio: 'inherit' });
} catch (e) {
  console.error('Failed to create mock Daml project. Make sure "daml" is installed and available.', e);
  process.exit(1);
}

// 3. Set the simulated inputs for the action
process.env['INPUT_PROJECT-DIR'] = MOCK_PROJECT_DIR;
process.env['INPUT_PROJECT_DIR'] = MOCK_PROJECT_DIR; // Sometimes mapped with underscores

// 4. Ensure DAML PATH is active for the execution context
const homeDir = os.homedir();
const damlBinPath = path.join(homeDir, '.daml', 'bin');
process.env.PATH = `${damlBinPath}:${process.env.PATH}`;

console.log('-----------------------------------------------------------\n');

// Import and run the compiled action script
console.log('Running @smelt/build action...');
// Await import allows async execution resolution
// Note: We need to wait for the actual run() function inside the script to complete
// We can use setTimeout as a dirty mock since the script doesn't export the promise.
import('../packages/build/dist/index.js');
console.log('Waiting for action to complete...');

setTimeout(() => {
  console.log('\n--- Action execution complete. Verifying output... ---');
  
  // 5. Verify the DAR file was generated (default empty-skeleton version is 0.0.1)
  const expectedDarPath = path.join(MOCK_PROJECT_DIR, '.daml', 'dist', `${MOCK_PROJECT_NAME}-0.0.1.dar`);
  
  if (fs.existsSync(expectedDarPath)) {
      console.log(`✅ Success! DAR file generated at: ${expectedDarPath}`);
  } else {
      console.error(`❌ Error: Expected DAR file NOT found at: ${expectedDarPath}`);
      // Fallback check: look for any .dar in the project dir
      if(fs.existsSync(path.join(MOCK_PROJECT_DIR, '.daml', 'dist'))) {
        const files = fs.readdirSync(path.join(MOCK_PROJECT_DIR, '.daml', 'dist')).filter(f => f.endsWith('.dar'));
        if(files.length > 0) {
          console.log(`ℹ️ Note: Found other .dar files instead: ${files.join(', ')}`);
        }
      }
      process.exit(1);
  }

  // 6. Cleanup
  console.log('Cleaning up test environment...');
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  console.log('Test completed successfully.');
}, 5000); // Wait 5 seconds for build to finish


