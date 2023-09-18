/**
 * 分析 aus 方案和 robula 方案的匹配情况
 */

const { get, isBoolean } = require('lodash');
const websiteJson = require('../website.json');
let total = 0;
let ausSuccess = 0;
let robulaSuccess = 0;

websiteJson.forEach((oneSite) => {
  oneSite.xpath.forEach((oneXpath) => {
    const ausMatched = get(oneXpath, 'result.aus.matched');
    const robulaMatched = get(oneXpath, 'result.robula.matched');
    if (isBoolean(ausMatched) && isBoolean(robulaMatched)) {
      total++;
      if (ausMatched) ausSuccess++;
      if (robulaMatched) robulaSuccess++;
    }
  });
});

function toPercent(point) {
  const str = Number(point * 100).toFixed(2);
  return `${str}%`;
}

console.info(`total: ${total}`);
console.info(`ausSuccess: ${ausSuccess}`, `errorRata: ${toPercent(1 - ausSuccess / total)}`);
console.info(`robulaSuccess: ${robulaSuccess}`, `errorRata: ${toPercent(1 - robulaSuccess / total)}`);

/**
 * total: 491
 * ausSuccess: 243 errorRata: 50.51%
 * robulaSuccess: 319 errorRata: 35.03%
 */
