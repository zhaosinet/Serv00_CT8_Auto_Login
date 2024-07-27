const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let telegramConfig;

function loadTelegramConfig() {
  const telegramJson = process.env.TELEGRAM_JSON;
  if (telegramJson) {
    try {
      telegramConfig = JSON.parse(telegramJson);
    } catch (error) {
      console.error('Error parsing TELEGRAM_JSON:', error);
    }
  }
}

async function sendTelegramMessage(message) {
  if (!telegramConfig) {
    console.error('Telegram configuration not loaded');
    return;
  }

  const { telegramBotToken, telegramBotUserId } = telegramConfig;
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  try {
    await axios.post(url, {
      chat_id: telegramBotUserId,
      text: message
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function loginAccount(account, browser) {
  const { username, password, panelnum, type } = account;
  const page = await browser.newPage();

  let url = type === 'ct8' 
    ? 'https://panel.ct8.pl/login/?next=/' 
    : `https://panel${panelnum}.serv00.com/login/?next=/`;

  try {
    await page.goto(url);

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

    await page.waitForNavigation({ timeout: 30000 });

    const isLoggedIn = await page.evaluate(() => {
      const logoutButton = document.querySelector('a[href="/logout/"]');
      return logoutButton !== null;
    });

    if (isLoggedIn) {
      const nowUtc = formatToISO(new Date());
      const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
      const message = `账号 ${username} (${type}) 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`;
      console.log(message);
      await sendTelegramMessage(message);
      return true;
    } else {
      const message = `账号 ${username} (${type}) 登录失败，请检查账号和密码是否正确。`;
      console.error(message);
      await sendTelegramMessage(message);
      return false;
    }
  } catch (error) {
    const errorMessage = `账号 ${username} (${type}) 登录时出现错误: ${error}`;
    console.error(errorMessage);
    await sendTelegramMessage(errorMessage);
    return false;
  } finally {
    await page.close();
  }
}

(async () => {
  loadTelegramConfig();
  const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
  const accounts = JSON.parse(accountsJson);

  const browser = await puppeteer.launch({ headless: true });

  const results = [];
  for (const account of accounts) {
    const success = await loginAccount(account, browser);
    results.push({ account: account.username, type: account.type, success });

    const delay = Math.floor(Math.random() * 8000) + 1000;
    await delayTime(delay);
  }

  await browser.close();

  const successfulLogins = results.filter(r => r.success);
  const failedLogins = results.filter(r => !r.success);

  let summaryMessage = '登录结果汇总：\n';
  summaryMessage += `成功登录的账号：${successfulLogins.length}\n`;
  summaryMessage += `登录失败的账号：${failedLogins.length}\n\n`;

  if (failedLogins.length > 0) {
    summaryMessage += '登录失败的账号列表：\n';
    failedLogins.forEach(({ account, type }) => {
      summaryMessage += `- ${account} (${type})\n`;
    });
  }

  console.log(summaryMessage);
  await sendTelegramMessage(summaryMessage);
})();
