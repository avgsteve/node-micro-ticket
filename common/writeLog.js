const fs = require('fs');
const logger = fs.createWriteStream('log.txt', {
  flags: 'a', // 'a' means appending (old data will be preserved)
});

logger.write(`\nNew log: ${new Date().toUTCString()}`); // append string to your file
// logger.write('more data'); // again
// logger.write('and more'); // again

console.log(`New log input done. \n`);
const packageJSON = fs.readFileSync('./package.json');
const convertedPackageJSON = JSON.parse(packageJSON);
console.log(`Current package name:`, convertedPackageJSON.name);
console.log(`Current package name:`, convertedPackageJSON.version);
