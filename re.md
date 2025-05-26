### 使用方法

### 编译主进程 TypeScript 文件
npx tsc -p tsconfig.electron.json
#### 开发模式（支持热更新和即时预览）
```bash
# 请在 NodeAppManager/NodeAppManager 目录下运行
npm run electron:dev
```
- 会自动启动 Vite 前端服务和 Electron，支持前端代码热更新，桌面应用自动刷新。

#### 生产模式（打包后本地预览）
```bash
npm run electron:build
```
- 会先打包前端，再用 Electron 加载打包后的页面。

如需进一步打包为安装包（dmg/exe），可随时告知！现在你可以直接体验桌面开发预览了。