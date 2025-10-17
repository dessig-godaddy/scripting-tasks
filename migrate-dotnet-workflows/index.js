#!/usr/bin/env node
/*
    CLI: migrate-dotnet-workflows
    Description: Migrates a .NET repo's workflows & related files from a source workflow repo.

    Steps:
        1. Delete FILES_FOLDERS_TO_REMOVE in current working directory
        2. Clone SOURCE_WORKFLOW_REPO temporarily to temp folder
        3. Copy FILES_FOLDERS_TO_COPY from SOURCE_WORKFLOW_REPO into current working directory
        4. Delete temp folder

    Usage:
        migrate-dotnet-workflows                 # run with defaults
        migrate-dotnet-workflows --source <git-url>
        migrate-dotnet-workflows --dry-run       # show what would change
        migrate-dotnet-workflows --force         # skip safety checks
        migrate-dotnet-workflows --help

    To install globally (from this folder):
        npm install -g .   OR   npm link

    Notes:
        - Assumes you have ssh access to the source repo if using an SSH URL.
        - Run from the root of the target repository (will refuse otherwise unless --force).
*/
const DEFAULT_SOURCE_WORKFLOW_REPO = 'git@github.com:gdcorp-crm/crm-jwt-client-dotnet.git';
const FILES_FOLDERS_TO_REMOVE = [
    '.github/',
    'docker/',
    'scripts/',
    '.gitignore',
    'Dockerfile',
    'Jenkinsfile',
    'nuget.config',
];
const FILES_FOLDERS_TO_COPY = [
    '.github/',
    '.dockerignore',
    '.gitignore',
    '.runsettings',
];

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function parseArgs(argv) {
    const args = { source: DEFAULT_SOURCE_WORKFLOW_REPO, dryRun: false, force: false, help: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '--source':
            case '-s':
                args.source = argv[++i];
                break;
            case '--dry-run':
                args.dryRun = true;
                break;
            case '--force':
                args.force = true;
                break;
            case '--help':
            case '-h':
                args.help = true;
                break;
            default:
                console.warn(`Unknown argument: ${a}`);
        }
    }
    return args;
}

function printHelp() {
    console.log(`migrate-dotnet-workflows\n\n` +
`Migrates workflow & related files from a source workflow repository.\n\n` +
`Options:\n` +
`  -s, --source <git-url>   Source workflow repository (default: ${DEFAULT_SOURCE_WORKFLOW_REPO})\n` +
`      --dry-run             Show planned actions without making changes\n` +
`      --force               Skip root repo safety checks\n` +
`  -h, --help                Show this help\n`);
}

function assertSafety(force) {
    if (force) return;
    const cwd = process.cwd();
    const indicators = ['package.json', 'global.json', 'README.md', '.git'];
    const found = indicators.filter(f => fs.existsSync(path.join(cwd, f)));
    if (!found.length) {
        console.error('Safety check failed: run this from the root of the target repository or pass --force.');
        process.exit(2);
    }
}

async function migrateWorkflows(opts) {
    assertSafety(opts.force);
    const SOURCE_WORKFLOW_REPO = opts.source;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-migration-'));
    console.log(`Cloning source workflow repo to temporary directory: ${tempDir}`);
    if (!opts.dryRun) {
        execSync(`git clone ${SOURCE_WORKFLOW_REPO} ${tempDir}`, { stdio: 'inherit' });
    } else {
        console.log(`[dry-run] git clone ${SOURCE_WORKFLOW_REPO} ${tempDir}`);
    }

    console.log('Removing old workflow files and folders...');
    for (const item of FILES_FOLDERS_TO_REMOVE) {
        const targetPath = path.join(process.cwd(), item);
        if (fs.existsSync(targetPath)) {
            if (!opts.dryRun) {
                fs.removeSync(targetPath);
            }
            console.log(`${opts.dryRun ? '[dry-run] Would remove' : 'Removed'}: ${item}`);
        }
    }

    console.log('Copying new workflow files and folders...');
    for (const item of FILES_FOLDERS_TO_COPY) {
        const sourcePath = path.join(tempDir, item);
        const destPath = path.join(process.cwd(), item);
        if (opts.dryRun) {
            console.log(`[dry-run] Would copy: ${item}`);
            continue;
        }
        if (fs.existsSync(sourcePath)) {
            fs.copySync(sourcePath, destPath, { overwrite: true });
            console.log(`Copied: ${item}`);
        }
    }

    if (opts.dryRun) {
        console.log('[dry-run] Skipping cleanup (temp dir retained for inspection).');
    } else {
        console.log('Cleaning up temporary directory...');
        fs.removeSync(tempDir);
    }
    console.log(opts.dryRun ? 'Dry run completed.' : 'Migration completed successfully.');
}

if (require.main === module) {
    const opts = parseArgs(process.argv);
    if (opts.help) {
        printHelp();
        process.exit(0);
    }
    migrateWorkflows(opts).catch(err => {
        console.error('An error occurred during migration:', err);
        process.exit(1);
    });
}

module.exports = { migrateWorkflows, DEFAULT_SOURCE_WORKFLOW_REPO };