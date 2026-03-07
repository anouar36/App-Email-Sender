import { query } from '../config/sqlite-database.js';

export const getConfig = async (req, res) => {
  try {
    const result = await query('SELECT config_key, config_value FROM config');
    const config = {};
    result.rows.forEach(row => { config[row.config_key] = row.config_value; });
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch config' });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    await query(
      'INSERT INTO config (config_key, config_value) VALUES (?, ?) ON CONFLICT(config_key) DO UPDATE SET config_value = ?, updated_at = CURRENT_TIMESTAMP',
      [key, value, value]
    );
    res.json({ success: true, message: 'Config updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update config' });
  }
};
