# 推送到远程仓库指南

由于当前环境无法直接使用git命令，请按照以下步骤手动推送到远程仓库：

## 方法1：使用GitHub Desktop（推荐）

1. **下载并安装GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装适用于Windows的版本

2. **克隆或添加仓库**
   - 打开GitHub Desktop
   - 点击 "Clone a Repository from the Internet..."
   - 输入您的远程仓库URL（如：`https://github.com/your-username/personality-test-app.git`）
   - 选择本地路径：`D:\git\personality-test-app\static`

3. **提交更改**
   - 在左侧会看到所有修改的文件
   - 在"Summary"字段输入提交信息，例如：
     ```
         feat: 添加AI人格实验室功能和多语言支持
         
         - 添加AgentPsy.com AI人格实验室横幅和说明
         - 优化中英文语言切换功能
         - 生成图片添加AgentPsy.com引导
         - 配置personality.agentpsy.com子域名
         - 创建详细的部署文档
     ```
   - 点击"Commit to main"（或相应分支）

4. **推送到远程**
   - 点击右上角的"Push origin"按钮
   - 等待推送完成

## 方法2：手动使用命令行

1. **打开命令提示符或PowerShell**
   ```cmd
   cd D:\git\personality-test-app\static
   ```

2. **初始化git（如果尚未初始化）**
   ```cmd
   git init
   git remote add origin https://github.com/your-username/personality-test-app.git
   ```

3. **添加所有更改**
   ```cmd
   git add .
   ```

4. **提交更改**
   ```cmd
   git commit -m "feat: 添加AI人格实验室功能和多语言支持
   
   - 添加AgentPsy.com AI人格实验室横幅和说明
   - 优化中英文语言切换功能
   - 生成图片添加AgentPsy.com引导（简化为AgentPsy.com）
   - 配置personality.agentpsy.com子域名
   - 创建详细的部署文档"
   ```

5. **推送到远程**
   ```cmd
   git push -u origin main
   ```
   或者如果是其他分支：
   ```cmd
   git push -u origin gh-pages
   ```

## 方法3：直接在GitHub网站上传

1. **访问GitHub仓库**
   - 打开：https://github.com/your-username/personality-test-app

2. **上传文件**
   - 点击"Add file" → "Upload files"
   - 拖拽整个`static`目录的内容到上传区域
   - 在提交信息中输入：
     ```
     feat: 添加AI人格实验室功能和多语言支持
     
     - 添加AgentPsy.com AI人格实验室横幅和说明
     - 优化中英文语言切换功能
     - 生成图片添加AgentPsy.com引导
     - 配置personality.agentpsy.com子域名
     - 创建详细的部署文档
     ```
   - 点击"Commit changes"

## 验证推送

推送完成后，请检查：

1. **文件是否上传成功**
   - 在GitHub仓库页面查看文件列表
   - 确认`index-en.html`、`CNAME`等文件存在

2. **GitHub Pages是否启用**
   - 进入仓库的Settings > Pages
   - 确认已启用GitHub Pages
   - 查看提供的访问链接

3. **自定义域名配置**
   - 确认`CNAME`文件内容为`personality.agentpsy.com`
   - 在DNS管理面板添加相应的CNAME记录

## 当前项目状态

### 主要更新内容：
✅ **AgentPsy.com AI人格实验室功能**
- 添加了AI实验室横幅和说明
- 生成图片包含AgentPsy.com引导（已简化为AgentPsy.com）

✅ **多语言支持优化**
- 中英文切换功能完全正常
- 50个中文问题完整
- 中文答案选项和界面文本

✅ **子域名配置**
- 配置为`personality.agentpsy.com`
- 默认英文界面（AI实验室主题）
- 支持中英文切换

✅ **部署文档**
- 创建了详细的`DEPLOYMENT.md`
- 包含GitHub Pages配置说明

### 推送后需要做的：
1. 配置DNS的CNAME记录
2. 等待DNS传播（5-30分钟）
3. 测试访问`https://personality.agentpsy.com`

请选择上述任一方法进行推送，如有问题请随时告知！