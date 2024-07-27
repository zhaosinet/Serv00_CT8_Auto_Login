const fs = require('fs');
const puppeteer = require('puppeteer');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').slice(0, -5);
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const config = {
  serv00: {
    baseUrl: 'https://panel{}.serv00.com/login/?next=/'
  },
  ct8: {
    loginUrl: 'https://panel.ct8.pl/login/?next=/'
  }
};

(async () => {
  const accountsJson = process.env.ACCOUNTS_JSON || fs.readFileSync('accounts.json', 'utf-8');
  const accounts = JSON.parse(accountsJson);

  for (const account of accounts) {
    const { username, password, panelnum } = account;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      if (panelnum) {
        // 登录 panel.serv00.com
        const serv00Url = config.serv00.baseUrl.replace('{}', panelnum);
        await loginToSite(page, serv00Url, username, password);
      }

      // 登录 panel.ct8.pl
      const ct8Url = config.ct8.loginUrl;
      await loginToSite(page, ct8Url, username, password);

    } catch (error) {
      console.error(`账号 ${username} 登录时出现错误: ${error}`);
    } finally {
      await page.close();
      await browser.close();

      const delay = Math.floor(Math.random() * 8000) + 1000;
      await delayTime(delay);
    }
  }

  console.log('所有账号登录完成！');
})();

async function loginToSite(page, url, username, password) {
  let retries = 3;
  while (retries > 0) {
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      if (url.includes('serv00.com')) {
        await loginToServ00(page, username, password);
      } else if (url.includes('ct8.pl')) {
        await loginToCt8(page, username, password);
      }

      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

      const isLoggedIn = await checkLoginStatus(page, url);

      if (isLoggedIn) {
        const nowUtc = formatToISO(new Date());
        const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
        console.log(`账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录 ${url} 成功！`);
        return;
      } else {
        console.error(`账号 ${username} 登录 ${url} 失败，正在重试...`);
      }
    } catch (error) {
      console.error(`账号 ${username} 登录 ${url} 时出现错误: ${error}`);
    }
    retries--;
    await delayTime(5000); // 等待5秒后重试
  }
  console.error(`账号 ${username} 登录 ${url} 失败，已尝试3次。`);
}

async function loginToServ00(page, username, password) {
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);

  const loginButton = await page.$('input[type="submit"]');
  if (loginButton) {
    await loginButton.click();
  } else {
    throw new Error('无法找到登录按钮');
  }
}

async function loginToCt8(page, username, password) {
  await page.type('#id_username', username);
  await page.type('#id_password', password);

  const loginButton = await page.$('input[type="submit"]');
  if (loginButton) {
    await loginButton.click();
  } else {
    throw new Error('无法找到登录按钮');
  }
}

async function checkLoginStatus(page, url) {
  if (url.includes('serv00.com')) {
    return await page.evaluate(() => {
      return document.querySelector('a[href*="logout"]') !== null || 
             document.querySelector('.user-menu') !== null;
    });
  } else if (url.includes('ct8.pl')) {
    return await page.evaluate(() => {
      return document.querySelector('.user-box-menu') !== null || 
             document.querySelector('.dashboard') !== null;
    });
  }
  return false;
}
