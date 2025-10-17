// Use scan to get list of .NET repos with Jenkinsfiles, then migrate each one using migrate-dotnet-workflows

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const getRepos = require('../scan-for-dotnet-jenkinsfiles/index.js');
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

async function main() {
    console.log(dryRun
        ? 'Dry-run mode: pass --apply to perform migrations.'
        : 'Apply mode: migrations will create branches and commits.');
    console.log('Scanning for .NET repositories with Jenkinsfiles...');
    const repos = await getRepos();
    console.log(`Found ${repos.length} repositories with Jenkinsfiles.`);
    for (const repo of repos) {
        console.log(`\nMigrating workflows for repository: ${repo}`);
        const repoUrl = `git@github.com:gdcorp-crm/${repo}`;
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-dotnet-'));
        try {
            console.log(`Cloning ${repo} into temporary directory...`);
            execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
            process.chdir(tempDir);
            if (!dryRun) execSync(`git checkout -b migrate-workflows`, { stdio: 'inherit' });
            console.log(`Running migrate-dotnet-workflows on ${repo}...`);
            execSync(`migrate-dotnet-workflows ${dryRun ? '--dry-run' : ''}`, { stdio: 'inherit' });
            if (!dryRun) {
                execSync(`git add .`, { stdio: 'inherit' });
                execSync(`git commit -m "Migrate .NET workflows to GHA"`, { stdio: 'inherit' });
                execSync(`git push --set-upstream origin migrate-workflows`, { stdio: 'inherit' });
            }
            console.log(`Migration for ${repo} completed. Please review changes and commit as needed.`);
        } catch (error) {
            console.error(`Error migrating ${repo}:`, error);
        } finally {
            process.chdir(__dirname);
            fs.removeSync(tempDir);
            console.log(`Cleaned up temporary directory for ${repo}.`);
        }
    }
    console.log('\nAll migrations complete.');
}

main().catch(err => {
    console.error('An error occurred during the migration process:', err);
    process.exit(1);
});
