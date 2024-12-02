# 炸金花单机H5手机版
用v0.dev ai写的炸金花游戏（也要自己修改一些代码），完全单机的vue实现，没有ai玩家，全靠自己手动控制。可用于多个朋友线下一起玩，各自轮流操作即可。

## 环境要求
```shell
$ node --version
v20.15.1

$ npm --version
10.7.0
```
## 实现功能
* 发牌、看牌、比牌、下注、设置
* 各种声效和背景音乐设置
* 完全随机牌，没有任何后门
* 不需要服务器，可以部署到静态网站，或本地运行即可

## 安装运行
```
npm install
npm run dev
```

## 游戏截图
<img width="315" alt="image" src="https://github.com/user-attachments/assets/1108987e-1025-4ba9-8f98-cc660e58dc81">
<img width="316" alt="image" src="https://github.com/user-attachments/assets/e8548447-34c4-4660-a29a-c670caaf43b0">
<img width="316" alt="image" src="https://github.com/user-attachments/assets/078feace-70c6-4b03-9c66-14fe519c78a2">

## 各种ai编程体验
### v0.dev
用的最满意的。
<img width="1419" alt="image" src="https://github.com/user-attachments/assets/ee058218-fa2f-4a24-af50-11db597c9a15">
#### 优点：
* 最好的地方是可以每天重置问答次数，而且是根据问答次数来限额，不是根据token。这意味着只要需求文档足够详细，几次就可以搞定1个项目。
* 免费用户也有每天差不多10次的提问次数，这个项目就是免费的来做的，当天不够就等明天继续。
* 自己改了代码后，可以同步修改到在线代码，然后ai可以根据最新代码来继续编写，而不是直接无视自己提交的代码
#### 缺点
* 多文件时，无法在线运行。。
* 不能直接打包下载整个项目，要自己手动复制一个个文件。。
  
### bolt.new
<img width="1416" alt="image" src="https://github.com/user-attachments/assets/cb262386-d022-45a0-a73a-131f356b3e88">

#### 优点
* 比较高级，可以在线运行。
* 可以直接打包下载整个项目

#### 缺点
* 太贵。。即使开通了会员，也是只有20M token，而且是一个月20M，当天要是用完了，就等下个月吧。。20M，也只够做一个小项目了

