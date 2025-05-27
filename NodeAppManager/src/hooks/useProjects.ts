import { useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { useToastContext } from '../store/ToastContext';
import { ProjectService } from '../services/ProjectService';
import { usePM2ProjectRunner } from '../services/PM2ProjectRunner';
import type { Project, ProjectCreationConfig } from '../types';

export function useProjects() {
  const { state, dispatch } = useApp();
  const { showToast } = useToastContext();
  const { startProject: runnerStartProject, stopProject: runnerStopProject } = usePM2ProjectRunner();

  // 加载所有项目
  const loadProjects = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await ProjectService.getAllProjects();
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_PROJECTS', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || '加载项目失败' });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '加载项目时发生未知错误' 
      });
    }
  }, [dispatch]);

  // 导入项目
  const importProject = useCallback(async (projectPath?: string) => {
    // 如果没有提供路径，显示文件选择器
    if (!projectPath) {
      const selectedPath = await showDirectoryPicker();
      if (!selectedPath) return;
      projectPath = selectedPath;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await ProjectService.importProject(projectPath);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_PROJECT', payload: result.data });
        
        // 显示成功通知
        showToast('项目导入成功', `已成功导入项目: ${result.data.name}`, 'success');
      } else {
        const errorMsg = result.error || '导入项目失败';
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast('导入失败', errorMsg, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入项目时发生未知错误';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast('导入失败', errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, showToast]);

  // 移除项目
  const removeProject = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    // 确认删除
    const confirmed = await showConfirmDialog(
      '移除项目',
      `确定要移除项目 "${project.name}" 吗？这不会删除项目文件，只会从列表中移除。`
    );
    
    if (!confirmed) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await ProjectService.removeProject(projectId);
      
      if (result.success) {
        dispatch({ type: 'REMOVE_PROJECT', payload: projectId });
        showToast('项目已移除', `已从列表中移除项目: ${project.name}`, 'success');
      } else {
        const errorMsg = result.error || '移除项目失败';
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast('移除失败', errorMsg, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '移除项目时发生未知错误';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast('移除失败', errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.projects, dispatch, showToast]);

  // 启动项目
  const startProject = useCallback(async (project: Project) => {
    try {
      const success = await runnerStartProject(project);
      
      if (success) {
        showToast('项目已启动', `${project.name} 正在运行`, 'success');
      } else {
        showToast('启动失败', '启动项目失败', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '启动项目时发生未知错误';
      showToast('启动失败', errorMessage, 'error');
    }
  }, [runnerStartProject, showToast]);

  // 停止项目
  const stopProject = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      await runnerStopProject(project);
      showToast('项目已停止', `${project.name} 已停止运行`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '停止项目时发生未知错误';
      showToast('停止失败', errorMessage, 'error');
    }
  }, [state.projects, runnerStopProject, showToast]);

  // 创建项目
  const createProject = useCallback(async (projectConfig: ProjectCreationConfig) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await ProjectService.createProject(projectConfig);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_PROJECT', payload: result.data });
        showToast('项目创建成功', `已成功创建项目: ${result.data.name}`, 'success');
      } else {
        const errorMsg = result.error || '创建项目失败';
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast('创建失败', errorMsg, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建项目时发生未知错误';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast('创建失败', errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, showToast]);

  // 为现有项目自动分配端口
  const assignPortsToExisting = useCallback(async () => {
    try {
      const result = await ProjectService.assignPortsToExistingProjects();
      if (result.success && result.data && result.data.updatedCount > 0) {
        // 重新加载项目列表以反映更新
        await loadProjects();
        showToast('端口分配成功', `为 ${result.data.updatedCount} 个项目自动分配了端口号`, 'success');
      }
    } catch (error) {
      console.error('自动分配端口失败:', error);
    }
  }, [loadProjects, showToast]);

  return {
    projects: state.projects,
    isLoading: state.isLoading,
    error: state.error,
    loadProjects,
    importProject,
    removeProject,
    startProject,
    stopProject,
    createProject,
    assignPortsToExisting,
  };
}

// 工具函数（在真实应用中，这些会通过 Electron IPC 实现）
async function showDirectoryPicker(): Promise<string | null> {
  try {
    // 检查是否支持 File System Access API（Chrome 86+）
    if ('showDirectoryPicker' in window) {
      const dirHandle = await (window as any).showDirectoryPicker();
      return dirHandle.name; // 返回文件夹名称，实际应用中会返回完整路径
    }
    
    // 如果不支持，使用input元素模拟
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true; // 允许选择文件夹
      input.multiple = true;
      
      input.onchange = (event: any) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          // 获取第一个文件的路径，提取文件夹路径
          const firstFile = files[0];
          const path = firstFile.webkitRelativePath;
          const folderPath = path.split('/')[0];
          resolve(`/Users/example/${folderPath}`); // 模拟完整路径
        } else {
          resolve(null);
        }
      };
      
      input.oncancel = () => resolve(null);
      
      // 触发文件选择器
      input.click();
    });
  } catch (error) {
    console.error('选择目录失败:', error);
    
    // 降级到简单的prompt
    const path = prompt('请输入项目路径:', '/Users/example/my-project');
    return path;
  }
}

async function showConfirmDialog(title: string, message: string): Promise<boolean> {
  // 在真实应用中，这会显示一个自定义的确认对话框
  return confirm(`${title}\n\n${message}`);
}
