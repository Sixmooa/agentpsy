@echo off
echo 🚀 开始部署修复后的算法到Supabase
echo ========================================

echo 1. 登录Supabase...
npx supabase login

echo.
echo 2. 链接到项目...
npx supabase link --project-ref fmjcjcpfcosvukgkgliz

echo.
echo 3. 部署函数...
npx supabase functions deploy personality-api --no-verify-jwt

echo.
echo 4. 验证部署...
npx supabase functions list

echo.
echo ✅ 部署完成！
echo 现在运行以下命令验证效果：
echo node simple-api-test.js
echo node score-comparison-test.js

pause