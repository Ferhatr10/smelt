import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as os from 'os';
import * as path from 'path';

async function run(): Promise<void> {
  try {
    const sdkVersion = core.getInput('sdk-version', { required: true });

    // 1. Determine download URL based on OS
    const platform = os.platform();
    const arch = os.arch();
    let downloadUrl: string;

    if (platform === 'linux' && arch === 'x64') {
      downloadUrl = `https://github.com/digital-asset/daml/releases/download/v${sdkVersion}/daml-sdk-${sdkVersion}-linux.tar.gz`;
    } else if (platform === 'darwin' && arch === 'x64') {
      downloadUrl = `https://github.com/digital-asset/daml/releases/download/v${sdkVersion}/daml-sdk-${sdkVersion}-osx.tar.gz`;
    } else if (platform === 'win32' && arch === 'x64') {
      downloadUrl = `https://github.com/digital-asset/daml/releases/download/v${sdkVersion}/daml-sdk-${sdkVersion}-windows.zip`;
    } else {
      throw new Error(`Unsupported platform: ${platform} ${arch}`);
    }

    core.info(`Downloading Daml SDK from: ${downloadUrl}`);

    // 2. Download and extract SDK
    const tempPath = process.env['RUNNER_TEMP'] || os.homedir();
    const sdkPath = await tc.downloadTool(downloadUrl);
    let extractedPath: string;

    if (downloadUrl.endsWith('.zip')) {
      extractedPath = await tc.extractZip(sdkPath, tempPath);
    } else {
      extractedPath = await tc.extractTar(sdkPath, tempPath);
    }

    const rootDir = path.join(extractedPath, `sdk-${sdkVersion}`);
    const sdkDir = path.join(rootDir, 'daml');
    
    // 3. Add SDK to PATH
    core.info(`Adding ${sdkDir} to PATH`);
    core.addPath(sdkDir);

    // 4. Install and use the specific SDK version
    core.info(`Installing and using Daml SDK version ${sdkVersion}...`);
    await exec.exec('daml', ['install', sdkVersion]);
    await exec.exec('daml', ['use', sdkVersion]);
    
    core.info(`Daml SDK version ${sdkVersion} has been set up successfully.`);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
