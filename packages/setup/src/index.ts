import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

async function run(): Promise<void> {
  try {
    const sdkVersion = core.getInput('sdk-version', { required: true });

    // 1. Determine download URL
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

    // 2. Download and extract to a temporary directory
    const sdkPath = await tc.downloadTool(downloadUrl);
    const tempExtractDir = await tc.extractTar(sdkPath); // Extracts to a unique temp dir

    // 3. Move to the final destination: $HOME/.daml
    const damlHome = path.join(os.homedir(), '.daml');
    const sourceDir = path.join(tempExtractDir, `sdk-${sdkVersion}`);
    
    core.info(`Moving SDK from ${sourceDir} to ${damlHome}`);
    if (!fs.existsSync(damlHome)) {
        fs.mkdirSync(damlHome, { recursive: true });
    }
    // We need to move the contents of sourceDir into .daml
    for (const file of fs.readdirSync(sourceDir)) {
      fs.renameSync(path.join(sourceDir, file), path.join(damlHome, file));
    }
    fs.rmdirSync(sourceDir);
    fs.rmdirSync(tempExtractDir);

    // 4. Add the binary to the PATH
    const binPath = path.join(damlHome, 'bin');
    core.info(`Adding ${binPath} to PATH`);
    core.addPath(binPath);

    // 5. Verify the installation
    core.info('Verifying Daml installation...');
    await exec.exec('daml', ['version']);

    core.info(`Daml SDK version ${sdkVersion} has been set up successfully.`);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
