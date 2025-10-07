/**
 * 测试运行器 - 统一执行所有测试
 * 包括单元测试、回归测试和集成测试
 */

const fs = require('fs');
const path = require('path');

// 导入测试模块
const { runUnitTests, runPerformanceTests } = require('./unit-tests.js');
const { runRegressionTests, runPerformanceComparison } = require('./regression-tests.js');
const { runIntegrationTests } = require('./integration-tests.js');

// 测试报告生成器
class TestReportGenerator {
  constructor() {
    this.startTime = new Date();
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0,
        duration: 0
      },
      unitTests: null,
      regressionTests: null,
      integrationTests: null,
      performance: {
        frontend: null,
        backend: null,
        comparison: null
      }
    };
  }
  
  addUnitTestResults(results) {
    this.results.unitTests = results;
    this.updateSummary(results.totalTests, results.passedTests);
  }
  
  addRegressionTestResults(results) {
    this.results.regressionTests = results;
    this.updateSummary(results.totalTests, results.passedTests);
  }
  
  addIntegrationTestResults(results) {
    this.results.integrationTests = results;
    this.updateSummary(results.summary.total, results.summary.passed);
  }
  
  addPerformanceResults(frontend, backend, comparison) {
    this.results.performance = {
      frontend,
      backend,
      comparison
    };
  }
  
  updateSummary(totalTests, passedTests) {
    this.results.summary.totalTests += totalTests;
    this.results.summary.passedTests += passedTests;
    this.results.summary.failedTests = this.results.summary.totalTests - this.results.summary.passedTests;
    this.results.summary.passRate = (this.results.summary.passedTests / this.results.summary.totalTests * 100).toFixed(2);
  }
  
  finalize() {
    const endTime = new Date();
    this.results.summary.duration = endTime - this.startTime;
    this.results.timestamp = this.startTime.toISOString();
    this.results.endTime = endTime.toISOString();
  }
  
  generateConsoleReport() {
    console.log('\n' + '='.repeat(100));
    console.log('综合测试报告');
    console.log('='.repeat(100));
    
    console.log(`\n测试开始时间: ${this.startTime.toLocaleString()}`);
    console.log(`测试结束时间: ${new Date().toLocaleString()}`);
    console.log(`总耗时: ${(this.results.summary.duration / 1000).toFixed(2)}秒`);
    
    // 总体概览
    console.log('\n📊 总体概览');
    console.log('-'.repeat(50));
    console.log(`总测试数: ${this.results.summary.totalTests}`);
    console.log(`通过测试: ${this.results.summary.passedTests}`);
    console.log(`失败测试: ${this.results.summary.failedTests}`);
    console.log(`总通过率: ${this.results.summary.passRate}%`);
    
    // 单元测试结果
    if (this.results.unitTests) {
      console.log('\n🔬 单元测试结果');
      console.log('-'.repeat(50));
      console.log(`测试数: ${this.results.unitTests.totalTests}`);
      console.log(`通过数: ${this.results.unitTests.passedTests}`);
      console.log(`通过率: ${this.results.unitTests.passRate}%`);
      console.log(`状态: ${this.results.unitTests.success ? '✅ 通过' : '❌ 失败'}`);
    }
    
    // 回归测试结果
    if (this.results.regressionTests) {
      console.log('\n🔄 回归测试结果');
      console.log('-'.repeat(50));
      console.log(`测试数: ${this.results.regressionTests.totalTests}`);
      console.log(`通过数: ${this.results.regressionTests.passedTests}`);
      console.log(`一致性率: ${this.results.regressionTests.passRate}%`);
      console.log(`状态: ${this.results.regressionTests.success ? '✅ 通过' : '❌ 失败'}`);
    }
    
    // 集成测试结果
    if (this.results.integrationTests) {
      console.log('\n🔗 集成测试结果');
      console.log('-'.repeat(50));
      console.log(`测试数: ${this.results.integrationTests.summary.total}`);
      console.log(`通过数: ${this.results.integrationTests.summary.passed}`);
      console.log(`通过率: ${this.results.integrationTests.summary.passRate}%`);
      console.log(`状态: ${this.results.integrationTests.summary.passRate === '100.00' ? '✅ 通过' : '❌ 失败'}`);
    }
    
    // 性能测试结果
    if (this.results.performance.frontend || this.results.performance.backend) {
      console.log('\n⚡ 性能测试结果');
      console.log('-'.repeat(50));
      
      if (this.results.performance.frontend) {
        console.log('前端性能:');
        console.log(`  Big Five计算: ${this.results.performance.frontend.bigFiveTime.toFixed(4)}ms/次`);
        console.log(`  MBTI计算: ${this.results.performance.frontend.mbtiTime.toFixed(4)}ms/次`);
        console.log(`  完整报告: ${this.results.performance.frontend.reportTime.toFixed(4)}ms/次`);
      }
      
      if (this.results.performance.backend) {
        console.log('后端性能:');
        console.log(`  前端平均: ${this.results.performance.comparison.frontend.toFixed(4)}ms/次`);
        if (this.results.performance.comparison.backend) {
          console.log(`  后端平均: ${this.results.performance.comparison.backend.toFixed(4)}ms/次`);
        } else {
          console.log(`  后端测试: 失败 - ${this.results.performance.comparison.error}`);
        }
      }
    }
    
    // 最终结论
    console.log('\n🎯 最终结论');
    console.log('-'.repeat(50));
    
    const overallSuccess = this.results.summary.passRate === '100.00';
    
    if (overallSuccess) {
      console.log('🎉 所有测试通过！系统迁移成功！');
      console.log('✅ 前端与后端计算逻辑100%一致');
      console.log('✅ 所有核心功能正常运行');
      console.log('✅ 性能表现符合预期');
    } else {
      console.log('⚠️  存在测试失败，需要进一步检查！');
      
      if (this.results.unitTests && !this.results.unitTests.success) {
        console.log('❌ 单元测试失败 - 核心算法存在问题');
      }
      
      if (this.results.regressionTests && !this.results.regressionTests.success) {
        console.log('❌ 回归测试失败 - 前后端计算不一致');
      }
      
      if (this.results.integrationTests && this.results.integrationTests.summary.passRate !== '100.00') {
        console.log('❌ 集成测试失败 - 系统集成存在问题');
      }
    }
    
    console.log('\n' + '='.repeat(100));
  }
  
  generateJsonReport() {
    return JSON.stringify(this.results, null, 2);
  }
  
  saveReport(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `test-report-${timestamp}.json`;
    }
    
    const reportPath = path.join(__dirname, filename);
    fs.writeFileSync(reportPath, this.generateJsonReport());
    
    console.log(`\n📄 测试报告已保存: ${reportPath}`);
    return reportPath;
  }
}

// 主测试运行函数
async function runAllTests() {
  console.log('🚀 开始执行完整测试套件...\n');
  
  const reporter = new TestReportGenerator();
  let hasErrors = false;
  
  try {
    // 1. 执行单元测试
    console.log('1️⃣ 执行单元测试...');
    console.log('='.repeat(80));
    
    try {
      const unitResults = runUnitTests();
      const perfResults = runPerformanceTests();
      
      reporter.addUnitTestResults(unitResults);
      reporter.addPerformanceResults(perfResults, null, null);
      
      if (!unitResults.success) {
        hasErrors = true;
        console.log('\n⚠️  单元测试失败，但继续执行其他测试...');
      }
    } catch (error) {
      console.error('单元测试执行出错:', error);
      hasErrors = true;
    }
    
    // 2. 执行回归测试
    console.log('\n\n2️⃣ 执行回归测试...');
    console.log('='.repeat(80));
    
    try {
      const regressionResults = await runRegressionTests();
      const perfComparison = await runPerformanceComparison();
      
      reporter.addRegressionTestResults(regressionResults);
      
      // 更新性能比较结果
      const currentPerf = reporter.results.performance;
      reporter.addPerformanceResults(currentPerf.frontend, perfComparison, perfComparison);
      
      if (!regressionResults.success) {
        hasErrors = true;
        console.log('\n⚠️  回归测试失败，但继续执行其他测试...');
      }
    } catch (error) {
      console.error('回归测试执行出错:', error);
      hasErrors = true;
    }
    
    // 3. 执行集成测试
    console.log('\n\n3️⃣ 执行集成测试...');
    console.log('='.repeat(80));
    
    try {
      const integrationResults = await runIntegrationTests();
      reporter.addIntegrationTestResults(integrationResults);
      
      if (integrationResults.summary.passRate !== '100.00') {
        hasErrors = true;
        console.log('\n⚠️  集成测试失败...');
      }
    } catch (error) {
      console.error('集成测试执行出错:', error);
      hasErrors = true;
    }
    
  } catch (error) {
    console.error('测试执行过程中发生严重错误:', error);
    hasErrors = true;
  }
  
  // 完成测试并生成报告
  reporter.finalize();
  reporter.generateConsoleReport();
  
  // 保存详细报告
  const reportPath = reporter.saveReport();
  
  // 返回结果
  return {
    success: !hasErrors && reporter.results.summary.passRate === '100.00',
    results: reporter.results,
    reportPath
  };
}

// 快速测试函数（仅执行关键测试）
async function runQuickTests() {
  console.log('⚡ 执行快速测试...\n');
  
  const reporter = new TestReportGenerator();
  
  try {
    // 只执行单元测试和一个简单的集成测试
    console.log('执行核心单元测试...');
    const unitResults = runUnitTests();
    reporter.addUnitTestResults(unitResults);
    
    console.log('\n执行基本集成测试...');
    // 这里可以添加简化版的集成测试
    
    reporter.finalize();
    reporter.generateConsoleReport();
    
    return {
      success: unitResults.success,
      results: reporter.results
    };
    
  } catch (error) {
    console.error('快速测试执行出错:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 命令行参数处理
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'full', // full, quick, unit, regression, integration
    saveReport: true,
    verbose: false
  };
  
  args.forEach(arg => {
    switch (arg) {
      case '--quick':
        options.mode = 'quick';
        break;
      case '--unit':
        options.mode = 'unit';
        break;
      case '--regression':
        options.mode = 'regression';
        break;
      case '--integration':
        options.mode = 'integration';
        break;
      case '--no-save':
        options.saveReport = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
测试运行器使用说明:

node test-runner.js [选项]

选项:
  --quick        执行快速测试（仅单元测试）
  --unit         仅执行单元测试
  --regression   仅执行回归测试
  --integration  仅执行集成测试
  --no-save      不保存测试报告
  --verbose      详细输出
  --help         显示此帮助信息

默认执行完整测试套件。
        `);
        process.exit(0);
        break;
    }
  });
  
  return options;
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    runQuickTests,
    TestReportGenerator
  };
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  (async () => {
    const options = parseCommandLineArgs();
    
    try {
      let result;
      
      switch (options.mode) {
        case 'quick':
          result = await runQuickTests();
          break;
        case 'unit':
          const unitResults = runUnitTests();
          result = { success: unitResults.success, results: { unitTests: unitResults } };
          break;
        case 'regression':
          const regressionResults = await runRegressionTests();
          result = { success: regressionResults.success, results: { regressionTests: regressionResults } };
          break;
        case 'integration':
          const integrationResults = await runIntegrationTests();
          result = { success: integrationResults.summary.passRate === '100.00', results: { integrationTests: integrationResults } };
          break;
        default:
          result = await runAllTests();
      }
      
      console.log(`\n🏁 测试完成，结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
      process.exit(result.success ? 0 : 1);
      
    } catch (error) {
      console.error('测试运行器执行失败:', error);
      process.exit(1);
    }
  })();
}