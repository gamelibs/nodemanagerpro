export class DefaultProjectSetupService {
    /**
     * 为缺少启动配置的项目创建默认配置
     */
    static async createDefaultProjectSetup(projectPath: string): Promise<{
        success: boolean;
        created: {
            serverJs: boolean;
            packageJsonScripts: boolean;
            envFile: boolean;
        };
        error?: string;
    }> {
        try {
            console.log("🔧 开始创建默认项目配置，路径:", projectPath);
            
            const created = {
                serverJs: false,
                packageJsonScripts: false,
                envFile: false,
            };

            // 1. 创建默认的 server.js 文件
            console.log("📝 步骤1: 创建 server.js 文件");
            const serverJsResult = await this.createDefaultServerJs(projectPath);
            created.serverJs = serverJsResult.success;
            console.log("📝 server.js 创建结果:", serverJsResult);

            // 2. 更新 package.json 添加启动脚本
            console.log("📝 步骤2: 更新 package.json 脚本");
            const packageJsonResult = await this.updatePackageJsonScripts(projectPath);
            created.packageJsonScripts = packageJsonResult.success;
            console.log("📝 package.json 更新结果:", packageJsonResult);

            // 3. 创建 .env 文件设置默认端口
            console.log("📝 步骤3: 创建 .env 文件");
            const envFileResult = await this.createDefaultEnvFile(projectPath);
            created.envFile = envFileResult.success;
            console.log("📝 .env 文件创建结果:", envFileResult);

            const allSuccess = created.serverJs && created.packageJsonScripts && created.envFile;
            
            console.log("🔧 默认配置创建完成，汇总:", {
                success: allSuccess,
                created,
                serverJs: serverJsResult.success ? "✅" : "❌",
                packageJson: packageJsonResult.success ? "✅" : "❌", 
                envFile: envFileResult.success ? "✅" : "❌"
            });

            return {
                success: allSuccess,
                created,
            };
        } catch (error) {
            console.error("❌ 创建默认配置异常:", error);
            return {
                success: false,
                created: { serverJs: false, packageJsonScripts: false, envFile: false },
                error: error instanceof Error ? error.message : "创建默认配置时发生错误",
            };
        }
    }

    /**
     * 创建默认的 server.js 文件
     */
    private static async createDefaultServerJs(projectPath: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const serverJsPath = `${projectPath}/server.js`;
            
            console.log("🔧 开始创建 server.js 文件:", serverJsPath);

            // 检查 server.js 是否已存在
            console.log("🔍 检查 server.js 文件是否存在");
            const existsResult = await window.electronAPI?.invoke("fs:exists", serverJsPath);
            if (existsResult?.exists) {
                console.log("✅ server.js 已存在，跳过创建");
                return { success: true }; // 已存在，跳过创建
            }

            console.log("📝 创建新的 server.js 文件");
            const serverJsContent = `const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// 从环境变量获取端口，默认为 2222
const PORT = process.env.PORT || 2222;
const IP = "0.0.0.0";
const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

// 设置静态文件目录，允许访问当前目录下的所有资源
app.use(express.static(path.join(__dirname, './')));

// 默认路由
app.get('/', (req, res) => {
    res.send(\`
        <h1>🚀 项目已启动</h1>
        <p>服务器运行在端口: \${PORT}</p>
        <p>请修改 server.js 文件来添加你的业务逻辑</p>
        <p>修改 .env 文件来设置自定义端口</p>
    \`);
});

// 启动服务器，监听指定端口
app.listen(PORT, IP, () => {
    console.log(\`🚀 Server is running on http://localhost:\${PORT}\`);
    console.log(\`📝 请编辑 server.js 文件来添加你的业务逻辑\`);
    console.log(\`🔧 请编辑 .env 文件来修改端口配置\`);
});
`;

            console.log("💾 保存 server.js 文件");
            const writeResult = await window.electronAPI?.invoke("fs:writeFile", serverJsPath, serverJsContent);

            if (!writeResult?.success) {
                console.error("❌ 无法创建 server.js 文件");
                return { success: false, error: "无法创建 server.js 文件" };
            }

            console.log("✅ server.js 文件创建成功");
            return { success: true };
        } catch (error) {
            console.error("❌ 创建 server.js 异常:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "创建 server.js 时发生错误",
            };
        }
    }

    /**
     * 更新 package.json 添加启动脚本
     */
    private static async updatePackageJsonScripts(projectPath: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const packageJsonPath = `${projectPath}/package.json`;
            console.log("🔧 开始更新 package.json 脚本:", packageJsonPath);

            // 读取现有的 package.json
            console.log("📖 读取现有 package.json 文件");
            const packageResult = await window.electronAPI?.invoke("fs:readFile", packageJsonPath);
            if (!packageResult?.success) {
                console.error("❌ 无法读取 package.json 文件");
                return { success: false, error: "无法读取 package.json 文件" };
            }

            let packageJson;
            try {
                packageJson = JSON.parse(packageResult.content);
                console.log("✅ package.json 解析成功");
            } catch (parseError) {
                console.error("❌ package.json 解析失败:", parseError);
                return { success: false, error: "package.json 格式错误" };
            }

            // 添加或更新启动脚本
            if (!packageJson.scripts) {
                console.log("📝 创建 scripts 字段");
                packageJson.scripts = {};
            } else {
                console.log("✅ scripts 字段已存在");
            }

            let hasChanges = false;

            // 只有在没有 start 脚本时才添加
            if (!packageJson.scripts.start) {
                console.log("📝 添加 start 脚本: node server.js");
                packageJson.scripts.start = "node server.js";
                hasChanges = true;
            } else {
                console.log("✅ start 脚本已存在:", packageJson.scripts.start);
            }

            // 添加开发脚本
            if (!packageJson.scripts.dev) {
                console.log("📝 添加 dev 脚本: node server.js");
                packageJson.scripts.dev = "node server.js";
                hasChanges = true;
            } else {
                console.log("✅ dev 脚本已存在:", packageJson.scripts.dev);
            }

            if (!hasChanges) {
                console.log("ℹ️ package.json 无需更新，脚本已完整");
                return { success: true };
            }

            // 写回文件
            console.log("💾 保存更新后的 package.json");
            const writeResult = await window.electronAPI?.invoke("fs:writeFile", packageJsonPath, JSON.stringify(packageJson, null, 2));

            if (!writeResult?.success) {
                console.error("❌ 无法保存 package.json 文件");
                return { success: false, error: "无法更新 package.json 文件" };
            }

            console.log("✅ package.json 脚本更新成功");
            return { success: true };
        } catch (error) {
            console.error("❌ 更新 package.json 异常:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "更新 package.json 时发生错误",
            };
        }
    }

    /**
     * 创建默认的 .env 文件
     */
    private static async createDefaultEnvFile(projectPath: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const envPath = `${projectPath}/.env`;
            console.log("🔧 开始创建 .env 文件:", envPath);

            // 检查 .env 是否已存在
            console.log("🔍 检查 .env 文件是否存在");
            const existsResult = await window.electronAPI?.invoke("fs:exists", envPath);
            if (existsResult?.exists) {
                console.log("✅ .env 文件已存在，检查 PORT 配置");
                // 如果已存在，检查是否有 PORT 配置
                const envResult = await window.electronAPI?.invoke("fs:readFile", envPath);
                if (envResult?.success && envResult.content.includes("PORT=")) {
                    console.log("✅ .env 文件已包含 PORT 配置，跳过创建");
                    return { success: true }; // 已有端口配置，跳过
                }

                // 如果没有 PORT 配置，追加到文件末尾
                console.log("📝 .env 文件缺少 PORT 配置，追加端口设置");
                const newContent = envResult.content + "\n# 默认端口配置\nPORT=2222\n";
                const writeResult = await window.electronAPI?.invoke("fs:writeFile", envPath, newContent);
                
                if (writeResult?.success) {
                    console.log("✅ 成功向 .env 文件追加 PORT 配置");
                } else {
                    console.error("❌ 无法向 .env 文件追加 PORT 配置");
                }
                
                return { success: writeResult?.success || false };
            }

            // 创建新的 .env 文件
            console.log("📝 创建新的 .env 文件");
            const envContent = `# 环境变量配置
# 服务器端口
PORT=2222

# 环境模式
NODE_ENV=development

# 请根据需要修改上述配置
`;

            const writeResult = await window.electronAPI?.invoke("fs:writeFile", envPath, envContent);

            if (!writeResult?.success) {
                console.error("❌ 无法创建 .env 文件");
                return { success: false, error: "无法创建 .env 文件" };
            }

            console.log("✅ .env 文件创建成功");
            return { success: true };
        } catch (error) {
            console.error("❌ 创建 .env 文件异常:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "创建 .env 文件时发生错误",
            };
        }
    }

    /**
     * 检查项目是否需要创建默认配置
     */
    static async needsDefaultSetup(projectPath: string): Promise<{
        needsSetup: boolean;
        missingFiles: string[];
        packageJsonHasStartScript: boolean;
    }> {
        try {
            console.log("🔍 检查项目是否需要默认配置:", projectPath);
            const missingFiles: string[] = [];
            let packageJsonHasStartScript = false;

            // 检查 package.json 中的启动脚本
            const packageJsonPath = `${projectPath}/package.json`;
            console.log("📖 检查 package.json 启动脚本");
            const packageResult = await window.electronAPI?.invoke("fs:readFile", packageJsonPath);

            if (packageResult?.success) {
                try {
                    const packageJson = JSON.parse(packageResult.content);
                    packageJsonHasStartScript = !!(packageJson.scripts && packageJson.scripts.start);
                    console.log("✅ package.json 解析成功，start脚本:", packageJsonHasStartScript ? "存在" : "缺失");
                } catch (parseError) {
                    console.error("❌ package.json 解析失败:", parseError);
                    packageJsonHasStartScript = false;
                }
            } else {
                console.error("❌ 无法读取 package.json");
            }

            // 检查关键文件
            const filesToCheck = [
                { file: "server.js", name: "server.js" },
                { file: ".env", name: ".env" },
            ];

            console.log("🔍 检查关键文件:");
            for (const { file, name } of filesToCheck) {
                const filePath = `${projectPath}/${file}`;
                const existsResult = await window.electronAPI?.invoke("fs:exists", filePath);
                if (!existsResult?.exists) {
                    console.log(`❌ 缺失文件: ${name}`);
                    missingFiles.push(name);
                } else {
                    console.log(`✅ 文件存在: ${name}`);
                }
            }

            // 如果没有启动脚本或缺少关键文件，则需要设置
            const needsSetup = !packageJsonHasStartScript || missingFiles.length > 0;
            
            console.log("🔍 默认配置检查结果:", {
                needsSetup,
                packageJsonHasStartScript,
                missingFiles,
                summary: needsSetup ? "需要创建默认配置" : "无需创建默认配置"
            });

            return {
                needsSetup,
                missingFiles,
                packageJsonHasStartScript,
            };
        } catch (error) {
            console.error("❌ 检查默认配置需求异常:", error);
            return {
                needsSetup: true,
                missingFiles: ["检测失败"],
                packageJsonHasStartScript: false,
            };
        }
    }
}
