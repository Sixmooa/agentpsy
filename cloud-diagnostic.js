/**
 * 云端算法诊断工具
 * TDD驱动的深度分析
 */

const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class CloudDiagnostic {
  constructor() {
    this.apiResults = [];
    this.diagnosticReport = {
      timestamp: new Date().toISOString(),
      version: 'unknown',
      algorithm: 'unknown',
      issues: [],
      recommendations: []
    };
  }

  /**
   * 发送HTTP请求到Supabase API
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({ status: res.statusCode, data: result });
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * 诊断测试1: 中性答案响应
   */
  async diagnoseNeutralResponse() {
    console.log('🔍 诊断测试1: 中性答案响应');
    console.log('-'.repeat(50));

    const neutralAnswers = {};
    for (let i = 1; i <= 50; i++) {
      neutralAnswers[i] = 3;
    }

    try {
      const response = await this.makeRequest(
        `${SUPABASE_URL}/functions/v1/personality-api/submit-test`,
        {
          method: 'POST',
          body: {
            answers: neutralAnswers,
            language: 'en',
            saveResult: false
          }
        }
      );

      if (response.status === 200 && response.data.success) {
        const report = response.data.report;
        console.log('✅ API响应正常');
        console.log('📊 Big Five分数:', JSON.stringify(report.bigFiveScores, null, 2));
        console.log('🧠 MBTI类型:', report.mbtiType);
        console.log('📋 版本信息:', report.metadata?.version || 'unknown');
        console.log('🔧 算法方法:', report.metadata?.calculationMethod || 'unknown');

        // 分析算法特征
        const scores = report.bigFiveScores;
        const isPercentageAlgorithm = Object.values(scores).some(score => score > 10);
        const isAverageAlgorithm = Object.values(scores).every(score => score >= 1 && score <= 5);

        if (isPercentageAlgorithm) {
          this.diagnosticReport.algorithm = 'percentage';
          this.diagnosticReport.issues.push('云端使用百分比算法，需要修复为平均分算法');
        } else if (isAverageAlgorithm) {
          this.diagnosticReport.algorithm = 'average';
        }

        // 检查MBTI边界处理
        if (report.mbtiType === 'INTJ-A') {
          console.log('✅ MBTI边界处理正确 (3.0=INTJ-A)');
        } else {
          console.log('❌ MBTI边界处理异常 (3.0应该得到INTJ-A)');
          this.diagnosticReport.issues.push(`MBTI边界处理错误: 期望INTJ-A，实际${report.mbtiType}`);
        }

        this.apiResults.push({
          test: 'neutral',
          response: report,
          algorithm: this.diagnosticReport.algorithm,
          version: report.metadata?.version
        });

      } else {
        console.log('❌ API响应异常:', response.data);
        this.diagnosticReport.issues.push('API响应异常');
      }

    } catch (error) {
      console.error('❌ 诊断失败:', error.message);
      this.diagnosticReport.issues.push(`诊断请求失败: ${error.message}`);
    }
  }

  /**
   * 诊断测试2: 极端答案响应
   */
  async diagnoseExtremeResponse() {
    console.log('\n🔍 诊断测试2: 极端答案响应');
    console.log('-'.repeat(50));

    const extremeAnswers = {};
    for (let i = 1; i <= 50; i++) {
      extremeAnswers[i] = 5;
    }

    try {
      const response = await this.makeRequest(
        `${SUPABASE_URL}/functions/v1/personality-api/submit-test`,
        {
          method: 'POST',
          body: {
            answers: extremeAnswers,
            language: 'en',
            saveResult: false
          }
        }
      );

      if (response.status === 200 && response.data.success) {
        const report = response.data.report;
        console.log('✅ 极端答案响应正常');
        console.log('📊 Big Five分数:', JSON.stringify(report.bigFiveScores, null, 2));
        console.log('🧠 MBTI类型:', report.mbtiType);

        // 验证期望结果
        const expectedMBTI = 'ENFJ-T';
        if (report.mbtiType === expectedMBTI) {
          console.log('✅ 极端答案MBTI计算正确');
        } else {
          console.log(`❌ 极端答案MBTI错误: 期望${expectedMBTI}，实际${report.mbtiType}`);
          this.diagnosticReport.issues.push(`极端答案MBTI计算错误`);
        }

        this.apiResults.push({
          test: 'extreme',
          response: report,
          expectedMBTI,
          actualMBTI: report.mbtiType
        });

      } else {
        console.log('❌ 极端答案API响应异常');
      }

    } catch (error) {
      console.error('❌ 极端答案诊断失败:', error.message);
    }
  }

  /**
   * 诊断测试3: 检查算法版本
   */
  async diagnoseAlgorithmVersion() {
    console.log('\n🔍 诊断测试3: 算法版本检查');
    console.log('-'.repeat(50));

    try {
      // 获取问题列表
      const questionsResponse = await this.makeRequest(
        `${SUPABASE_URL}/functions/v1/personality-api/questions?language=en`
      );

      if (questionsResponse.status === 200 && questionsResponse.data.questions) {
        console.log('✅ 问题API正常');
        console.log('📝 问题数量:', questionsResponse.data.questions.length);

        // 检查问题结构
        const firstQuestion = questionsResponse.data.questions[0];
        console.log('📋 问题结构示例:', {
          id: firstQuestion.id,
          dimension: firstQuestion.dimension,
          hasReverse: 'reverse' in firstQuestion
        });

        this.diagnosticReport.questionCount = questionsResponse.data.questions.length;
        this.diagnosticReport.hasReverseQuestions = questionsResponse.data.questions.some(q => q.reverse);

      } else {
        console.log('❌ 问题API异常');
        this.diagnosticReport.issues.push('问题API异常');
      }

    } catch (error) {
      console.error('❌ 版本诊断失败:', error.message);
    }
  }

  /**
   * 生成诊断报告
   */
  generateDiagnosticReport() {
    console.log('\n📋 云端算法诊断报告');
    console.log('='.repeat(60));

    console.log(`🕐 诊断时间: ${this.diagnosticReport.timestamp}`);
    console.log(`🔧 当前算法: ${this.diagnosticReport.algorithm}`);
    console.log(`📊 问题数量: ${this.diagnosticReport.questionCount || 'unknown'}`);
    console.log(`🔄 包含反转题: ${this.diagnosticReport.hasReverseQuestions ? '是' : '否'}`);

    if (this.diagnosticReport.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.diagnosticReport.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ 未发现问题');
    }

    // 生成修复建议
    console.log('\n💡 修复建议:');
    if (this.diagnosticReport.algorithm === 'percentage') {
      console.log('  1. 需要将算法从百分比改为1-5平均分');
      console.log('  2. 修复MBTI边界判断逻辑 (>= 3.0)');
      console.log('  3. 更新神经质性判断 (3.0中点)');
    }

    console.log('\n🎯 诊断结论:');
    if (this.diagnosticReport.algorithm === 'percentage') {
      console.log('  云端使用旧版算法，需要立即部署修复版本');
    } else {
      console.log('  云端算法可能已更新，需要进一步验证');
    }

    return this.diagnosticReport;
  }

  /**
   * 运行完整诊断
   */
  async runFullDiagnostic() {
    console.log('🚀 开始云端算法深度诊断');
    console.log('='.repeat(60));

    await this.diagnoseNeutralResponse();
    await this.diagnoseExtremeResponse();
    await this.diagnoseAlgorithmVersion();

    const report = this.generateDiagnosticReport();

    return {
      diagnostic: report,
      apiResults: this.apiResults
    };
  }
}

// 运行诊断
async function main() {
  const diagnostic = new CloudDiagnostic();
  await diagnostic.runFullDiagnostic();
}

if (require.main === module) {
  main();
}

module.exports = CloudDiagnostic;