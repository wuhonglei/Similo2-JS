/**
 * 统计当前相似度比较的成功率(基于 current_result.json 结果)
 */

const fs = require('fs');
const path = require('path');
const originResult = require('./origin_result.json');
const currentResult = require('./current_result.json');
const historyCsvPath = path.resolve(__dirname, './history.csv');

function sum(dataList, name) {
  return dataList.reduce((sum, data) => {
    return sum + data[name];
  }, 0);
}

function display(json) {
  delete json.Total;
  const locatedSuccess = sum(Object.values(json), 'locatedSuccess');
  const locatedError = sum(Object.values(json), 'locatedError');
  const ratio = Math.floor((locatedError * 100) / (locatedSuccess + locatedError));

  return {
    locatedSuccess,
    locatedError,
    ratio,
  };
}

function count() {
  console.info('当前数据');
  const { locatedSuccess, locatedError, ratio } = display(currentResult);

  console.info('locatedSuccess', locatedSuccess);
  console.info('locatedError', locatedError);
  console.info('失败率', ratio);

  const content = `${Math.floor(Date.now() / 1000)},${locatedSuccess},${locatedError},${ratio}\n`;
  fs.writeFileSync(historyCsvPath, content, { flag: 'a' });
}

// 直接由外部脚本调用
if (require.main === module) {
  count();
}

module.exports = count;
