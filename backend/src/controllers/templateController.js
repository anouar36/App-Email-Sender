import { query } from '../config/sqlite-database.js';

export const getTemplates = async (req, res) => {
  try {
    const result = await query('SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, templates: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM templates WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, body, type } = req.body;
    if (!name || !subject || !body)
      return res.status(400).json({ success: false, message: 'Name, subject, and body are required' });
    const result = await query(
      'INSERT INTO templates (user_id, name, subject, body, type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, subject, body, type || 'custom']
    );
    res.status(201).json({ success: true, message: 'Template created', template: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, subject, body, type } = req.body;
    const check = await query('SELECT * FROM templates WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Template not found' });
    if (check.rows[0].is_default === 1)
      return res.status(403).json({ success: false, message: 'Cannot modify default templates' });
    await query(
      'UPDATE templates SET name = ?, subject = ?, body = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, subject, body, type || 'custom', req.params.id, req.user.id]
    );
    const updated = await query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Template updated', template: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const check = await query('SELECT * FROM templates WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Template not found' });
    if (check.rows[0].is_default === 1)
      return res.status(403).json({ success: false, message: 'Cannot delete default templates' });
    await query('DELETE FROM templates WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
};

export const duplicateTemplate = async (req, res) => {
  try {
    const check = await query('SELECT * FROM templates WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Template not found' });
    const orig = check.rows[0];
    const result = await query(
      'INSERT INTO templates (user_id, name, subject, body, type, is_default) VALUES (?, ?, ?, ?, ?, 0)',
      [req.user.id, `${orig.name} (Copy)`, orig.subject, orig.body, orig.type]
    );
    res.status(201).json({ success: true, message: 'Template duplicated', template: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to duplicate template' });
  }
};
