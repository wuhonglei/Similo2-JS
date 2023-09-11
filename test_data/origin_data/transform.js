// 将 Silimon2 原有的 name.properties 数据格式转为 json 格式

const path = require('path');
const fs = require('fs');
const { camelCase, pick, get, set } = require('lodash');

const appPath = path.join(__dirname, '../apps');
const output = path.join(__dirname, 'apps');

const nameByIndex = ['target', 'candidate'];

function parseContentToJson(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const json = {};
  lines.forEach((line) => {
    const [key, ...value] = line.split('=');
    json[camelCase(key)] = value.join('=');
  });

  const sameObject = pick(json, [
    'tag',
    'name',
    'id',
    'href',
    'alt',
    'xpath',
    'idxpath',
    'area',
    'shape',
    'widgetId',
    'visibleText',
    'neighborText',
  ]);
  const isButton = json.isButton === 'yes';
  const location = pick(json, ['x', 'y', 'width', 'height']);
  const classList = (json.class || '').split(/[\n\s]+/).filter(Boolean);
  const neighborText = (
    json.neighborText ||
    [json.neighborTextLeft, json.neighborTextAbove, json.neighborTextRight, json.neighborTextBelow].join(' ')
  )
    .split(/[\n\s]+/)
    .filter(Boolean);
  const visibleText = (json.visibleText || '').split(/[\n\s]+/).filter(Boolean);
  const res = {
    ...sameObject,
    isButton,
    location,
    classList,
    neighborText,
    visibleText,
  };
  ['area', 'shape', 'widgetId', 'location.x', 'location.y', 'location.width', 'location.height'].forEach((path) => {
    const value = get(res, path);
    set(res, path, Number(value));
  });

  return res;
}

function walk(app) {
  fs.readdirSync(app).forEach((dir) => {
    const filepath = path.join(app, dir);
    if (!fs.statSync(filepath).isDirectory()) {
      return;
    }

    const appPath = path.join(output, dir);
    if (fs.existsSync(appPath)) {
      // 删除目录
      fs.rmdirSync(appPath, { recursive: true });
    }
    const propertyPath = path.join(appPath, 'properties');
    fs.mkdirSync(propertyPath, { recursive: true });

    // 处理单个站点下 target_widgets 和 candidate_widgets
    const targetsPath = path.join(filepath, 'target_widgets');
    const candidatePath = path.join(filepath, 'candidate_widgets');
    const properties = [undefined, undefined];
    [targetsPath, candidatePath].forEach((filepath, index) => {
      if (!fs.existsSync(filepath)) {
        console.info('path not exists: ', filepath);
        return;
      }

      properties[index] = [];
      fs.readdirSync(filepath).forEach((file) => {
        const propertyPath = path.join(filepath, file);
        const content = fs.readFileSync(propertyPath, 'utf8');
        properties[index].push(parseContentToJson(content));
      });
    });
    properties.forEach((property, index) => {
      if (!property) {
        return;
      }
      const name = nameByIndex[index];
      const filepath = path.join(propertyPath, `${name}.json`);
      fs.writeFileSync(filepath, JSON.stringify(property, null, 2));
    });
  });
}

walk(appPath);
