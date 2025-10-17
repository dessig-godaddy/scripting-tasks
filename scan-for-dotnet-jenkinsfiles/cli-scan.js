const runScan = require('./index');
console.log('Starting scan for .NET repositories with Jenkinsfiles...');
runScan()
    .then((foundRepos) => {
        console.log('Found the following repositories with Jenkinsfiles:');
        foundRepos.forEach(repo => {
            console.log(`- ${repo}`);
        });
    })
    .catch(err => {
        console.error('An error occurred during scan:', err);
        process.exit(1);
    });