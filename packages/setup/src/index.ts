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
    } else {
      throw new Error(`Unsupported platform: ${platform} ${arch}`);
    }

    core.info(`Downloading Daml SDK from: ${downloadUrl}`);

    // 2. Download and extract SDK to a temp directory
    const sdkPath = await tc.downloadTool(downloadUrl);
    const tempExtractDir = await tc.extractTar(sdkPath);

    // 3. Prepare the final destination and bin directory
    const homeDir = os.homedir();
    const damlHome = path.join(homeDir, '.daml');
    const binDir = path.join(damlHome, 'bin');
    fs.mkdirSync(binDir, { recursive: true });

    // 4. Find the real 'daml' executable in the extracted folder
    const sourceDir = path.join(tempExtractDir, `sdk-${sdkVersion}`);
    const sourceDamlExe = path.join(sourceDir, 'daml', 'daml');

    // 5. Create a symlink in the standard bin directory
    const targetDamlExe = path.join(binDir, 'daml');
    core.info(`Linking ${sourceDamlExe} to ${targetDamlExe}`);
    fs.symlinkSync(sourceDamlExe, targetDamlExe);

    // 6. Ensure the executable has the correct permissions
    core.info(`Setting executable permissions for ${targetDamlExe}`);
    fs.chmodSync(targetDamlExe, '755');
    
    // 7. Add the standard bin directory to the PATH
    core.info(`Adding ${binDir} to PATH`);
    core.addPath(binDir);
    
    // 8. Move the rest of the sdk files to their home
    core.info(`Moving SDK files to ${damlHome}`);
    fs.renameSync(sourceDir, path.join(damlHome, 'sdk'));


    // 9. Verify the installation from the PATH
    core.info('Verifying Daml installation by calling "daml version"...');
    await exec.exec('daml', ['version']);

    core.info(`Daml SDK version ${sdkVersion} has been set up successfully.`);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
