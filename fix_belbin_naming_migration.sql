-- 修正贝尔宾角色命名迁移脚本
-- 使数据库中的命名与 static/js/data.js 保持一致

-- 修正 Monitor_Evaluator 的中文名称：从 "监督评估者" 改为 "监督者"
UPDATE belbin_roles 
SET name_zh = '监督者'
WHERE role_key = 'Monitor_Evaluator' AND name_zh = '监督评估者';

-- 修正 Plant 的中文名称：从 "塑造者" 改为 "智多星"
UPDATE belbin_roles 
SET name_zh = '智多星'
WHERE role_key = 'Plant' AND name_zh = '塑造者';

-- 验证修改结果
SELECT role_key, name_zh, name_en 
FROM belbin_roles 
WHERE role_key IN ('Monitor_Evaluator', 'Plant')
ORDER BY role_key;