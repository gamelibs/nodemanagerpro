import { PortDetectionService } from './PortDetectionService';

/**
 * 项目配置分析服务 - 分析项目配置完整性，不自动创建文件
 */
export class ProjectConfigAnalysisService {
    /**
     * 分析项目配置完整性状态
     */
    static async analyzeProjectConfiguration(projectPath: string): Promise<{
        success: boolean;
        configStatus: 'complete' | 'incomplete' | 'missing';
        analysis: {
            hasPackageJson: boolean;
            hasStartScript: boolean;
            hasEnvFile: boolean;
            hasPortConfig: boolean;
            hasMainFile: boolean;
            portInfo?: {
                detectedPorts: number[];
                defaultPort?: number;
                sources: string[];
            };
            mainFileInfo?: {
                detected: string[];
                recommended: string;
            };
            missingConfigs: string[];
            recommendations: string[];
        };
        error?: string;
    }> {
        try {
            console.log("🔍 开始分析项目配置，路径:", projectPath);
            
            const analysis = {
                hasPackageJson: false,
                hasStartScript: false,
                hasEnvFile: false,
                hasPortConfig: false,
                hasMainFile: false,
                portInfo: undefined as {
                    detectedPorts: number[];
                    defaultPort?: number;
                    sources: string[];
                } | undefined,
                mainFileInfo: undefined as {
                    detected: string[];
                    recommended: string;
                } | undefined,
                missingConfigs: [] as string[],
                recommendations: [] as string[]
            };

            // 1. 检查 package.json
            const packageJsonResult = await this.checkPackageJson(projectPath);
            analysis.hasPackageJson = packageJsonResult.exists;
            analysis.hasStartScript = packageJsonResult.hasStartScript;

            if (!analysis.hasPackageJson) {
                analysis.missingConfigs.push("package.json");
                analysis.recommendations.push("需要创建 package.json 文件");
            } else if (!analysis.hasStartScript) {
                analysis.missingConfigs.push("启动脚本");
                analysis.recommendations.push("在 package.json 中添加 start 或 dev 脚本");
            }

            // 2. 检查 .env 文件
            const envResult = await this.checkEnvFile(projectPath);
            analysis.hasEnvFile = envResult.exists;
            
            if (!analysis.hasEnvFile) {
                analysis.missingConfigs.push(".env 文件");
                analysis.recommendations.push("创建 .env 文件配置环境变量");
            }

            // 3. 检查端口配置
            const portResult = await PortDetectionService.detectProjectPorts(projectPath);
            analysis.hasPortConfig = portResult.hasPortConfig;
            
            if (portResult.hasPortConfig) {
                analysis.portInfo = {
                    detectedPorts: portResult.configuredPorts,
                    defaultPort: portResult.defaultPort,
                    sources: portResult.detectedSources.map(s => `${s.source}(${s.file})`)
                };
            } else {
                analysis.missingConfigs.push("端口配置");
                analysis.recommendations.push("配置项目运行端口");
            }

            // 4. 检查主文件
            const mainFileResult = await this.checkMainFiles(projectPath);
            analysis.hasMainFile = mainFileResult.hasMain;
            
            if (mainFileResult.hasMain) {
                analysis.mainFileInfo = {
                    detected: mainFileResult.detected,
                    recommended: mainFileResult.recommended
                };
            } else {
                analysis.missingConfigs.push("主入口文件");
                analysis.recommendations.push("创建项目主入口文件 (如 index.js, app.js, server.js)");
            }

            // 5. 确定配置状态
            let configStatus: 'complete' | 'incomplete' | 'missing';
            
            if (analysis.hasPackageJson && analysis.hasStartScript && analysis.hasMainFile && analysis.hasPortConfig) {
                configStatus = 'complete';
            } else if (analysis.hasPackageJson || analysis.hasMainFile) {
                configStatus = 'incomplete';
            } else {
                configStatus = 'missing';
            }

            console.log("🔍 配置分析完成:", {
                configStatus,
                missingCount: analysis.missingConfigs.length,
                recommendationCount: analysis.recommendations.length
            });

            return {
                success: true,
                configStatus,
                analysis: {
                    ...analysis,
                    portInfo: analysis.portInfo,
                    mainFileInfo: analysis.mainFileInfo
                }
            };

        } catch (error) {
            console.error("❌ 配置分析失败:", error);
            return {
                success: false,
                configStatus: 'missing',
                analysis: {
                    hasPackageJson: false,
                    hasStartScript: false,
                    hasEnvFile: false,
                    hasPortConfig: false,
                    hasMainFile: false,
                    missingConfigs: [],
                    recommendations: []
                },
                error: error instanceof Error ? error.message : '配置分析失败'
            };
        }
    }

    /**
     * 检查 package.json 文件
     */
    private static async checkPackageJson(projectPath: string): Promise<{
        exists: boolean;
        hasStartScript: boolean;
        scripts?: string[];
    }> {
        try {
            const packagePath = `${projectPath}/package.json`;
            const result = await window.electronAPI?.invoke("fs:readFile", packagePath);

            if (result?.success) {
                const packageJson = JSON.parse(result.content);
                const scripts = packageJson.scripts || {};
                const scriptNames = Object.keys(scripts);
                
                // 检查是否有启动脚本
                const hasStartScript = scriptNames.some(script => 
                    ['start', 'dev', 'serve', 'run'].includes(script)
                );

                return {
                    exists: true,
                    hasStartScript,
                    scripts: scriptNames
                };
            }
        } catch (error) {
            console.log("📄 package.json 不存在或解析失败");
        }

        return {
            exists: false,
            hasStartScript: false
        };
    }

    /**
     * 检查 .env 文件
     */
    private static async checkEnvFile(projectPath: string): Promise<{
        exists: boolean;
        hasPortConfig?: boolean;
    }> {
        const envFiles = [".env", ".env.local", ".env.development"];
        
        for (const envFile of envFiles) {
            try {
                const envPath = `${projectPath}/${envFile}`;
                const result = await window.electronAPI?.invoke("fs:readFile", envPath);

                if (result?.success) {
                    const hasPortConfig = /PORT\s*=/.test(result.content);
                    return {
                        exists: true,
                        hasPortConfig
                    };
                }
            } catch (error) {
                // 继续检查下一个文件
            }
        }

        return { exists: false };
    }

    /**
     * 检查主入口文件
     */
    private static async checkMainFiles(projectPath: string): Promise<{
        hasMain: boolean;
        detected: string[];
        recommended: string;
    }> {
        const possibleFiles = [
            'index.js', 'app.js', 'server.js', 'main.js',
            'index.ts', 'app.ts', 'server.ts', 'main.ts',
            'src/index.js', 'src/app.js', 'src/server.js', 'src/main.js',
            'src/index.ts', 'src/app.ts', 'src/server.ts', 'src/main.ts'
        ];

        const detected: string[] = [];

        for (const file of possibleFiles) {
            try {
                const filePath = `${projectPath}/${file}`;
                const result = await window.electronAPI?.invoke("fs:readFile", filePath);
                
                if (result?.success) {
                    detected.push(file);
                }
            } catch (error) {
                // 文件不存在，继续检查
            }
        }

        // 推荐文件优先级
        const recommended = detected.find(file => 
            ['index.js', 'app.js', 'server.js', 'src/index.js'].includes(file)
        ) || 'index.js';

        return {
            hasMain: detected.length > 0,
            detected,
            recommended
        };
    }

    /**
     * 生成配置建议
     */
    static generateConfigurationSuggestions(analysis: any): {
        priority: 'high' | 'medium' | 'low';
        suggestions: Array<{
            type: 'create' | 'edit' | 'configure';
            target: string;
            description: string;
            example?: string;
        }>;
    } {
        const suggestions: Array<{
            type: 'create' | 'edit' | 'configure';
            target: string;
            description: string;
            example?: string;
        }> = [];

        // 根据缺失的配置生成建议
        if (!analysis.hasPackageJson) {
            suggestions.push({
                type: 'create',
                target: 'package.json',
                description: '创建项目基础配置文件',
                example: '{"name": "my-project", "scripts": {"start": "node index.js"}}'
            });
        }

        if (!analysis.hasMainFile) {
            suggestions.push({
                type: 'create',
                target: analysis.mainFileInfo?.recommended || 'index.js',
                description: '创建项目主入口文件',
                example: 'console.log("Hello World!");'
            });
        }

        if (!analysis.hasEnvFile) {
            suggestions.push({
                type: 'create',
                target: '.env',
                description: '创建环境变量配置文件',
                example: 'PORT=3000\nNODE_ENV=development'
            });
        }

        if (!analysis.hasStartScript && analysis.hasPackageJson) {
            suggestions.push({
                type: 'edit',
                target: 'package.json',
                description: '添加启动脚本到 package.json',
                example: '"scripts": {"start": "node index.js", "dev": "nodemon index.js"}'
            });
        }

        // 确定优先级
        const priority = suggestions.length === 0 ? 'low' : 
                        suggestions.length <= 2 ? 'medium' : 'high';

        return { priority, suggestions };
    }
}
