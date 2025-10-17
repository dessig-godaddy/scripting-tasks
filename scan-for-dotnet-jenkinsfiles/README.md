# scan-for-dotnet-jenkinsfiles
Scans all of gdcorp-crm org repos ending in -dotnet for `Jenkinsfile`s and lists those found.

This is intended to be used as part of the `migrate-dotnet-workflows` script.

## Usage
Must provide a `GITHUB_TOKEN`. Can create one at https://github.com/settings/tokens/new?scopes=repo and place in a `.env` file, then click the `Configure SSO` button on it and enable access to gdcorp-crm org.