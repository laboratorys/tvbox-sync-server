# tvbox-sync-server

[![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://www.docker.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/github/license/laboratorys/tvbox-sync-server?color=green)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)]()

开源的 **TVBox 同步服务**，旨在解决多设备间影视观看记录、收藏夹及搜索历史无法同步的痛点。

本项目需搭配 **[影视（LAB 魔改版）](https://github.com/laboratorys/TV-Release)** 使用。

---

## 💡 特性

- **跨端同步**：无缝同步播放记录、收藏列表、搜索历史。
- **多源支持**：支持配置多个订阅源，每个源可灵活定义订阅路径。
- **多用户系统**：支持多账号管理，互不干扰。
- **源内容纯净**：不对原始接口内容做任何修改，仅进行重定向，保证原始体验。
- **灵活部署**：支持 Cloudflare Pages + D1 数据库及 Docker 环境部署。
- **安全配置**：支持 OTP 两步验证，强制环境变量校验，保障服务安全。

---

## 🚀 部署指南

### 方法一：Cloudflare Pages 部署 (推荐)

这种方式通过 Cloudflare 直接连接 GitHub，代码更新会自动触发部署。

1. **Fork 本仓库**：
   - 点击右上角的 Fork 按钮，将本仓库同步到你的 GitHub 账户下。

2. **连接 Cloudflare**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
   - 进入 **Workers & Pages** -> **创建应用程序 (Create application)** -> **Pages** -> **连接到 Git (Connect to Git)**。
   - 授权 Cloudflare 访问你的 GitHub，选择你刚才 Fork 的 `tvbox-sync-server` 仓库。

3. **配置构建设置 (Build Settings)**：
   - **构建命令 (Build command)**: `pnpm run build`
   - **构建输出目录 (Build output directory)**: `dist`
   - (如果系统提示选择框架，选择 "None")。

4. **设置环境变量**：
   - 在项目设置页面中，找到 **设置 (Settings)** -> **环境变量 (Environment variables)**。
   - 添加以下生产环境 (Production) 变量：
     | 变量名 | 说明 |
     | :--- | :--- |
     | `JWT_SECRET` | 任意自定义随机字符串 |
     | `ADMIN_USER` | 管理员用户名 |
     | `ADMIN_PASSWORD` | 管理员密码 |
     | `OTP_SECRET` | (可选) OTP 密钥，留空则关闭 OTP |

5. **绑定 D1 数据库**：
   - 进入项目设置 -> **函数 (Functions)** -> **D1 数据库绑定**。
   - 点击 **添加**，变量名填 `DB`，数据库选择你已创建的 D1 数据库。
   - 保存并重新部署 (Deploy) 你的项目。
6. **配置 GitHub Actions**
   - `CLOUDFLARE_ACCOUNT_ID` CF_ACCOUNT_ID
   - `CLOUDFLARE_API_TOKEN` API TOKEN
   - `D1_DATABASE_ID` 绑定的数据库D1 ID

---

### 方法二：Docker 部署

适合拥有 VPS 或 NAS 的用户，支持本地持久化存储。

1. **准备 `docker-compose.yml`**：

```yaml
services:
  tvbox-sync:
    image: ghcr.io/laboratorys/tvbox-sync-server:latest
    container_name: tvbox-sync
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - JWT_SECRET=your_jwt_secret_here # 必填
      - ADMIN_USER=admin # 必填
      - ADMIN_PASSWORD=your_password_here # 必填
      - OTP_SECRET= # 可选
      - DATABASE_PATH=/app/data/database.db # 固定映射路径
    restart: always
```
