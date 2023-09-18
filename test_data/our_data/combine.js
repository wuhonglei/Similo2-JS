/**
 * 将 aus selector, robula selector, 以及我们的 图像匹配进行 合并
 */

const { get, isBoolean } = require('lodash');
const websiteJson = require('../website.json');
let total = 0;
let ausPlusImage = 0;
let robulaPlusImage = 0;
let similoPlusImage = 0;
let similoTotal = 0;

websiteJson.forEach((oneSite) => {
  oneSite.xpath.forEach((oneXpath) => {
    const ausMatched = get(oneXpath, 'result.aus.matched');
    const robulaMatched = get(oneXpath, 'result.robula.matched');
    const imageMatched = get(oneXpath, 'result.image.matched');
    const similonMatched = get(oneXpath, 'result.similo.matched');
    if (isBoolean(similonMatched)) {
      similoTotal++;
    }

    if (similonMatched || imageMatched) {
      similoPlusImage++;
    }

    if (isBoolean(ausMatched) && isBoolean(robulaMatched)) {
      total++;
    }

    if (ausMatched || imageMatched) {
      ausPlusImage++;
    }
    if (robulaMatched || imageMatched) {
      robulaPlusImage++;
    }
  });
});

function toPercent(point) {
  const str = Number(point * 100).toFixed(2);
  return `${str}%`;
}

console.info('similoPlusImage', similoPlusImage);
console.info('similoTotal', similoTotal);

console.info(`total: ${total}`);
console.info(`ausPlusImage: ${ausPlusImage}`, `errorRata: ${toPercent(1 - ausPlusImage / total)}`);
console.info(`robulaPlusImage: ${robulaPlusImage}`, `errorRata: ${toPercent(1 - robulaPlusImage / total)}`);
console.info(`similoPlusImage: ${similoPlusImage}`, `errorRata: ${toPercent(1 - similoPlusImage / similoTotal)}`);

/**
 * total: 491
 * ausPlusImage: 351 errorRata: 28.51%
 * robulaPlusImage: 390 errorRata: 20.57%
 *
 * similoTotal: 572
 * similoPlusImage: 527 errorRata: 7.87%
 */
