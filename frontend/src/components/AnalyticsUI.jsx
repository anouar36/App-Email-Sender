import React, { useState } from 'react';
import { Download, TrendingUp, Mail, AlertCircle, Activity, BarChart3, PieChart } from 'lucide-react';

const AnalyticsUI = ({ analytics, onExport, isExporting }) => {
  const [localExporting, setLocalExporting] = useState(false);
  const exporting = Boolean(isExporting || localExporting);
  
  // State for row selection
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Escape double quotes
    return `"${str.replace(/"/g, '""')}"`;
  };
  const generateCsvFromCampaigns = (campaigns) => {
    const headers = ['No', 'Email', 'Company Name', 'Recipient Name', 'Subject', 'Application Date', 'Application Time', 'Full DateTime', 'Status', 'Sender', 'Campaign ID'];
    const rows = campaigns.map((c, index) => {
      const email = c.recipient_email || c.contact_email || c.recipient || '';
      const name = c.recipient_name || c.contact_name || 'N/A';
      const company = c.company_name || c.company || 'N/A';
      const sentDate = c.sent_at || c.created_at;
      const date = sentDate ? new Date(sentDate) : new Date();
      const applicationDate = date.toLocaleDateString('en-GB');
      const applicationTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const fullDateTime = date.toLocaleString('en-GB');
      
      return [
        index + 1,
        email,
        company,
        name,
        c.subject || '',
        applicationDate,
        applicationTime,
        fullDateTime,
        c.status || c.email_status || '',
        c.sender_name || 'N/A',
        c.id || c.campaign_id || ''
      ];
    });

    const csvLines = [headers, ...rows].map((row) => row.map(escapeCsv).join(','));
    return csvLines.join('\r\n');
  };
  const handleExportClick = async () => {
    try {
      setLocalExporting(true);
      
      // Get campaign IDs to export (selected or all)
      const campaigns = analytics.recent_campaigns || [];
      const campaignIds = selectedRows.size > 0 
        ? Array.from(selectedRows)
        : campaigns.map(c => c.id);
      
      if (campaignIds.length === 0) {
        alert('No campaigns to export');
        return;
      }

      // Fetch detailed data from backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/export-detailed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaignIds })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the Excel file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `email_campaigns_detailed_${ts}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${campaignIds.length} campaign(s) with all recipient details!`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export. Please try again.');
    } finally {
      setLocalExporting(false);
    }
  };

  // Toggle individual row selection
  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    const campaigns = analytics.recent_campaigns || [];
    setSelectAll(newSelected.size === campaigns.length);
  };

  // Toggle select all rows
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const campaigns = analytics.recent_campaigns || [];
      setSelectedRows(new Set(campaigns.map(c => c.id)));
      setSelectAll(true);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity size={48} className="text-terminal-accent mx-auto mb-4 animate-pulse" />
          <p className="text-terminal-dim">LOADING_ANALYTICS...</p>
        </div>
      </div>
    );
  }

  const successRate = analytics.total_sent > 0 
    ? ((analytics.total_sent / (analytics.total_sent + analytics.total_failed)) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">      {/* Header with Export Button */}
      <div className="flex items-center justify-between border-b border-terminal-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-terminal-text">ANALYTICS_DASHBOARD</h2>
          <div className="text-xs text-terminal-dim font-mono mt-1">
            // CAMPAIGN_PERFORMANCE_METRICS
            {selectedRows.size > 0 && (
              <span className="ml-2 text-terminal-accent font-bold">
                • {selectedRows.size} SELECTED
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {selectedRows.size > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-2 px-4 py-2 border border-terminal-border text-terminal-dim hover:text-terminal-text hover:border-terminal-accent/50 transition-all"
            >
              <span className="text-xs tracking-widest">CLEAR_SELECTION</span>
            </button>
          )}
          <button
            onClick={handleExportClick}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-terminal-accent text-terminal-accent hover:bg-terminal-accent hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className={exporting ? 'animate-bounce' : ''} />
            <span className="text-xs tracking-widest">
              {exporting 
                ? 'EXPORTING...' 
                : selectedRows.size > 0 
                  ? `EXPORT_SELECTED (${selectedRows.size})`
                  : 'EXPORT_ALL_DETAILS'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="border border-terminal-border bg-terminal-bg/50 p-4 hover:border-terminal-accent/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 border border-terminal-accent/30 bg-terminal-accent/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all">
              <BarChart3 size={20} className="text-terminal-accent" />
            </div>
            <div className="text-[10px] text-terminal-dim font-mono">TOTAL</div>
          </div>
          <div className="text-3xl font-bold text-terminal-text mb-1 font-mono">
            {analytics.total_campaigns}
          </div>
          <div className="text-[10px] text-terminal-dim uppercase tracking-wider">
            CAMPAIGNS_SENT
          </div>
        </div>

        {/* Total Emails Sent */}
        <div className="border border-terminal-border bg-terminal-bg/50 p-4 hover:border-green-500/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 border border-green-500/30 bg-green-500/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all">
              <Mail size={20} className="text-green-500" />
            </div>
            <div className="text-[10px] text-green-500 font-mono">SUCCESS</div>
          </div>
          <div className="text-3xl font-bold text-terminal-text mb-1 font-mono">
            {analytics.total_sent}
          </div>
          <div className="text-[10px] text-terminal-dim uppercase tracking-wider">
            EMAILS_DELIVERED
          </div>
        </div>

        {/* Total Failed */}
        <div className="border border-terminal-border bg-terminal-bg/50 p-4 hover:border-red-500/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 border border-red-500/30 bg-red-500/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div className="text-[10px] text-red-500 font-mono">FAILED</div>
          </div>
          <div className="text-3xl font-bold text-terminal-text mb-1 font-mono">
            {analytics.total_failed}
          </div>
          <div className="text-[10px] text-terminal-dim uppercase tracking-wider">
            EMAILS_FAILED
          </div>
        </div>

        {/* Success Rate */}
        <div className="border border-terminal-border bg-terminal-bg/50 p-4 hover:border-terminal-accent/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 border border-terminal-accent/30 bg-terminal-accent/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all">
              <TrendingUp size={20} className="text-terminal-accent" />
            </div>
            <div className="text-[10px] text-terminal-dim font-mono">RATE</div>
          </div>
          <div className="text-3xl font-bold text-terminal-text mb-1 font-mono">
            {successRate}%
          </div>
          <div className="text-[10px] text-terminal-dim uppercase tracking-wider">
            SUCCESS_RATE
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {analytics.status_breakdown && analytics.status_breakdown.length > 0 && (
        <div className="border border-terminal-border bg-terminal-bg/50 p-6">
          <h3 className="text-sm font-bold text-terminal-accent mb-4 uppercase tracking-widest flex items-center gap-2">
            <PieChart size={16} />
            CAMPAIGN_STATUS_BREAKDOWN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.status_breakdown.map((status) => (
              <div key={status.status} className="border border-terminal-border/50 p-4 bg-terminal-darker/30">
                <div className="text-2xl font-bold text-terminal-text font-mono mb-1">
                  {status.count}
                </div>
                <div className="text-[10px] text-terminal-dim uppercase tracking-wider">
                  {status.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Campaigns Table */}
      {analytics.recent_campaigns && analytics.recent_campaigns.length > 0 && (
        <div className="border border-terminal-border bg-terminal-bg/50">
          <div className="p-4 border-b border-terminal-border">
            <h3 className="text-sm font-bold text-terminal-accent uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} />
              RECENT_CAMPAIGNS
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-terminal-border">
                  <th className="text-left p-3 text-terminal-dim font-mono uppercase tracking-wider">ID</th>
                  <th className="text-left p-3 text-terminal-dim font-mono uppercase tracking-wider">Subject</th>
                  <th className="text-left p-3 text-terminal-dim font-mono uppercase tracking-wider">Sender</th>
                  <th className="text-center p-3 text-terminal-dim font-mono uppercase tracking-wider">Total</th>
                  <th className="text-center p-3 text-terminal-dim font-mono uppercase tracking-wider">Sent</th>
                  <th className="text-center p-3 text-terminal-dim font-mono uppercase tracking-wider">Failed</th>
                  <th className="text-left p-3 text-terminal-dim font-mono uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-terminal-dim font-mono uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_campaigns.map((campaign, index) => (
                  <tr 
                    key={campaign.id} 
                    className="border-b border-terminal-border/30 hover:bg-terminal-accent/5 transition-colors"
                  >
                    <td className="p-3 font-mono text-terminal-dim">#{campaign.id}</td>
                    <td className="p-3 text-terminal-text max-w-xs truncate">{campaign.subject}</td>
                    <td className="p-3 text-terminal-dim font-mono">{campaign.sender_name || 'N/A'}</td>
                    <td className="p-3 text-center font-mono text-terminal-text">{campaign.total_recipients || 0}</td>
                    <td className="p-3 text-center font-mono text-green-500">{campaign.sent_count || 0}</td>
                    <td className="p-3 text-center font-mono text-red-500">{campaign.failed_count || 0}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                        campaign.status === 'completed' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                        campaign.status === 'processing' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                        'border-red-500/30 text-red-500 bg-red-500/10'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-3 text-terminal-dim font-mono text-[10px]">
                      {new Date(campaign.created_at).toLocaleDateString()} {new Date(campaign.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {analytics.total_campaigns === 0 && (
        <div className="border border-terminal-border border-dashed bg-terminal-darker/10 p-12 text-center">
          <Activity size={48} className="text-terminal-dim mx-auto mb-4 opacity-50" />
          <h3 className="text-terminal-text font-bold mb-2 uppercase tracking-widest">NO_CAMPAIGNS_YET</h3>
          <p className="text-terminal-dim text-sm">
            Start sending emails to see analytics data here
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsUI;
