# Git推送脚本 - Windows环境
# 请将此脚本保存为 push_to_github.bat 并在本地运行

@echo off
echo ========================================
echo AgentPsy.com 项目推送到GitHub
echo 远程仓库: https://github.com/ptreezh/personality
echo ========================================

:: 设置Git路径（请根据您的实际安装路径修改）
set GIT_PATH=C:\Program Files\Git\cmd\git.exe
set PROJECT_PATH=D:\git\personality-test-app\static

:: 检查Git是否存在
if not exist "%GIT_PATH%" (
    echo 错误: 未找到Git，请检查安装路径
    echo 请确认Git已安装在: %GIT_PATH%
    pause
    exit /b 1
)

echo 正在进入项目目录...
cd /d "%PROJECT_PATH%"

echo ========================================
echo 1. 检查Git状态
echo ========================================
"%GIT_PATH%" status

echo ========================================
echo 2. 添加所有更改到暂存区
echo ========================================
"%GIT_PATH%" add .

echo ========================================
echo 3. 提交更改
echo ========================================
"%GIT_PATH%" commit -m "feat: 添加AgentPsy.com页首页脚和AI人格实验室功能

- 添加AgentPsy.com页首导航栏（Home, About, Products, Blog, Contact）
- 添加完整页脚（品牌介绍、快速链接、资源、联系方式）
- 为index-en.html和index.html添加统一的页首页脚设计
- 页首页脚采用深灰色渐变背景，与品牌色调一致
- 响应式设计，适配移动端显示
- 保持https://agentpsy.com域名引用一致性
- 优化用户体验，提供完整的网站导航

主要修改文件:
- index-en.html: 添加完整页首页脚
- index.html: 添加简化页首页脚
- 相关CSS样式文件

功能特点:
- 🤖 AgentPsy.com AI人格实验室横幅
- 📊 50题大五人格测试（中英文）
- 🎯 MBTI类型分析（含-A/-T后缀）
- 👥 贝尔宾团队角色分析
- 💼 个性化职业建议
- 🖼️ 结果图片生成（显示AgentPsy.com引导）
- 🌐 多语言支持，响应式设计"

echo ========================================
echo 4. 推送到远程仓库
echo ========================================
"%GIT_PATH%" push -u origin main

echo ========================================
echo 推送完成！
echo ========================================
echo 请访问: https://github.com/ptreezh/personality 查看结果
echo 部署地址: https://personality.agentpsy.com
echo ========================================

pause