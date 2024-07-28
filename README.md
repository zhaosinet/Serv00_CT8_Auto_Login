# Serv00-CT8 - 控制面板自动登录脚本
## 使用方法
### serv00格式如下

　　在 GitHub 仓库中，进入右上角`Settings`，在侧边栏找到`Secrets and variables`，点击展开选择`Actions`，点击`New repository secret`，然后创建一个名为`ACCOUNTS_JSON`的`Secret`，将 JSON 格式的账号密码字符串作为它的值，如下格式：  
```
[  
  { "username": "serv00user1", "password": "serv00password1", "panelnum": "0", "type": "serv00" },
  { "username": "serv00user2", "password": "serv00password2", "panelnum": "4", "type": "serv00" },
  { "username": "serv00user3", "password": "serv00password3", "panelnum": "7", "type": "serv00" }  
]
```
> 其中`panelnum`参数为面板编号，即为你所收到注册邮件的`panel*.serv00.com`中的`*`数值。

### CT8格式如下
```
[  
  { "username": "ct8user1", "password": "ct8password1", "type": "ct8" },
  { "username": "ct8user2", "password": "ct8password2", "type": "ct8" } 
]
```
## 通知方法接入
对于需要查看机器是否全部存活，设置了两种通知方法，不设置也可以正常使用保活定时任务。
### 接入telegram
创建`TELEGRAM_JSON`，方法同上,在telegram搜索`botfather`,输入`/newbot`创建一个机器人并获取`telegramBotToken`;通过`@userinfobot`输入`/start`获取`telegramBotUserId`
```
{
  "telegramBotToken": "YOUR_BOT_TOKEN",
  "telegramBotUserId": "YOUR_USER_ID"
}
```
### 接入钉钉

在自己的钉钉群聊中，进入`群设置`点击`机器人`，然后`添加机器人`，选择`自定义`，输入机器人名字，在安全设置中勾选`加签`，把加签密码复制下来，点击完成后得到的`Webhook`复制下来

创建`DINGDING_WEBHOOK_URL`和`DINGDING_SECRET`，方法同前，`DINGDING_WEBHOOK_URL`直接填入获取的`Webhook`，`DINGDING_SECRET`直接填入获取的 `加签`
`

## 参考信息
|  名称 |来源|地址|
| :------------: | :------------: | :------------: |
|bg8ixz|Github|https://github.com/bg8ixz|
|aixiu|Github|https://github.com/aixiu|
