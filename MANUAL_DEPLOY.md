# 手动部署指南

## 方法1: 使用Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目: fmjcjcpfcosvukgkgliz
3. 进入 Edge Functions
4. 点击函数: personality-api
5. 复制 personality-api-fixed.ts 的完整内容
6. 替换编辑器中的代码
7. 点击 Save/Deploy

## 方法2: 使用命令行

运行以下命令序列：
```bash
npx supabase login
npx supabase link --project-ref fmjcjcpfcosvukgkgliz
npx supabase functions deploy personality-api --no-verify-jwt
```

## 验证部署

部署完成后运行:
```bash
node simple-api-test.js
node score-comparison-test.js
```

预期结果: 一致性率达到100%
