# migrate-dotnet-workflows

CLI tool to migrate a .NET repository's workflow & related infra files from a canonical source workflow repo.

## Install (local folder)

From inside this directory:

```
npm install
```

## Global install / development link

```
npm link
# Now available globally:
migrate-dotnet-workflows --help
```

To uninstall the linked binary later:

```
npm unlink -g migrate-dotnet-workflows
```

Or install directly without linking once published to a registry:

```
npm install -g migrate-dotnet-workflows
```

## Usage

```
migrate-dotnet-workflows [options]

Options:
  -s, --source <git-url>   Source workflow repository (defaults to embedded default)
      --dry-run             Show planned actions without making changes
      --force               Skip root repo safety checks
  -h, --help                Show help
```

Check out a branch and run the command from the root of the repository you wish to migrate. You can then review and commit changes for PR manually.

## Example

```
cd /path/to/target-repo
migrate-dotnet-workflows --dry-run
migrate-dotnet-workflows
```

## What it does

1. Deletes predefined legacy workflow-related files/folders.
2. Clones the source workflow repo to a temporary directory.
3. Copies a curated list of files/folders from the source.
4. Cleans up temp directory (kept if using --dry-run).

## Safety

Performs a basic root-directory heuristic check (looks for files like README.md, package.json, .git) unless `--force` is passed.

## License

MIT
