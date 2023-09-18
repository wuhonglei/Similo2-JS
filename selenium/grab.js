const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { shuffle, sampleSize } = require('lodash');
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const website = require('../test_data/website.json');
const root = path.join(__dirname, '../test_data/our_data/apps');
const recordedPath = path.join(__dirname, '../test_data/our_data/recorded.txt');
const failedPath = path.join(__dirname, '../test_data/our_data/failed.txt');

function getRecorded() {
  const recordedContent = fs.readFileSync(recordedPath, 'utf8');
  return recordedContent.split('\n').filter(Boolean);
}

function getFailed() {
  const failedContent = fs.readFileSync(failedPath, 'utf8');
  return failedContent.split('\n').filter(Boolean);
}

function writeRecorded(recorded) {
  fs.writeFileSync(recordedPath, recorded.join('\n'));
}

const javascript = (function getJavascript() {
  const filepath = path.join(__dirname, '../lib/property.js');
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
  const { width, height } = await element.getRect();
  if (width === 0 || height === 0) {
    console.warn('element size is 0');
    return;
  }

  const base64 = await element.takeScreenshot().catch((err) => {
    console.info('element.takeScreenshot', err);
    return undefined;
  });
  if (!base64) {
    return;
  }

  const buffer = Buffer.from(base64, 'base64');
  sharp(buffer)
    .jpeg({
      quality: 100,
      chromaSubsampling: '4:4:4',
    })
    .resize(Math.floor(width), Math.floor(height))
    .toFile(filepath)
    .catch((err) => {
      console.info('element.takeScreenshot', err);
    });
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
    const screenshotPath = path.join(root, site.name, `screenshot/new/target_${index}.jpeg`);
    return getScreenshotOfElement(element, screenshotPath);
  });
  const positionScreenshots = targetProperties.map(async (targetProperty, index) => {
    if (!targetProperty?.location) {
      console.warn('targetProperty.location is null', targetProperty);
      return;
    }

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

function cleanDirectory(dirpath) {
  if (fs.existsSync(dirpath)) {
    fs.rmSync(dirpath, { recursive: true });
  }
}

async function writeJson(data, filepath) {
  // 如果文件路径不存在，则创建一个
  createDirectory(filepath);
  const newData = data.map(({ roluSelector, ausSelector, ...restData }) => restData);
  fs.writeFileSync(filepath, JSON.stringify(newData, null, 2));
}

/**
 * 如果 xpathList 中一半以上的元素都已经出现在页面上，则认为页面已经加载完成
 * @param {*} driver
 * @param {*} xpathList
 */
async function isDocumentReady(driver, xpathList) {
  const candidateList = sampleSize(shuffle(xpathList), Math.floor((xpathList.length + 1) / 2));
  const promiseList = candidateList.map((xpath) =>
    driver.wait(until.elementLocated(By.xpath(xpath)), 120000).catch(() => null),
  );
  return Promise.all(promiseList);
}

/**
 * 统计新网站上的元素 xpath 属性与旧网站上的元素 xpath 属性的是否一致
 * @param {*} targetProperties
 * @param {*} targetPropertiesInNewSite
 */
function compareSelector(targetProperties, targetPropertiesInNewSite, xpath) {
  xpath.forEach((oneTarget, index) => {
    oneTarget.result = oneTarget.result || {};
    oneTarget.result.aus = {
      old: targetProperties[index]?.ausSelector,
      new: targetPropertiesInNewSite[index]?.ausSelector,
      matched: targetPropertiesInNewSite[index].ausMatched,
    };
    oneTarget.result.robula = {
      old: targetProperties[index]?.roluSelector,
      new: targetPropertiesInNewSite[index]?.roluSelector,
      matched: targetPropertiesInNewSite[index].roluMatched,
    };
  });
}

function isEmptyProperties(properties) {
  return !properties || properties.length === 0 || properties.every((property) => Object.keys(property).length === 0);
}

/**
 * 获取单个站点的配置
 */
async function getPropertyOfSite(driver, site) {
  const { url, xpath } = site;

  console.time(`open old page`);

  // 访问旧站点
  driver.get(url.old);
  await isDocumentReady(
    driver,
    xpath.map((oneTarget) => oneTarget.old),
  );
  console.timeEnd(`open old page`);
  await driver.executeScript(javascript).catch(() => {}); // 注入 selector 函数
  // cleanDirectory(path.join(root, site.name)); // 清空目录

  const promiseList = xpath.map((oneTarget) =>
    driver.executeScript(function getProperties(xpath) {
      if (!window.Silimon) {
        return {};
      }

      const element = Silimon.getElementByXPath(xpath);

      return {
        // ...Silimon.getElementPropertiesByXpath(xpath),
        ausSelector: Silimon.getAusDomPath(element),
        roluSelector: Silimon.getRobustXPath(element, document),
      };
    }, oneTarget.old),
  );
  const targetProperties = await Promise.all(promiseList);
  if (isEmptyProperties(targetProperties)) {
    throw new Error('targetProperties is empty');
  }

  // await writeJson(targetProperties, path.join(root, site.name, 'properties/target.json')); // 旧网站上目标元素的属性
  // await getScreenshotsOfOldSite(driver, site);
  // 访问新站点
  console.time(`open new page`);
  driver.get(url.new);
  await isDocumentReady(
    driver,
    xpath.map((oneTarget) => oneTarget.new),
  );
  console.timeEnd(`open new page`);
  await driver.executeScript(javascript).catch(() => {}); // 注入 selector 函数

  console.info('targetProperties', targetProperties);

  const promiseList1 = xpath.map((oneTarget, index) =>
    driver.executeScript(
      function getProperties(xpath, ausSelector, roluSelector) {
        if (!window.Silimon) {
          return {};
        }

        const correctElement = Silimon.getElementByXPath(xpath);
        const ausElement = ausSelector.startsWith('//')
          ? Silimon.getElementByXPath(ausSelector)
          : document.querySelector(ausSelector);
        const roluElement = Silimon.getElementByXPath(roluSelector);

        return {
          ausSelector: Silimon.getAusDomPath(correctElement),
          roluSelector: Silimon.getRobustXPath(correctElement, document),
          ausMatched: correctElement === ausElement,
          roluMatched: correctElement === roluElement,
        };
      },
      oneTarget.new,
      targetProperties[index].ausSelector,
      targetProperties[index].roluSelector,
    ),
  );
  const targetPropertiesInNewSite = await Promise.all(promiseList1);
  compareSelector(targetProperties, targetPropertiesInNewSite, xpath);
  // const elementsToExtract = 'input,textarea,button,select,a,h1,h2,h3,h4,h5,li,span,div,p,th,tr,td,label,svg';
  // const candidateProperties = await driver.executeScript(function getProperties(selector) {
  //   if (!window.Silimon) {
  //     return [];
  //   }
  //   return Silimon.getCandidateElementsPropertiesBySelector(selector);
  // }, elementsToExtract);
  // if (isEmptyProperties(candidateProperties)) {
  // throw new Error('candidateProperties is empty');
  // }
  // await writeJson(candidateProperties, path.join(root, site.name, 'properties/candidate.json')); // 旧网站上目标元素的属性
  // await getScreenshotsOfNewSite(driver, site, targetProperties);
}

async function startRecord(website) {
  // 创建 ChromeOptions 对象并禁用隐身模式
  const headless = true;
  const chromeOptions = new chrome.Options();
  headless && chromeOptions.addArguments('--headless');
  const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
  try {
    /**
     * setRect 设置的是浏览器最外层的窗口大小
     * 有头模式, 全屏窗口(outerWidth, outerHeight) window size 1792 1095
     * 无头模式, 全屏窗口(outerWidth, outerHeight) window size 1792 965
     * 无头模式不包含域名栏和状态栏, 为了保证显示一致，所以无头时的全屏等价于有头时的 window.innerWidth, window.innerHeight
     */
    await driver
      .manage()
      .window()
      .setRect({ x: 0, y: 0, width: 1792, height: headless ? 965 : 1095 });
    for (const site of website) {
      const recorded = getRecorded();
      if (!recorded.includes(site.name) && !getFailed().includes(site.name)) {
        console.info('recording', site.name);
        try {
          await getPropertyOfSite(driver, site);
          recorded.push(site.name);
          console.info(`recorded success: ${site.name}`);
          writeRecorded(recorded);
          fs.writeFileSync(path.join(__dirname, '../test_data/website.json'), JSON.stringify(website, null, 2));
        } catch (error) {
          console.info(`recorded error: ${site.name}`, error);
          fs.appendFileSync(failedPath, `${site.name}\n`);
        }
      }
    }
  } finally {
    await driver.quit();
  }
}

startRecord(website);
