/**
 * 自动化部署辅助脚本
 * 提供部署指导和验证
 */

const fs = require('fs');
const path = require('path');

class DeployHelper {
  constructor() {
    this.projectId = 'fmjcjcpfcosvukgkgliz';
    this.functionName = 'personality-api';
    this.sourceFile = 'personality-api-fixed.ts';
  }

  /**
   * 检查部署前置条件
   */
  checkDeploymentPrerequisites() {
    console.log('🔍 检查部署前置条件');
    console.log('='.repeat(50));

    // 检查文件是否存在
    const sourceFilePath = path.join(__dirname, this.sourceFile);
    if (!fs.existsSync(sourceFilePath)) {
      console.log('❌ 源文件不存在:', this.sourceFile);
      return false;
    }
    console.log('✅ 源文件存在:', this.sourceFile);

    // 检查文件内容
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
    if (!sourceContent.includes('calculateMBTI') || !sourceContent.includes('calculateBigFiveScores')) {
      console.log('❌ 源文件内容不完整');
      return false;
    }
    console.log('✅ 源文件内容验证通过');

    // 检查关键修复
    if (!sourceContent.includes('openness >= midPoint')) {
      console.log('❌ 关键修复缺失 (S/N维度 >= 判断)');
      return false;
    }
    if (!sourceContent.includes('conscientiousness >= midPoint')) {
      console.log('❌ 关键修复缺失 (J/P维度 >= 判断)');
      return false;
    }
    console.log('✅ 关键修复验证通过');

    console.log('\n📋 部署信息:');
    console.log('  项目ID:', this.projectId);
    console.log('  函数名:', this.functionName);
    console.log('  源文件:', this.sourceFile);

    return true;
  }

  /**
   * 生成部署命令
   */
  generateDeploymentCommands() {
    console.log('\n🚀 部署命令生成');
    console.log('='.repeat(50));

    const commands = [
      {
        description: '1. 登录Supabase',
        command: 'npx supabase login',
        note: '在浏览器中完成认证'
      },
      {
        description: '2. 链接项目',
        command: `npx supabase link --project-ref ${this.projectId}`,
        note: '链接到你的Supabase项目'
      },
      {
        description: '3. 部署函数',
        command: `npx supabase functions deploy ${this.functionName} --no-verify-jwt`,
        note: '部署更新后的算法'
      },
      {
        description: '4. 验证部署',
        command: 'npx supabase functions list',
        note: '检查函数状态'
      }
    ];

    commands.forEach(cmd => {
      console.log(`\n${cmd.description}:`);
      console.log(`  命令: ${cmd.command}`);
      console.log(`  说明: ${cmd.note}`);
    });

    return commands;
  }

  /**
   * 生成验证脚本
   */
  generateValidationScript() {
    console.log('\n🧪 部署验证脚本');
    console.log('='.repeat(50));

    const validationSteps = [
      {
        description: '1. 测试API响应',
        command: 'node simple-api-test.js',
        expected: 'Big Five分数应该在1-5范围内'
      },
      {
        description: '2. 运行对比测试',
        command: 'node score-comparison-test.js',
        expected: '一致性率应该达到100%'
      },
      {
        description: '3. 运行回归测试',
        command: 'node regression-test.js',
        expected: '所有19个测试应该通过'
      }
    ];

    validationSteps.forEach(step => {
      console.log(`\n${step.description}:`);
      console.log(`  命令: ${step.command}`);
      console.log(`  预期: ${step.expected}`);
    });

    return validationSteps;
  }

  /**
   * 创建一键部署脚本
   */
  createOneClickDeployScript() {
    console.log('\n⚡ 创建一键部署脚本');
    console.log('='.repeat(50));

    const scriptContent = `@echo off
echo 🚀 一键部署Supabase算法
echo ================================

echo 📋 检查部署前置条件...
if not exist "${this.sourceFile}" (
    echo ❌ 源文件不存在: ${this.sourceFile}
    pause
    exit /b 1
)
echo ✅ 源文件存在

echo.
echo 🔧 开始部署流程...
echo 1. 请在浏览器中完成Supabase认证
echo 2. 等待部署完成
echo 3. 运行验证测试
echo.

echo 登录Supabase...
npx supabase login

echo.
echo 链接项目...
npx supabase link --project-ref ${this.projectId}

echo.
echo 部署函数...
npx supabase functions deploy ${this.functionName} --no-verify-jwt

echo.
echo 检查部署状态...
npx supabase functions list

echo.
echo 🧪 验证部署效果...
echo 运行API测试...
node simple-api-test.js

echo.
echo 运行对比测试...
node score-comparison-test.js

echo.
echo ✅ 部署流程完成！
echo 请检查测试结果确认算法一致性
pause
`;

    const scriptPath = path.join(__dirname, 'one-click-deploy.bat');
    fs.writeFileSync(scriptPath, scriptContent);

    console.log('✅ 一键部署脚本已创建:', scriptPath);
    return scriptPath;
  }

  /**
   * 创建手动部署指南
   */
  createManualDeploymentGuide() {
    console.log('\n📖 创建手动部署指南');
    console.log('='.repeat(50));

    const guide = `# 手动部署指南

## 方法1: 使用Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目: ${this.projectId}
3. 进入 Edge Functions
4. 点击函数: ${this.functionName}
5. 复制 ${this.sourceFile} 的完整内容
6. 替换编辑器中的代码
7. 点击 Save/Deploy

## 方法2: 使用命令行

运行以下命令序列：
\`\`\`bash
npx supabase login
npx supabase link --project-ref ${this.projectId}
npx supabase functions deploy ${this.functionName} --no-verify-jwt
\`\`\`

## 验证部署

部署完成后运行:
\`\`\`bash
node simple-api-test.js
node score-comparison-test.js
\`\`\`

预期结果: 一致性率达到100%
`;

    const guidePath = path.join(__dirname, 'MANUAL_DEPLOY.md');
    fs.writeFileSync(guidePath, guide);

    console.log('✅ 手动部署指南已创建:', guidePath);
    return guidePath;
  }

  /**
   * 运行完整的部署准备流程
   */
  runDeploymentPreparation() {
    console.log('🛠️  Supabase算法部署准备');
    console.log('='.repeat(60));

    // 检查前置条件
    if (!this.checkDeploymentPrerequisites()) {
      console.log('\n❌ 部署前置条件检查失败');
      return false;
    }

    // 生成部署命令
    const commands = this.generateDeploymentCommands();

    // 生成验证脚本
    const validationSteps = this.generateValidationScript();

    // 创建一键部署脚本
    const deployScript = this.createOneClickDeployScript();

    // 创建手动指南
    const manualGuide = this.createManualDeploymentGuide();

    console.log('\n📦 部署准备完成!');
    console.log('='.repeat(60));
    console.log('✅ 前置条件检查通过');
    console.log('✅ 部署命令已生成');
    console.log('✅ 验证脚本已准备');
    console.log('✅ 部署文档已创建');

    console.log('\n🚀 接下来的步骤:');
    console.log('1. 运行一键部署脚本: one-click-deploy.bat');
    console.log('2. 或者按照命令手动执行部署');
    console.log('3. 部署完成后运行验证测试');

    return {
      commands,
      validationSteps,
      deployScript,
      manualGuide
    };
  }
}

// 运行部署准备
function main() {
  const deployHelper = new DeployHelper();
  deployHelper.runDeploymentPreparation();
}

if (require.main === module) {
  main();
}

module.exports = DeployHelper;