@echo off
echo 🚀 一键部署Supabase算法
echo ================================

echo 📋 检查部署前置条件...
if not exist "personality-api-fixed.ts" (
    echo ❌ 源文件不存在: personality-api-fixed.ts
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
npx supabase link --project-ref fmjcjcpfcosvukgkgliz

echo.
echo 部署函数...
npx supabase functions deploy personality-api --no-verify-jwt

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
