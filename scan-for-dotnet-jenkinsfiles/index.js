// list all gdcorp-crm repos ending in -dotnet containing Jenkinsfiles

var { Octokit } = require('octokit');
var dotenv = require('dotenv');
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set in environment variables.');
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getDotnetRepos() {
    const repos = [];
    let page = 1;
    while (true) {
        const response = await octokit.request('GET /orgs/{org}/repos', {
            org: 'gdcorp-crm',
            type: 'all',
            per_page: 100,
            page: page,
        });
        if (response.data.length === 0) break;
        for (const repo of response.data) {
            if (repo.name.endsWith('-dotnet')) {
                repos.push(repo);
            }
        }
        page++;
    }
    return repos;
}

async function checkForJenkinsfile(repo) {
    try {
        await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'gdcorp-crm',
            repo: repo.name,
            path: 'Jenkinsfile',
        });
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = async function main() {
    const repos = await getDotnetRepos();
    const foundRepos = [];
    for (const repo of repos) {
        if (await checkForJenkinsfile(repo)) {
            foundRepos.push(repo.name);
        }
    }
    return foundRepos;
};