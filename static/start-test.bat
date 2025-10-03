@echo off
echo 启动人格测试应用...
echo.
echo 正在启动本地服务器...
start /min python -m http.server 8080
timeout /t 2 >nul

echo 正在打开浏览器...
start http://localhost:8080/quick-test.html
timeout /t 1 >nul
start http://localhost:8080/index.html

echo.
echo 服务器已启动在 http://localhost:8080
echo 快速测试: http://localhost:8080/quick-test.html
echo 主应用: http://localhost:8080/index.html  
echo 完整测试: http://localhost:8080/test.html
echo.
echo 按任意键停止服务器...
pause >nul

echo 正在停止服务器...
taskkill /f /im python.exe >nul 2>&1
echo 服务器已停止。