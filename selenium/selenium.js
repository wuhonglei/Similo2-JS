const { Builder, Browser, By, Key, until } = require('selenium-webdriver');

(async function example() {
  console.info('开始1');
  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    console.info('开始');
    await driver.get('https://www.google.com/ncr');
    const element = await driver.wait(until.elementLocated(By.name('q')), 10000);
    console.info(await driver.executeScript('return document.querySelector("textarea")'));
    console.info('element', element);
  } finally {
    await driver.quit();
  }
})();
