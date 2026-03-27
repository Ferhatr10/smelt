import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// Recursive function to find a file in a directory
function findFile(startPath: string, filter: string): string | null {
    const files = fs.readdirSync(startPath);
    for (const file of files) {
        const filename = path.join(startPath, file);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            const result = findFile(filename, filter);
            if (result) {
                return result;
            }
        } else if (path.basename(filename) === filter) {
            return filename;
        }
    }
    return null;
}

async function run(): Promise<void> {
  try {
    const sdkVersion = core.getInput('sdk-version', { required: true });

    // 1. Determine download URL
    const platform = os.platform();
    if (platform !== 'linux') {
      throw new Error('This action currently only supports Linux runners.');
    }
    const downloadUrl = `https://github.com/digital-asset/daml/releases/download/v${sdkVersion}/daml-sdk-${sdkVersion}-linux.tar.gz`;
    
    core.info(`Downloading Daml SDK from: ${downloadUrl}`);

    // 2. Download and extract to a temp directory
    const sdkArchive = await tc.downloadTool(downloadUrl);
    const tempExtractDir = await tc.extractTar(sdkArchive);

    // 3. Guaranteed Search: Find the 'daml' executable within the extracted files
    core.info(`Searching for 'daml' executable in ${tempExtractDir}...`);
    const damlExeSourcePath = findFile(tempExtractDir, 'daml');

    if (!damlExeSourcePath || !fs.existsSync(damlExeSourcePath)) {
        core.error(`Failed to find 'daml' executable. Listing extracted files:`);
        await exec.exec('ls', ['-R', tempExtractDir]);
        throw new Error("Could not find the 'daml' executable in the extracted SDK.");
    }
    core.info(`Found daml executable at: ${damlExeSourcePath}`);
    
    // 4. Prepare the final destination
    const homeDir = os.homedir();
    const binDir = path.join(homeDir, '.daml', 'bin');
    fs.mkdirSync(binDir, { recursive: true });
    const targetDamlExe = path.join(binDir, 'daml');

    // 5. Forcefully Move and Set Permissions
    core.info(`Moving ${damlExeSourcePath} to ${targetDamlExe}`);
    fs.renameSync(damlExeSourcePath, targetDamlExe);
    core.info(`Setting executable permissions for ${targetDamlExe}`);
    fs.chmodSync(targetDamlExe, '755');

    // 6. Add the standard bin directory to the PATH
    core.info(`Adding ${binDir} to PATH`);
    core.addPath(binDir);
    
    // 7. In-Action Verification
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
