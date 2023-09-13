const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const websiteJson = require('./website.json');

function getDate(str) {
  const pattern = /\d{8}/;
  const match = str.match(pattern);
  return dayjs(match[0], 'YYYYMMDD');
}

let total = 0;
let websiteCount = 0;
websiteJson.forEach((item) => {
  websiteCount++;
  const { url } = item;
  const { new: newUrl, old: oldUrl } = url;
  const oldData = getDate(oldUrl);
  const newData = getDate(newUrl);
  const distanceMonth = newData.diff(oldData, 'month');
  item.diffMonth = distanceMonth;
  total += distanceMonth;
});

const average = total / websiteCount;
console.log('average', average); // average 32.645833333333336 个月
fs.writeFileSync(path.resolve(__dirname, './website.json'), JSON.stringify(websiteJson, null, 2));
