-- ========================================
-- 贝尔宾角色命名修正脚本
-- 手动在 Supabase 控制台中执行
-- ========================================

-- 1. 首先查看当前的贝尔宾角色数据
SELECT role_key, name_zh, name_en 
FROM belbin_roles 
WHERE role_key IN ('Monitor_Evaluator', 'Plant')
ORDER BY role_key;

-- 2. 修正 Monitor_Evaluator 的中文名称：从 "监督评估者" 改为 "监督者"
UPDATE belbin_roles 
SET name_zh = '监督者'
WHERE role_key = 'Monitor_Evaluator';

-- 3. 修正 Plant 的中文名称：从 "塑造者" 改为 "智多星"  
UPDATE belbin_roles 
SET name_zh = '智多星'
WHERE role_key = 'Plant';

-- 4. 验证修改结果
SELECT role_key, name_zh, name_en 
FROM belbin_roles 
WHERE role_key IN ('Monitor_Evaluator', 'Plant')
ORDER BY role_key;

-- 5. 查看所有贝尔宾角色以确保一致性
SELECT role_key, name_zh, name_en 
FROM belbin_roles 
ORDER BY role_key;

-- ========================================
-- 执行说明：
-- 1. 登录 Supabase 控制台
-- 2. 进入项目 "WeMBTI" 
-- 3. 点击左侧菜单的 "SQL Editor"
-- 4. 复制并粘贴上述SQL语句
-- 5. 逐步执行每个查询
-- ========================================