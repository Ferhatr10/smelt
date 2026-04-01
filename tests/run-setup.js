import path from 'path';
import os from 'os';

// Set up environment variables that GitHub Actions would normally provide
// core.getInput converts 'sdk-version' to 'INPUT_SDK_VERSION' implicitly in GitHub Actions,
// but expects the exact env var format:
process.env['INPUT_SDK-VERSION'] = '2.7.0';
process.env['INPUT_SDK_VERSION'] = '2.7.0';

// Mock runner temp and tool cache directories for @actions/tool-cache
process.env.RUNNER_TEMP = path.join(os.tmpdir(), 'runner-temp');
process.env.RUNNER_TOOL_CACHE = path.join(os.tmpdir(), 'runner-tool-cache');

console.log('--- Setting up local mock environment for GitHub Action ---');
console.log(`INPUT_SDK_VERSION: ${process.env['INPUT_SDK_VERSION']}`);
console.log(`RUNNER_TEMP: ${process.env.RUNNER_TEMP}`);
console.log(`RUNNER_TOOL_CACHE: ${process.env.RUNNER_TOOL_CACHE}`);
console.log('-----------------------------------------------------------\n');

// Import the action code after setting env vars
await import('../packages/setup/dist/index.js');
