const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 精确问题检测测试
 * 基于TDD原则验证中文题目问题的存在性
 */
class PreciseProblemDetection {
    constructor() {
        this.testResults = {
            database: { status: 'pending', issues: [], problemKeywords: [] },
            edgeFunctions: { status: 'pending', issues: [], problemKeywords: [] },
            mockApiService: { status: 'pending', issues: [], problemKeywords: [] },
            staticFiles: { status: 'pending', issues: [], problemKeywords: [] }
        };

        // 精确的问题关键词列表（用户反馈的）
        this.problemKeywords = [
            '你更倾向于',
            '你通常',
            '你更看重',
            '你更注重',
            '你一般',
            '你常常',
            '你往往',
            '你习惯',
            '你喜欢',
            '你希望',
            '你想要',
            '你觉得',
            '你认为',
            '你相信',
            '你感觉',
            '：',
            ':',
            '？',
            '?'
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logEntry);
    }

    /**
     * 精确检测问题关键词
     */
    detectProblemKeywords(text, source) {
        const foundKeywords = [];

        this.problemKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        });

        return foundKeywords;
    }

    /**
     * 测试1：数据库题目精确检测
     */
    async testDatabaseQuestions() {
        this.log('🧪 测试1: 数据库题目精确检测...');

        try {
            const { data: questions, error } = await supabase
                .from('questions')
                .select('*')
                .order('id');

            if (error) {
                this.testResults.database.status = 'error';
                this.testResults.database.issues.push(`数据库查询失败: ${error.message}`);
                return false;
            }

            let problematicQuestions = [];
            let allKeywords = new Set();

            questions.forEach(question => {
                const keywords = this.detectProblemKeywords(question.text_zh, 'database');
                if (keywords.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        text: question.text_zh,
                        keywords: keywords
                    });
                    keywords.forEach(keyword => allKeywords.add(keyword));
                }
            });

            this.testResults.database.status = problematicQuestions.length === 0 ? 'success' : 'failed';
            this.testResults.database.issues = problematicQuestions;
            this.testResults.database.problemKeywords = Array.from(allKeywords);

            this.log(`数据库题目检测结果: ${questions.length}个题目, ${problematicQuestions.length}个问题`);

            if (problematicQuestions.length > 0) {
                this.log(`发现的问题关键词: ${Array.from(allKeywords).join(', ')}`);
                problematicQuestions.slice(0, 3).forEach(q => {
                    this.log(`问题题目 ID${q.id}: "${q.text}" (${q.keywords.join(', ')})`);
                });
            }

            return problematicQuestions.length === 0;

        } catch (error) {
            this.testResults.database.status = 'error';
            this.testResults.database.issues.push(`检测异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试2：Edge Functions API精确检测
     */
    async testEdgeFunctionsApi() {
        this.log('🧪 测试2: Edge Functions API精确检测...');

        try {
            const response = await fetch('https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1/personality-api/questions?language=zh&count=20', {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey
                }
            });

            if (!response.ok) {
                this.testResults.edgeFunctions.status = 'error';
                this.testResults.edgeFunctions.issues.push(`HTTP ${response.status}: ${response.statusText}`);
                return false;
            }

            const data = await response.json();
            const questions = data.data || [];

            let problematicQuestions = [];
            let allKeywords = new Set();

            questions.forEach(question => {
                const text = question.question_text_zh || question.text;
                const keywords = this.detectProblemKeywords(text, 'edgefunctions');
                if (keywords.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        text: text,
                        keywords: keywords
                    });
                    keywords.forEach(keyword => allKeywords.add(keyword));
                }
            });

            this.testResults.edgeFunctions.status = problematicQuestions.length === 0 ? 'success' : 'failed';
            this.testResults.edgeFunctions.issues = problematicQuestions;
            this.testResults.edgeFunctions.problemKeywords = Array.from(allKeywords);

            this.log(`Edge Functions API检测结果: ${questions.length}个题目, ${problematicQuestions.length}个问题`);

            if (problematicQuestions.length > 0) {
                this.log(`发现的问题关键词: ${Array.from(allKeywords).join(', ')}`);
                problematicQuestions.slice(0, 3).forEach(q => {
                    this.log(`问题题目 ID${q.id}: "${q.text}" (${q.keywords.join(', ')})`);
                });
            }

            return problematicQuestions.length === 0;

        } catch (error) {
            this.testResults.edgeFunctions.status = 'error';
            this.testResults.edgeFunctions.issues.push(`API测试失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试3：MockApiService精确检测
     */
    testMockApiService() {
        this.log('🧪 测试3: MockApiService精确检测...');

        try {
            // 读取MockApiService文件
            const mockApiPath = path.join('E:\\work\\app\\app\\src\\main\\java\\com\\example\\myapplication\\data\\network\\MockApiService.kt');

            if (!fs.existsSync(mockApiPath)) {
                this.testResults.mockApiService.status = 'error';
                this.testResults.mockApiService.issues.push('MockApiService文件不存在');
                return false;
            }

            const content = fs.readFileSync(mockApiPath, 'utf8');

            // 提取所有中文题目文本
            const questionMatches = content.match(/questionTextZh\s*=\s*"([^"]+)"/g);
            const questions = questionMatches ? questionMatches.map((match, index) => {
                const text = match.match(/"([^"]+)"/)[1];
                return { text, id: index + 1 };
            }) : [];

            let problematicQuestions = [];
            let allKeywords = new Set();

            questions.forEach(question => {
                const keywords = this.detectProblemKeywords(question.text, 'mockapi');
                if (keywords.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        text: question.text,
                        keywords: keywords
                    });
                    keywords.forEach(keyword => allKeywords.add(keyword));
                }
            });

            this.testResults.mockApiService.status = problematicQuestions.length === 0 ? 'success' : 'failed';
            this.testResults.mockApiService.issues = problematicQuestions;
            this.testResults.mockApiService.problemKeywords = Array.from(allKeywords);

            this.log(`MockApiService检测结果: ${questions.length}个题目, ${problematicQuestions.length}个问题`);

            if (problematicQuestions.length > 0) {
                this.log(`发现的问题关键词: ${Array.from(allKeywords).join(', ')}`);
                problematicQuestions.slice(0, 5).forEach(q => {
                    this.log(`问题题目 ID${q.id}: "${q.text}" (${q.keywords.join(', ')})`);
                });
            }

            return problematicQuestions.length === 0;

        } catch (error) {
            this.testResults.mockApiService.status = 'error';
            this.testResults.mockApiService.issues.push(`检测异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试4：静态文件检测
     */
    testStaticFiles() {
        this.log('🧪 测试4: 静态文件检测...');

        try {
            // 搜索项目中的静态文件
            const staticDirs = [
                'E:\\work\\app\\app\\src\\main\\assets',
                'E:\\work\\app\\app\\src\\main\\res\\raw',
                'E:\\work\\app\\app\\src\\main\\res\\values'
            ];

            let foundIssues = [];
            let allKeywords = new Set();

            staticDirs.forEach(dir => {
                if (fs.existsSync(dir)) {
                    const files = this.findFiles(dir, ['.json', '.xml', '.txt']);
                    files.forEach(file => {
                        const content = fs.readFileSync(file, 'utf8');
                        const keywords = this.detectProblemKeywords(content, 'static');
                        if (keywords.length > 0) {
                            foundIssues.push({
                                file: file,
                                keywords: keywords
                            });
                            keywords.forEach(keyword => allKeywords.add(keyword));
                        }
                    });
                }
            });

            this.testResults.staticFiles.status = foundIssues.length === 0 ? 'success' : 'failed';
            this.testResults.staticFiles.issues = foundIssues;
            this.testResults.staticFiles.problemKeywords = Array.from(allKeywords);

            this.log(`静态文件检测结果: ${foundIssues.length}个文件有问题`);

            if (foundIssues.length > 0) {
                this.log(`发现的问题关键词: ${Array.from(allKeywords).join(', ')}`);
                foundIssues.slice(0, 3).forEach(issue => {
                    this.log(`问题文件: ${issue.file} (${issue.keywords.join(', ')})`);
                });
            }

            return foundIssues.length === 0;

        } catch (error) {
            this.testResults.staticFiles.status = 'error';
            this.testResults.staticFiles.issues.push(`检测异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 递归查找文件
     */
    findFiles(dir, extensions) {
        const files = [];
        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.findFiles(fullPath, extensions));
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        });

        return files;
    }

    /**
     * 生成详细报告
     */
    generateReport() {
        this.log('\n=== 精确问题检测报告 ===\n');

        const sources = [
            { name: '数据库', key: 'database' },
            { name: 'Edge Functions API', key: 'edgeFunctions' },
            { name: 'MockApiService', key: 'mockApiService' },
            { name: '静态文件', key: 'staticFiles' }
        ];

        let totalIssues = 0;
        let allProblemKeywords = new Set();

        sources.forEach(source => {
            const result = this.testResults[source.key];
            const status = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';

            console.log(`${source.name}: ${status}`);
            console.log(`  状态: ${result.status}`);
            console.log(`  问题数量: ${result.issues.length}`);

            if (result.problemKeywords.length > 0) {
                console.log(`  问题关键词: ${result.problemKeywords.join(', ')}`);
                result.problemKeywords.forEach(keyword => allProblemKeywords.add(keyword));
            }

            if (result.issues.length > 0) {
                console.log('  问题详情:');
                result.issues.slice(0, 3).forEach(issue => {
                    if (typeof issue === 'object' && issue.text) {
                        console.log(`    - ID${issue.id}: "${issue.text}" (${issue.keywords.join(', ')})`);
                    } else if (typeof issue === 'object' && issue.file) {
                        console.log(`    - 文件: ${issue.file} (${issue.keywords.join(', ')})`);
                    } else {
                        console.log(`    - ${issue}`);
                    }
                });
                if (result.issues.length > 3) {
                    console.log(`    ... 还有 ${result.issues.length - 3} 个问题`);
                }
            }
            console.log('');

            totalIssues += result.issues.length;
        });

        console.log('总结:');
        console.log(`  总问题数: ${totalIssues}`);
        console.log(`  问题关键词总数: ${allProblemKeywords.size}`);
        console.log(`  所有关键词: ${Array.from(allProblemKeywords).join(', ')}`);

        if (totalIssues === 0) {
            console.log('🎉 未发现问题！所有数据源都是正确的。');
            console.log('🤔 如果用户仍看到问题，可能的原因:');
            console.log('   1. Android Studio缓存问题');
            console.log('   2. APK未正确更新');
            console.log('   3. 运行时配置问题');
            console.log('   4. 设备缓存问题');
        } else {
            console.log('⚠️ 发现问题！需要进一步分析和修复。');
            console.log('🎯 重点修复包含最多问题的数据源。');
        }

        return {
            totalIssues,
            problemKeywords: Array.from(allProblemKeywords),
            details: this.testResults
        };
    }

    /**
     * 运行完整检测
     */
    async runFullDetection() {
        this.log('开始精确问题检测...');
        this.log('目标：检测所有数据源中的问题关键词\n');

        // 并行运行所有测试
        await Promise.all([
            this.testDatabaseQuestions(),
            this.testEdgeFunctionsApi(),
            this.testMockApiService(),
            this.testStaticFiles()
        ]);

        return this.generateReport();
    }
}

// 执行检测
async function runPreciseDetection() {
    const detector = new PreciseProblemDetection();

    try {
        const results = await detector.runFullDetection();
        console.log('\n=== 检测完成 ===');
        return results;
    } catch (error) {
        console.error('检测失败:', error.message);
        process.exit(1);
    }
}

// 运行检测
runPreciseDetection();