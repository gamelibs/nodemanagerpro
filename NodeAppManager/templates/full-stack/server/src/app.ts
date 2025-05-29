import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || {{PORT}};
const isDev = process.env.NODE_ENV === 'development';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/info', (req: Request, res: Response) => {
  res.json({
    message: '🚀 {{PROJECT_NAME}} 全栈应用启动成功!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    frontend: 'Vite + TypeScript',
    backend: 'Express + TypeScript'
  });
});

// 示例API路由
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
    ]
  });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    role: 'user'
  };
  
  res.status(201).json(newUser);
});

// 在生产环境中提供静态文件
if (!isDev) {
  const clientPath = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientPath));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 处理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (isDev) {
    console.log(`📱 Frontend dev server: http://localhost:5173`);
  }
});

export default app;
