import { useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { useToastContext } from '../store/ToastContext';
import { ProjectService } from '../services/ProjectService';
import { usePM2ProjectRunner } from '../services/PM2ProjectRunner';
import { useLogs } from './useLogs';
import type { Project, ProjectCreationConfig } from '../types';

export function useProjects() {
  const { state, dispatch } = useApp();
  const { showToast } = useToastContext();
  const { startLogSession, endLogSession, addLog } = useLogs();
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

  // 导入项目 - 支持进度回调
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
      // 创建进度回调函数
      const onProgress = (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
        console.log(`[导入进度] [${level.toUpperCase()}] ${message}`);
        // 可以在这里添加更多的进度显示逻辑，比如更新UI状态
      };

      const result = await ProjectService.importProject(projectPath, onProgress);
      
      if (result.success && result.data) {
        dispatch({ type: 'ADD_PROJECT', payload: result.data });
        
        // 显示成功通知
        showToast(`项目导入成功: ${result.data.name}`, 'success');
      } else {
        const errorMsg = result.error || '导入项目失败';
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast(`导入失败: ${errorMsg}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入项目时发生未知错误';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast(`导入失败: ${errorMessage}`, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, showToast]);

  // 移除项目
  const removeProject = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    // 第一次确认删除
    const firstConfirmed = await showConfirmDialog(
      '移除项目',
      `确定要移除项目 "${project.name}" 吗？这不会删除项目文件，只会从列表中移除。`
    );
    
    if (!firstConfirmed) return;

    // 第二次确认删除
    const secondConfirmed = await showConfirmDialog(
      '最终确认',
      `再次确认：真的要移除项目 "${project.name}" 吗？此操作不可撤销。`
    );
    
    if (!secondConfirmed) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await ProjectService.removeProject(projectId);
      
      if (result.success) {
        dispatch({ type: 'REMOVE_PROJECT', payload: projectId });
        showToast(`项目已移除: ${project.name}`, 'success');
      } else {
        const errorMsg = result.error || '移除项目失败';
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast(`移除失败: ${errorMsg}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '移除项目时发生未知错误';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast(`移除失败: ${errorMessage}`, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.projects, dispatch, showToast]);

  // 启动项目
  const startProject = useCallback(async (project: Project) => {
    try {
      const success = await runnerStartProject(project);
      
      if (success) {
        showToast(`项目已启动: ${project.name}`, 'success');
      } else {
        showToast('启动项目失败', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '启动项目时发生未知错误';
      showToast(`启动失败: ${errorMessage}`, 'error');
    }
  }, [runnerStartProject, showToast]);

  // 停止项目
  const stopProject = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      await runnerStopProject(project);
      showToast(`项目已停止: ${project.name}`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '停止项目时发生未知错误';
      showToast(`停止失败: ${errorMessage}`, 'error');
    }
  }, [state.projects, runnerStopProject, showToast]);

  // 创建项目
  const createProject = useCallback(async (projectConfig: ProjectCreationConfig) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // 为项目创建生成临时ID
    const tempProjectId = `creating-${Date.now()}`;
    const projectDisplayName = `创建项目: ${projectConfig.name}`;

    console.log('🔄 开始创建项目，临时ID:', tempProjectId);

    // 启动日志会话
    startLogSession(tempProjectId, projectDisplayName);
    
    // 添加开始日志
    addLog({
      projectId: tempProjectId,
      level: 'info',
      message: `🏗️ 开始创建项目: ${projectConfig.name}`,
      source: 'system'
    });

    addLog({
      projectId: tempProjectId,
      level: 'info',
      message: `📍 项目路径: ${projectConfig.path}`,
      source: 'system'
    });

    addLog({
      projectId: tempProjectId,
      level: 'info',
      message: `🎨 使用模板: ${projectConfig.template}`,
      source: 'system'
    });

    try {
      const result = await ProjectService.createProject(projectConfig, {
        onProgress: (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
          console.log('📝 添加创建日志:', message);
          addLog({
            projectId: tempProjectId,
            level,
            message,
            source: 'system'
          });
        }
      });
      
      if (result.success && result.data) {
        // 添加成功日志
        addLog({
          projectId: tempProjectId,
          level: 'success',
          message: `✅ 项目创建成功: ${result.data.name}`,
          source: 'system'
        });

        addLog({
          projectId: tempProjectId,
          level: 'info',
          message: `🎉 项目已添加到项目列表，可以开始开发了！`,
          source: 'system'
        });

        dispatch({ type: 'ADD_PROJECT', payload: result.data });
        showToast(`项目创建成功: ${result.data.name}`, 'success');

        // 添加最终提示，但不自动关闭日志会话
        addLog({
          projectId: tempProjectId,
          level: 'info',
          message: `💡 提示: 日志会话将保持开启，您可以随时查看创建过程。点击其他项目或刷新页面来切换视图。`,
          source: 'system'
        });

        // 不自动关闭日志会话，让用户可以继续查看创建日志
        // 用户可以通过选择其他项目或手动操作来切换视图
      } else {
        const errorMsg = result.error || '创建项目失败';
        
        addLog({
          projectId: tempProjectId,
          level: 'error',
          message: `❌ 创建失败: ${errorMsg}`,
          source: 'system'
        });

        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        showToast(`创建失败: ${errorMsg}`, 'error');
        
        // 出错时延迟关闭日志会话，让用户看到错误信息
        setTimeout(() => {
          console.log('🔚 出错后结束创建日志会话:', tempProjectId);
          endLogSession(tempProjectId);
        }, 5000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建项目时发生未知错误';
      
      addLog({
        projectId: tempProjectId,
        level: 'error',
        message: `💥 异常错误: ${errorMessage}`,
        source: 'system'
      });

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast(`创建失败: ${errorMessage}`, 'error');
      
      // 异常错误时延迟关闭日志会话，让用户看到错误信息
      setTimeout(() => {
        console.log('🔚 异常后结束创建日志会话:', tempProjectId);
        endLogSession(tempProjectId);
      }, 5000);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, showToast, startLogSession, endLogSession, addLog]);

  // 为现有项目自动分配端口
  const assignPortsToExisting = useCallback(async () => {
    try {
      const result = await ProjectService.assignPortsToExistingProjects();
      if (result.success && result.data && result.data.updatedCount > 0) {
        // 重新加载项目列表以反映更新
        await loadProjects();
        showToast(`端口分配成功: 为 ${result.data.updatedCount} 个项目自动分配了端口号`, 'success');
      }
    } catch (error) {
      console.error('自动分配端口失败:', error);
    }
  }, [loadProjects, showToast]);

  // 同步项目状态与PM2
  const synchronizeProjectStatuses = useCallback(async () => {
    try {
      console.log('🔄 正在同步项目状态...');
      
      // 遍历所有项目，检查其实际状态
      const updates: { id: string; status: 'running' | 'stopped' | 'error'; name: string }[] = [];
      
      for (const project of state.projects) {
        try {
          // 使用正确的进程名称格式 ${project.name}-${project.id}
          const processName = `${project.name}-${project.id}`;
          const result = await window.electronAPI?.invoke('pm2:describe', processName);
          
          if (result?.success && result.status) {
            // PM2 进程存在且运行
            const pm2Status = result.status.status;
            let projectStatus: 'running' | 'stopped' | 'error' = 'stopped';
            
            if (pm2Status === 'online') {
              projectStatus = 'running';
            } else if (pm2Status === 'error' || pm2Status === 'errored') {
              projectStatus = 'error';
            }
            
            // 如果状态不一致，记录需要更新
            if (project.status !== projectStatus) {
              updates.push({ id: project.id, status: projectStatus, name: project.name });
              console.log(`📝 项目 ${project.name} 状态同步: ${project.status} -> ${projectStatus}`);
            }
          } else {
            // PM2 进程不存在，应该标记为stopped
            if (project.status !== 'stopped') {
              updates.push({ id: project.id, status: 'stopped', name: project.name });
              console.log(`📝 项目 ${project.name} 未在PM2中运行，状态同步: ${project.status} -> stopped`);
            }
          }
        } catch (error) {
          console.warn(`检查项目 ${project.name} 状态失败:`, error);
        }
      }
      
      // 批量更新状态
      for (const update of updates) {
        dispatch({
          type: 'UPDATE_PROJECT_STATUS',
          payload: { id: update.id, status: update.status }
        });
      }
      
      if (updates.length > 0) {
        const statusChangeText = updates.map(u => `${u.name}: ${u.status}`).join(', ');
        showToast(
          `状态同步完成: 更新了 ${updates.length} 个项目状态: ${statusChangeText}`, 
          'success'
        );
        console.log(`✅ 同步完成，更新了 ${updates.length} 个项目的状态`);
      } else {
        console.log('✅ 所有项目状态已同步');
      }
    } catch (error) {
      console.error('❌ 同步项目状态失败:', error);
      showToast('同步项目状态失败，请稍后重试', 'error');
    }
  }, [state.projects, dispatch, showToast]);

  // 更新项目信息
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      const result = await ProjectService.updateProject(projectId, updates);
      
      if (result.success) {
        // 更新本地状态
        dispatch({
          type: 'UPDATE_PROJECT_PARTIAL',
          payload: { id: projectId, updates }
        });
        
        showToast('项目信息已更新', 'success');
        return { success: true };
      } else {
        showToast(`更新项目失败: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新项目时发生未知错误';
      showToast(`更新项目失败: ${errorMessage}`, 'error');
      return { success: false, error: errorMessage };
    }
  }, [dispatch, showToast]);

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
    updateProject,
    assignPortsToExisting,
    synchronizeProjectStatuses,
  };
}

// 工具函数（使用 Electron IPC 实现）
async function showDirectoryPicker(): Promise<string | null> {
  try {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.showOpenDialog({
        title: '选择项目文件夹',
        buttonLabel: '选择',
        properties: ['openDirectory']
      });
      
      if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    }
    
    // 降级到Web API（仅用于开发环境）
    if ('showDirectoryPicker' in window) {
      const dirHandle = await (window as any).showDirectoryPicker();
      return dirHandle.name; // 返回文件夹名称，实际应用中会返回完整路径
    }
    
    // 如果都不支持，使用input元素模拟
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
