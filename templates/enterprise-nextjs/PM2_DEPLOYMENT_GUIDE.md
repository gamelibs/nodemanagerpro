# PM2 部署指南

## 概述

此企业级Next.js游戏网站模板完全支持PM2部署，提供开发和生产两种运行模式。

## 快速开始

### 1. 使用启动脚本（推荐）

```bash
# 开发模式启动
./start.sh dev

# 生产模式启动  
./start.sh prod

# 查看状态
./start.sh status

# 查看日志
./start.sh logs

# 停止服务
./start.sh stop
```

### 2. 使用npm脚本

```bash
# 开发模式
npm run pm2:dev

# 生产模式（会自动构建）
npm run pm2:prod

# 查看状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 停止服务
npm run pm2:stop
```

### 3. 直接使用PM2

```bash
# 开发模式
pm2 start ecosystem.config.json --only {{PROJECT_NAME}}-dev

# 生产模式（需要先构建）
npm run build
pm2 start ecosystem.config.json --only {{PROJECT_NAME}}-prod

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 配置文件

### ecosystem.config.json

PM2配置文件包含两个应用配置：

- `{{PROJECT_NAME}}-dev`: 开发模式，单实例，文件监听
- `{{PROJECT_NAME}}-prod`: 生产模式，集群模式，多实例

## 环境变量

支持通过环境变量配置：

```bash
# 端口配置
export PORT=3000

# 环境配置
export NODE_ENV=production
```

## 常见问题解决

### 1. 构建问题

如果遇到"Could not find a production build"错误：

```bash
# 确保先构建项目
npm run build

# 然后启动生产模式
npm run pm2:prod
```

### 2. 配置问题

如果遇到配置警告，检查：
- `next.config.js` 中的i18n配置
- 环境变量设置是否正确

### 3. 端口冲突

如果端口被占用：

```bash
# 停止现有服务
npm run pm2:stop

# 或者修改端口
export PORT=3001
npm run pm2:dev
```

## 日志管理

日志文件位置：
- `logs/error.log` - 错误日志
- `logs/out.log` - 输出日志
- `logs/combined.log` - 合并日志

查看实时日志：
```bash
pm2 logs
```

## 生产部署建议

1. **性能优化**
   ```bash
   # 构建优化版本
   npm run build
   
   # 使用集群模式
   npm run pm2:prod
   ```

2. **监控设置**
   ```bash
   # 安装PM2监控
   pm2 install pm2-logrotate
   
   # 设置日志轮转
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

3. **自动重启**
   ```bash
   # 保存PM2配置
   pm2 save
   
   # 开机自启
   pm2 startup
   ```

## 开发模式特性

- 热重载支持
- 开发工具集成
- 详细错误输出
- 单实例运行

## 生产模式特性

- 集群模式，充分利用CPU
- 自动故障恢复
- 内存限制保护
- 日志轮转
- 零停机重启

## 故障排除

### 内存溢出

如果遇到内存问题，调整配置：

```json
{
  "max_memory_restart": "2G"
}
```

### CPU使用率过高

检查实例数量：

```json
{
  "instances": 2  // 减少实例数
}
```

### 依赖问题

确保所有依赖已安装：

```bash
npm install
# 或
pnpm install
```

## 支持的包管理器

- npm
- pnpm（推荐）
- yarn

脚本会自动检测并使用合适的包管理器。
