# tvbox-sync-server

[![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://www.docker.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/github/license/laboratorys/tvbox-sync-server?color=green)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)]()

一套开源的 **TVBox 同步服务**，旨在解决多设备间影视观看记录、收藏夹及搜索历史无法同步的痛点。

本项目需搭配 **影视（LAB 魔改版）** 使用。

---

## 💡 特性

- **跨端同步**：无缝同步播放记录、收藏列表、搜索历史。
- **多源支持**：支持配置多个订阅源，每个源可灵活定义订阅路径。
- **多用户系统**：支持多账号管理，互不干扰。
- **源内容纯净**：不对原始接口内容做任何修改，仅进行重定向与解析，保证原始体验。
- **灵活部署**：支持 Cloudflare Workers + D1 数据库及 Docker 环境部署。
- **安全配置**：支持 OTP 两步验证，强制环境变量校验，保障服务安全。

---

## 🚀 部署指南

### Docker 部署

准备 `docker-compose.yml` 文件：

```yaml
version: "3"
services:
  tvbox-sync:
    image: your-image-name:latest
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your_jwt_secret_here # 必填
      - ADMIN_USER=admin # 必填
      - ADMIN_PASSWORD=your_password_here # 必填
      - OTP_SECRET= # 可选，留空关闭OTP
    restart: always
```
