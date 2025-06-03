import { useState, useCallback } from "react";
import { PM2Service } from "../../services/PM2Service";
import { useToastContext } from "../../store/ToastContext";
import { useApp } from "../../store/AppContext"; // 🔧 使用 AppContext
import { ProjectStatusService } from "../../services/ProjectStatusService"; // 🔧 添加这个导入
import type { Project } from "../../types";

export interface UseProjectOperationsReturn {
    isInstallingDependencies: boolean;
    isEditingPort: boolean;
    tempPort: string;
    startProject: (project: Project) => Promise<boolean>;
    stopProject: (project: Project) => Promise<boolean>;
    restartProject: (project: Project) => Promise<boolean>;
    installDependencies: (project: Project, packageManager: string) => Promise<boolean>;
    saveProjectPort: (project: Project, newPort: number) => Promise<boolean>;
    setIsEditingPort: (editing: boolean) => void;
    setTempPort: (port: string) => void;
}

// 生成PM2进程名称的辅助函数 - 使用稳定ID
const generateProcessName = (project: Project) => {
    return PM2Service.generateStableProjectId(project.name, project.path);
};

export const useProjectOperations = (): UseProjectOperationsReturn => {
    const [isInstallingDependencies, setIsInstallingDependencies] = useState(false);
    const [isEditingPort, setIsEditingPort] = useState(false);
    const [tempPort, setTempPort] = useState<string>("");

    // 使用全局Toast系统
    const { showToast } = useToastContext();

    // 🔧 获取 dispatch 来直接更新项目状态
    const { dispatch } = useApp();

    // 🔧 增强的单个项目状态同步函数 - 同时更新详情页状态
    const syncSingleProjectStatus = useCallback(
        async (project: Project, action: string) => {
            try {
                console.log(`🔄 [${action}] 开始查询单个项目状态: ${project.name}`);

                // 使用 ProjectStatusService 的单个项目查询
                const statusResult = await ProjectStatusService.queryProjectStatus(project);

                if (statusResult.success) {
                    const newStatus = statusResult.mappedStatus;
                    const currentStatus = project.status;

                    console.log(`🔍 [${action}] 项目 "${project.name}" 状态: ${currentStatus} -> ${newStatus}`);

                    // 只有状态真的发生变化时才更新
                    if (currentStatus !== newStatus) {
                        console.log(`📝 [${action}] 更新项目状态: ${project.name} (${currentStatus} -> ${newStatus})`);

                        // 🔧 1. 更新项目列表状态
                        dispatch({
                            type: "UPDATE_PROJECT_STATUS",
                            payload: {
                                id: project.id,
                                status: newStatus,
                            },
                        });

                        // 🔧 2. 发送事件更新详情页状态
                        window.dispatchEvent(
                            new CustomEvent("update-project-detail-status", {
                                detail: {
                                    projectId: project.id,
                                    newStatus: newStatus,
                                    pm2Process: statusResult.success
                                        ? {
                                              name: statusResult.processName,
                                              pid: statusResult.processId || 0,
                                              pm_id: statusResult.processId || 0,
                                              pm2_env: {
                                                  status: statusResult.pm2Status || "unknown",
                                                  pm_cwd: project.path,
                                                  exec_mode: "fork",
                                                  pm_exec_path: project.path,
                                              },
                                              monit: {
                                                  memory: 0,
                                                  cpu: 0,
                                              },
                                          }
                                        : null,
                                },
                            })
                        );

                        console.log(`✅ [${action}] 项目 "${project.name}" 状态已更新到UI`);

                        // 🔧 特殊处理：如果启动后变成错误状态
                        if (action === "start" && newStatus === "error") {
                            showToast(`⚠️ 项目 ${project.name} 启动后发生错误，请检查日志`, "warning");
                        } else if (action === "start" && newStatus === "stopped") {
                            showToast(`⚠️ 项目 ${project.name} 启动失败，进程已停止`, "warning");
                        }

                        return true;
                    } else {
                        console.log(`ℹ️ [${action}] 项目 "${project.name}" 状态无变化: ${currentStatus}`);
                        return false;
                    }
                } else {
                    console.error(`❌ [${action}] 查询项目状态失败:`, statusResult.error);
                    return false;
                }
            } catch (error) {
                console.error(`❌ [${action}] 单个项目状态同步异常:`, error);
                return false;
            }
        },
        [dispatch, showToast]
    );

    // 🔧 状态同步辅助函数 - 使用单个项目查询
    const triggerStatusSync = useCallback(
        (action: "start" | "stop" | "restart", project: Project) => {
            console.log(`🔄 [${action}] 项目操作成功，准备同步状态: ${project.name}`);

            // 延迟同步，确保PM2状态已更新
            const delay = action === "start" ? 1000 : 800;
            setTimeout(async () => {
                console.log(`🔄 [${action}] 开始同步单个项目状态...`);

                const updated = await syncSingleProjectStatus(project, action);

                if (updated) {
                    showToast(`✅ 项目 ${project.name} 状态已同步`, "success");
                }
            }, delay);
        },
        [syncSingleProjectStatus, showToast]
    );
    // 启动项目
    const startProject = useCallback(
        async (project: Project): Promise<boolean> => {
            try {
                console.log("🚀 [操作] 启动项目开始:", project.name);
                const processName = generateProcessName(project);
                console.log("🚀 启动项目:", project.name, "进程名:", processName);

                const result = await PM2Service.startProject(project);

                if (result.success) {
                    console.log("✅ 项目启动成功");
                    showToast(`项目 ${project.name} 启动成功`, "success");

                    // 🔧 使用单个项目状态同步
                    triggerStatusSync("start", project);

                    return true;
                } else {
                    console.error("❌ 项目启动失败:", result.error);
                    showToast(`项目启动失败: ${result.error}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("启动项目时发生错误:", error);
                showToast("启动项目时发生错误", "error");
                return false;
            }
        },
        [showToast, triggerStatusSync]
    );

    // 停止项目
    const stopProject = useCallback(
        async (project: Project): Promise<boolean> => {
            try {
                console.log("🛑 [操作] 停止项目开始:", project.name);
                const processName = generateProcessName(project);
                console.log("🛑 停止项目:", project.name, "进程名:", processName);

                const result = await PM2Service.stopProject(project);

                if (result.success) {
                    console.log("✅ 项目停止成功");
                    showToast(`项目 ${project.name} 已停止`, "success");

                    // 🔧 使用单个项目状态同步
                    triggerStatusSync("stop", project);

                    return true;
                } else {
                    console.error("❌ 项目停止失败:", result.error);
                    showToast(`项目停止失败: ${result.error}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("停止项目时发生错误:", error);
                showToast("停止项目时发生错误", "error");
                return false;
            }
        },
        [showToast, triggerStatusSync]
    );

    // 重启项目
    const restartProject = useCallback(
        async (project: Project): Promise<boolean> => {
            try {
                console.log("🔄 [操作] 重启项目开始:", project.name);
                const processName = generateProcessName(project);
                console.log("🔄 重启项目:", project.name, "进程名:", processName);

                const result = await PM2Service.restartProject(processName);

                if (result.success) {
                    console.log("✅ 项目重启成功");
                    showToast(`项目 ${project.name} 重启成功`, "success");

                    // 🔧 使用单个项目状态同步
                    triggerStatusSync("restart", project);

                    return true;
                } else {
                    console.error("❌ 项目重启失败:", result.error);
                    showToast(`项目重启失败: ${result.error}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("重启项目时发生错误:", error);
                showToast("重启项目时发生错误", "error");
                return false;
            }
        },
        [showToast, triggerStatusSync]
    );

    // 安装依赖包
    const installDependencies = useCallback(
        async (project: Project, packageManager: string = "npm"): Promise<boolean> => {
            setIsInstallingDependencies(true);
            try {
                console.log("📦 开始安装依赖包:", project.name);
                showToast("正在安装依赖包...", "info");

                // 使用 Electron API 执行安装命令
                const command = `${packageManager} install`;
                const result = await window.electronAPI?.invoke("exec:command", {
                    command,
                    cwd: project.path,
                });

                if (result?.success) {
                    console.log("✅ 依赖包安装成功");
                    showToast("依赖包安装成功", "success");
                    return true;
                } else {
                    console.error("❌ 依赖包安装失败:", result?.error);
                    showToast(`依赖包安装失败: ${result?.error}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("安装依赖包时发生错误:", error);
                showToast("安装依赖包时发生错误", "error");
                return false;
            } finally {
                setIsInstallingDependencies(false);
            }
        },
        [showToast]
    );

    // 保存项目端口配置
    const saveProjectPort = useCallback(
        async (project: Project, newPort: number): Promise<boolean> => {
            try {
                console.log("💾 保存项目端口:", project.name, "新端口:", newPort);

                // 首先尝试更新 .env 文件
                const envPath = `${project.path}/.env`;
                let envContent = "";

                // 读取现有的 .env 文件
                try {
                    const result = await window.electronAPI?.invoke("fs:readFile", envPath);
                    if (result?.success) {
                        envContent = result.content;
                    }
                } catch (e) {
                    console.log("📄 .env 文件不存在，将创建新文件");
                }

                // 更新或添加 PORT 配置
                if (envContent.includes("PORT=")) {
                    envContent = envContent.replace(/PORT\s*=\s*\d+/, `PORT=${newPort}`);
                } else {
                    envContent += `${envContent ? "\n" : ""}PORT=${newPort}\n`;
                }

                // 写入 .env 文件
                const writeResult = await window.electronAPI?.invoke("fs:writeFile", envPath, envContent);

                if (writeResult?.success) {
                    console.log("✅ 端口配置保存成功");
                    showToast(`端口已更新为 ${newPort}`, "success");
                    return true;
                } else {
                    console.error("❌ 端口配置保存失败:", writeResult?.error);
                    showToast("端口配置保存失败", "error");
                    return false;
                }
            } catch (error) {
                console.error("保存端口配置时发生错误:", error);
                showToast("保存端口配置时发生错误", "error");
                return false;
            }
        },
        [showToast]
    );

    return {
        isInstallingDependencies,
        isEditingPort,
        tempPort,
        startProject,
        stopProject,
        restartProject,
        installDependencies,
        saveProjectPort,
        setIsEditingPort,
        setTempPort,
    };
};
