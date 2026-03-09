import nodemailer from 'nodemailer';
import { query } from '../config/sqlite-database.js';

export const sendEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId, subject, content, recipients } = req.body;

    if (!senderId || !subject || !content || !recipients || recipients.length === 0)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const senderResult = await query('SELECT * FROM senders WHERE id = ? AND user_id = ?', [senderId, userId]);
    if (senderResult.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Sender not found' });

    const sender = senderResult.rows[0];

    const campaignResult = await query(
      'INSERT INTO email_campaigns (user_id, sender_id, subject, content, status, total_recipients) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, senderId, subject, content, 'sending', recipients.length]
    );
    const campaignId = campaignResult.rows[0]?.id;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: sender.email, pass: sender.password },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const email = typeof recipient === 'string' ? recipient : recipient.email;
      const name = typeof recipient === 'object' ? recipient.name || '' : '';
      try {
        await transporter.sendMail({ from: `${sender.name} <${sender.email}>`, to: email, subject, text: content });
        await query(
          'INSERT INTO emails (campaign_id, recipient_email, recipient_name, status, sent_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, email, name, 'sent', new Date().toISOString()]
        );
        sentCount++;
      } catch (err) {
        await query(
          'INSERT INTO emails (campaign_id, recipient_email, status, error_message) VALUES (?, ?, ?, ?)',
          [campaignId, email, 'failed', err.message]
        );
        failedCount++;
      }
    }

    await query(
      'UPDATE email_campaigns SET status = ?, sent_count = ?, failed_count = ?, completed_at = ? WHERE id = ?',
      ['completed', sentCount, failedCount, new Date().toISOString(), campaignId]
    );

    res.json({ success: true, message: `Sent: ${sentCount}, Failed: ${failedCount}`, campaignId });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, s.name as sender_name, s.email as sender_email 
       FROM email_campaigns c LEFT JOIN senders s ON c.sender_id = s.id 
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, campaigns: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
};

export const sendEmailWithAttachment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId, subject, content, recipients } = req.body;
    const cvFile = req.file;

    // Parse recipients from JSON string
    const recipientList = JSON.parse(recipients);

    if (!senderId || !subject || !content || !recipientList || recipientList.length === 0)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const senderResult = await query('SELECT * FROM senders WHERE id = ? AND user_id = ?', [senderId, userId]);
    if (senderResult.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Sender not found' });

    const sender = senderResult.rows[0];

    const campaignResult = await query(
      'INSERT INTO email_campaigns (user_id, sender_id, subject, content, status, total_recipients) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, senderId, subject, content, 'sending', recipientList.length]
    );
    const campaignId = campaignResult.rows[0]?.id;    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: sender.email, pass: sender.password },
    });

    let sentCount = 0;
    let failedCount = 0;

    // Prepare attachment object
    const attachments = cvFile ? [{
      filename: cvFile.originalname,
      content: cvFile.buffer,
      contentType: cvFile.mimetype
    }] : [];

    for (const recipient of recipientList) {
      const email = typeof recipient === 'string' ? recipient : recipient.email;
      const name = typeof recipient === 'object' ? recipient.name || '' : '';
      
      try {
        const mailOptions = {
          from: `${sender.name} <${sender.email}>`,
          to: email,
          subject: subject,
          html: content, // Use HTML content for better formatting
          attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        await query(
          'INSERT INTO emails (campaign_id, recipient_email, recipient_name, status, sent_at) VALUES (?, ?, ?, ?, ?)',
          [campaignId, email, name, 'sent', new Date().toISOString()]
        );
        sentCount++;
        
        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err.message);
        await query(
          'INSERT INTO emails (campaign_id, recipient_email, status, error_message) VALUES (?, ?, ?, ?)', 
          [campaignId, email, 'failed', err.message]
        );
        failedCount++;
      }
    }

    await query(
      'UPDATE email_campaigns SET status = ?, sent_count = ?, failed_count = ?, completed_at = ? WHERE id = ?',
      ['completed', sentCount, failedCount, new Date().toISOString(), campaignId]
    );

    const attachmentInfo = cvFile ? ` (CV: ${cvFile.originalname})` : '';
    res.json({ 
      success: true, 
      message: `Sent: ${sentCount}, Failed: ${failedCount}${attachmentInfo}`, 
      campaignId 
    });

  } catch (error) {
    console.error('Send email with attachment error:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails with attachment', error: error.message });
  }
};
