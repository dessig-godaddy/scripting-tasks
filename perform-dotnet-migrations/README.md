# perform-dotnet-migrations

Actually performs migrations on all found repos from `scan-for-dotnet-jenkinsfiles`.

## Usage

Create your `.env` file with `GITHUB_TOKEN` created for scan script in this directory, then From this folder:
```bash
node index.js # will perform dry run and only log what would have changed - no branches or commits created
```

```bash
node index.js --apply # performs and applies changes to branch before pushing
```