import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as path from 'path';

async function run(): Promise<void> {
  try {
    const projectDirInput = core.getInput('project-dir') || '.';
    const projectDir = path.resolve(process.cwd(), projectDirInput);

    core.info(`Project directory resolved to: ${projectDir}`);

    // Check if directory exists
    if (!fs.existsSync(projectDir)) {
      throw new Error(`Project directory does not exist: ${projectDir}`);
    }

    // Check if daml.yaml exists
    const damlYamlPath = path.join(projectDir, 'daml.yaml');
    if (!fs.existsSync(damlYamlPath)) {
      throw new Error(`daml.yaml not found in directory: ${projectDir}`);
    }

    core.info(`Found daml.yaml at ${damlYamlPath}`);
    core.info('Running daml build...');

    // Execute daml build
    const exitCode = await exec.exec('daml', ['build'], { cwd: projectDir });

    if (exitCode !== 0) {
      throw new Error(`daml build failed with exit code ${exitCode}`);
    }

    core.info('Daml project built successfully.');

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred during the build process.');
    }
  }
}

run();
