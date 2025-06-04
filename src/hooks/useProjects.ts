import { useCallback, useEffect, useRef } from "react";
import { useApp } from "../store/AppContext";
import { useToastContext } from "../store/ToastContext";
import { ProjectService } from "../services/ProjectService";
import { useLogs } from "./useLogs";
import type { Project, ProjectCreationConfig } from "../types";
import { ProjectStatusService } from "../services/ProjectStatusService";
import { PortDetectionService } from "../services/PortDetectionService";
import { DefaultProjectSetupService } from "../services/DefaultProjectSetupService";

export function useProjects() {
    const { state, dispatch } = useApp();
    const { showToast, showToastWin } = useToastContext();
    const { startLogSession, endLogSession, addLog } = useLogs();
    // const { startProject: runnerStartProject, stopProject: runnerStopProject } = usePM2ProjectRunner();

    // 使用 ref 来追踪是否需要自动同步状态
    const shouldAutoSync = useRef(false);
    // 添加防重复加载标志
    const isLoadingRef = useRef(false);

    const isSyncingRef = useRef(false); // 用于标记状态同步是否正在进行

    // 加载所有项目（带动态配置检测）
    const loadProjects = useCallback(async () => {
        // 防止重复加载
        if (isLoadingRef.current) {
            console.log("⚠️ 项目正在加载中，跳过重复请求");
            return;
        }

        isLoadingRef.current = true;
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        try {
            console.log("🔄 开始加载项目...");
            // 使用带有动态配置检测的方法
            const result = await ProjectService.getAllProjectsWithConfig();

            if (result.success && result.data) {
                dispatch({ type: "SET_PROJECTS", payload: result.data });

                // 加载项目后自动检查 PM2 状态
                console.log("🔄 项目加载完成，设置自动同步标志...");
                shouldAutoSync.current = true;
            } else {
                dispatch({ type: "SET_ERROR", payload: result.error || "加载项目失败" });
            }
        } catch (error) {
            dispatch({
                type: "SET_ERROR",
                payload: error instanceof Error ? error.message : "加载项目时发生未知错误",
            });
        } finally {
            isLoadingRef.current = false;
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [dispatch]);

    // 导入项目 - 支持进度回调
    // const importProject = useCallback(
    //     async (projectPath?: string) => {
    //         // 如果没有提供路径，显示文件选择器
    //         if (!projectPath) {
    //             const selectedPath = await showDirectoryPicker();
    //             if (!selectedPath) return;
    //             projectPath = selectedPath;
    //         }

    //         dispatch({ type: "SET_LOADING", payload: true });
    //         dispatch({ type: "SET_ERROR", payload: null });

    //         try {
    //             // 创建进度回调函数 - 同时在控制台和Toast中显示
    //             const onProgress = (message: string, level: "info" | "warn" | "error" | "success" = "info") => {
    //                 console.log(`[导入进度] [${level.toUpperCase()}] ${message}`);
    //                 // 通过Toast系统向用户显示进度，将 warn 映射为 info
    //                 const toastType = level === "warn" ? "info" : level;
    //                 showToast(message, toastType);
    //             };

    //                const result = await ProjectService.importProject(projectPath, onProgress, portInfo);

    //             if (result.success && result.data) {
    //                 dispatch({ type: "ADD_PROJECT", payload: result.data });

    //                 // 显示成功通知
    //                 showToast(`项目导入成功: ${result.data.name}`, "success");

    //                 // 🔄 触发项目导入后的自动同步
    //                 console.log("🔄 项目导入成功，开始自动同步PM2状态...");
    //                 onProgress("🔄 正在同步PM2状态...", "info");

    //                 // 设置自动同步标志，触发PM2状态检查
    //                 shouldAutoSync.current = true;

    //                 // 延迟一小段时间后进行状态同步，确保项目已添加到列表中
    //                 setTimeout(() => {
    //                     console.log("🔄 开始导入后PM2状态同步...");
    //                 }, 500);
    //             } else {
    //                 const errorMsg = result.error || "导入项目失败";
    //                 dispatch({ type: "SET_ERROR", payload: errorMsg });
    //                 showToast(`导入失败: ${errorMsg}`, "error");
    //             }
    //         } catch (error) {
    //             const errorMessage = error instanceof Error ? error.message : "导入项目时发生未知错误";
    //             dispatch({ type: "SET_ERROR", payload: errorMessage });
    //             showToast(`导入失败: ${errorMessage}`, "error");
    //         } finally {
    //             dispatch({ type: "SET_LOADING", payload: false });
    //         }
    //     },
    //     [dispatch, showToast]
    // );
    // 🔧 重构的导入项目方法 - 优化检测流程
    const importProject = useCallback(
        async (projectPath?: string) => {
            // 如果没有提供路径，显示文件选择器
            if (!projectPath) {
                const selectedPath = await showDirectoryPicker();
                if (!selectedPath) return;
                projectPath = selectedPath;
            }

            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });

            try {
                // 创建进度回调函数
                const onProgress = (message: string, level: "info" | "warn" | "error" | "success" = "info") => {
                    console.log(`[导入进度] [${level.toUpperCase()}] ${message}`);
                    const toastType = level === "warn" ? "info" : level;
                    showToast(message, toastType);
                };

                // 🔧 1. 重复导入检查
                onProgress("🔍 检查项目是否已经导入...", "info");
                const normalizedProjectPath = projectPath.replace(/\/+$/, "");
                const existingProject = state.projects.find((project) => {
                    const normalizedExistingPath = project.path.replace(/\/+$/, "");
                    return normalizedExistingPath === normalizedProjectPath;
                });

                if (existingProject) {
                    console.log(`⚠️ 项目已存在: ${existingProject.name}`);
                    const duplicateMessage = buildDuplicateMessage(existingProject);
                    showToastWin("项目重复导入", duplicateMessage, [], "warning");
                    dispatch({ type: "SET_LOADING", payload: false });
                    return;
                }

                onProgress("✅ 项目路径检查通过", "success");

                // 🔧 2. 基础配置检查
                onProgress("🔍 检查项目基础配置...", "info");
                const basicCheckResult = await checkProjectBasics(projectPath);

                // 显示基础检查结果
                logBasicCheckResults(basicCheckResult, onProgress);

                // 🔧 3. 关键配置自动修复
                let needsPortRedetection = false;
                if (basicCheckResult.needsBasicSetup) {
                    onProgress("🔧 正在修复基础配置...", "info");
                    const setupResult = await DefaultProjectSetupService.createDefaultProjectSetup(projectPath);

                    if (setupResult.success) {
                        onProgress("✅ 基础配置修复完成", "success");
                        needsPortRedetection = true;

                        // 显示修复详情
                        const setupMessage = buildSetupMessage(setupResult.created, projectPath);
                        showToastWin("已创建基础项目配置", setupMessage, [], "info");
                    } else {
                        onProgress("⚠️ 基础配置修复部分失败，但不影响导入", "warn");
                    }
                }

                // 🔧 4. 端口配置检查 (在配置修复后)
                onProgress("🔌 检测项目端口配置...", "info");
                let portInfo = await PortDetectionService.detectProjectPorts(projectPath);

                // 🔧 如果创建了默认配置，重新检测端口确保获取最新配置
                if (needsPortRedetection) {
                    console.log("🔄 检测到基础配置已修复，重新检测端口配置...");
                    onProgress("🔄 重新检测端口配置...", "info");
                    portInfo = await PortDetectionService.detectProjectPorts(projectPath);
                    console.log("🔄 端口重新检测完成:", portInfo);
                }

                // 显示端口检测结果
                logPortDetectionResults(portInfo, onProgress);

                // 🔧 5. 端口冲突检查
                const conflictWarnings = await checkPortConflicts(portInfo, state.projects, onProgress);

                // 🔧 6. 问题汇总 (不阻止导入)
                const warnings = [...basicCheckResult.warnings, ...conflictWarnings];

                if (warnings.length > 0) {
                    onProgress(`⚠️ 发现 ${warnings.length} 个提醒事项，但不影响导入`, "warn");
                    // 可以选择性地显示警告汇总
                }

                // 🔧 7. 项目导入 (始终执行)
                onProgress("📦 开始导入项目...", "info");
                const result = await ProjectService.importProject(projectPath, onProgress, portInfo);

                if (result.success && result.data) {
                    dispatch({ type: "ADD_PROJECT", payload: result.data });

                    // 成功消息
                    const successMessage = buildSuccessMessage(result.data, portInfo, warnings);
                    onProgress(successMessage, "success");
                    showToast(`项目导入成功: ${result.data.name}`, "success");

                    // PM2状态同步
                    shouldAutoSync.current = true;
                    setTimeout(() => {
                        console.log("🔄 开始导入后PM2状态同步...");
                    }, 500);
                } else {
                    const errorMsg = result.error || "导入项目失败";
                    dispatch({ type: "SET_ERROR", payload: errorMsg });
                    showToast(`导入失败: ${errorMsg}`, "error");
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "导入项目时发生未知错误";
                console.error("❌ 导入项目失败:", error);
                dispatch({ type: "SET_ERROR", payload: errorMessage });
                showToast(`导入失败: ${errorMessage}`, "error");
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [dispatch, showToast, showToastWin, state.projects]
    );

    // 🔧 检查项目基础配置
    async function checkProjectBasics(projectPath: string): Promise<{
        needsBasicSetup: boolean;
        hasPackageJson: boolean;
        hasStartScript: boolean;
        hasStartFile: boolean;
        warnings: string[];
    }> {
        const warnings: string[] = [];
        let hasPackageJson = false;
        let hasStartScript = false;
        let hasStartFile = false;

        try {
            // 检查 package.json
            const packageJsonPath = `${projectPath}/package.json`;
            const packageResult = await window.electronAPI?.invoke("fs:readFile", packageJsonPath);

            if (packageResult?.success) {
                hasPackageJson = true;
                const packageJson = JSON.parse(packageResult.content);
                hasStartScript = !!packageJson.scripts?.start;

                if (!hasStartScript) {
                    warnings.push("缺少启动脚本 (package.json scripts.start)");
                }
            } else {
                warnings.push("缺少 package.json 文件");
            }

            // 检查启动文件
            const startFiles = ["server.js", "index.js", "app.js", "main.js"];
            for (const fileName of startFiles) {
                const filePath = `${projectPath}/${fileName}`;
                const existsResult = await window.electronAPI?.invoke("fs:exists", filePath);
                if (existsResult?.exists) {
                    hasStartFile = true;
                    break;
                }
            }

            if (!hasStartFile) {
                warnings.push("未找到标准的启动文件 (server.js, index.js 等)");
            }
        } catch (error) {
            warnings.push("基础配置检查时发生错误");
        }

        const needsBasicSetup = !hasPackageJson || !hasStartScript || !hasStartFile;

        return {
            needsBasicSetup,
            hasPackageJson,
            hasStartScript,
            hasStartFile,
            warnings,
        };
    }

    // 🔧 记录基础检查结果
    function logBasicCheckResults(
        result: {
            hasPackageJson: boolean;
            hasStartScript: boolean;
            hasStartFile: boolean;
            warnings: string[];
        },
        onProgress: (message: string, level?: "info" | "warn" | "error" | "success") => void
    ) {
        if (result.hasPackageJson) {
            onProgress("✅ package.json 文件存在", "info");
        }

        if (result.hasStartScript) {
            onProgress("✅ 启动脚本配置正常", "info");
        }

        if (result.hasStartFile) {
            onProgress("✅ 检测到启动文件", "info");
        }

        if (result.warnings.length > 0) {
            onProgress(`⚠️ 检测到 ${result.warnings.length} 个配置问题，将自动修复`, "warn");
            result.warnings.forEach((warning) => {
                onProgress(`  • ${warning}`, "info");
            });
        }
    }

    // 🔧 记录端口检测结果
    function logPortDetectionResults(portInfo: any, onProgress: (message: string, level?: "info" | "warn" | "error" | "success") => void) {
        if (portInfo.hasPortConfig) {
            onProgress(`📋 检测到端口配置: ${portInfo.configuredPorts.join(", ")}`, "info");

            if (portInfo.defaultPort) {
                onProgress(`🎯 默认端口: ${portInfo.defaultPort}`, "info");
            }
        } else {
            onProgress("⚠️ 未检测到端口配置", "warn");
        }
    }

    // 🔧 检查端口冲突
    async function checkPortConflicts(portInfo: any, existingProjects: any[], onProgress: (message: string, level?: "info" | "warn" | "error" | "success") => void): Promise<string[]> {
        const warnings: string[] = [];

        if (!portInfo.hasPortConfig || existingProjects.length === 0) {
            return warnings;
        }

        onProgress("🔍 检查端口冲突...", "info");

        // 项目间端口冲突检查
        const existingProjectsMap = existingProjects.map((p) => ({
            id: p.id,
            name: p.name,
            port: p.port,
        }));

        const conflicts = PortDetectionService.checkPortConflictsWithExisting(portInfo.configuredPorts, existingProjectsMap);

        if (conflicts.length > 0) {
            onProgress(`⚠️ 发现 ${conflicts.length} 个端口冲突`, "warn");

            const conflictMessage = buildConflictMessage(conflicts);
            showToastWin("检测到端口冲突", conflictMessage, [], "warning");

            warnings.push(`端口冲突: ${conflicts.length} 个`);
        } else {
            onProgress("✅ 无端口冲突", "success");
        }

        // Vite 配置冲突检查
        if (portInfo.viteConfigConflict?.hasConflict) {
            onProgress("⚠️ 检测到 Vite 配置冲突", "warn");

            const viteMessage = buildViteConflictMessage(portInfo.viteConfigConflict.vitePort, portInfo.viteConfigConflict.envPort);
            showToastWin("Vite 配置冲突", viteMessage, [], "warning");

            warnings.push("Vite 配置冲突");
        }

        return warnings;
    }

    // 🔧 构建消息的辅助函数
    function buildDuplicateMessage(existingProject: any): string {
        return `该项目已经在项目列表中了！

项目名称：${existingProject.name}
项目路径：${existingProject.path}
项目ID：${existingProject.id}
最后打开：${new Date(existingProject.lastOpened).toLocaleString()}

如果您想重新配置这个项目，可以先删除现有项目再重新导入。`;
    }

    function buildSetupMessage(created: { serverJs: boolean; packageJsonScripts: boolean; envFile: boolean }, projectPath: string): string {
        let message = "检测到项目缺少基础配置，已自动创建：\n\n";

        const createdFiles = [];
        if (created.serverJs) createdFiles.push("✅ server.js - 默认 Express 服务器");
        if (created.packageJsonScripts) createdFiles.push("✅ package.json scripts - 启动脚本");
        if (created.envFile) createdFiles.push("✅ .env - 环境配置 (端口: 2222)");

        message += createdFiles.join("\n") + "\n\n";
        message += "💡 项目现在可以使用 'npm start' 启动";

        return message;
    }

    function buildConflictMessage(conflicts: any[]): string {
        let message = `发现 ${conflicts.length} 个端口冲突：\n\n`;

        conflicts.forEach((conflict) => {
            const projectNames = conflict.conflictingProjects.map((p: any) => p.name).join("、");
            message += `🔥 端口 ${conflict.port} 与项目冲突：${projectNames}\n`;
        });

        message += "\n💡 建议修改 .env 文件中的 PORT 值以避免冲突";
        return message;
    }

    function buildViteConflictMessage(vitePort: number, envPort: number): string {
        return `Vite 项目配置不一致：

🔧 vite.config.js: ${vitePort}
📋 .env 文件: ${envPort}

Vite 将使用配置文件中的端口 ${vitePort}

💡 建议统一配置以避免混淆`;
    }

    function buildSuccessMessage(project: any, portInfo: any, warnings: string[]): string {
        let message = `✅ 项目导入成功: ${project.name}`;

        if (portInfo.defaultPort) {
            message += ` (端口: ${portInfo.defaultPort})`;
        }

        if (warnings.length > 0) {
            message += ` [${warnings.length}个提醒]`;
        }

        return message;
    }

    // 移除项目
    const removeProject = useCallback(
        async (projectId: string) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (!project) return;

            // 第一次确认删除
            const firstConfirmed = await showConfirmDialog("移除项目", `确定要移除项目 "${project.name}" 吗？这不会删除项目文件，只会从列表中移除。`);

            if (!firstConfirmed) return;

            // 第二次确认删除
            const secondConfirmed = await showConfirmDialog("最终确认", `再次确认：真的要移除项目 "${project.name}" 吗？此操作不可撤销。`);

            if (!secondConfirmed) return;

            dispatch({ type: "SET_LOADING", payload: true });

            try {
                const result = await ProjectService.removeProject(projectId);

                if (result.success) {
                    dispatch({ type: "REMOVE_PROJECT", payload: projectId });
                    showToast(`项目已移除: ${project.name}`, "success");
                } else {
                    const errorMsg = result.error || "移除项目失败";
                    dispatch({ type: "SET_ERROR", payload: errorMsg });
                    showToast(`移除失败: ${errorMsg}`, "error");
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "移除项目时发生未知错误";
                dispatch({ type: "SET_ERROR", payload: errorMessage });
                showToast(`移除失败: ${errorMessage}`, "error");
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [state.projects, dispatch, showToast]
    );

    // 注释掉原有的同步逻辑，使用新的封装服务
    const synchronizeProjectStatuses = useCallback(
        async (manual = false) => {
            // 防止重复同步
            if (isLoadingRef.current) {
                console.log("⚠️ 项目正在加载中，跳过同步请求");
                return;
            }

            if (isSyncingRef.current) {
                console.log("⚠️ 状态同步正在进行中，跳过重复请求");
                return;
            }

            try {
                isSyncingRef.current = true; // 设置同步标志
                console.log("🔄 正在同步项目状态...");

                if (manual) {
                    console.log("🎯 [手动同步] 用户主动触发状态同步");
                } else {
                    console.log("🎯 [自动同步] 检测到项目列表更新，开始自动同步状态");
                }

                // 获取当前项目列表
                const currentProjects = state.projects || [];
                if (currentProjects.length === 0) {
                    console.log("📋 没有项目需要同步状态");
                    return;
                }

                // 使用新的 ProjectStatusService 进行批量状态查询
                const batchResult = await ProjectStatusService.queryMultipleProjectStatusOptimized(currentProjects);

                // 统计需要更新的项目
                let updatedCount = 0;
                const statusUpdates: Array<{ projectId: string; newStatus: Project["status"]; oldStatus: Project["status"] | undefined }> = [];

                // 🔧 添加去重机制：收集所有需要更新的项目，然后批量更新
                const projectsToUpdate = new Map<string, { project: Project; newStatus: Project["status"]; oldStatus: Project["status"] | undefined }>();

                // 处理查询结果并收集需要更新的项目
                for (const result of batchResult.results) {
                    const currentProject = currentProjects.find((p) => p.id === result.projectId);
                    const currentStatus = currentProject?.status;
                    const newStatus = result.mappedStatus;

                    console.log(`🔍 [状态对比] 项目 "${result.projectName}": 当前=${currentStatus} vs 新=${newStatus}`);

                    // 只有状态发生变化时才添加到更新列表
                    if (currentStatus !== newStatus) {
                        console.log(`📝 [状态同步] 项目 "${result.projectName}" 状态更新: ${currentStatus} -> ${newStatus}`);

                        // 🔧 添加到更新列表而不是立即 dispatch
                        projectsToUpdate.set(result.projectId, {
                            project: currentProject!,
                            newStatus,
                            oldStatus: currentStatus,
                        });

                        updatedCount++;
                        statusUpdates.push({
                            projectId: result.projectId,
                            newStatus,
                            oldStatus: currentStatus,
                        });
                    } else {
                        console.log(`✅ [状态同步] 项目 "${result.projectName}" 状态无变化: ${currentStatus}`);
                    }
                }

                // 🔧 批量更新状态（一次性更新，避免重复）
                if (projectsToUpdate.size > 0) {
                    console.log(`🔄 [批量更新] 准备更新 ${projectsToUpdate.size} 个项目的状态`);

                    for (const [projectId, updateInfo] of projectsToUpdate) {
                        console.log(`🔄 [单项更新] 更新项目 "${updateInfo.project.name}" 状态: ${updateInfo.oldStatus} -> ${updateInfo.newStatus}`);
                        console.log("配发事件次数:");
                        dispatch({
                            type: "UPDATE_PROJECT_STATUS",
                            payload: {
                                id: projectId,
                                status: updateInfo.newStatus,
                            },
                        });
                        console.log(`✅ [状态更新] 项目 "${updateInfo.project.name}" 状态已更新: ${updateInfo.oldStatus} -> ${updateInfo.newStatus}`);
                    }

                    console.log(`✅ [批量更新] 完成更新 ${projectsToUpdate.size} 个项目的状态`);
                    // 🔧 在 dispatch 之后立即记录，而不是在 Reducer 中
                }

                // 显示同步结果
                if (manual) {
                    // 手动同步显示详细结果
                    console.log("📊 [手动同步] 详细查询结果:");
                    console.log(ProjectStatusService.formatQueryResultsForLog(batchResult.results));

                    // 显示用户友好的同步结果
                    if (updatedCount > 0) {
                        showToast(`✅ 手动同步完成，更新了 ${updatedCount} 个项目的状态`, "success");
                    } else {
                        showToast("ℹ️ 所有项目状态都是最新的", "info");
                    }
                } else {
                    // 自动同步也显示用户友好的结果
                    if (updatedCount > 0) {
                        console.log(`✅ 自动同步完成，更新了 ${updatedCount} 个项目的状态`);
                        console.log("📊 [自动同步] 详细查询结果:");
                        console.log(ProjectStatusService.formatQueryResultsForLog(batchResult.results));

                        // 自动同步也显示Toast提示
                        const statusChangeText = statusUpdates
                            .map((u) => {
                                const project = currentProjects.find((p) => p.id === u.projectId);
                                return `${project?.name}: ${u.newStatus}`;
                            })
                            .join(", ");
                        showToast(`🔄 状态同步完成: ${statusChangeText}`, "info");
                    } else {
                        console.log("✅ 自动同步完成，所有项目状态都是最新的");
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "同步状态失败";
                console.error("❌ 项目状态同步失败:", error);

                if (manual) {
                    showToast(`❌ 手动同步失败: ${errorMessage}`, "error");
                } else {
                    showToast(`❌ 自动同步失败: ${errorMessage}`, "error");
                }
            } finally {
                isSyncingRef.current = false; // 清除同步标志
            }
        },
        [dispatch, showToast, state.projects]
    );

    // 监听来自 AppContext 的同步事件
    useEffect(() => {
        const handleSyncEvent = (event: CustomEvent) => {
            console.log("🔄 [useProjects] 收到同步事件:", event.detail);
            const manual = event.detail?.manual || true;
            synchronizeProjectStatuses(manual);
        };

        // 监听来自 AppContext 的同步事件
        window.addEventListener("sync-project-statuses", handleSyncEvent as EventListener);

        return () => {
            window.removeEventListener("sync-project-statuses", handleSyncEvent as EventListener);
        };
    }, [synchronizeProjectStatuses]);

    // 创建项目
    const createProject = useCallback(
        async (projectConfig: ProjectCreationConfig) => {
            dispatch({ type: "SET_LOADING", payload: true });
            dispatch({ type: "SET_ERROR", payload: null });

            // 为项目创建生成临时ID
            const tempProjectId = `creating-${Date.now()}`;
            const projectDisplayName = `创建项目: ${projectConfig.name}`;

            console.log("🔄 开始创建项目，临时ID:", tempProjectId);

            // 启动日志会话
            startLogSession(tempProjectId, projectDisplayName);

            // 添加开始日志
            addLog({
                projectId: tempProjectId,
                level: "info",
                message: `🏗️ 开始创建项目: ${projectConfig.name}`,
                source: "system",
            });

            addLog({
                projectId: tempProjectId,
                level: "info",
                message: `📍 项目路径: ${projectConfig.path}`,
                source: "system",
            });

            addLog({
                projectId: tempProjectId,
                level: "info",
                message: `🎨 使用模板: ${projectConfig.template}`,
                source: "system",
            });

            try {
                const result = await ProjectService.createProject(projectConfig, {
                    onProgress: (message: string, level: "info" | "warn" | "error" | "success" = "info") => {
                        console.log("📝 添加创建日志:", message);
                        addLog({
                            projectId: tempProjectId,
                            level,
                            message,
                            source: "system",
                        });
                    },
                });

                if (result.success && result.data) {
                    // 添加成功日志
                    addLog({
                        projectId: tempProjectId,
                        level: "success",
                        message: `✅ 项目创建成功: ${result.data.name}`,
                        source: "system",
                    });

                    addLog({
                        projectId: tempProjectId,
                        level: "info",
                        message: `🎉 项目已添加到项目列表，可以开始开发了！`,
                        source: "system",
                    });

                    dispatch({ type: "ADD_PROJECT", payload: result.data });
                    showToast(`项目创建成功: ${result.data.name}`, "success");

                    // 添加最终提示，但不自动关闭日志会话
                    addLog({
                        projectId: tempProjectId,
                        level: "info",
                        message: `💡 提示: 日志会话将保持开启，您可以随时查看创建过程。点击其他项目或刷新页面来切换视图。`,
                        source: "system",
                    });

                    // 不自动关闭日志会话，让用户可以继续查看创建日志
                    // 用户可以通过选择其他项目或手动操作来切换视图
                } else {
                    const errorMsg = result.error || "创建项目失败";

                    addLog({
                        projectId: tempProjectId,
                        level: "error",
                        message: `❌ 创建失败: ${errorMsg}`,
                        source: "system",
                    });

                    dispatch({ type: "SET_ERROR", payload: errorMsg });
                    showToast(`创建失败: ${errorMsg}`, "error");

                    // 出错时延迟关闭日志会话，让用户看到错误信息
                    setTimeout(() => {
                        console.log("🔚 出错后结束创建日志会话:", tempProjectId);
                        endLogSession(tempProjectId);
                    }, 5000);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "创建项目时发生未知错误";

                addLog({
                    projectId: tempProjectId,
                    level: "error",
                    message: `💥 异常错误: ${errorMessage}`,
                    source: "system",
                });

                dispatch({ type: "SET_ERROR", payload: errorMessage });
                showToast(`创建失败: ${errorMessage}`, "error");

                // 异常错误时延迟关闭日志会话，让用户看到错误信息
                setTimeout(() => {
                    console.log("🔚 异常后结束创建日志会话:", tempProjectId);
                    endLogSession(tempProjectId);
                }, 5000);
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [dispatch, showToast, startLogSession, endLogSession, addLog]
    );

    // 为现有项目自动分配端口
    const assignPortsToExisting = useCallback(async () => {
        try {
            const result = await ProjectService.assignPortsToExistingProjects();
            if (result.success && result.data && result.data.updatedCount > 0) {
                // 重新加载项目列表以反映更新
                await loadProjects();
                showToast(`端口分配成功: 为 ${result.data.updatedCount} 个项目自动分配了端口号`, "success");
            }
        } catch (error) {
            console.error("自动分配端口失败:", error);
        }
    }, [loadProjects, showToast]);

    // 更新项目信息
    const updateProject = useCallback(
        async (projectId: string, updates: Partial<Project>) => {
            try {
                const result = await ProjectService.updateProject(projectId, updates);

                if (result.success) {
                    // 更新本地状态
                    dispatch({
                        type: "UPDATE_PROJECT_PARTIAL",
                        payload: { id: projectId, updates },
                    });

                    showToast("项目信息已更新", "success");
                    return { success: true };
                } else {
                    showToast(`更新项目失败: ${result.error}`, "error");
                    return { success: false, error: result.error };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "更新项目时发生未知错误";
                showToast(`更新项目失败: ${errorMessage}`, "error");
                return { success: false, error: errorMessage };
            }
        },
        [dispatch, showToast]
    );

    return {
        projects: state.projects,
        isLoading: state.isLoading,
        error: state.error,
        loadProjects,
        importProject,
        removeProject,
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
        if (typeof window !== "undefined" && (window as any).electronAPI) {
            const result = await (window as any).electronAPI.showOpenDialog({
                title: "选择项目文件夹",
                buttonLabel: "选择",
                properties: ["openDirectory"],
            });

            if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
                return result.filePaths[0];
            }
            return null;
        }

        // 降级到Web API（仅用于开发环境）
        if ("showDirectoryPicker" in window) {
            const dirHandle = await (window as any).showDirectoryPicker();
            return dirHandle.name; // 返回文件夹名称，实际应用中会返回完整路径
        }

        // 如果都不支持，使用input元素模拟
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.webkitdirectory = true; // 允许选择文件夹
            input.multiple = true;

            input.onchange = (event: any) => {
                const files = event.target.files;
                if (files && files.length > 0) {
                    // 获取第一个文件的路径，提取文件夹路径
                    const firstFile = files[0];
                    const path = firstFile.webkitRelativePath;
                    const folderPath = path.split("/")[0];
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
        console.error("选择目录失败:", error);

        // 降级到简单的prompt
        const path = prompt("请输入项目路径:", "/Users/example/my-project");
        return path;
    }
}

async function showConfirmDialog(title: string, message: string): Promise<boolean> {
    // 在真实应用中，这会显示一个自定义的确认对话框
    return confirm(`${title}\n\n${message}`);
}
