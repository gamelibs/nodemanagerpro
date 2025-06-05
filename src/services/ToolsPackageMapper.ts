/**
 * 工具包映射服务
 * 将项目工具配置映射为具体的NPM包依赖
 */
export interface ToolPackageMapping {
  dependencies: string[];     // 生产依赖
  devDependencies: string[];  // 开发依赖
  scripts: Record<string, string>; // package.json 脚本
  configFiles: Array<{        // 配置文件
    name: string;
    content: string;
  }>;
}

export interface ToolsMapping {
  [toolName: string]: ToolPackageMapping;
}

export class ToolsPackageMapper {
  /**
   * 获取工具包映射配置
   */
  static getToolsMapping(): ToolsMapping {
    return {
      eslint: {
        dependencies: [],
        devDependencies: [
          'eslint@^8.57.0',
          '@typescript-eslint/eslint-plugin@^6.9.0',
          '@typescript-eslint/parser@^6.9.0'
        ],
        scripts: {
          'lint': 'eslint . --ext .ts,.tsx --fix',
          'lint:check': 'eslint . --ext .ts,.tsx'
        },
        configFiles: [
          {
            name: '.eslintrc.json',
            content: JSON.stringify({
              extends: ['eslint:recommended', '@typescript-eslint/recommended'],
              parser: '@typescript-eslint/parser',
              plugins: ['@typescript-eslint'],
              env: { node: true, es6: true },
              rules: {
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
                '@typescript-eslint/no-explicit-any': 'warn',
                'prefer-const': 'error',
                'no-var': 'error',
                'no-console': ['warn', { allow: ['warn', 'error'] }]
              }
            }, null, 2)
          }
        ]
      },

      prettier: {
        dependencies: [],
        devDependencies: [
          'prettier@^3.0.3'
        ],
        scripts: {
          'format': 'prettier --write .',
          'format:check': 'prettier --check .'
        },
        configFiles: [
          {
            name: '.prettierrc.json',
            content: JSON.stringify({
              semi: true,
              trailingComma: 'es5',
              singleQuote: true,
              printWidth: 80,
              tabWidth: 2,
              useTabs: false,
              bracketSpacing: true,
              arrowParens: 'avoid',
              endOfLine: 'lf'
            }, null, 2)
          },
          {
            name: '.prettierignore',
            content: [
              'node_modules/',
              'dist/',
              'build/',
              '.next/',
              '.nuxt/',
              'coverage/',
              '*.min.js',
              '*.min.css',
              'package-lock.json',
              'yarn.lock',
              'pnpm-lock.yaml'
            ].join('\n')
          }
        ]
      },

      jest: {
        dependencies: [],
        devDependencies: [
          'jest@^29.7.0',
          '@types/jest@^29.5.8',
          'ts-jest@^29.1.1'
        ],
        scripts: {
          'test': 'jest',
          'test:watch': 'jest --watch',
          'test:coverage': 'jest --coverage'
        },
        configFiles: [
          {
            name: 'jest.config.js',
            content: `export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};`
          }
        ]
      },

      typescript: {
        dependencies: [],
        devDependencies: [
          'typescript@^5.2.2',
          '@types/node@^20.8.7'
        ],
        scripts: {
          'type-check': 'tsc --noEmit',
          'build:types': 'tsc --declaration --emitDeclarationOnly'
        },
        configFiles: [
          {
            name: 'tsconfig.json',
            content: JSON.stringify({
              compilerOptions: {
                target: 'ES2020',
                lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                module: 'ESNext',
                skipLibCheck: true,
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
                baseUrl: '.',
                paths: {
                  '@/*': ['./src/*']
                }
              },
              include: ['src'],
              exclude: ['node_modules', 'dist', 'build']
            }, null, 2)
          }
        ]
      },

      tailwindcss: {
        dependencies: [],
        devDependencies: [
          'tailwindcss@^3.3.2',
          'autoprefixer@^10.4.16',
          'postcss@^8.4.31'
        ],
        scripts: {
          'build:css': 'tailwindcss -i ./src/index.css -o ./dist/index.css --watch'
        },
        configFiles: [
          {
            name: 'tailwind.config.js',
            content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
          },
          {
            name: 'postcss.config.js',
            content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}`
          }
        ]
      },

      husky: {
        dependencies: [],
        devDependencies: [
          'husky@^8.0.3'
        ],
        scripts: {
          'prepare': 'husky install'
        },
        configFiles: [
          {
            name: '.husky/pre-commit',
            content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint && npm run format:check`
          }
        ]
      },

      commitlint: {
        dependencies: [],
        devDependencies: [
          '@commitlint/cli@^17.8.1',
          '@commitlint/config-conventional@^17.8.1'
        ],
        scripts: {
          'commitlint': 'commitlint --edit'
        },
        configFiles: [
          {
            name: 'commitlint.config.js',
            content: `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档更新
        'style',    // 样式修改
        'refactor', // 重构
        'test',     // 测试
        'chore',    // 构建过程或辅助工具的变动
        'perf',     // 性能优化
        'ci',       // CI配置
        'build',    // 构建系统
        'revert'    // 回滚
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'header-max-length': [2, 'always', 72]
  }
};`
          },
          {
            name: '.husky/commit-msg',
            content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit $1`
          }
        ]
      },

      editorconfig: {
        dependencies: [],
        devDependencies: [],
        scripts: {},
        configFiles: [
          {
            name: '.editorconfig',
            content: `# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[*.json]
indent_size = 2

[*.{js,ts,jsx,tsx}]
indent_size = 2

[Makefile]
indent_style = tab`
          }
        ]
      },

      vscode: {
        dependencies: [],
        devDependencies: [],
        scripts: {},
        configFiles: [
          {
            name: '.vscode/settings.json',
            content: JSON.stringify({
              'editor.formatOnSave': true,
              'editor.defaultFormatter': 'esbenp.prettier-vscode',
              'editor.codeActionsOnSave': {
                'source.fixAll.eslint': 'explicit'
              },
              'typescript.preferences.importModuleSpecifier': 'relative',
              'tailwindCSS.includeLanguages': {
                'typescript': 'javascript',
                'typescriptreact': 'javascript'
              },
              'files.associations': {
                '*.css': 'tailwindcss'
              }
            }, null, 2)
          },
          {
            name: '.vscode/extensions.json',
            content: JSON.stringify({
              recommendations: [
                'esbenp.prettier-vscode',
                'dbaeumer.vscode-eslint',
                'ms-vscode.vscode-typescript-next',
                'bradlc.vscode-tailwindcss',
                'editorconfig.editorconfig',
                'christian-kohler.path-intellisense',
                'formulahendry.auto-rename-tag'
              ]
            }, null, 2)
          }
        ]
      }
    };
  }

  /**
   * 根据工具配置生成依赖包列表和配置文件
   */
  static generatePackagesAndConfig(toolsConfig: Record<string, boolean>): {
    dependencies: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
    configFiles: Array<{ name: string; content: string; }>;
  } {
    const mapping = this.getToolsMapping();
    const result = {
      dependencies: [] as string[],
      devDependencies: [] as string[],
      scripts: {} as Record<string, string>,
      configFiles: [] as Array<{ name: string; content: string; }>
    };

    // 遍历选中的工具
    Object.entries(toolsConfig).forEach(([toolName, enabled]) => {
      if (enabled && mapping[toolName]) {
        const toolMapping = mapping[toolName];
        
        // 合并依赖
        result.dependencies.push(...toolMapping.dependencies);
        result.devDependencies.push(...toolMapping.devDependencies);
        
        // 合并脚本
        Object.assign(result.scripts, toolMapping.scripts);
        
        // 合并配置文件
        result.configFiles.push(...toolMapping.configFiles);
      }
    });

    // 去重依赖包
    result.dependencies = [...new Set(result.dependencies)];
    result.devDependencies = [...new Set(result.devDependencies)];

    return result;
  }

  /**
   * 检查是否启用了特定工具组合
   */
  static checkToolCombinations(toolsConfig: Record<string, boolean>): {
    needsLintStaged: boolean;
    needsHuskySetup: boolean;
    needsTailwindSetup: boolean;
  } {
    return {
      needsLintStaged: toolsConfig.husky && (toolsConfig.eslint || toolsConfig.prettier),
      needsHuskySetup: toolsConfig.husky || toolsConfig.commitlint,
      needsTailwindSetup: toolsConfig.tailwindcss
    };
  }

  /**
   * 生成 lint-staged 配置
   */
  static generateLintStagedConfig(toolsConfig: Record<string, boolean>): string {
    const lintStagedConfig: Record<string, string[]> = {};
    
    if (toolsConfig.eslint && toolsConfig.prettier) {
      lintStagedConfig['*.{js,jsx,ts,tsx}'] = [
        'eslint --fix',
        'prettier --write'
      ];
    } else if (toolsConfig.eslint) {
      lintStagedConfig['*.{js,jsx,ts,tsx}'] = ['eslint --fix'];
    } else if (toolsConfig.prettier) {
      lintStagedConfig['*.{js,jsx,ts,tsx,json,md,css}'] = ['prettier --write'];
    }

    return JSON.stringify(lintStagedConfig, null, 2);
  }
}
