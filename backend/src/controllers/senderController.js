import { query } from '../config/sqlite-database.js';

export const getSenders = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, provider, created_at FROM senders WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, senders: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch senders' });
  }
};

export const createSender = async (req, res) => {
  try {
    const { name, email, password, provider } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const result = await query(
      'INSERT INTO senders (user_id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, email, password, provider || 'gmail']
    );
    const sender = result.rows[0];
    res.status(201).json({ success: true, sender: { id: sender.id, name: sender.name, email: sender.email, provider: sender.provider } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sender' });
  }
};

export const deleteSender = async (req, res) => {
  try {
    await query('DELETE FROM senders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Sender deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete sender' });
  }
};
