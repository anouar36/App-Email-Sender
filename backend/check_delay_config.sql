-- Check if send_delay_ms is configured
SELECT 
    user_id,
    config_key,
    config_value,
    created_at,
    updated_at
FROM app_config 
WHERE config_key = 'send_delay_ms';

-- If you want to manually set it for testing (replace 1 with your user_id):
-- INSERT INTO app_config (user_id, config_key, config_value) 
-- VALUES (1, 'send_delay_ms', '3000')
-- ON CONFLICT (user_id, config_key) 
-- DO UPDATE SET config_value = '3000', updated_at = CURRENT_TIMESTAMP;
