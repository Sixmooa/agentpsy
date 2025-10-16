const fs = require('fs');
const path = require('path');

/**
 * Android Studio运行时环境分析器
 * 分析为什么用户仍然看到问题题目
 */
class RuntimeEnvironmentAnalyzer {
    constructor() {
        this.analysisResults = {
            buildSystem: {},
            cacheSystem: {},
            configuration: {},
            deployment: {},
            runtime: {}
        };
        this.log = [];
    }

    logger(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        this.log.push(logEntry);
        console.log(logEntry);
    }

    /**
     * 分析构建系统
     */
    analyzeBuildSystem() {
        this.logger('🔍 分析构建系统...');

        const projectRoot = 'E:\\work\\app';
        const appModule = path.join(projectRoot, 'app');

        // 检查构建文件
        const buildFiles = [
            path.join(projectRoot, 'build.gradle.kts'),
            path.join(appModule, 'build.gradle.kts'),
            path.join(projectRoot, 'settings.gradle.kts'),
            path.join(appModule, 'src\\main\\AndroidManifest.xml')
        ];

        buildFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                this.analysisResults.buildSystem[file] = {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime,
                    path: file
                };
                this.logger(`✅ 构建文件: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
            } else {
                this.logger(`❌ 构建文件不存在: ${file}`, 'error');
            }
        });

        // 检查APK输出
        const apkDir = path.join(appModule, 'build', 'outputs', 'apk', 'debug');
        const apkPath = path.join(apkDir, 'app-debug.apk');

        if (fs.existsSync(apkPath)) {
            const stats = fs.statSync(apkPath);
            this.analysisResults.buildSystem.apk = {
                exists: true,
                size: stats.size,
                modified: stats.mtime,
                path: apkPath
            };
            this.logger(`✅ APK文件: ${apkPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            this.logger(`   修改时间: ${stats.mtime.toISOString()}`);

            // 检查APK是否是最近构建的
            const apkAge = Date.now() - stats.mtime.getTime();
            const apkAgeMinutes = Math.floor(apkAge / (1000 * 60));

            if (apkAgeMinutes > 60) {
                this.logger(`⚠️ APK构建时间较旧 (${apkAgeMinutes} 分钟前)`, 'warning');
            } else {
                this.logger(`✅ APK构建时间较新 (${apkAgeMinutes} 分钟前)`);
            }
        } else {
            this.logger(`❌ APK文件不存在: ${apkPath}`, 'error');
        }

        return this.analysisResults.buildSystem;
    }

    /**
     * 分析缓存系统
     */
    analyzeCacheSystem() {
        this.logger('🔍 分析缓存系统...');

        const projectRoot = 'E:\\work\\app';
        const cacheDirs = [
            path.join(projectRoot, '.gradle'),
            path.join(projectRoot, 'app', 'build'),
            path.join(projectRoot, 'build'),
            path.join(projectRoot, '.idea', 'caches'),
            path.join(projectRoot, 'app', '.cxx')
        ];

        cacheDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                const stats = this.getDirStats(dir);
                this.analysisResults.cacheSystem[dir] = {
                    exists: true,
                    size: stats.size,
                    fileCount: stats.fileCount,
                    path: dir
                };
                this.logger(`📁 缓存目录: ${dir} (${(stats.size / 1024 / 1024).toFixed(2)} MB, ${stats.fileCount} 个文件)`);
            } else {
                this.logger(`📁 缓存目录不存在: ${dir}`);
            }
        });

        return this.analysisResults.cacheSystem;
    }

    /**
     * 分析配置系统
     */
    analyzeConfiguration() {
        this.logger('🔍 分析配置系统...');

        const networkModulePath = path.join('E:\\work\\app\\app\\src\\main\\java\\com\\example\\myapplication\\data\\network\\NetworkModule.kt');

        if (fs.existsSync(networkModulePath)) {
            const content = fs.readFileSync(networkModulePath, 'utf8');

            // 分析USE_MOCK_API配置
            const mockApiMatch = content.match(/USE_MOCK_API\s*=\s*(true|false)/);
            if (mockApiMatch) {
                const useMockApi = mockApiMatch[1] === 'true';
                this.analysisResults.configuration.useMockApi = useMockApi;
                this.logger(`📋 USE_MOCK_API配置: ${useMockApi ? 'true (使用Mock API)' : 'false (使用真实API)'}`);
            }

            // 分析本地API配置
            const localApiMatch = content.match(/USE_LOCAL_API\s*=\s*(true|false)/);
            if (localApiMatch) {
                const useLocalApi = localApiMatch[1] === 'true';
                this.analysisResults.configuration.useLocalApi = useLocalApi;
                this.logger(`📋 USE_LOCAL_API配置: ${useLocalApi ? 'true (使用本地API)' : 'false (不使用本地API)'}`);
            }

            // 分析Base URL
            const baseUrlMatch = content.match(/baseURL\s*=\s*"([^"]+)"/);
            if (baseUrlMatch) {
                const baseUrl = baseUrlMatch[1];
                this.analysisResults.configuration.baseUrl = baseUrl;
                this.logger(`📋 Base URL配置: ${baseUrl}`);
            }
        }

        return this.analysisResults.configuration;
    }

    /**
     * 分析部署状态
     */
    analyzeDeployment() {
        this.logger('🔍 分析部署状态...');

        // 检查是否有部署脚本
        const deployScripts = [
            'E:\\work\\app\\deploy-commands.bat',
            'E:\\work\\app\\one-click-deploy.bat',
            'E:\\work\\app\\auto-deploy.js'
        ];

        deployScripts.forEach(script => {
            if (fs.existsSync(script)) {
                const stats = fs.statSync(script);
                this.analysisResults.deployment[script] = {
                    exists: true,
                    modified: stats.mtime,
                    path: script
                };
                this.logger(`📜 部署脚本: ${script}`);
            }
        });

        return this.analysisResults.deployment;
    }

    /**
     * 分析运行时问题
     */
    analyzeRuntimeIssues() {
        this.logger('🔍 分析运行时问题...');

        const issues = [];

        // 检查可能的缓存问题
        if (this.analysisResults.cacheSystem) {
            Object.entries(this.analysisResults.cacheSystem).forEach(([dir, info]) => {
                if (info.exists && info.size > 100 * 1024 * 1024) { // 大于100MB
                    issues.push({
                        type: 'cache_size',
                        severity: 'warning',
                        message: `缓存目录 ${dir} 过大 (${(info.size / 1024 / 1024).toFixed(2)} MB)`,
                        suggestion: '建议清理缓存'
                    });
                }
            });
        }

        // 检查APK构建时间
        if (this.analysisResults.buildSystem.apk) {
            const apkAge = Date.now() - this.analysisResults.buildSystem.apk.modified.getTime();
            const apkAgeMinutes = Math.floor(apkAge / (1000 * 60));

            if (apkAgeMinutes > 120) { // 大于2小时
                issues.push({
                    type: 'apk_age',
                    severity: 'error',
                    message: `APK构建时间过旧 (${apkAgeMinutes} 分钟前)`,
                    suggestion: '建议重新构建项目'
                });
            }
        }

        // 检查配置问题
        if (this.analysisResults.configuration.useMockApi) {
            // 检查MockApiService是否真的被修复了
            const mockApiPath = path.join('E:\\work\\app\\app\\src\\main\\java\\com\\example\\myapplication\\data\\network\\MockApiService.kt');
            if (fs.existsSync(mockApiPath)) {
                const content = fs.readFileSync(mockApiPath, 'utf8');
                const hasProblemPatterns = [
                    '你更倾向于',
                    '你通常',
                    '你更看重',
                    '你更注重'
                ].some(pattern => content.includes(pattern));

                if (hasProblemPatterns) {
                    issues.push({
                        type: 'mock_api_not_fixed',
                        severity: 'error',
                        message: 'MockApiService仍然包含问题题目',
                        suggestion: '需要修复MockApiService中的问题题目'
                    });
                }
            }
        }

        this.analysisResults.runtime.issues = issues;

        if (issues.length > 0) {
            this.logger(`⚠️ 发现 ${issues.length} 个运行时问题:`);
            issues.forEach((issue, index) => {
                const severity = issue.severity === 'error' ? '❌' : '⚠️';
                this.logger(`${severity} ${index + 1}. ${issue.message}`);
                this.logger(`   建议: ${issue.suggestion}`);
            });
        } else {
            this.logger('✅ 未发现明显的运行时问题');
        }

        return this.analysisResults.runtime;
    }

    /**
     * 获取目录统计信息
     */
    getDirStats(dirPath) {
        let totalSize = 0;
        let fileCount = 0;

        const scanDir = (currentPath) => {
            if (!fs.existsSync(currentPath)) return;

            const items = fs.readdirSync(currentPath);
            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stats = fs.statSync(fullPath);

                if (stats.isDirectory()) {
                    scanDir(fullPath);
                } else {
                    totalSize += stats.size;
                    fileCount++;
                }
            });
        };

        scanDir(dirPath);
        return { size: totalSize, fileCount };
    }

    /**
     * 生成分析报告
     */
    generateReport() {
        this.logger('\n=== 运行时环境分析报告 ===\n');

        const sections = [
            { name: '构建系统', key: 'buildSystem' },
            { name: '缓存系统', key: 'cacheSystem' },
            { name: '配置系统', key: 'configuration' },
            { name: '部署状态', key: 'deployment' },
            { name: '运行时问题', key: 'runtime' }
        ];

        sections.forEach(section => {
            console.log(`${section.name}:`);
            const data = this.analysisResults[section.key];

            if (section.key === 'runtime') {
                if (data.issues && data.issues.length > 0) {
                    data.issues.forEach((issue, index) => {
                        const severity = issue.severity === 'error' ? '❌' : '⚠️';
                        console.log(`  ${severity} ${issue.message}`);
                        console.log(`     建议: ${issue.suggestion}`);
                    });
                } else {
                    console.log('  ✅ 无问题');
                }
            } else {
                Object.entries(data).forEach(([key, value]) => {
                    if (typeof value === 'object' && value.exists !== undefined) {
                        const status = value.exists ? '✅' : '❌';
                        console.log(`  ${status} ${key}: ${value.path || key}`);
                    } else if (typeof value === 'boolean') {
                        const status = value ? '✅' : '❌';
                        console.log(`  ${status} ${key}: ${value}`);
                    } else {
                        console.log(`  📋 ${key}: ${value}`);
                    }
                });
            }
            console.log('');
        });

        // 生成建议
        this.logger('\n📋 建议操作:');

        if (this.analysisResults.runtime.issues && this.analysisResults.runtime.issues.length > 0) {
            this.analysisResults.runtime.issues.forEach(issue => {
                this.logger(`• ${issue.suggestion}`);
            });
        } else {
            this.logger('• 如果仍然看到问题，请尝试以下操作:');
            this.logger('  1. 清理Android Studio缓存');
            this.logger('  2. 重新构建项目');
            this.logger('  3. 卸载并重新安装应用');
            this.logger('  4. 重启Android Studio');
        }

        return this.analysisResults;
    }

    /**
     * 运行完整分析
     */
    async runFullAnalysis() {
        this.logger('开始运行时环境分析...');
        this.logger('目标：分析为什么用户仍然看到问题题目\n');

        // 执行所有分析
        this.analyzeBuildSystem();
        this.analyzeCacheSystem();
        this.analyzeConfiguration();
        this.analyzeDeployment();
        this.analyzeRuntimeIssues();

        return this.generateReport();
    }
}

// 执行分析
async function runRuntimeAnalysis() {
    const analyzer = new RuntimeEnvironmentAnalyzer();

    try {
        const results = await analyzer.runFullAnalysis();
        console.log('\n=== 分析完成 ===');
        return results;
    } catch (error) {
        console.error('分析失败:', error.message);
        process.exit(1);
    }
}

// 运行分析
runRuntimeAnalysis();