const fs = require('fs');
const moment = require('moment');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync('./package.json'));

// Increment the version number
const version = packageJson.version.split('-');
version[1] = parseInt(version[1]) + 1;
packageJson.version = version.join('-');

// Add the release date
packageJson.releaseDate = moment().format('YY-MM-DD');

// Write the updated package.json file
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
