/**
 * 网络连接诊断工具
 */

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class NetworkDiagnostics {
    constructor() {
        this.baseHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        };
    }

    async testConnectivity() {
        console.log('🔍 开始网络连接诊断...\n');
        
        const tests = [
            { name: '获取题目', endpoint: '/questions' },
            { name: '提交答案', endpoint: '/submit-test', method: 'POST', body: { answers: [1,2,3,4,5] } }
        ];

        for (const test of tests) {
            await this.runTest(test);
        }
    }

    async runTest({ name, endpoint, method = 'GET', body = null }) {
        console.log(`📡 测试: ${name}`);
        const startTime = Date.now();
        
        try {
            const url = `${SUPABASE_URL}/functions/v1/personality-api${endpoint}`;
            const options = {
                method,
                headers: this.baseHeaders,
                ...(body && { body: JSON.stringify(body) })
            };

            const response = await fetch(url, options);
            const duration = Date.now() - startTime;
            
            console.log(`✅ 成功 - 状态: ${response.status}, 耗时: ${duration}ms`);
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log(`❌ 失败 - 错误: ${error.message}, 耗时: ${duration}ms`);
            
            if (error.code === 'ECONNRESET') {
                console.log('   🔍 ECONNRESET 错误分析:');
                console.log('   - 可能是服务器主动断开连接');
                console.log('   - 可能是网络不稳定');
                console.log('   - 可能是请求超时');
            }
        }
        console.log('');
    }
}

// 运行诊断
const diagnostics = new NetworkDiagnostics();
diagnostics.testConnectivity().then(() => {
    console.log('🏁 网络诊断完成');
});