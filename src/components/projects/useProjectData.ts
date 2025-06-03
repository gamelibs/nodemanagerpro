import { useState, useCallback, useEffect } from "react";
import { PM2Service, type PM2Process } from "../../services/PM2Service";
import { ProjectValidationService } from "../../services/ProjectValidationService";
import type { Project } from "../../types";
import { ProjectStatusService } from "../../services/ProjectStatusService";

export interface UseProjectDataReturn {
    pm2Status: PM2Process | null;
    isLoadingPM2: boolean;
    packageInfo: any;
    isLoadingPackage: boolean;
    dependencyStatus: { [key: string]: boolean };
    isCheckingDependencies: boolean;
    projectPort: number | null;
    pm2Logs: string[];
    isLoadingLogs: boolean;
    // 新增验证相关状态
    validationResult: {
        isValid: boolean;
        configValid: boolean;
        pm2StatusValid: boolean;
        errors: string[];
        warnings: string[];
    } | null;
    isValidating: boolean;

    fetchProjectData: (project: Project) => Promise<void>;
    refreshPM2Status: (project: Project) => Promise<PM2Process | null>;
    refreshPackageInfo: (project: Project) => Promise<any>;
    refreshProjectPort: (project: Project) => Promise<number | null>;
    checkDependencies: (project: Project, packageData: any) => Promise<void>;
    fetchPM2Logs: (project: Project) => Promise<void>;
    // 新增验证方法
    validateProject: (project: Project, onProgress?: (message: string, level?: "info" | "warn" | "error" | "success") => void) => Promise<void>;
    clearData: () => void;
}

// 生成PM2进程名称的辅助函数 - 使用稳定ID
const generateProcessName = (project: Project) => {
    return PM2Service.generateStableProjectId(project.name, project.path);
};

export const useProjectData = (): UseProjectDataReturn => {
    const [pm2Status, setPm2Status] = useState<PM2Process | null>(null);
    const [isLoadingPM2, setIsLoadingPM2] = useState(false);
    const [packageInfo, setPackageInfo] = useState<any>(null);
    const [isLoadingPackage, setIsLoadingPackage] = useState(false);
    const [dependencyStatus, setDependencyStatus] = useState<{ [key: string]: boolean }>({});
    const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
    const [projectPort, setProjectPort] = useState<number | null>(null);
    const [pm2Logs, setPm2Logs] = useState<string[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // 新增验证相关状态
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean;
        configValid: boolean;
        pm2StatusValid: boolean;
        errors: string[];
        warnings: string[];
    } | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // 清空所有数据
    const clearData = useCallback(() => {
        setPm2Status(null);
        setPackageInfo(null);
        setDependencyStatus({});
        setProjectPort(null);
        setPm2Logs([]);
        setValidationResult(null);
    }, []);

    // 🔧 监听来自启动/停止操作的状态更新事件
    useEffect(() => {
        const handleDetailStatusUpdate = (event: CustomEvent) => {
            const { projectId, newStatus, pm2Process } = event.detail;

            console.log(`🔄 [详情页] 收到状态更新事件: ${projectId} -> ${newStatus}`);

            // 更新详情页的PM2状态
            if (pm2Process) {
                setPm2Status(pm2Process);
                console.log(`✅ [详情页] PM2状态已更新: ${newStatus}`);
            } else {
                setPm2Status(null);
                console.log(`✅ [详情页] PM2状态已清空`);
            }
        };

        window.addEventListener("update-project-detail-status", handleDetailStatusUpdate as EventListener);

        return () => {
            window.removeEventListener("update-project-detail-status", handleDetailStatusUpdate as EventListener);
        };
    }, []);

    // 获取PM2状态
    const refreshPM2Status = useCallback(async (project: Project): Promise<PM2Process | null> => {
        setIsLoadingPM2(true);
        try {
            console.log("🔍 正在获取项目PM2状态:", project.name);

            // ✅ 使用单项目查询，不影响手动同步的全量查询
            const statusResult = await ProjectStatusService.queryProjectStatus(project);

            if (statusResult.success) {
                // 🔧 修复类型错误：确保 status 是 string 类型
                const pm2Process: PM2Process = {
                    name: statusResult.processName,
                    pid: statusResult.processId || 0,
                    pm_id: statusResult.processId || 0,
                    pm2_env: {
                        status: statusResult.pm2Status || "unknown", // 🔧 提供默认值
                        pm_cwd: project.path,
                        exec_mode: "fork", // 🔧 添加必需的属性
                        pm_exec_path: project.path, // 🔧 添加必需的属性
                    },
                    monit: {
                        memory: 0,
                        cpu: 0,
                    },
                };

                console.log(`✅ 单项目状态查询完成: ${project.name} -> ${statusResult.mappedStatus}`);
                setPm2Status(pm2Process);
                return pm2Process;
            } else {
                console.log("❌ 未找到匹配的PM2进程");
                setPm2Status(null);
                return null;
            }
        } catch (error) {
            console.error("获取PM2状态失败:", error);
            setPm2Status(null);
            return null;
        } finally {
            setIsLoadingPM2(false);
        }
    }, []);

    // 获取package.json信息
    const refreshPackageInfo = useCallback(async (project: Project): Promise<any> => {
        setIsLoadingPackage(true);
        try {
            const packagePath = `${project.path}/package.json`;
            console.log("📡 尝试读取:", packagePath);

            const result = await window.electronAPI?.invoke("fs:readFile", packagePath);

            if (result?.success && result.content) {
                const packageData = JSON.parse(result.content);
                console.log("📦 成功读取并设置 package.json:", packageData.name, packageData.version);
                setPackageInfo(packageData);
                return packageData;
            } else {
                console.log("❌ 无法读取 package.json:", result?.error);
                setPackageInfo(null);
                return null;
            }
        } catch (error) {
            console.error("📡 读取package.json失败:", error);
            setPackageInfo(null);
            return null;
        } finally {
            setIsLoadingPackage(false);
        }
    }, []);

    // 读取项目端口配置
    const refreshProjectPort = useCallback(async (project: Project): Promise<number | null> => {
        try {
            // 尝试从 .env 文件读取端口
            const envPath = `${project.path}/.env`;
            try {
                const result = await window.electronAPI?.invoke("fs:readFile", envPath);
                if (result?.success) {
                    const portMatch = result.content.match(/PORT\s*=\s*(\d+)/);
                    if (portMatch) {
                        const port = parseInt(portMatch[1]);
                        setProjectPort(port);
                        return port;
                    }
                }
            } catch (e) {
                // .env 文件不存在或读取失败
            }

            // 尝试从 vite.config.js/ts 读取端口
            const viteConfigPath = `${project.path}/vite.config.ts`;
            const viteConfigJsPath = `${project.path}/vite.config.js`;

            let configContent = null;
            try {
                const result = await window.electronAPI?.invoke("fs:readFile", viteConfigPath);
                if (result?.success) {
                    configContent = result.content;
                }
            } catch (e) {
                try {
                    const result = await window.electronAPI?.invoke("fs:readFile", viteConfigJsPath);
                    if (result?.success) {
                        configContent = result.content;
                    }
                } catch (e2) {
                    // 继续尝试其他配置文件
                }
            }

            if (configContent) {
                const portMatch = configContent.match(/port:\s*(\d+)/);
                if (portMatch) {
                    const port = parseInt(portMatch[1]);
                    setProjectPort(port);
                    return port;
                }
            }

            // 返回项目记录中的端口或默认端口
            const port = project.port || 3000;
            setProjectPort(port);
            return port;
        } catch (error) {
            console.error("读取项目端口失败:", error);
            const port = project.port || 3000;
            setProjectPort(port);
            return port;
        }
    }, []);

    // 检查依赖安装状态
    const checkDependencies = useCallback(async (project: Project, packageData: any): Promise<void> => {
        if (!packageData) {
            setDependencyStatus({});
            return;
        }

        setIsCheckingDependencies(true);
        try {
            const allDependencies = {
                ...packageData.dependencies,
                ...packageData.devDependencies,
            };

            console.log("🔍 要检查的依赖包:", Object.keys(allDependencies));

            if (Object.keys(allDependencies).length === 0) {
                console.log("🔍 无依赖包需要检查");
                setDependencyStatus({});
                return;
            }

            const nodeModulesPath = `${project.path}/node_modules`;
            const status: { [key: string]: boolean } = {};

            for (const [depName] of Object.entries(allDependencies)) {
                try {
                    const depPath = `${nodeModulesPath}/${depName}/package.json`;
                    const result = await window.electronAPI?.invoke("fs:readFile", depPath);
                    status[depName] = result?.success === true;
                } catch (error) {
                    status[depName] = false;
                }
            }

            setDependencyStatus(status);
            console.log("📦 依赖包安装状态检查完成:", status);
        } catch (error) {
            console.error("检查依赖包安装状态失败:", error);
            setDependencyStatus({});
        } finally {
            setIsCheckingDependencies(false);
        }
    }, []);

    // 获取PM2日志
    const fetchPM2Logs = useCallback(async (project: Project): Promise<void> => {
        setIsLoadingLogs(true);
        try {
            const processName = generateProcessName(project);
            const result = await PM2Service.getRecentLogs(processName, 15);

            if (result.success && result.logs) {
                setPm2Logs(result.logs);
            } else {
                setPm2Logs([]);
            }
        } catch (error) {
            console.error("获取PM2日志失败:", error);
            setPm2Logs([]);
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    // 验证项目配置和PM2状态
    const validateProject = useCallback(async (project: Project, onProgress?: (message: string, level?: "info" | "warn" | "error" | "success") => void): Promise<void> => {
        setIsValidating(true);
        setValidationResult(null);

        const report = (message: string, level: "info" | "warn" | "error" | "success" = "info") => {
            console.log(`[${level.toUpperCase()}] ${message}`);
            onProgress?.(message, level);
        };

        try {
            report("开始项目验证...", "info");

            // 使用 ProjectValidationService 进行综合验证
            const validationResult = await ProjectValidationService.validateProject(project, report);

            if (validationResult.success && validationResult.data) {
                const { configuration, pm2Status } = validationResult.data;

                // 更新package信息
                if (configuration?.hasPackageJson && configuration.packageJson) {
                    setPackageInfo(configuration.packageJson);
                    report("✅ 项目配置信息已更新", "success");
                }

                // 设置验证结果
                const configValid = configuration?.hasPackageJson || false;
                const pm2StatusValid = pm2Status?.isRunning !== undefined;

                setValidationResult({
                    isValid: configValid && pm2StatusValid,
                    configValid,
                    pm2StatusValid,
                    errors: [],
                    warnings: configValid ? [] : ["未找到 package.json 文件"],
                });

                if (configValid && pm2StatusValid) {
                    report("✅ 项目验证通过", "success");
                } else {
                    if (!configValid) {
                        report("⚠️ 项目配置验证失败", "warn");
                    }
                    if (!pm2StatusValid) {
                        report("⚠️ PM2状态检查异常", "warn");
                    }
                }
            } else {
                const errorMsg = validationResult.error || "验证失败";
                report(`❌ 验证失败: ${errorMsg}`, "error");

                setValidationResult({
                    isValid: false,
                    configValid: false,
                    pm2StatusValid: false,
                    errors: [errorMsg],
                    warnings: [],
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "验证过程中发生未知错误";
            report(`💥 验证异常: ${errorMessage}`, "error");

            setValidationResult({
                isValid: false,
                configValid: false,
                pm2StatusValid: false,
                errors: [errorMessage],
                warnings: [],
            });
        } finally {
            setIsValidating(false);
            report("验证完成", "info");
        }
    }, []);

    // 获取项目的所有数据 - 集成验证功能
    const fetchProjectData = useCallback(
        async (project: Project): Promise<void> => {
            console.log("🔄 获取项目最新数据...");
            clearData();

            // 立即获取PM2状态
            await refreshPM2Status(project);

            // 并行获取其他信息
            const [packageData] = await Promise.all([refreshPackageInfo(project), refreshProjectPort(project), fetchPM2Logs(project)]);

            // 在package.json加载完成后检查依赖状态
            if (packageData) {
                await checkDependencies(project, packageData);
            }

            // 最后进行项目验证
            // await validateProject(project);
        },
        [refreshPM2Status, refreshPackageInfo, refreshProjectPort, fetchPM2Logs, checkDependencies, validateProject, clearData]
    );

    return {
        pm2Status,
        isLoadingPM2,
        packageInfo,
        isLoadingPackage,
        dependencyStatus,
        isCheckingDependencies,
        projectPort,
        pm2Logs,
        isLoadingLogs,
        validationResult,
        isValidating,
        fetchProjectData,
        refreshPM2Status,
        refreshPackageInfo,
        refreshProjectPort,
        checkDependencies,
        fetchPM2Logs,
        validateProject,
        clearData,
    };
};
