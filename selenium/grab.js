const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { shuffle } = require('lodash');
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cluster = require('cluster');

const website = require('../data/website.json');
const root = path.join(__dirname, '../data/apps');
const recordedPath = path.join(__dirname, '../data/recorded.txt');

function getRecorded() {
  const recordedContent = fs.readFileSync(recordedPath, 'utf8');
  return recordedContent.split('\n').filter(Boolean);
}

function writeRecorded(recorded) {
  fs.writeFileSync(recordedPath, recorded.join('\n'));
}

const javascript = (function getJavascript() {
  const filepath = path.join(__dirname, '../lib/bundle.js');
  return fs.readFileSync(filepath, 'utf8');
})();

async function getFullPageScreenshot(driver, filepath) {
  createDirectory(filepath);
  const base64 = await driver.takeScreenshot();
  const { width, height } = await driver.executeScript('return {width: window.innerWidth, height: window.innerHeight}');
  const buffer = Buffer.from(base64, 'base64');
  sharp(buffer)
    .jpeg({
      quality: 100,
      chromaSubsampling: '4:4:4',
    })
    .resize(Math.floor(width), Math.floor(height))
    .toFile(filepath);
}

async function getScreenshotOfElement(element, filepath) {
  if (!element) {
    console.warn('element is null');
    return;
  }

  createDirectory(filepath);
  const base64 = await element.takeScreenshot();
  const { width, height } = await element.getRect();
  const buffer = Buffer.from(base64, 'base64');
  sharp(buffer)
    .jpeg({
      quality: 100,
      chromaSubsampling: '4:4:4',
    })
    .resize(Math.floor(width), Math.floor(height))
    .toFile(filepath);
}

async function getScreenshotsOfOldSite(driver, site) {
  const { url, xpath } = site;
  const targetList = xpath.map((oneTarget) => driver.findElement(By.xpath(oneTarget.old)).catch(() => null));
  const targetElements = await Promise.all(targetList);
  const targetScreenshots = targetElements.map((element, index) => {
    const screenshotPath = path.join(root, site.name, `screenshot/old/target_${index}.jpeg`);
    return getScreenshotOfElement(element, screenshotPath);
  });
  const screenshotPath = path.join(root, site.name, 'screenshot/old/screen.jpeg');
  return Promise.all([...targetScreenshots, getFullPageScreenshot(driver, screenshotPath)]);
}

async function getScreenshotsOfNewSite(driver, site, targetProperties) {
  const { url, xpath } = site;
  const targetList = xpath.map((oneTarget) => driver.findElement(By.xpath(oneTarget.new)).catch(() => null));
  const targetElements = await Promise.all(targetList);
  const targetScreenshots = targetElements.map((element, index) => {
    const screenshotPath = path.join(root, site.name, `screenshot/old/target_${index}.jpeg`);
    return getScreenshotOfElement(element, screenshotPath);
  });
  const positionScreenshots = targetProperties.map(async (targetProperty, index) => {
    const { x, y, width, height } = targetProperty.location;
    const newX = Math.floor(x + width / 2);
    const newY = Math.floor(y + height / 2);
    const element = await driver.executeScript(
      function getElement(x, y) {
        return document.elementFromPoint(x, y);
      },
      newX,
      newY,
    );
    const screenshotPath = path.join(root, site.name, `screenshot/new/position_${index}.jpeg`);
    return getScreenshotOfElement(element, screenshotPath);
  });
  const screenshotPath = path.join(root, site.name, 'screenshot/new/screen.jpeg');
  return Promise.all([...targetScreenshots, ...positionScreenshots, getFullPageScreenshot(driver, screenshotPath)]);
}

function createDirectory(filepath) {
  const dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function writeJson(data, filepath) {
  // 如果文件路径不存在，则创建一个
  createDirectory(filepath);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

/**
 * 获取单个站点的配置
 */
async function getPropertyOfSite(driver, site) {
  const { url, xpath } = site;
  // 访问旧站点
  await driver.get(url.old);
  await driver.sleep(2000);
  await driver.executeScript(javascript); // 注入 selector 函数
  const promiseList = xpath.map((oneTarget) =>
    driver.executeScript(function getProperties(xpath) {
      return Silimon.getElementPropertiesByXpath(xpath);
    }, oneTarget.old),
  );
  const targetProperties = await Promise.all(promiseList);
  await writeJson(targetProperties, path.join(root, site.name, 'properties/target.json')); // 旧网站上目标元素的属性
  await getScreenshotsOfOldSite(driver, site);

  await driver.sleep(3000);
  // 访问新站点
  await driver.get(url.new);
  await driver.sleep(2000);
  await driver.executeScript(javascript); // 注入 selector 函数
  const elementsToExtract = 'input,textarea,button,select,a,h1,h2,h3,h4,h5,li,span,div,p,th,tr,td,label,svg';
  const candidateProperties = await driver.executeScript(function getProperties(selector) {
    return Silimon.getCandidateElementsPropertiesBySelector(selector);
  }, elementsToExtract);
  await writeJson(candidateProperties, path.join(root, site.name, 'properties/candidate.json')); // 旧网站上目标元素的属性
  await getScreenshotsOfNewSite(driver, site, targetProperties);
}

async function startRecord(website) {
  // 创建 ChromeOptions 对象并禁用隐身模式
  const chromeOptions = new chrome.Options();
  const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
  try {
    await driver.manage().window().maximize(); // 最大化窗口
    for (const site of website) {
      const recorded = getRecorded();
      if (!recorded.includes(site.name)) {
        await getPropertyOfSite(driver, site);
        recorded.push(site.name);
        console.info(`recorded: ${site.name}`);
        writeRecorded(recorded);
      }
    }
  } finally {
    await driver.quit();
  }
}

if (cluster.isMaster) {
  const numWorkers = 4; // 设置线程数

  // 创建多个子线程
  for (let i = 0; i < numWorkers; i++) {
    setTimeout(() => {
      cluster.fork();
    }, 5000 * i);
  }
} else {
  startRecord(shuffle(website));
}
