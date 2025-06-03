import { PM2Service } from "./PM2Service";
import type { CoreProject, Project } from "../types";

// 项目状态查询结果接口
export interface ProjectStatusResult {
    projectId: string;
    projectName: string;
    processName: string;
    success: boolean;
    pm2Status?: string;
    mappedStatus: Project["status"];
    processId?: number;
    error?: string;
    queryMethod: "describe" | "list";
}

// 批量状态查询结果
export interface BatchStatusResult {
    results: ProjectStatusResult[];
    summary: {
        total: number;
        successful: number;
        failed: number;
        running: number;
        stopped: number;
        error: number;
    };
}

/**
 * 统一的项目状态查询服务
 * 封装自动同步、手动同步、项目详情的共同状态查询逻辑
 */
export class ProjectStatusService {
    /**
     * 核心状态映射逻辑 - 统一的PM2状态到应用状态的映射
     */
    static mapPM2StatusToProjectStatus(pm2Status: string | undefined | null): Project["status"] {
        if (!pm2Status) return "stopped";

        switch (pm2Status.toLowerCase()) {
            case "online":
                return "running";
            case "stopped":
                return "stopped";
            case "error":
            case "errored":
                return "error";
            case "stopping":
            case "launching":
                return "stopped"; // 过渡状态视为停止
            default:
                return "stopped";
        }
    }

    /**
     * 查询单个项目状态 - 统一的单项目状态查询
     */
    static async queryProjectStatus(project: CoreProject): Promise<ProjectStatusResult> {
        const processName = PM2Service.generateStableProjectId(project.name, project.path);

        console.log(`🔍 [状态查询] 项目: ${project.name}`);
        console.log(`🆔 [状态查询] 项目ID: ${project.id}`);
        console.log(`📁 [状态查询] 项目路径: ${project.path}`);
        console.log(`🎯 [状态查询] 查询进程名: ${processName}`);

        try {
            // 直接使用 PM2 describe 进行更准确的查询
            const result = await window.electronAPI?.invoke("pm2:describe", processName);

            console.log(`📡 [状态查询] PM2 describe 查询结果:`, result);

            if (result?.success && result.status) {
                // 优先使用 pm2_env.status，这是最准确的状态
                const pm2Status = result.status.pm2_env?.status || result.status.status;
                const mappedStatus = this.mapPM2StatusToProjectStatus(pm2Status);

                console.log(`✅ [状态查询] 成功查询状态: PM2原始=${pm2Status} -> 映射=${mappedStatus}`);
                console.log(`🔍 [状态查询] 详细状态信息:`, {
                    directStatus: result.status.status,
                    pm2EnvStatus: result.status.pm2_env?.status,
                    pid: result.status.pid,
                    pm_id: result.status.pm_id,
                });

                return {
                    projectId: project.id,
                    projectName: project.name,
                    processName,
                    success: true,
                    pm2Status,
                    mappedStatus,
                    processId: result.status.pid,
                    queryMethod: "describe",
                };
            } else {
                console.log(`❌ [状态查询] PM2进程不存在或查询失败`);

                return {
                    projectId: project.id,
                    projectName: project.name,
                    processName,
                    success: true, // 查询本身成功，只是进程不存在
                    mappedStatus: "stopped",
                    error: "进程不存在",
                    queryMethod: "describe",
                };
            }
        } catch (error) {
            console.error(`❌ [状态查询] 查询失败:`, error);

            return {
                projectId: project.id,
                projectName: project.name,
                processName,
                success: false,
                mappedStatus: "stopped",
                error: error instanceof Error ? error.message : "查询失败",
                queryMethod: "describe",
            };
        }
    }

    /**
     * 批量查询项目状态 - 用于自动/手动同步
     */
    static async queryMultipleProjectStatus(projects: CoreProject[]): Promise<BatchStatusResult> {
        console.log(`🔄 [批量状态查询] 开始查询 ${projects.length} 个项目的状态...`);

        const results: ProjectStatusResult[] = [];

        // 逐个查询每个项目状态
        for (const project of projects) {
            const result = await this.queryProjectStatus(project);
            results.push(result);
        }

        // 统计结果
        const summary = {
            total: results.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            running: results.filter((r) => r.mappedStatus === "running").length,
            stopped: results.filter((r) => r.mappedStatus === "stopped").length,
            error: results.filter((r) => r.mappedStatus === "error").length,
        };

        console.log(`✅ [批量状态查询] 完成，统计:`, summary);

        return {
            results,
            summary,
        };
    }

    /**
     * 选择最优查询策略 - 根据项目数量选择查询方式
     */
    private static selectQueryStrategy(projectCount: number): "batch" | "individual" {
        // 如果项目数量较少，使用独立查询
        // 如果项目数量较多，使用批量查询
        return projectCount <= 5 ? "individual" : "batch";
    }

    /**
     * 优化的批量查询 - 根据项目数量选择最优策略
     */
    static async queryMultipleProjectStatusOptimized(projects: CoreProject[]): Promise<BatchStatusResult> {
        const strategy = this.selectQueryStrategy(projects.length);

        console.log(`🎯 [优化查询] 选择查询策略: ${strategy} (项目数: ${projects.length})`);

        if (strategy === "individual") {
            // 使用独立查询
            return this.queryMultipleProjectStatus(projects);
        } else {
            // 使用批量查询 (pm2:list)
            return this.queryMultipleProjectStatusViaBatch(projects);
        }
    }

    /**
     * 通过 PM2 list 进行批量查询 - 用于大量项目
     */
    private static async queryMultipleProjectStatusViaBatch(projects: CoreProject[]): Promise<BatchStatusResult> {
        console.log(`📋 [批量查询] 通过 PM2 list 查询 ${projects.length} 个项目...`);

        try {
            // 获取所有PM2进程
            const allProcesses = await PM2Service.listAllProcesses();

            if (!allProcesses.success || !allProcesses.processes) {
                console.warn(`⚠️ [批量查询] 获取PM2进程列表失败`);
                // 降级为独立查询
                return this.queryMultipleProjectStatus(projects);
            }

            const results: ProjectStatusResult[] = [];

            // 为每个项目匹配对应的PM2进程
            for (const project of projects) {
                const processName = PM2Service.generateStableProjectId(project.name, project.path);
                const matchedProcess = allProcesses.processes.find((proc) => proc.name === processName);

                if (matchedProcess) {
                    const pm2Status = matchedProcess.pm2_env?.status;
                    const mappedStatus = this.mapPM2StatusToProjectStatus(pm2Status);

                    results.push({
                        projectId: project.id,
                        projectName: project.name,
                        processName,
                        success: true,
                        pm2Status,
                        mappedStatus,
                        processId: matchedProcess.pid,
                        queryMethod: "list",
                    });
                } else {
                    results.push({
                        projectId: project.id,
                        projectName: project.name,
                        processName,
                        success: true,
                        mappedStatus: "stopped",
                        error: "进程不存在",
                        queryMethod: "list",
                    });
                }
            }

            // 统计结果
            const summary = {
                total: results.length,
                successful: results.filter((r) => r.success).length,
                failed: results.filter((r) => !r.success).length,
                running: results.filter((r) => r.mappedStatus === "running").length,
                stopped: results.filter((r) => r.mappedStatus === "stopped").length,
                error: results.filter((r) => r.mappedStatus === "error").length,
            };

            console.log(`✅ [批量查询] 完成，统计:`, summary);

            return {
                results,
                summary,
            };
        } catch (error) {
            console.error(`❌ [批量查询] 失败，降级为独立查询:`, error);
            // 降级为独立查询
            return this.queryMultipleProjectStatus(projects);
        }
    }

    /**
     * 格式化查询结果用于日志显示
     */
    static formatQueryResultsForLog(results: ProjectStatusResult[]): string {
        return results
            .map((result, index) => {
                return `${index + 1}. 项目: ${result.projectName}
进程名: ${result.processName}
查询成功: ${result.success ? "是" : "否"}
PM2状态: ${result.pm2Status || "未找到"}
映射状态: ${result.mappedStatus}
进程ID: ${result.processId || "N/A"}
查询方式: ${result.queryMethod}
错误信息: ${result.error || "无"}`;
            })
            .join("\n\n");
    }
}
