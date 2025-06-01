import { useApp } from '../store/AppContext';
import type { Project } from '../types';

export function useTestData() {
  const { dispatch } = useApp();

  const initializeTestData = () => {
    const testProjects: Project[] = [
      {
        id: 'test-express-1',
        name: 'Express API Server',
        path: '/Users/vidar/works/test-express',
        type: 'express',
        status: 'stopped',
        port: 8000,
        lastOpened: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
        packageManager: 'npm',
        scripts: [
          { name: 'start', command: 'npm start', description: '启动生产服务器' },
          { name: 'dev', command: 'npm run dev', description: '启动开发服务器' }
        ],
        description: '基于Express的API服务器',
        version: '1.0.0',
        template: 'express'
      },
      {
        id: 'test-vite-express-1',
        name: 'Full-Stack React App',
        path: '/Users/vidar/works/test-vite-react',
        type: 'vite-express',
        status: 'stopped',
        port: 8001,
        lastOpened: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        packageManager: 'yarn',
        scripts: [
          { name: 'start', command: 'yarn start', description: '启动生产服务器' },
          { name: 'dev', command: 'yarn dev', description: '启动开发服务器' }
        ],
        description: 'React + Express 全栈应用',
        version: '1.2.0',
        template: 'vite-express',
        frontendFramework: 'react'
      },
      {
        id: 'test-vue-app-1',
        name: 'Vue Dashboard',
        path: '/Users/vidar/works/test-vue-dashboard',
        type: 'vite-express',
        status: 'stopped',
        port: 8002,
        lastOpened: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1周前
        packageManager: 'pnpm',
        scripts: [
          { name: 'start', command: 'pnpm start', description: '启动生产服务器' },
          { name: 'dev', command: 'pnpm dev', description: '启动开发服务器' }
        ],
        description: 'Vue 3 管理后台',
        version: 'beta0.1.0',
        template: 'vite-express',
        frontendFramework: 'vue'
      }
    ];

    // 将测试项目添加到状态
    testProjects.forEach(project => {
      dispatch({ type: 'ADD_PROJECT', payload: project });
    });
    
    // 同时保存到localStorage
    localStorage.setItem('nodeapp_projects', JSON.stringify(testProjects));
  };

  const startTestProject = async (projectId: string) => {
    // 这个方法暂时不使用，由ProjectRunner处理项目启动
    console.log('启动测试项目:', projectId);
  };

  return {
    startTestProject,
    initializeTestData
  };
}
