/**
 * 统计站点、目标元素的数量
 */

const path = require('path');
const fs = require('fs');

const oldPathPattern = /(?:old_xpath=).+/;
const newPathPattern = /(?:new_xpath=).+/;

function walk(app, callback) {
  const map = {};
  let same = 0;
  fs.readdirSync(app).forEach((dir) => {
    const filepath = path.join(app, dir);
    if (!fs.statSync(filepath).isDirectory()) {
      return;
    }

    // 遍历单个站点
    map[dir] = 0;
    fs.readdirSync(filepath).forEach((file) => {
      const _path = path.join(filepath, file);
      if (fs.statSync(_path).isFile()) {
        map[dir]++;
        const content = fs.readFileSync(_path, 'utf8');
        const oldPathMatch = content.match(oldPathPattern);
        const newPathMatch = content.match(newPathPattern);
        if (oldPathMatch && newPathMatch) {
          const oldPath = oldPathMatch[0].replace('old_xpath=', '');
          const newPath = newPathMatch[0].replace('new_xpath=', '');
          if (oldPath === newPath) {
            same++;
          }
        }
      }
    });
  });
  return [map, same];
}

const root = path.join(__dirname, 'apps');
const [map, same] = walk(root);
console.info('map', map);
console.info('same', same);
console.info(Object.values(map).reduce((a, b) => a + b, 0));
