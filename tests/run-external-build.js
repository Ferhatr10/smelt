import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';

// --- Environment Setup ---
// Testi daha gerçekçi bir senaryo ile (/tmp/smelt-test-external altında) yapıyoruz.
const TEST_DIR = path.join(os.tmpdir(), 'smelt-test-external');
const MOCK_PROJECT_NAME = 'external-project';
const MOCK_PROJECT_DIR = path.join(TEST_DIR, MOCK_PROJECT_NAME);

console.log('--- Setting up local mock environment for EXTERNAL Build Action ---');
console.log(`TEST_DIR: ${TEST_DIR}`);
console.log(`MOCK_PROJECT_DIR: ${MOCK_PROJECT_DIR}`);

// 1. Create a temporary testing directory (Clean state)
if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEST_DIR, { recursive: true });

// 2. Create a realistic Daml project (create-daml-app template)
console.log('Creating realistic Daml project (create-daml-app)...');
try {
  // empty-skeleton yerine UI ve dependencies iceren daha karmasik bir sablon seciyoruz.
  execSync(`~/.daml/bin/daml new ${MOCK_PROJECT_NAME} --template create-daml-app`, { cwd: TEST_DIR, stdio: 'inherit' });
} catch (e) {
  console.error('Failed to create realistic mock Daml project. Make sure "daml" is installed.', e);
  process.exit(1);
}

// 3. Set the simulated inputs for the action
process.env['INPUT_PROJECT-DIR'] = MOCK_PROJECT_DIR;
process.env['INPUT_PROJECT_DIR'] = MOCK_PROJECT_DIR; 

// 4. Ensure DAML PATH is active for the execution context
const homeDir = os.homedir();
const damlBinPath = path.join(homeDir, '.daml', 'bin');
process.env.PATH = `${damlBinPath}:${process.env.PATH}`;

console.log('-----------------------------------------------------------\n');

// Import and run the compiled action script
console.log('Running @smelt/build action on the realistic project...');

// Use dynamic import to run the action
import('../packages/build/dist/index.js');
console.log('Waiting for action to complete its build process...');

// create-daml-app daha büyük bir proje olduğu için build süresi biraz daha uzun sürebilir.
setTimeout(() => {
  console.log('\n--- Action execution complete. Verifying output... ---');
  
  // 5. Verify the DAR file was generated 
  // create-daml-app şablonu varsayılan olarak version: 0.1.0 kullanır.
  const expectedDarPath = path.join(MOCK_PROJECT_DIR, '.daml', 'dist', `${MOCK_PROJECT_NAME}-0.1.0.dar`);
  
  if (fs.existsSync(expectedDarPath)) {
      console.log(`✅ Success! Realistic DAR file generated at: ${expectedDarPath}`);
  } else {
      console.error(`❌ Error: Expected DAR file NOT found at: ${expectedDarPath}`);
      // Fallback check
      if(fs.existsSync(path.join(MOCK_PROJECT_DIR, '.daml', 'dist'))) {
        const files = fs.readdirSync(path.join(MOCK_PROJECT_DIR, '.daml', 'dist')).filter(f => f.endsWith('.dar'));
        if(files.length > 0) {
          console.log(`ℹ️ Note: Found other .dar files instead: ${files.join(', ')}`);
        }
      }
      process.exit(1);
  }

  // 6. Cleanup
  console.log('Cleaning up external test environment...');
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  console.log('External test completed successfully.');
}, 10000); // 10 saniye bekleme süresi veriyoruz çünkü bu proje daha büyük.
