# --- 第一阶段：构建 (Builder) ---
FROM node:22-alpine AS builder

# 启用 corepack 以支持 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 先拷贝 package 配置，利用缓存层加速
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 拷贝源代码并进行构建
COPY . .
RUN pnpm run build:node

# --- 第二阶段：运行 (Runner) ---
FROM node:22-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 从构建阶段拷贝必要文件
# 1. 服务端入口文件 (server.js)
# 2. 前端静态资源 (dist 目录下的其他内容)
COPY --from=builder /app/dist/server.js ./server.js
COPY --from=builder /app/dist ./dist

# 暴露端口 (与你 src/node.ts 中设置的端口一致)
EXPOSE 3000

# 启动服务
CMD ["node", "server.js"]