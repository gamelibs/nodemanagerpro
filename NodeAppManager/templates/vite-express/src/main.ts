import './style.css';

// API 基础配置
const API_BASE = '/api';

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ApiResponse<T> {
  [key: string]: T;
}

// API 请求函数
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// 获取健康状态
async function getHealthStatus() {
  try {
    const health = await fetchAPI<any>('/health');
    return health;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}

// 获取应用信息
async function getAppInfo() {
  try {
    const info = await fetchAPI<any>('/info');
    return info;
  } catch (error) {
    console.error('App info failed:', error);
    return null;
  }
}

// 获取用户列表
async function getUsers(): Promise<User[]> {
  try {
    const response = await fetchAPI<{ users: User[] }>('/users');
    return response.users;
  } catch (error) {
    console.error('Get users failed:', error);
    return [];
  }
}

// 创建用户
async function createUser(name: string, email: string): Promise<User | null> {
  try {
    const user = await fetchAPI<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    return user;
  } catch (error) {
    console.error('Create user failed:', error);
    return null;
  }
}

// 渲染状态卡片
function renderStatusCard(title: string, value: string, isHealthy = false) {
  return `
    <div class="status-card ${isHealthy ? 'healthy' : ''}">
      <h3>${title}</h3>
      <p>${value}</p>
    </div>
  `;
}

// 渲染用户项
function renderUserItem(user: User) {
  return `
    <div class="user-item">
      <div class="user-info">
        <h4>${user.name}</h4>
        <p>${user.email}</p>
      </div>
      <span class="user-role role-${user.role}">${user.role.toUpperCase()}</span>
    </div>
  `;
}

// 渲染用户列表
function renderUsers(users: User[]) {
  const usersList = document.getElementById('users-list');
  if (!usersList) return;

  if (users.length === 0) {
    usersList.innerHTML = '<div class="user-item">暂无用户</div>';
    return;
  }

  usersList.innerHTML = users.map(renderUserItem).join('');
}

// 加载和显示数据
async function loadData() {
  // 显示应用信息
  const appInfo = await getAppInfo();
  if (appInfo) {
    document.getElementById('app-title')!.textContent = appInfo.message;
    document.getElementById('app-description')!.textContent = 
      `${appInfo.frontend} + ${appInfo.backend}`;
  }

  // 显示健康状态
  const health = await getHealthStatus();
  const statusContainer = document.getElementById('status-container');
  if (health && statusContainer) {
    statusContainer.innerHTML = `
      ${renderStatusCard('状态', health.status, health.status === 'healthy')}
      ${renderStatusCard('运行时间', `${Math.floor(health.uptime)}s`)}
      ${renderStatusCard('环境', health.environment)}
      ${renderStatusCard('最后更新', new Date(health.timestamp).toLocaleTimeString())}
    `;
  }

  // 加载用户列表
  const users = await getUsers();
  renderUsers(users);
}

// 处理表单提交
function setupUserForm() {
  const form = document.getElementById('user-form') as HTMLFormElement;
  const nameInput = document.getElementById('user-name') as HTMLInputElement;
  const emailInput = document.getElementById('user-email') as HTMLInputElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!name || !email) {
      alert('请输入姓名和邮箱');
      return;
    }

    const newUser = await createUser(name, email);
    if (newUser) {
      // 重新加载用户列表
      const users = await getUsers();
      renderUsers(users);
      
      // 清空表单
      nameInput.value = '';
      emailInput.value = '';
    } else {
      alert('创建用户失败');
    }
  });
}

// 初始化应用
document.getElementById('app')!.innerHTML = `
  <div class="container">
    <header class="header">
      <h1 id="app-title">{{PROJECT_NAME}}</h1>
      <p id="app-description">前后端同构快速搭建</p>
    </header>

    <div class="status" id="status-container">
      <div class="status-card">
        <h3>加载中...</h3>
        <p>正在获取状态信息</p>
      </div>
    </div>

    <section class="users-section">
      <h2>用户管理</h2>
      
      <form id="user-form" class="user-form">
        <input 
          type="text" 
          id="user-name" 
          placeholder="用户姓名" 
          required 
        />
        <input 
          type="email" 
          id="user-email" 
          placeholder="邮箱地址" 
          required 
        />
        <button type="submit">添加用户</button>
      </form>

      <div class="users-list" id="users-list">
        <div class="user-item">加载中...</div>
      </div>
    </section>
  </div>
`;

// 启动应用
loadData();
setupUserForm();

// 每30秒刷新一次状态
setInterval(loadData, 30000);
