// https://netbasal.com/strategies-for-cache-busting-translation-files-in-angular-86143ee14c3c

const crypto = require('crypto');
const fs = require('fs');
const glob = require('glob');

function generateChecksum(str) {
  return crypto
    .createHash('md5')
    .update(str, 'utf8')
    .digest('hex');
}

let result = {}

// hash i18n json files
// TODO now we hash all the language files together. better to hash each language alone and set the language version when we load individual translation files.
let i18nContent = ''
glob.sync('src/assets/i18n/**/*.json').forEach(path => {
  const [_, lang] = path.split('src/assets/i18n/');
  i18nContent += fs.readFileSync(path, { encoding: 'utf-8' });
});
result['i18n'] = generateChecksum(i18nContent)


// hash world.json
let worldContent = fs.readFileSync('src/assets/world.json', { encoding: 'utf-8' });
result['world'] = generateChecksum(worldContent)

fs.writeFileSync('./assets-cache-busting.json', JSON.stringify(result));
