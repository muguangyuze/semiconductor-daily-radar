# 免费部署到 Render

这个项目可以部署到 Render Free Web Service，手机可通过公网 URL 访问。

## 1. 上传到 GitHub

在 GitHub 新建一个仓库，然后把当前项目推上去。

## 2. Render 创建服务

1. 打开 https://render.com
2. 注册/登录
3. 点击 New，选择 Web Service
4. 连接 GitHub 仓库
5. Render 会自动读取 `render.yaml`
6. 点击 Deploy

部署完成后，Render 会给一个类似这样的地址：

```text
https://semiconductor-daily-radar.onrender.com
```

手机浏览器打开这个地址即可。

## 可选：接入 X

如果要让 X 舆情信号真实接入，在 Render 的 Environment 里添加：

```text
X_BEARER_TOKEN=你的 X API Bearer Token
```

不配置也能使用网站，只是 X 来源会显示需要配置。

## 注意

Render 免费服务长时间无人访问会休眠，第一次打开可能需要几十秒唤醒。唤醒后页面会正常刷新实时行情、新闻和财务数据。
