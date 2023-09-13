/**
 * 根据原始数据生成 website.json
 */

const path = require('path');
const fs = require('fs');

const oldSite = require('./json/old.json');
const newSite = require('./json/new.json');
const appPath = path.join(__dirname, '../apps');
const websitePath = path.join(__dirname, '../website.json');

const oldPathPattern = /(?:old_xpath=).+/;
const newPathPattern = /(?:new_xpath=).+/;

function findOldSite(name) {
  const newName = name.toLowerCase();
  return oldSite.find((url) => url.toLowerCase().includes(newName));
}

function findNewSite(name) {
  const newName = name.toLowerCase();
  return newSite.find((url) => url.toLowerCase().includes(newName));
}

function walk(app) {
  const siteList = [];
  fs.readdirSync(app).forEach((dir) => {
    const filepath = path.join(app, dir);
    if (!fs.statSync(filepath).isDirectory()) {
      return;
    }

    // 遍历单个站点多个目标元素
    const site = {
      name: dir,
      url: {
        old: findOldSite(dir),
        new: findNewSite(dir),
      },
      xpath: [],
    };
    fs.readdirSync(filepath).forEach((file) => {
      const _path = path.join(filepath, file);
      if (fs.statSync(_path).isFile()) {
        const content = fs.readFileSync(_path, 'utf8');
        const oldPathMatch = content.match(oldPathPattern);
        const newPathMatch = content.match(newPathPattern);
        const oldPath = oldPathMatch[0].replace('old_xpath=', '');
        const newPath = newPathMatch[0].replace('new_xpath=', '');
        site.xpath.push({
          old: oldPath,
          new: newPath,
        });
      }
    });
    siteList.push(site);
  });
  return siteList;
}

const content = walk(appPath);
fs.writeFileSync(websitePath, JSON.stringify(content, null, 2));
