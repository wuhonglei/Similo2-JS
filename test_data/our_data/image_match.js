/**
 * 图像匹配
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const websiteJson = require('../website.json');

async function isImageMatch(imagePath, templatePath, isFullScreen) {
  const scriptPath = '/Users/honglei.wu/Desktop/项目源码/ads-ui-scriptless/template/utils/python/cli.py';
  const pythonPath = '/usr/bin/python3';

  const cmd = `${pythonPath} ${scriptPath} ${imagePath} ${templatePath} --full_screen=${Number(isFullScreen)}`;
  // console.info('cmd', cmd);
  const child = spawn(cmd, {
    stdio: null, // 不直接打印到 terminal
    shell: true,
  });

  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];

    // Handling the standard output of the child process
    child.stdout.on('data', (data) => {
      const str = data.toString();
      stdout.push(str);
      process.stdout.write(str);
    });
    child.stderr.on('data', (data) => {
      const str = data.toString();
      stderr.push(str);
      process.stderr.write(str);
    });

    // Handling the child process exit event
    child.on('close', (_code) => {
      const out = stdout.join('');
      const isSuccess = out.includes('success');
      if (!isSuccess) {
        return reject(stderr.join(''));
      }
      const match = out.match(/success.*?(\d+).*?(\d+).*?(\d+).*?(\d+).*?/);
      if (!match) {
        return reject(new Error('match error'));
      }

      const numList = match.map(Number);
      return resolve({
        startX: numList[1],
        startY: numList[2],
        endX: numList[3],
        endY: numList[4],
      });
    });
  });
}

function getCandidatePosition(name, xpath) {
  const filepath = path.join(__dirname, 'apps', name, 'properties/candidate.json');
  const json = require(filepath);
  const element = json.find((item) => item.xpath === xpath);
  return element?.location || {};
}

function getTargetPosition(name, xpath) {
  const filepath = path.join(__dirname, 'apps', name, 'properties/target.json');
  const json = require(filepath);
  const element = json.find((item) => item.xpath === xpath);
  return element?.location || {};
}

/**
 * 全屏匹配的元素是否正确
 */
function isGoodMatchInScreen(position, name, newXpath) {
  const { startX, startY, endX, endY } = position;
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  const rightLocation = getCandidatePosition(name, newXpath);
  const { x, y, width, height } = rightLocation;
  const distanceX = centerX - x;
  const distanceY = centerY - y;
  if (distanceX >= 0 && distanceX <= width && distanceY >= 0 && distanceY <= height) {
    return true;
  }

  return false;
}

/**
 * 指定位置的匹配是否正确
 */
function isGoodMatchInPosition(name, oldXpath, newXpath) {
  const oldPosition = getTargetPosition(name, oldXpath);
  const centerX = oldPosition.x + oldPosition.width / 2;
  const centerY = oldPosition.y + oldPosition.height / 2;

  const newPosition = getCandidatePosition(name, newXpath);
  const { x, y, width, height } = newPosition;
  const distanceX = centerX - x;
  const distanceY = centerY - y;
  if (distanceX >= 0 && distanceX <= width && distanceY >= 0 && distanceY <= height) {
    return true;
  }

  return false;
}

let count = 0;
let total = 0;

const promiseList = websiteJson.map((oneSite) => {
  const promiseList = oneSite.xpath.map(async (oneXpath, index) => {
    const targetPath = path.join(__dirname, 'apps', oneSite.name, 'screenshot/old', `target_${index}.jpeg`);
    const candidatePath = path.join(__dirname, 'apps', oneSite.name, 'screenshot/new', `target_${index}.jpeg`);
    if (!fs.existsSync(targetPath) || !fs.existsSync(candidatePath)) {
      return;
    }
    const positionPath = path.join(__dirname, 'apps', oneSite.name, 'screenshot/new', `position_${index}.jpeg`);
    const fullScreenPath = path.join(__dirname, 'apps', oneSite.name, 'screenshot/new', `screen.jpeg`);
    oneXpath.result = oneXpath.result || {};
    oneXpath.result.image = {
      old: path.basename(targetPath),
      new: path.basename(candidatePath),
      matched: false,
    };

    if (fs.existsSync(positionPath)) {
      total++;
      try {
        await isImageMatch(targetPath, positionPath, false);
        if (isGoodMatchInPosition(oneSite.name, oneXpath.old, oneXpath.new)) {
          console.info('指定位置匹配成功-js');
          count++;
          oneXpath.result.image = {
            old: path.basename(targetPath),
            new: path.basename(positionPath),
            matched: true,
          };
        }
      } catch (error) {
        if (fs.existsSync(fullScreenPath)) {
          const position = await isImageMatch(fullScreenPath, targetPath, true);
          if (isGoodMatchInScreen(position, oneSite.name, oneXpath.new)) {
            console.info('全屏匹配成功-js');
            count++;
            oneXpath.result.image = {
              old: path.basename(targetPath),
              new: path.basename(fullScreenPath),
              matched: true,
            };
          }
        }
      }
    } else {
      if (fs.existsSync(fullScreenPath)) {
        total++;
        const position = await isImageMatch(fullScreenPath, targetPath, true);
        if (isGoodMatchInScreen(position, oneSite.name, oneXpath.new)) {
          console.info('全屏匹配成功-js');
          count++;
          oneXpath.result.image = {
            old: path.basename(targetPath),
            new: path.basename(fullScreenPath),
            matched: true,
          };
        }
      }
    }
  });

  return promiseList;
});

(async function main() {
  console.info('开始匹配');
  await Promise.allSettled(promiseList.flat());
  fs.writeFileSync(path.join(__dirname, '../website.json'), JSON.stringify(websiteJson, null, 2));
  console.info('total, count', total, count); // total: 674, success count: 278, error_rate = 58.75%
  console.info('结束匹配');
})();
