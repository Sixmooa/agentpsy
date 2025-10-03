# 部署到 GitHub Pages 说明

## 子域名配置
本项目配置为使用子域名 `personality.agentpsy.com` 指向 GitHub Pages。

### 必要步骤：

1. **GitHub 仓库设置**
   - 在 GitHub 上创建仓库（例如：`your-username/personality-test-app`）
   - 将本 `static` 目录的内容推送到仓库的 `gh-pages` 分支

2. **DNS 配置**
   在您的域名管理面板（agentpsy.com）添加以下 DNS 记录：
   ```
   记录类型: CNAME
   主机记录: personality
   记录值: your-username.github.io
   TTL: 默认
   ```

3. **GitHub Pages 设置**
   - 进入仓库的 Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages" 分支
   - 保存设置

4. **等待生效**
   - DNS 传播可能需要 5-30 分钟
   - GitHub Pages 部署可能需要 5-10 分钟

### 验证部署
部署完成后，访问：https://personality.agentpsy.com

应该会自动重定向到英文版本的 AI 人格实验室界面。

### 多语言支持
- 默认英文界面：`https://personality.agentpsy.com/index-en.html`
- 中文界面：`https://personality.agentpsy.com/index.html`（会自动重定向）
- 语言切换：点击页面右上角的 "中文"/"English" 按钮

### 功能特点
- 🤖 AI 人格实验室横幅
- 📊 50题大五人格测试
- 🎯 MBTI 类型分析
- 👥 贝尔宾团队角色
- 💼 职业建议
- 🖼️ 个性化结果图片生成
- 🔗 AgentPsy.com 引导

### 技术特性
- ✅ 纯前端应用，无需后端
- ✅ PWA 支持，可离线使用
- ✅ 响应式设计，支持移动端
- ✅ 本地数据存储
- ✅ 多语言支持（中英文）

### 文件结构
```
static/
├── index.html              # 重定向到英文版本
├── index-en.html           # 英文主界面（AI实验室版）
├── CNAME                   # 子域名配置
├── _config.yml             # GitHub Pages 配置
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker
└── js/                     # JavaScript 模块
    ├── data.js             # 多语言数据
    ├── app.js              # 主应用逻辑
    ├── calculator.js       # 人格计算
    ├── storage.js          # 本地存储
    └── imageGenerator.js   # 图片生成
```

### 注意事项
1. 确保 DNS 配置正确，特别是 CNAME 记录
2. GitHub Pages 可能需要几分钟来识别新配置
3. 如果使用 Cloudflare 等 CDN，需要清除缓存
4. 证书会自动由 GitHub Pages 提供（HTTPS）

### 故障排除
如果访问失败：
1. 检查 DNS 是否生效：`nslookup personality.agentpsy.com`
2. 检查 GitHub Pages 状态：仓库 Settings > Pages
3. 检查 CNAME 文件内容是否正确
4. 确认仓库设置为公开（私有仓库需要 GitHub Pro）