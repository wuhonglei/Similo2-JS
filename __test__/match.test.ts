const fs = require('fs');
const path = require('path');

const { findSimilarProperty, findPropertyByXpath } = require('../lib/bundle');
const website = require('../test_data/origin_data/website.json');
const appPath = path.join(__dirname, '../test_data/origin_data/apps');

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

website.forEach((oneSite) => {
  const { name, xpath } = oneSite;
  xpath.forEach((oneXpath) => {
    const { old: oldPath, new: newPath } = oneXpath;
    test(`test ${name} ${oldPath} ${newPath}`, () => {
      const targetProperties = readJsonFile(path.join(appPath, name, 'properties/target.json'));
      const candidateProperties = readJsonFile(path.join(appPath, name, 'properties/candidate.json'));
      if (!targetProperties || !candidateProperties) {
        return;
      }

      const targetProperty = findPropertyByXpath(oldPath, targetProperties);
      const candidateProperty = findPropertyByXpath(newPath, candidateProperties);
      expect(targetProperty).not.toBeUndefined();
      expect(candidateProperty).not.toBeUndefined();
      const similarProperty = findSimilarProperty(targetProperty, candidateProperties);
      expect(similarProperty).not.toBeUndefined();
      expect(similarProperty).toBe(candidateProperty);
    });
  });
});
