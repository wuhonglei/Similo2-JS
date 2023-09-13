/**
 * 比较当前结果和原始 Silimo2 算法在成功率上的差异
 */

const fs = require('fs');
const path = require('path');
const originResult = require('./origin_result.json');
const currentResult = require('./current_result.json');

function compare() {
  const diff = {};
  Object.keys(originResult).forEach((key) => {
    if (key === 'Total') {
      return;
    }

    const origin = originResult[key];
    const current = currentResult[key];
    if (!current) {
      return;
    }

    // 屏蔽无效数据
    if (!current.locatedSuccess && !current.locatedError) {
      return;
    }

    if (current.locatedSuccess < origin.locatedSuccess) {
      diff[key] = {
        origin,
        current,
      };
    }
  });

  const filepath = path.join(__dirname, './diff.json');
  fs.writeFileSync(filepath, JSON.stringify(diff, null, 2));
}

if (require.main === module) {
  compare();
}

module.exports = compare;
