const fs = require('fs');
const path = require('path');

const website = require('../test_data/origin_data/website.json');
const appPath: string = path.join(__dirname, '../test_data/origin_data/apps');
const compare = require('./compare.js');
const diffJson = require('./diff.json');
const diffNames = Object.keys(diffJson);

import { findSimilarProperty, findPropertyByXpath, findPropertyIndexByXpath } from '../src/similarity';

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

const map = {};
website.forEach((oneSite) => {
  const { name, xpath } = oneSite;
  // if (!diffNames.includes(name)) {
  //   return;
  // }

  map[name] = {
    locatedSuccess: 0,
    locatedError: 0,
  };

  describe(`test ${name}`, () => {
    xpath.forEach((oneXpath) => {
      const { old: oldPath, new: newPath } = oneXpath;
      test(`expect ${name} ${oldPath} ${newPath}`, () => {
        const targetProperties = readJsonFile(path.join(appPath, name, 'properties/target.json'));
        const candidateProperties = readJsonFile(path.join(appPath, name, 'properties/candidate.json'));
        if (!targetProperties || !candidateProperties) {
          return;
        }

        const targetPropertyIndex = findPropertyIndexByXpath(oldPath, targetProperties);
        const candidatePropertyIndex = findPropertyIndexByXpath(newPath, candidateProperties);
        const targetProperty = targetProperties[targetPropertyIndex];
        const candidateProperty = candidateProperties[candidatePropertyIndex];
        expect(targetProperty).not.toBeUndefined();
        expect(candidateProperty).not.toBeUndefined();

        // 获取最相似的属性
        const result = findSimilarProperty(targetProperty, candidateProperties);
        const { similarProperty, scores, maxIndex, maxScore, scoreDetails, normalizedScores } = result;
        if (maxIndex === candidatePropertyIndex) {
          map[name].locatedSuccess += 1;
        } else {
          map[name].locatedError += 1;
          // console.error('maxScore', maxScore);
          // console.error('candidate score', scores[candidatePropertyIndex]);
        }

        expect(similarProperty).not.toBeUndefined();
        expect(similarProperty).toEqual(candidateProperty);
      });
    });
  });
});

afterAll(() => {
  const filepath = path.join(__dirname, './current_result.json');
  const content = fs.readFileSync(filepath, 'utf8');
  const oldMap = content ? JSON.parse(content) : {};
  const newMap = { ...oldMap, ...map };
  delete newMap.Total;
  // @ts-ignore
  const success = Object.values(newMap).reduce((acc, cur) => acc + cur.locatedSuccess, 0);
  // @ts-ignore
  const error = Object.values(newMap).reduce((acc, cur) => acc + cur.locatedError, 0);
  newMap.Total = {
    locatedSuccess: success,
    locatedError: error,
  };

  fs.writeFileSync(filepath, JSON.stringify(newMap, null, 2));
});
