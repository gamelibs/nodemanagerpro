# 企业级Next.js游戏网站 - 完整部署指南

## 概述

本指南提供了企业级Next.js游戏网站的完整部署方案，支持开发、测试、生产等多种环境。

## 目录结构

```
{{PROJECT_NAME}}/
├── ecosystem.config.js      # PM2 配置文件
├── start.sh                # 启动脚本
├── fix.sh                  # 修复脚本
├── health-check.sh         # 健康检查脚本
├── PM2_DEPLOYMENT_GUIDE.md # PM2 部署详细指南
├── .env.example            # 环境变量模板
└── logs/                   # 日志目录
```

## 快速开始

### 1. 环境准备

```bash
# 检查系统要求
./health-check.sh --quick

# 如果有问题，运行修复
./fix.sh full
```

### 2. 启动项目

```bash
# 开发模式
./start.sh dev

# 生产模式
./start.sh prod

# 查看状态
./start.sh status
```

## 详细部署方案

### 开发环境部署

适用于本地开发和测试：

```bash
# 1. 克隆项目
git clone <repository-url>
cd {{PROJECT_NAME}}

# 2. 安装依赖
pnpm install  # 或 npm install

# 3. 环境配置
cp .env.example .env.local
# 编辑 .env.local 设置开发环境变量

# 4. 启动开发服务器
./start.sh dev
# 或
pnpm dev
```

访问: http://localhost:3000

### 测试环境部署

适用于集成测试和QA：

```bash
# 1. 构建项目
pnpm build

# 2. 启动测试环境
./start.sh staging
# 或
pm2 start ecosystem.config.js --only {{PROJECT_NAME}}-prod --env staging
```

### 生产环境部署

#### 方式一：使用脚本部署（推荐）

```bash
# 1. 生产环境准备
export NODE_ENV=production
export PORT=3000

# 2. 一键部署
./start.sh prod

# 3. 监控状态
pm2 monit
```

#### 方式二：手动部署

```bash
# 1. 构建项目
pnpm build

# 2. 启动生产服务器
pm2 start ecosystem.config.js --only {{PROJECT_NAME}}-prod --env production

# 3. 保存PM2配置
pm2 save

# 4. 设置开机自启
pm2 startup
```

#### 方式三：自动化部署

使用PM2的部署功能：

```bash
# 1. 配置部署服务器
# 编辑 ecosystem.config.js 中的 deploy 配置

# 2. 初始化部署
pm2 deploy ecosystem.config.js production setup

# 3. 执行部署
pm2 deploy ecosystem.config.js production
```

## Docker 部署（可选）

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 构建应用
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## 环境变量配置

### 开发环境 (.env.local)

```bash
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 生产环境

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 数据库
DATABASE_URL=mongodb://localhost:27017/gamesite

# 缓存
REDIS_URL=redis://localhost:6379

# 分析工具
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your-sentry-dsn

# API密钥
API_SECRET_KEY=your-secret-key
```

## 性能优化

### 1. 服务器配置

```bash
# 设置文件描述符限制
ulimit -n 65536

# 内存优化
export NODE_OPTIONS="--max-old-space-size=4096"

# PM2 集群模式
pm2 start ecosystem.config.js --only {{PROJECT_NAME}}-prod -i max
```

### 2. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 静态文件缓存
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # 图片缓存
    location /images/ {
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # 代理到Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 监控与日志

### 1. PM2 监控

```bash
# 实时监控
pm2 monit

# 日志查看
pm2 logs {{PROJECT_NAME}}-prod

# 性能指标
pm2 show {{PROJECT_NAME}}-prod
```

### 2. 日志管理

```bash
# 安装日志轮转
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 3. 健康检查

```bash
# 定期健康检查
./health-check.sh --full

# 设置定时任务
echo "0 */6 * * * cd /path/to/project && ./health-check.sh --quick" | crontab -
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用进程
   lsof -i :3000
   
   # 杀死进程
   kill -9 <PID>
   ```

2. **构建失败**
   ```bash
   # 清理并重新构建
   ./fix.sh clean
   ./fix.sh full
   ```

3. **内存不足**
   ```bash
   # 增加内存限制
   export NODE_OPTIONS="--max-old-space-size=8192"
   ```

4. **PM2 进程异常**
   ```bash
   # 重启所有进程
   pm2 restart all
   
   # 重置PM2
   pm2 kill
   pm2 resurrect
   ```

### 日志分析

```bash
# 查看错误日志
tail -f logs/prod-error.log

# 查看访问日志
tail -f logs/prod-out.log

# 搜索特定错误
grep "ERROR" logs/*.log
```

## 安全配置

### 1. 防火墙设置

```bash
# 只允许必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. SSL/TLS 配置

```bash
# 使用 Let's Encrypt
certbot --nginx -d your-domain.com
```

### 3. 安全头配置

在 `next.config.js` 中已配置安全头，包括：
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 备份策略

### 1. 代码备份

```bash
# Git 备份
git push origin main

# 定期创建标签
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### 2. 数据备份

```bash
# 数据库备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --out backup_$DATE
tar -czf backup_$DATE.tar.gz backup_$DATE/
```

## 自动化部署

### GitHub Actions 示例

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build
      run: pnpm build
      
    - name: Deploy
      run: |
        pm2 deploy ecosystem.config.js production
```

## 支持与维护

- 定期运行健康检查: `./health-check.sh`
- 监控系统资源使用情况
- 定期更新依赖包
- 备份重要数据
- 监控错误日志

更多详细信息请参考：
- [PM2_DEPLOYMENT_GUIDE.md](./PM2_DEPLOYMENT_GUIDE.md)
- [项目README.md](./README.md)
