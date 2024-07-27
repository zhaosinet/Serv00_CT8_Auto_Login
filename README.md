# Serv00-CT8 - 控制面板自动登录脚本
## 使用方法
### serv00格式如下

　　在 GitHub 仓库中，进入右上角`Settings`，在侧边栏找到`Secrets and variables`，点击展开选择`Actions`，点击`New repository secret`，然后创建一个名为`ACCOUNTS_JSON`的`Secret`，将 JSON 格式的账号密码字符串作为它的值，如下格式：  
```
[  
  { "username": "qinshihuang", "password": "linux.do", "panelnum": "0", "type": "serv00" },
  { "username": "zhaogao", "password": "daqinzhonggong", "panelnum": "2", "type": "serv00" },
  { "username": "heiheihei", "password": "shaibopengke", "panelnum": "3", "type": "serv00" }  
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

## 参考信息
|  名称 |来源|地址|
| :------------: | :------------: | :------------: |
|bg8ixz|Github|https://github.com/bg8ixz|
|aixiu|Github|https://github.com/aixiu|
