import { PortDetectionService } from "./PortDetectionService";

export class ProjectPortManager {
    /**
     * 项目导入时的端口冲突处理
     */
    static async handleProjectImportWithPortCheck(projects: Project[]): Promise<{
        success: boolean;
        conflicts: Array<{
            port: number;
            projects: string[];
            suggestedActions: string[];
        }>;
        warnings: string[];
    }> {
        console.log('🔍 开始检测项目端口冲突...');

        // 为每个项目检测端口
        const projectsWithPorts = await Promise.all(
            projects.map(async (project) => {
                const portInfo = await PortDetectionService.detectProjectPorts(project.path);
                return {
                    ...project,
                    detectedPorts: portInfo.configuredPorts,
                    defaultPort: portInfo.defaultPort,
                    portSources: portInfo.detectedSources
                };
            })
        );

        // 检测冲突
        const conflictResult = await PortDetectionService.detectPortConflicts(projectsWithPorts);

        // 生成解决建议
        const conflictsWithSuggestions = conflictResult.conflicts.map(conflict => ({
            port: conflict.port,
            projects: conflict.projects.map(p => p.name),
            suggestedActions: this.generateConflictResolutionSuggestions(conflict)
        }));

        return {
            success: conflictResult.conflicts.length === 0,
            conflicts: conflictsWithSuggestions,
            warnings: conflictResult.warnings
        };
    }

    /**
     * 生成冲突解决建议
     */
    private static generateConflictResolutionSuggestions(conflict: {
        port: number;
        projects: Array<{id: string; name: string; path: string}>;
    }): string[] {
        const suggestions = [
            `将其中 ${conflict.projects.length - 1} 个项目的端口修改为其他可用端口`,
            `使用环境变量区分不同环境的端口配置`,
            `为项目添加端口自动分配机制`
        ];

        // 根据端口类型添加特定建议
        if (conflict.port === 3000) {
            suggestions.push('建议将 React/Vue 开发项目端口改为 3001, 3002 等');
        } else if (conflict.port === 8080) {
            suggestions.push('建议将后端服务端口改为 8081, 8082 等');
        }

        return suggestions;
    }

    /**
     * 自动解决端口冲突
     */
    static async autoResolvePortConflicts(
        conflicts: Array<{
            port: number;
            projects: Array<{id: string; name: string; path: string}>;
        }>
    ): Promise<{
        resolved: Array<{
            projectId: string;
            oldPort: number;
            newPort: number;
        }>;
        failed: Array<{
            projectId: string;
            reason: string;
        }>;
    }> {
        const resolved = [];
        const failed = [];

        for (const conflict of conflicts) {
            // 为除第一个项目外的其他项目分配新端口
            const projectsToUpdate = conflict.projects.slice(1);
            
            for (const project of projectsToUpdate) {
                try {
                    const newPort = await this.findAvailablePort(conflict.port + 1);
                    
                    if (newPort) {
                        const updateResult = await this.updateProjectPort(project.path, newPort);
                        
                        if (updateResult.success) {
                            resolved.push({
                                projectId: project.id,
                                oldPort: conflict.port,
                                newPort
                            });
                        } else {
                            failed.push({
                                projectId: project.id,
                                reason: updateResult.error || '更新端口失败'
                            });
                        }
                    } else {
                        failed.push({
                            projectId: project.id,
                            reason: '未找到可用端口'
                        });
                    }
                } catch (error) {
                    failed.push({
                        projectId: project.id,
                        reason: error instanceof Error ? error.message : '未知错误'
                    });
                }
            }
        }

        return { resolved, failed };
    }

    /**
     * 寻找可用端口
     */
    private static async findAvailablePort(startPort: number): Promise<number | null> {
        for (let port = startPort; port < startPort + 100; port++) {
            const availability = await PortDetectionService.checkPortAvailability(port);
            if (availability.available) {
                return port;
            }
        }
        return null;
    }

    /**
     * 更新项目端口配置
     */
    private static async updateProjectPort(projectPath: string, newPort: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // 1. 更新 .env 文件
            const envPath = `${projectPath}/.env`;
            let envContent = '';

            try {
                const result = await window.electronAPI?.invoke("fs:readFile", envPath);
                if (result?.success) {
                    envContent = result.content;
                }
            } catch (e) {
                // .env 文件不存在，创建新的
            }

            // 更新或添加 PORT 配置
            if (envContent.includes('PORT=')) {
                envContent = envContent.replace(/PORT\s*=\s*\d+/, `PORT=${newPort}`);
            } else {
                envContent += `${envContent ? '\n' : ''}PORT=${newPort}\n`;
            }

            // 写入 .env 文件
            const writeResult = await window.electronAPI?.invoke("fs:writeFile", envPath, envContent);

            if (writeResult?.success) {
                console.log(`✅ 项目端口已更新为 ${newPort}: ${projectPath}`);
                return { success: true };
            } else {
                return { success: false, error: writeResult?.error || '写入文件失败' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    }
}