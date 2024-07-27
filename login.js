const fs = require('fs');
const puppeteer = require('puppeteer');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
  const accounts = JSON.parse(accountsJson);

  for (const account of accounts) {
    const { username, password, panelnum } = account;

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      // 登录 panel.serv00.com
      let url = `https://panel${panelnum}.serv00.com/login/?next=/`;
      await loginToSite(page, url, username, password);

      // 登录 panel.ct8.pl
      url = 'https://panel.ct8.pl/login/?next=/';
      await loginToSite(page, url, username, password);

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
  await page.goto(url);

  // 判断登录页面的类型并执行相应的登录操作
  if (url.includes('serv00.com')) {
    await loginToServ00(page, username, password);
  } else if (url.includes('ct8.pl')) {
    await loginToCt8(page, username, password);
  }

  // 等待登录成功（如果有跳转页面的话）
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  // 判断是否登录成功
  const isLoggedIn = await checkLoginStatus(page, url);

  if (isLoggedIn) {
    const nowUtc = formatToISO(new Date());
    const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
    console.log(`账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录 ${url} 成功！`);
  } else {
    console.error(`账号 ${username} 登录 ${url} 失败，请检查账号和密码是否正确。`);
  }
}

async function loginToServ00(page, username, password) {
  const usernameInput = await page.$('#id_username');
  if (usernameInput) {
    await usernameInput.click({ clickCount: 3 });
    await usernameInput.press('Backspace');
  }

  await page.type('#id_username', username);
  await page.type('#id_password', password);

  const loginButton = await page.$('#submit');
  if (loginButton) {
    await loginButton.click();
  } else {
    throw new Error('无法找到登录按钮');
  }
}

async function loginToCt8(page, username, password) {
  await page.type('input[name="email"]', username);
  await page.type('input[name="password"]', password);

  const loginButton = await page.$('button[type="submit"]');
  if (loginButton) {
    await loginButton.click();
  } else {
    throw new Error('无法找到登录按钮');
  }
}

async function checkLoginStatus(page, url) {
  if (url.includes('serv00.com')) {
    return await page.evaluate(() => {
      const logoutButton = document.querySelector('a[href="/logout/"]');
      return logoutButton !== null;
    });
  } else if (url.includes('ct8.pl')) {
    return await page.evaluate(() => {
      const userMenu = document.querySelector('.user-box-menu');
      return userMenu !== null;
    });
  }
  return false;
}
