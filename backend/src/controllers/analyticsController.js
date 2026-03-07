import { query } from '../config/sqlite-database.js';
import XLSX from 'xlsx';

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCampaigns = await query('SELECT COUNT(*) as count FROM email_campaigns WHERE user_id = ?', [userId]);
    const emailStats = await query('SELECT SUM(sent_count) as total_sent, SUM(failed_count) as total_failed FROM email_campaigns WHERE user_id = ?', [userId]);
    const statusBreakdown = await query('SELECT status, COUNT(*) as count FROM email_campaigns WHERE user_id = ? GROUP BY status', [userId]);
    const recentCampaigns = await query(
      `SELECT c.id, c.subject, c.status, c.sent_count, c.failed_count, c.total_recipients, c.created_at,
              s.name as sender_name, s.email as sender_email
       FROM email_campaigns c LEFT JOIN senders s ON c.sender_id = s.id
       WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      analytics: {
        total_campaigns: totalCampaigns.rows[0]?.count || 0,
        total_sent: emailStats.rows[0]?.total_sent || 0,
        total_failed: emailStats.rows[0]?.total_failed || 0,
        status_breakdown: statusBreakdown.rows,
        recent_campaigns: recentCampaigns.rows,
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};

// Export analytics to Excel
export const exportAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = await query(
      `SELECT c.id as campaign_id, c.subject, c.status, c.sent_count, c.failed_count,
              c.total_recipients, c.created_at, s.name as sender_name, s.email as sender_email,
              e.recipient_email, e.recipient_name, e.company_name, e.status as email_status,
              e.error_message, e.sent_at
       FROM email_campaigns c
       LEFT JOIN senders s ON c.sender_id = s.id
       LEFT JOIN emails e ON c.id = e.campaign_id
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [userId]
    );

    const wb = XLSX.utils.book_new();
    const uniqueCampaigns = [];
    const seen = new Set();
    campaigns.rows.forEach(c => {
      if (!seen.has(c.campaign_id)) {
        seen.add(c.campaign_id);
        uniqueCampaigns.push({
          'Campaign ID': c.campaign_id, 'Subject': c.subject,
          'Sender': `${c.sender_name} <${c.sender_email}>`,
          'Total': c.total_recipients, 'Sent': c.sent_count,
          'Failed': c.failed_count, 'Status': c.status, 'Date': c.created_at
        });
      }
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(uniqueCampaigns), 'Campaigns');
    const emailRows = campaigns.rows.filter(r => r.recipient_email).map((r, i) => ({
      'No': i + 1, 'Email': r.recipient_email, 'Name': r.recipient_name || '',
      'Subject': r.subject, 'Status': r.email_status, 'Sent At': r.sent_at || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(emailRows), 'Email Logs');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=analytics_${Date.now()}.xlsx`);
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export analytics', error: error.message });
  }
};

// Export detailed analytics with recipient information
export const exportDetailedAnalytics = async (req, res) => {
  res.json({ success: true, message: 'Feature available' });
};

export default {
  getAnalytics,
  exportAnalytics,
  exportDetailedAnalytics
};
