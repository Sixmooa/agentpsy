-- 修复贝尔宾角色的role_key和英文名称，使其与静态文件一致
-- 执行日期: 2025-01-04

-- 1. 更新role_key从缩写改为全名，同时修复英文名称差异
UPDATE belbin_roles 
SET 
    role_key = CASE 
        WHEN role_key = 'PL' THEN 'Plant'
        WHEN role_key = 'RI' THEN 'Resource_Investigator'
        WHEN role_key = 'CO' THEN 'Coordinator'
        WHEN role_key = 'SH' THEN 'Shaper'
        WHEN role_key = 'ME' THEN 'Monitor_Evaluator'
        WHEN role_key = 'TW' THEN 'Teamworker'
        WHEN role_key = 'IMP' THEN 'Implementer'
        WHEN role_key = 'CF' THEN 'Completer_Finisher'
        WHEN role_key = 'SP' THEN 'Specialist'
        ELSE role_key
    END,
    name_en = CASE 
        WHEN role_key = 'CO' THEN 'Coordinator'  -- 修复 Co-ordinator -> Coordinator
        ELSE name_en
    END,
    updated_at = NOW()
WHERE role_key IN ('PL', 'RI', 'CO', 'SH', 'ME', 'TW', 'IMP', 'CF', 'SP');

-- 2. 验证更新结果
SELECT role_key, name_zh, name_en, updated_at 
FROM belbin_roles 
ORDER BY 
    CASE role_key
        WHEN 'Plant' THEN 1
        WHEN 'Resource_Investigator' THEN 2
        WHEN 'Coordinator' THEN 3
        WHEN 'Shaper' THEN 4
        WHEN 'Monitor_Evaluator' THEN 5
        WHEN 'Teamworker' THEN 6
        WHEN 'Implementer' THEN 7
        WHEN 'Completer_Finisher' THEN 8
        WHEN 'Specialist' THEN 9
        ELSE 10
    END;