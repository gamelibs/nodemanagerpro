export class PortDetectionService {
    /**
     * 多源端口检测 - 检测项目可能使用的所有端口
     */
    /**
     * 多源端口检测 - 检测项目可能使用的所有端口
     */
    static async detectProjectPorts(projectPath: string): Promise<{
        configuredPorts: number[];
        detectedSources: Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>;
        defaultPort?: number;
        hasPortConfig: boolean;
        // 🔧 新增：Vite 项目冲突检测
        viteConfigConflict?: {
            vitePort: number;
            envPort: number;
            hasConflict: boolean;
        };
    }> {
        const detectedSources: Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }> = [];

        // 1. 检测 .env 文件
        const envPorts = await this.checkEnvFiles(projectPath);
        detectedSources.push(...envPorts);

        // 2. 检测 package.json scripts
        const packagePorts = await this.checkPackageJson(projectPath);
        detectedSources.push(...packagePorts);

        // 3. 检测主要代码文件
        const codePorts = await this.checkSourceCode(projectPath);
        detectedSources.push(...codePorts);

        // 4. 检测配置文件
        const configPorts = await this.checkConfigFiles(projectPath);
        detectedSources.push(...configPorts);

        // 去重并排序
        const allPorts = [...new Set(detectedSources.map((s) => s.port))];

        // 🔧 检测 Vite 项目配置冲突
        const viteSource = detectedSources.find((s) => s.source === "vite-config");
        const envSource = detectedSources.find((s) => s.source === "env");

        let viteConfigConflict;
        if (viteSource && envSource && viteSource.port !== envSource.port) {
            viteConfigConflict = {
                vitePort: viteSource.port,
                envPort: envSource.port,
                hasConflict: true,
            };
        }

        // 确定默认端口（优先级：Vite 配置 > .env > package.json > 配置文件 > 代码）
        const defaultPort = this.determineDefaultPort(detectedSources);

        return {
            configuredPorts: allPorts,
            detectedSources,
            defaultPort,
            hasPortConfig: allPorts.length > 0,
            viteConfigConflict,
        };
    }

    /**
     * 检测 .env 相关文件
     */
    private static async checkEnvFiles(projectPath: string): Promise<
        Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>
    > {
        const envFiles = [".env", ".env.local", ".env.development", ".env.production"];
        const results = [];

        for (const envFile of envFiles) {
            try {
                const filePath = `${projectPath}/${envFile}`;
                const result = await window.electronAPI?.invoke("fs:readFile", filePath);

                if (result?.success) {
                    const content = result.content;
                    // 匹配 PORT=3000 或 PORT = 3000
                    const portMatch = content.match(/PORT\s*=\s*(\d+)/);

                    if (portMatch) {
                        results.push({
                            source: "env",
                            port: parseInt(portMatch[1]),
                            file: envFile,
                            confidence: "high" as const,
                        });
                    }
                }
            } catch (error) {
                // 文件不存在，继续检测其他文件
            }
        }

        return results;
    }

    /**
     * 检测 package.json 中的端口配置
     */
    private static async checkPackageJson(projectPath: string): Promise<
        Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>
    > {
        try {
            const packagePath = `${projectPath}/package.json`;
            const result = await window.electronAPI?.invoke("fs:readFile", packagePath);

            if (result?.success) {
                const packageJson = JSON.parse(result.content);
                const results = [];

                // 检测 scripts 中的端口
                if (packageJson.scripts) {
                    for (const [scriptName, script] of Object.entries(packageJson.scripts)) {
                        // 匹配 --port=3000, --port 3000, -p 3000, -p=3000
                        const portMatch = (script as string).match(/(?:--port[=\s]+|--port:|port:|--p[=\s]+|--p:)(\d+)/);
                        if (portMatch) {
                            results.push({
                                source: "package.json",
                                port: parseInt(portMatch[1]),
                                file: `package.json (script: ${scriptName})`,
                                confidence: "medium" as const,
                            });
                        }
                    }
                }

                return results;
            }
        } catch (error) {
            console.error("检测 package.json 端口失败:", error);
        }

        return [];
    }

    /**
     * 检测源代码中的端口配置
     */
    private static async checkSourceCode(projectPath: string): Promise<
        Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>
    > {
        const codeFiles = ["index.js", "app.js", "server.js", "main.js", "src/index.js", "src/app.js", "src/server.js", "src/main.js", "src/server.ts", "src/app.ts"];
        const results = [];

        for (const codeFile of codeFiles) {
            try {
                const filePath = `${projectPath}/${codeFile}`;
                const result = await window.electronAPI?.invoke("fs:readFile", filePath);

                if (result?.success) {
                    const content = result.content;

                    // 检测常见的端口配置模式
                    const patterns = [
                        /\.listen\(\s*(\d+)/g, // app.listen(3000)
                        /port\s*[=:]\s*(\d+)/gi, // port = 3000, port: 3000
                        /PORT\s*\|\|\s*(\d+)/g, // process.env.PORT || 3000
                        /listen.*?(\d{4,5})/g, // 其他 listen 模式
                    ];

                    for (const pattern of patterns) {
                        let match;
                        while ((match = pattern.exec(content)) !== null) {
                            const port = parseInt(match[1]);
                            if (port > 1000 && port < 65536) {
                                // 有效端口范围
                                results.push({
                                    source: "code",
                                    port,
                                    file: codeFile,
                                    confidence: "low" as const,
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                // 文件不存在，继续检测其他文件
            }
        }

        return results;
    }

    /**
     * 检测配置文件中的端口 - 增强 Vite 支持
     */
    private static async checkConfigFiles(projectPath: string): Promise<
        Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>
    > {
        const configFiles = [
            { file: "vite.config.js", priority: "high" },
            { file: "vite.config.ts", priority: "high" },
            { file: "next.config.js", priority: "high" },
            { file: "vue.config.js", priority: "medium" },
            { file: "webpack.config.js", priority: "medium" },
            { file: "nuxt.config.js", priority: "medium" },
        ];

        const results = [];

        for (const configFile of configFiles) {
            try {
                const filePath = `${projectPath}/${configFile.file}`;
                const result = await window.electronAPI?.invoke("fs:readFile", filePath);

                if (result?.success) {
                    const content = result.content;

                    // 🔧 特殊处理 Vite 配置文件
                    if (configFile.file.includes("vite.config")) {
                        const vitePort = this.extractVitePort(content);
                        if (vitePort) {
                            results.push({
                                source: "vite-config",
                                port: vitePort,
                                file: configFile.file,
                                confidence: "high" as const,
                            });
                        }
                    } else {
                        // 通用配置文件端口检测
                        const portMatch = content.match(/port\s*[:=]\s*(\d+)/i);
                        if (portMatch) {
                            results.push({
                                source: "config",
                                port: parseInt(portMatch[1]),
                                file: configFile.file,
                                confidence: configFile.priority as "high" | "medium",
                            });
                        }
                    }
                }
            } catch (error) {
                // 文件不存在，继续检测其他文件
            }
        }

        return results;
    }

    /**
     * 专门提取 Vite 配置中的端口
     */
    private static extractVitePort(content: string): number | null {
        // 匹配 server.port 配置
        const patterns = [
            /server\s*:\s*{[^}]*port\s*:\s*(\d+)/s, // server: { port: 5173 }
            /port\s*:\s*(\d+)/, // 简单的 port: 5173
            /server\.port\s*=\s*(\d+)/, // server.port = 5173
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                const port = parseInt(match[1]);
                if (port > 1000 && port < 65536) {
                    return port;
                }
            }
        }

        return null;
    }

    /**
     * 🔧 增强确定默认端口的逻辑 - Vite 配置优先级最高
     */
    private static determineDefaultPort(
        detectedSources: Array<{
            source: string;
            port: number;
            file: string;
            confidence: "high" | "medium" | "low";
        }>
    ): number | undefined {
        // 🔧 特殊处理：如果是 Vite 项目，Vite 配置优先级最高
        const viteSource = detectedSources.find((s) => s.source === "vite-config");
        if (viteSource) {
            return viteSource.port;
        }

        // 原有的优先级逻辑
        const priorityOrder = ["high", "medium", "low"];

        for (const priority of priorityOrder) {
            const source = detectedSources.find((s) => s.confidence === priority);
            if (source) {
                return source.port;
            }
        }

        return undefined;
    }

    /**
     * 检测端口冲突（仅检测，不解决）
     */
    static checkPortConflictsWithExisting(
        newProjectPorts: number[],
        existingProjects: Array<{ id: string; name: string; port?: number }>
    ): Array<{
        port: number;
        conflictingProjects: Array<{ id: string; name: string }>;
    }> {
        const conflicts = [];

        for (const newPort of newProjectPorts) {
            const conflictingProjects = existingProjects.filter((p) => p.port === newPort);

            if (conflictingProjects.length > 0) {
                conflicts.push({
                    port: newPort,
                    conflictingProjects: conflictingProjects.map((p) => ({ id: p.id, name: p.name })),
                });
            }
        }

        return conflicts;
    }

    /**
     * 检查端口是否可用
     */
    static async checkPortAvailability(port: number): Promise<{
        available: boolean;
        occupiedBy?: string;
        error?: string;
    }> {
        try {
            if (!window.electronAPI) {
                return { 
                    available: false, 
                    error: '不在 Electron 环境中' 
                };
            }

            const result = await window.electronAPI.invoke('port:check', port);
            
            return {
                available: result.available,
                occupiedBy: result.occupiedBy,
                error: result.error
            };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : '检查端口时发生错误'
            };
        }
    }

    /**
     * 检测项目间端口冲突
     */
    static async detectPortConflicts(
        projects: Array<{
            id?: string;
            name: string;
            path: string;
            detectedPorts?: number[];
            defaultPort?: number;
        }>
    ): Promise<{
        conflicts: Array<{
            port: number;
            projects: Array<{ id?: string; name: string; path: string }>;
        }>;
        warnings: string[];
    }> {
        const portMap = new Map<number, Array<{ id?: string; name: string; path: string }>>();
        const warnings: string[] = [];

        // 收集所有项目的端口
        for (const project of projects) {
            const ports = project.detectedPorts || (project.defaultPort ? [project.defaultPort] : []);
            
            for (const port of ports) {
                if (!portMap.has(port)) {
                    portMap.set(port, []);
                }
                portMap.get(port)!.push({
                    id: project.id,
                    name: project.name,
                    path: project.path,
                });
            }
        }

        // 找出冲突的端口
        const conflicts = [];
        for (const [port, projectList] of portMap.entries()) {
            if (projectList.length > 1) {
                conflicts.push({
                    port,
                    projects: projectList,
                });
            }
        }

        return {
            conflicts,
            warnings,
        };
    }

    /**
     * 生成端口冲突警告消息
     */
    static generateConflictWarningMessage(
        conflicts: Array<{
            port: number;
            projects: Array<{ id?: string; name: string; path: string }>;
        }>,
        viteConfigConflict?: {
            vitePort: number;
            envPort: number;
            hasConflict: boolean;
        }
    ): {
        title: string;
        message: string;
        suggestions: string[];
    } {
        let message = "";
        const suggestions: string[] = [];

        if (conflicts.length > 0) {
            message += `发现 ${conflicts.length} 个端口冲突：\n\n`;
            
            for (const conflict of conflicts) {
                const projectNames = conflict.projects.map(p => p.name).join("、");
                message += `🔥 端口 ${conflict.port}：${projectNames}\n`;
            }

            suggestions.push("修改项目的 .env 文件中的 PORT 值");
            suggestions.push("使用不同的端口号避免冲突");
            suggestions.push("考虑使用端口自动分配机制");
        }

        if (viteConfigConflict?.hasConflict) {
            message += `\n⚠️ Vite 配置冲突：\n`;
            message += `Vite 配置端口: ${viteConfigConflict.vitePort}\n`;
            message += `.env 文件端口: ${viteConfigConflict.envPort}\n`;
            message += `Vite 配置将覆盖 .env 设置！`;

            suggestions.push("统一 vite.config.js 和 .env 文件中的端口设置");
            suggestions.push("删除其中一个配置，避免冲突");
        }

        return {
            title: "端口配置冲突检测",
            message: message.trim(),
            suggestions,
        };
    }
}
