# scripting-tasks

Various scripts that were useful for something, even if one offs.



## migrate-dotnet-workflows
A Node CLI script meant to be run from the root of a dotnet component library repo that will perform the workflow migration steps outlined [here](https://godaddy-corp.atlassian.net/wiki/spaces/CRM/pages/3468248973/Steps+for+upgrading+dotnet+libraries+to+8.0).

## scan-for-dotnet-jenkinsfiles
Scans all of gdcorp-crm org -dotnet repos for the presence of a `Jenkinsfile`. Intended to be used with `migrate-dotnet-workflows`

## perform-dotnet-migrations
Uses `scan-for-dotnet-jenkinsfiles` to find remaining dotnet repos still using jenkins, and runs `migrate-dotnet-worfklows` on them. Will make branch and commits if passed `--apply`.