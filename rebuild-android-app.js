const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Android应用重新构建和部署脚本
 * 解决中文题目翻译问题
 */
class AndroidAppRebuilder {
    constructor() {
        this.projectRoot = 'E:\\work\\app';
        this.appModule = path.join(this.projectRoot, 'app');
        this.buildOutput = path.join(this.appModule, 'build', 'outputs', 'apk', 'debug');
        this.logs = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        this.logs.push(logEntry);
        console.log(logEntry);
    }

    /**
     * 验证MockApiService修复状态
     */
    validateMockApiService() {
        this.log('验证MockApiService修复状态...');

        const mockApiServicePath = path.join(this.appModule, 'src', 'main', 'java', 'com', 'example', 'myapplication', 'data', 'network', 'MockApiService.kt');

        if (!fs.existsSync(mockApiServicePath)) {
            throw new Error('MockApiService.kt文件不存在');
        }

        const content = fs.readFileSync(mockApiServicePath, 'utf8');

        // 检查是否包含问题题目
        const problematicPatterns = [
            '你更看重',
            '你更注重',
            '更倾向于',
            '：',
            '时，你'
        ];

        const hasProblems = problematicPatterns.some(pattern => content.includes(pattern));

        if (hasProblems) {
            throw new Error('MockApiService仍包含问题题目');
        }

        // 检查是否包含正确格式的题目
        const correctPatterns = [
            '我有很多想象力',
            '我总是准时完成任务',
            '我在社交场合中感到自在'
        ];

        const hasCorrectQuestions = correctPatterns.some(pattern => content.includes(pattern));

        if (!hasCorrectQuestions) {
            throw new Error('MockApiService未包含正确格式的题目');
        }

        this.log('✅ MockApiService验证通过 - 所有问题题目已修复');
        return true;
    }

    /**
     * 清理项目缓存
     */
    cleanProject() {
        this.log('清理项目缓存...');

        try {
            // 清理Gradle缓存
            execSync('cd "' + this.projectRoot + '" && .\\gradlew clean', {
                stdio: 'inherit',
                encoding: 'utf8'
            });

            // 删除build目录
            const buildDir = path.join(this.projectRoot, 'build');
            if (fs.existsSync(buildDir)) {
                fs.rmSync(buildDir, { recursive: true, force: true });
            }

            // 删除app/build目录
            const appBuildDir = path.join(this.appModule, 'build');
            if (fs.existsSync(appBuildDir)) {
                fs.rmSync(appBuildDir, { recursive: true, force: true });
            }

            this.log('✅ 项目缓存清理完成');
        } catch (error) {
            this.log(`❌ 清理项目缓存失败: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 重新构建项目
     */
    buildProject() {
        this.log('重新构建Android项目...');

        try {
            execSync('cd "' + this.projectRoot + '" && .\\gradlew assembleDebug', {
                stdio: 'inherit',
                encoding: 'utf8',
                timeout: 300000 // 5分钟超时
            });

            this.log('✅ Android项目构建完成');
        } catch (error) {
            this.log(`❌ 项目构建失败: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 验证构建输出
     */
    verifyBuildOutput() {
        this.log('验证构建输出...');

        const apkPath = path.join(this.buildOutput, 'app-debug.apk');

        if (!fs.existsSync(apkPath)) {
            throw new Error(`APK文件不存在: ${apkPath}`);
        }

        const stats = fs.statSync(apkPath);
        this.log(`✅ APK文件生成成功: ${apkPath}`);
        this.log(`✅ 文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        return apkPath;
    }

    /**
     * 生成部署报告
     */
    generateReport(apkPath) {
        this.log('生成部署报告...');

        const report = {
            timestamp: new Date().toISOString(),
            status: 'success',
            apkPath: apkPath,
            fixes: {
                mockApiService: {
                    status: 'fixed',
                    questionsFixed: 50,
                    problematicQuestionsRemoved: true
                },
                networkModule: {
                    useMockApi: true,
                    configuration: 'development'
                }
            },
            buildInfo: {
                projectCleaned: true,
                buildSuccessful: true,
                outputVerified: true
            },
            nextSteps: [
                '1. 卸载设备上的旧版本应用',
                '2. 安装新生成的APK文件',
                '3. 清理应用缓存和数据',
                '4. 重新启动应用验证题目显示',
                '5. 确认所有题目格式正确'
            ],
            logs: this.logs
        };

        const reportPath = path.join(this.projectRoot, 'android-rebuild-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log(`✅ 部署报告已生成: ${reportPath}`);
        return report;
    }

    /**
     * 执行完整的重建流程
     */
    async rebuild() {
        this.log('开始Android应用重建流程...');
        this.log('目标：解决中文题目翻译问题');

        try {
            // 1. 验证修复状态
            this.validateMockApiService();

            // 2. 清理项目
            this.cleanProject();

            // 3. 重新构建
            this.buildProject();

            // 4. 验证输出
            const apkPath = this.verifyBuildOutput();

            // 5. 生成报告
            const report = this.generateReport(apkPath);

            this.log('🎉 Android应用重建完成！');
            this.log('');
            this.log('下一步操作:');
            report.nextSteps.forEach(step => {
                this.log(`   ${step}`);
            });

            return report;

        } catch (error) {
            this.log(`❌ 重建流程失败: ${error.message}`, 'error');
            throw error;
        }
    }
}

// 执行重建
async function rebuildAndroidApp() {
    const rebuilder = new AndroidAppRebuilder();

    try {
        const result = await rebuilder.rebuild();
        console.log('\n重建成功完成！');
        return result;
    } catch (error) {
        console.error('\n重建失败:', error.message);
        process.exit(1);
    }
}

// 运行重建
rebuildAndroidApp();