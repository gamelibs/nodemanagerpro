// 渲染进程中的文件系统服务（通过IPC与主进程通信）
import type { Project, CoreProject, FileSystemResult } from "../types";

// 声明Electron API类型
declare global {
    interface Window {
        electronAPI?: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            showOpenDialog: (options: any) => Promise<any>;
            on: (channel: string, callback: (...args: any[]) => void) => void;
            removeListener: (channel: string, callback: (...args: any[]) => void) => void;
            getAppVersion: () => Promise<string>;
            platform: string;
            isDev: boolean; // 开发模式标识
        };
    }
}

export class RendererFileSystemService {
    /**
     * 统一的Electron环境检查方法
     */
    static checkElectronEnvironment(): boolean {
        const result = typeof window !== "undefined" && window.electronAPI !== undefined;
        // 移除重复的环境检查日志，只在实际需要时才输出
        return result;
    }
    /**
     * 检查是否在Electron环境中（私有方法，不输出日志）
     */
    private static isElectron(): boolean {
        return typeof window !== "undefined" && window.electronAPI !== undefined;
    }

    /**
     * 公开的方法检查是否在Electron环境中（使用统一的检查方法）
     */
    static isInElectron(): boolean {
        return this.checkElectronEnvironment();
    }

    /**
     * 加载项目列表
     */
    static async loadProjects(): Promise<FileSystemResult> {
        console.log("🔄 RendererFileSystemService.loadProjects() 开始");

        if (!this.isElectron()) {
            // 使用私有方法，不输出重复日志
            console.warn("⚠️ 不在Electron环境中，返回空数组");
            return { success: true, data: [] };
        }

        try {
            console.log("📡 发送 fs:loadProjects IPC调用");
            const result = await window.electronAPI!.invoke("fs:loadProjects");
            console.log("📡 收到 fs:loadProjects 响应:", result);
            return result;
        } catch (error) {
            console.error("❌ fs:loadProjects IPC调用失败:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "加载项目失败",
            };
        }
    }

    /**
     * 保存项目列表（仅保存核心信息）
     */
    static async saveProjects(projects: CoreProject[]): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，跳过保存");
            return { success: false, error: "不在Electron环境中" };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:saveProjects", projects);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "保存项目失败",
            };
        }
    }

    /**
     * 添加项目
     */
    static async addProject(project: CoreProject): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，跳过添加");
            return { success: false, error: "不在Electron环境中" };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:addProject", project);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "添加项目失败",
            };
        }
    }

    /**
     * 移除项目
     */
    static async removeProject(projectId: string): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，跳过移除");
            return { success: false, error: "不在Electron环境中" };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:removeProject", projectId);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "移除项目失败",
            };
        }
    }

    /**
     * 更新项目信息
     */
    static async updateProject(projectId: string, updates: Partial<Project>): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，跳过更新");
            return { success: false, error: "不在Electron环境中" };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:updateProject", projectId, updates);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "更新项目失败",
            };
        }
    }

    /**
     * 更新项目状态
     */
    static async updateProjectStatus(projectId: string, status: Project["status"]): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，跳过更新");
            return { success: false, error: "不在Electron环境中" };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:updateProjectStatus", projectId, status);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "更新项目状态失败",
            };
        }
    }

    /**
     * 获取数据目录信息
     */
    static async getDataInfo(): Promise<FileSystemResult> {
        if (!this.isElectron()) {
            return {
                success: true,
                data: {
                    dataDir: "N/A (浏览器环境)",
                    projectsFile: "N/A",
                    exists: false,
                },
            };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:getDataInfo");
            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "获取数据信息失败",
            };
        }
    }

    /**
     * 从模板创建项目文件
     */
    static async createProjectFromTemplate(projectConfig: any): Promise<FileSystemResult> {
        console.log("🔄 RendererFileSystemService.createProjectFromTemplate() 开始:", projectConfig);

        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，无法创建项目文件");
            return {
                success: false,
                error: "不在Electron环境中，无法创建项目文件",
            };
        }

        try {
            const result = await window.electronAPI!.invoke("fs:createProjectFromTemplate", projectConfig);
            console.log("✅ RendererFileSystemService.createProjectFromTemplate() 成功:", result);
            return result;
        } catch (error) {
            console.error("❌ RendererFileSystemService.createProjectFromTemplate() 失败:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "创建项目模板失败",
            };
        }
    }

    /**
     * 获取项目包信息
     */
    static async getProjectPackageInfo(projectPath: string): Promise<FileSystemResult> {
        console.log("🔄 RendererFileSystemService.getProjectPackageInfo() 开始:", projectPath);

        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，无法获取项目包信息");
            return {
                success: false,
                error: "不在Electron环境中，无法获取项目包信息",
            };
        }

        try {
            const result = await window.electronAPI!.invoke("project:getPackageInfo", projectPath);
            console.log("✅ RendererFileSystemService.getProjectPackageInfo() 成功:", result);
            return result;
        } catch (error) {
            console.error("❌ RendererFileSystemService.getProjectPackageInfo() 失败:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "获取项目包信息失败",
            };
        }
    }

    /**
     * 安装项目依赖
     */
    static async installProjectDependencies(projectPath: string): Promise<FileSystemResult> {
        console.log("🔄 RendererFileSystemService.installProjectDependencies() 开始:", projectPath);

        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，无法安装项目依赖");
            return {
                success: false,
                error: "不在Electron环境中，无法安装项目依赖",
            };
        }

        try {
            const result = await window.electronAPI!.invoke("project:installDependencies", projectPath);
            console.log("✅ RendererFileSystemService.installProjectDependencies() 成功:", result);
            return result;
        } catch (error) {
            console.error("❌ RendererFileSystemService.installProjectDependencies() 失败:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "安装项目依赖失败",
            };
        }
    }

    /**
     * 安装特定的项目依赖包
     */
    static async installSpecificPackages(projectPath: string, packages: string[]): Promise<FileSystemResult> {
        console.log("🔄 RendererFileSystemService.installSpecificPackages() 开始:", projectPath, packages);

        if (!this.isElectron()) {
            console.warn("⚠️ 不在Electron环境中，无法安装特定依赖包");
            return {
                success: false,
                error: "不在Electron环境中，无法安装特定依赖包",
            };
        }

        try {
            const result = await window.electronAPI!.invoke("project:installSpecificPackages", projectPath, packages);
            console.log("✅ RendererFileSystemService.installSpecificPackages() 成功:", result);
            return result;
        } catch (error) {
            console.error("❌ RendererFileSystemService.installSpecificPackages() 失败:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "安装特定依赖包失败",
            };
        }
    }

    /**
     * 创建基础的 package.json 文件
     */
    static async createPackageJson(projectPath: string, projectName?: string) {
        console.log("🔄 RendererFileSystemService.createPackageJson() 开始:", projectPath, projectName);

        // 移除重复的环境检查日志，使用私有方法
        if (!this.isElectron()) {
            return { success: false, error: "非 Electron 环境" };
        }

        try {
            const result = await window.electronAPI!.invoke("project:createPackageJson", projectPath, projectName);
            console.log("✅ RendererFileSystemService.createPackageJson() 成功:", result);
            return result;
        } catch (error) {
            console.error("❌ RendererFileSystemService.createPackageJson() 失败:", error);
            return { success: false, error: "创建 package.json 失败" };
        }
    }
}
