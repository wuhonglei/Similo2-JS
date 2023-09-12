const path = require('path');
const fs = require('fs');

const csvPath = path.join(__dirname, 'result.csv');
const resultPath = path.join(__dirname, '../../__test__/origin_result.json');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const map = {};
csvContent
  .split('\n')
  .filter(Boolean)
  .slice(1)
  .forEach((line) => {
    const [name, ...values] = line.split(',');
    map[name] = {
      locatedSuccess: Number(values[0]),
      locatedError: Number(values[2]),
    };
  });

console.info('map', map);
