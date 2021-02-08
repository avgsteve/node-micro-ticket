const fs = require('fs');
const chalk = require('chalk');
const packageJsonFile = fs.readFileSync('./package.json');
const packageName = '@ticket-microservice2021/common';
const packageVersion = JSON.parse(packageJsonFile).dependencies[packageName];
console.log(
  `\n  package name: ${chalk.yellow(packageName)}
  package version: ${chalk.yellow(packageVersion)}
  \n`
);

return;
