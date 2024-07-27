const fs = require('fs');
const puppeteer = require('puppeteer');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginAccount(account, browser) {
  const { username, password, panelnum, type } = account;
  const page = await browser.newPage();

  let url = type === 'ct8' 
    ? 'https://panel.ct8.pl/login/?next=/' 
    : `https://panel${panelnum}.serv00.com/login/?next=/`;

  try {
    await page.goto(url);

    // 清空用户名输入框的原有值
    const usernameInput = await page.$('#id_username');
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.press('Backspace');
    }

    // 输入实际的账号和密码
    await page.type('#id_username', username);
    await page.type('#id_password', password);

    // 提交登录表单
    const loginButton = await page.$('#submit');
    if (loginButton) {
      await loginButton.click();
    } else {
      throw new Error('无法找到登录按钮');
    }

    // 等待登录成功（如果有跳转页面的话）
    await page.waitForNavigation();

    // 判断是否登录成功
    const isLoggedIn = await page.evaluate(() => {
      const logoutButton = document.querySelector('a[href="/logout/"]');
      return logoutButton !== null;
    });

    if (isLoggedIn) {
      const nowUtc = formatToISO(new Date());
      const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
      console.log(`账号 ${username} (${type}) 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`);
    } else {
      console.error(`账号 ${username} (${type}) 登录失败，请检查账号和密码是否正确。`);
    }
  } catch (error) {
    console.error(`账号 ${username} (${type}) 登录时出现错误: ${error}`);
  } finally {
    await page.close();
  }
}

(async () => {
  const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
  const accounts = JSON.parse(accountsJson);

  const browser = await puppeteer.launch({ headless: false });

  for (const account of accounts) {
    await loginAccount(account, browser);

    // 用户之间添加随机延时
    const delay = Math.floor(Math.random() * 8000) + 1000;
    await delayTime(delay);
  }

  await browser.close();
  console.log('所有账号登录完成！');
})();
