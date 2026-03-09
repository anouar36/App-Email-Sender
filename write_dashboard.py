import os

path = r'C:\Users\Youcode\Desktop\App-Email-Sender\frontend\src\pages\CyberpunkDashboard.jsx'

code = r"""import { useState, useEffect, useRef } from 'react';
import {
  Send, BarChart3, Settings, LogOut, Plus, Trash2,
  Upload, Terminal, Zap, Database, ChevronRight, Download,
  User, Eye, EyeOff, RefreshCw, FileText, AlertTriangle,
  CheckCircle, XCircle, TrendingUp, Shield, Cpu, Mail
} from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const authHdr = (token, json = true) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${token}`,
});

const CyberpunkDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('send');
  const [senders, setSenders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [log, setLog] = useState(['> SYSTEM INITIALIZED', '> AWAITING COMMANDS...']);
  const [blink, setBlink] = useState(true);
  const logRef = useRef(null);

  // send
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [sending, setSending] = useState(false);

  // senders
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newSenderPass, setNewSenderPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [addingSender, setAddingSender] = useState(false);

  // import
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importSubject, setImportSubject] = useState('');
  const [importContent, setImportContent] = useState('');
  const [importSender, setImportSender] = useState('');
  const [importing, setImporting] = useState(false);

  // profile
  const [profileData, setProfileData] = useState({ full_name: '', email: '', username: '' });
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirm, setProfileConfirm] = useState('');
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // settings
  const [config, setConfig] = useState({ delay_ms: '200', batch_size: '10', smtp_host: 'smtp.gmail.com', smtp_port: '587' });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState(null);

  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 500);
    return () => clearInterval(b);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = msg => setLog(prev => [...prev.slice(-30), `> ${msg}`]);

  const fetchSenders = async () => {
    try {
      const r = await fetch(`${API}/senders`, { headers: authHdr(token) });
      const d = await r.json();
      setSenders(d.senders || []);
    } catch { addLog('ERROR: Failed to fetch senders'); }
  };

  const fetchAnalytics = async () => {
    try {
      const r = await fetch(`${API}/analytics`, { headers: authHdr(token) });
      const d = await r.json();
      if (d.success) setAnalytics(d.analytics);
    } catch { addLog('ERROR: Failed to fetch analytics'); }
  };

  const fetchProfile = async () => {
    try {
      const r = await fetch(`${API}/profile`, { headers: authHdr(token) });
      const d = await r.json();
      if (d.success) {
        setProfileData({ full_name: d.user.full_name || '', email: d.user.email || '', username: d.user.username || '' });
        if (d.user.avatar_url) setProfileAvatarPreview(`http://localhost:5000${d.user.avatar_url}`);
      }
    } catch { addLog('ERROR: Failed to load profile'); }
  };

  const fetchConfig = async () => {
    try {
      const r = await fetch(`${API}/config`, { headers: authHdr(token) });
      const d = await r.json();
      if (d.success) setConfig(prev => ({ ...prev, ...d.config }));
    } catch { addLog('ERROR: Failed to load config'); }
  };

  useEffect(() => {
    if (token) { fetchSenders(); fetchAnalytics(); fetchProfile(); fetchConfig(); }
  }, [token]);

  const handleSend = async e => {
    e.preventDefault();
    if (!selectedSender) { addLog('ERROR: No sender selected'); return; }
    setSending(true);
    const rl = recipients.split(',').map(r => r.trim()).filter(Boolean);
    addLog(`INITIATING SEND to ${rl.length} recipient(s)...`);
    try {
      const r = await fetch(`${API}/emails/send`, {
        method: 'POST', headers: authHdr(token),
        body: JSON.stringify({ senderId: selectedSender, subject, content, recipients: rl }),
      });
      const d = await r.json();
      if (d.success) { addLog(`SUCCESS: ${d.message}`); setSubject(''); setContent(''); setRecipients(''); fetchAnalytics(); }
      else addLog(`ERROR: ${d.message}`);
    } catch (err) { addLog(`ERROR: ${err.message}`); }
    finally { setSending(false); }
  };

  const handleAddSender = async e => {
    e.preventDefault(); setAddingSender(true); addLog(`REGISTERING: ${newSenderEmail}`);
    try {
      const r = await fetch(`${API}/senders`, {
        method: 'POST', headers: authHdr(token),
        body: JSON.stringify({ name: newSenderName, email: newSenderEmail, password: newSenderPass }),
      });
      const d = await r.json();
      if (d.success) { addLog(`SUCCESS: Sender ${newSenderEmail} registered`); setNewSenderName(''); setNewSenderEmail(''); setNewSenderPass(''); fetchSenders(); }
      else addLog(`ERROR: ${d.message}`);
    } catch (err) { addLog(`ERROR: ${err.message}`); }
    finally { setAddingSender(false); }
  };

  const handleDeleteSender = async (id, email) => {
    if (!window.confirm(`Delete sender ${email}?`)) return;
    try { await fetch(`${API}/senders/${id}`, { method: 'DELETE', headers: authHdr(token) }); addLog(`DELETED: ${email}`); fetchSenders(); }
    catch { addLog('ERROR: Delete failed'); }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1, 11).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setImportPreview(rows);
      addLog(`CSV LOADED: ${lines.length - 1} records found`);
    };
    reader.readAsText(file);
  };

  const handleImportSend = async e => {
    e.preventDefault();
    if (!importFile || !importSender || !importSubject || !importContent) { addLog('ERROR: Fill all import fields'); return; }
    setImporting(true); addLog('PARSING CSV...');
    const reader = new FileReader();
    reader.onload = async ev => {
      const lines = ev.target.result.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const emailCol = headers.findIndex(h => h.toLowerCase().includes('email'));
      const nameCol = headers.findIndex(h => h.toLowerCase().includes('name'));
      if (emailCol === -1) { addLog('ERROR: No email column found'); setImporting(false); return; }
      const rl = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return { email: vals[emailCol], name: nameCol !== -1 ? vals[nameCol] : '' };
      }).filter(r => r.email && r.email.includes('@'));
      addLog(`SENDING to ${rl.length} imported recipients...`);
      try {
        const r = await fetch(`${API}/emails/send`, {
          method: 'POST', headers: authHdr(token),
          body: JSON.stringify({ senderId: importSender, subject: importSubject, content: importContent, recipients: rl }),
        });
        const d = await r.json();
        if (d.success) { addLog(`SUCCESS: ${d.message}`); setImportFile(null); setImportPreview([]); setImportSubject(''); setImportContent(''); fetchAnalytics(); }
        else addLog(`ERROR: ${d.message}`);
      } catch (err) { addLog(`ERROR: ${err.message}`); }
      finally { setImporting(false); }
    };
    reader.readAsText(importFile);
  };

  const handleProfileSave = async e => {
    e.preventDefault();
    if (profilePassword && profilePassword !== profileConfirm) { setProfileMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setProfileSaving(true); setProfileMsg(null);
    try {
      const fd = new FormData();
      if (profileData.full_name) fd.append('full_name', profileData.full_name);
      if (profilePassword) fd.append('password', profilePassword);
      if (profileAvatar) fd.append('avatar', profileAvatar);
      const r = await fetch(`${API}/profile`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await r.json();
      if (d.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
        setProfilePassword(''); setProfileConfirm('');
        if (d.user?.avatar_url) setProfileAvatarPreview(`http://localhost:5000${d.user.avatar_url}`);
        addLog('SUCCESS: Profile updated');
      } else setProfileMsg({ type: 'error', text: d.message });
    } catch (err) { setProfileMsg({ type: 'error', text: err.message }); }
    finally { setProfileSaving(false); }
  };

  const handleConfigSave = async e => {
    e.preventDefault(); setConfigSaving(true); setConfigMsg(null);
    try {
      for (const [key, value] of Object.entries(config)) {
        await fetch(`${API}/config`, { method: 'POST', headers: authHdr(token), body: JSON.stringify({ key, value }) });
      }
      setConfigMsg({ type: 'success', text: 'Configuration saved' }); addLog('SUCCESS: Config updated');
    } catch (err) { setConfigMsg({ type: 'error', text: err.message }); }
    finally { setConfigSaving(false); }
  };

  const handleExport = () => {
    addLog('EXPORTING analytics to XLSX...');
    fetch(`${API}/analytics/export`, { headers: authHdr(token) })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `analytics_${Date.now()}.xlsx`; a.click();
        URL.revokeObjectURL(url);
        addLog('SUCCESS: XLSX exported');
      })
      .catch(() => addLog('ERROR: Export failed'));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { id: 'send',      icon: Send,      label: 'SEND_MAIL'  },
    { id: 'senders',   icon: Database,  label: 'SENDERS'    },
    { id: 'analytics', icon: BarChart3, label: 'ANALYTICS'  },
    { id: 'import',    icon: Upload,    label: 'IMPORT_CSV' },
    { id: 'profile',   icon: User,      label: 'PROFILE'    },
    { id: 'settings',  icon: Settings,  label: 'SETTINGS'   },
  ];

  const inp = 'w-full bg-black border border-green-500/40 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition font-mono placeholder-green-900';
  const btnP = 'flex items-center gap-2 px-4 py-2 text-xs tracking-widest border border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition font-mono disabled:opacity-40';
  const btnD = 'flex items-center gap-2 px-2 py-1.5 text-xs border border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/15 transition font-mono';

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      {/* scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.015) 2px,rgba(0,255,65,0.015) 4px)' }} />

      {/* HEADER */}
      <header className="border-b border-green-500/30 bg-black/98 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-green-400" />
          <span className="text-green-400 tracking-[0.3em] text-sm font-bold">
            AUTO_MAILER<span className={`ml-1 ${blink ? 'opacity-100' : 'opacity-0'}`}>█</span>
          </span>
          <span className="text-xs text-green-900 border border-green-900 px-2 py-0.5">v2.0</span>
          <span className="hidden md:inline text-xs text-green-900 border border-green-900/50 px-2 py-0.5">
            STATUS: <span className="text-green-600">ONLINE</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-700">USER:</span>
            <span className="text-green-500">{user?.username || user?.email || 'OPERATOR'}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-500/70 hover:text-red-400 border border-red-500/30 px-3 py-1.5 transition">
            <LogOut className="w-3 h-3" /> LOGOUT
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-53px)]">
        {/* SIDEBAR */}
        <nav className="w-52 border-r border-green-500/20 bg-black/80 flex flex-col shrink-0">
          <div className="p-3 text-xs text-green-900 border-b border-green-500/20 tracking-widest">[ NAVIGATION ]</div>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-3 text-xs tracking-wider transition border-l-2 text-left w-full ${
                activeTab === id
                  ? 'border-green-400 bg-green-500/10 text-green-300'
                  : 'border-transparent text-green-700 hover:text-green-500 hover:bg-green-500/5'}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {activeTab === id && <ChevronRight className="w-3 h-3 ml-auto text-green-500" />}
            </button>
          ))}
          {analytics && (
            <div className="mt-auto p-3 border-t border-green-500/20 space-y-1.5">
              <div className="text-xs text-green-900 tracking-widest mb-1">[ LIVE STATS ]</div>
              {[
                { l: 'CAMPAIGNS', v: analytics.total_campaigns, c: 'text-green-400' },
                { l: 'SENT',      v: analytics.total_sent,      c: 'text-cyan-400'  },
                { l: 'FAILED',    v: analytics.total_failed,    c: 'text-red-400'   },
                { l: 'SENDERS',   v: senders.length,            c: 'text-yellow-400'},
              ].map(({ l, v, c }) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-green-900">{l}:</span>
                  <span className={c}>{v ?? '...'}</span>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">

            {/* ══ SEND MAIL ══ */}
            {activeTab === 'send' && (
              <section className="max-w-2xl">
                <SH title="SEND_MAIL.exe" sub="Compose and transmit emails to multiple recipients" />
                <form onSubmit={handleSend} className="space-y-4">
                  <F label="SELECT_SENDER">
                    <select value={selectedSender} onChange={e => setSelectedSender(e.target.value)} required className={inp}>
                      <option value="">-- SELECT SENDER --</option>
                      {senders.map(s => <option key={s.id} value={s.id}>{s.name} &lt;{s.email}&gt;</option>)}
                    </select>
                    {senders.length === 0 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        No senders configured. Go to <b className="text-yellow-500">SENDERS</b> tab first.
                      </p>
                    )}
                  </F>
                  <F label="RECIPIENTS (comma-separated)">
                    <input value={recipients} onChange={e => setRecipients(e.target.value)} required className={inp}
                      placeholder="alice@example.com, bob@example.com, ..." />
                    {recipients && (
                      <p className="text-xs text-green-900 mt-1">
                        {recipients.split(',').filter(r => r.trim()).length} recipient(s) detected
                      </p>
                    )}
                  </F>
                  <F label="SUBJECT_LINE">
                    <input value={subject} onChange={e => setSubject(e.target.value)} required className={inp} placeholder="Email subject..." />
                  </F>
                  <F label="MESSAGE_BODY">
                    <textarea value={content} onChange={e => setContent(e.target.value)} required rows={7}
                      className={`${inp} resize-none`} placeholder="Type your email content here..." />
                  </F>
                  <button type="submit" disabled={sending || senders.length === 0}
                    className={`${btnP} px-6 py-3 text-sm hover:shadow-[0_0_20px_rgba(0,255,65,0.25)]`}>
                    <Zap className="w-4 h-4" />
                    {sending ? '[ TRANSMITTING... ]' : '[ EXECUTE_SEND ]'}
                  </button>
                </form>
              </section>
            )}

            {/* ══ SENDERS ══ */}
            {activeTab === 'senders' && (
              <section>
                <SH title="SENDER_MANAGEMENT.exe" sub="Configure Gmail senders with App Passwords" />
                <div className="max-w-2xl mb-6 border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs space-y-1">
                  <div className="text-yellow-400 flex items-center gap-2 mb-2 font-bold">
                    <Shield className="w-3.5 h-3.5" /> HOW TO GET A GMAIL APP PASSWORD
                  </div>
                  {[
                    '1. Go to myaccount.google.com > Security',
                    '2. Enable 2-Step Verification (required)',
                    '3. Search "App passwords" in the search bar',
                    '4. Select Mail > Other > name it "AutoMailer"',
                    '5. Copy the 16-character password shown',
                    '6. Paste it below (no spaces needed)',
                  ].map((s, i) => <div key={i} className="text-yellow-700">{s}</div>)}
                </div>
                <form onSubmit={handleAddSender} className="border border-green-500/30 p-4 mb-6 max-w-xl space-y-3 bg-green-500/5">
                  <div className="text-xs text-green-700 mb-1 tracking-wider">[ ADD NEW SENDER ]</div>
                  <F label="DISPLAY_NAME">
                    <input value={newSenderName} onChange={e => setNewSenderName(e.target.value)} required className={inp} placeholder="John Doe" />
                  </F>
                  <F label="GMAIL_ADDRESS">
                    <input type="email" value={newSenderEmail} onChange={e => setNewSenderEmail(e.target.value)} required className={inp} placeholder="yourname@gmail.com" />
                  </F>
                  <F label="APP_PASSWORD (16 chars)">
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={newSenderPass}
                        onChange={e => setNewSenderPass(e.target.value)} required
                        className={`${inp} pr-10`} placeholder="xxxx xxxx xxxx xxxx" maxLength={19} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-400">
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </F>
                  <button type="submit" disabled={addingSender} className={btnP}>
                    <Plus className="w-3 h-3" />
                    {addingSender ? 'REGISTERING...' : '[ ADD_SENDER ]'}
                  </button>
                </form>
                <div className="max-w-xl space-y-2">
                  <div className="text-xs text-green-900 mb-2">[ REGISTERED_SENDERS ] — {senders.length} found</div>
                  {senders.length === 0 ? (
                    <div className="border border-green-900 p-4 text-xs text-green-900">No senders configured yet.</div>
                  ) : senders.map(s => (
                    <div key={s.id} className="flex items-center justify-between border border-green-500/20 px-4 py-3 bg-green-500/5 hover:border-green-500/40 transition">
                      <div className="min-w-0">
                        <div className="text-xs text-green-300 truncate">{s.name}</div>
                        <div className="text-xs text-green-700 truncate">{s.email}</div>
                        <div className="text-xs text-green-900 mt-0.5">PROVIDER: {(s.provider || 'gmail').toUpperCase()}</div>
                      </div>
                      <button onClick={() => handleDeleteSender(s.id, s.email)} className={`${btnD} ml-4`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══ ANALYTICS ══ */}
            {activeTab === 'analytics' && (
              <section>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <SH title="ANALYTICS_MODULE.exe" sub="Campaign statistics and performance data" noMargin />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={fetchAnalytics} className={btnP}><RefreshCw className="w-3 h-3" /> REFRESH</button>
                    <button onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest border border-cyan-500/40 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/15 transition font-mono">
                      <Download className="w-3 h-3" /> EXPORT_XLSX
                    </button>
                  </div>
                </div>
                {!analytics ? (
                  <div className="text-xs text-green-700 animate-pulse">Loading analytics...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-3xl">
                      {[
                        { label: 'CAMPAIGNS',    value: analytics.total_campaigns, Icon: Mail,        cls: 'text-green-400', b: 'border-green-500/30' },
                        { label: 'TOTAL_SENT',   value: analytics.total_sent,      Icon: CheckCircle, cls: 'text-cyan-400',  b: 'border-cyan-500/30'  },
                        { label: 'TOTAL_FAILED', value: analytics.total_failed,    Icon: XCircle,     cls: 'text-red-400',   b: 'border-red-500/30'   },
                        {
                          label: 'SUCCESS_RATE',
                          value: (() => {
                            const t = (analytics.total_sent || 0) + (analytics.total_failed || 0);
                            return t > 0 ? `${Math.round(analytics.total_sent / t * 100)}%` : 'N/A';
                          })(),
                          Icon: TrendingUp, cls: 'text-yellow-400', b: 'border-yellow-500/30',
                        },
                      ].map(({ label, value, Icon, cls, b }) => (
                        <div key={label} className={`border ${b} p-4 bg-black`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-green-900">{label}</span>
                            <Icon className={`w-3.5 h-3.5 ${cls} opacity-50`} />
                          </div>
                          <div className={`text-2xl font-bold ${cls}`}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {analytics.status_breakdown?.length > 0 && (
                      <div className="max-w-3xl mb-6">
                        <div className="text-xs text-green-900 mb-2">[ STATUS_BREAKDOWN ]</div>
                        <div className="flex gap-3 flex-wrap">
                          {analytics.status_breakdown.map(s => (
                            <div key={s.status} className="border border-green-500/20 px-3 py-2 text-xs">
                              <span className="text-green-700">{s.status?.toUpperCase()}: </span>
                              <span className="text-green-400">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="max-w-4xl">
                      <div className="text-xs text-green-900 mb-2">[ RECENT_CAMPAIGNS ]</div>
                      <div className="border border-green-500/20 overflow-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-green-500/10 border-b border-green-500/20">
                              {['SUBJECT', 'SENDER', 'STATUS', 'TOTAL', 'SENT', 'FAILED', 'DATE'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-green-700 font-normal tracking-wider whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(analytics.recent_campaigns || []).length === 0 ? (
                              <tr><td colSpan={7} className="px-3 py-4 text-green-900">No campaigns yet</td></tr>
                            ) : (analytics.recent_campaigns || []).map((c, i) => (
                              <tr key={i} className="border-b border-green-500/10 hover:bg-green-500/5 transition">
                                <td className="px-3 py-2 text-green-300 max-w-[160px] truncate">{c.subject}</td>
                                <td className="px-3 py-2 text-green-700 whitespace-nowrap">{c.sender_name || '—'}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 border text-xs ${
                                    c.status === 'completed' ? 'border-green-500/30 text-green-400' :
                                    c.status === 'sending'   ? 'border-yellow-500/30 text-yellow-400' :
                                                               'border-red-500/30 text-red-400'}`}>
                                    {c.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-green-700">{c.total_recipients}</td>
                                <td className="px-3 py-2 text-cyan-400">{c.sent_count}</td>
                                <td className="px-3 py-2 text-red-400">{c.failed_count}</td>
                                <td className="px-3 py-2 text-green-900 whitespace-nowrap">
                                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* ══ IMPORT CSV ══ */}
            {activeTab === 'import' && (
              <section>
                <SH title="IMPORT_MODULE.exe" sub="Bulk email sending from CSV file" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                  <form onSubmit={handleImportSend} className="space-y-4">
                    <F label="UPLOAD_CSV_FILE">
                      <label className="block border border-dashed border-green-500/40 hover:border-green-400 p-6 text-center cursor-pointer transition bg-green-500/5">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                        <Upload className="w-8 h-8 text-green-700 mx-auto mb-2" />
                        <div className="text-xs text-green-700">
                          {importFile ? (
                            <><span className="text-green-400">{importFile.name}</span><br /><span className="text-green-900">{importPreview.length}+ rows detected</span></>
                          ) : (
                            <><span>DROP CSV FILE HERE</span><br /><span className="text-green-900">or click to browse</span></>
                          )}
                        </div>
                      </label>
                      <div className="text-xs text-green-900 mt-1">
                        Required column: <span className="text-green-700">email</span> | Optional: name, company
                      </div>
                    </F>
                    <F label="SELECT_SENDER">
                      <select value={importSender} onChange={e => setImportSender(e.target.value)} required className={inp}>
                        <option value="">-- SELECT SENDER --</option>
                        {senders.map(s => <option key={s.id} value={s.id}>{s.name} &lt;{s.email}&gt;</option>)}
                      </select>
                    </F>
                    <F label="SUBJECT_LINE">
                      <input value={importSubject} onChange={e => setImportSubject(e.target.value)} required className={inp} placeholder="Campaign subject..." />
                    </F>
                    <F label="MESSAGE_BODY">
                      <textarea value={importContent} onChange={e => setImportContent(e.target.value)} required rows={5}
                        className={`${inp} resize-none`} placeholder="Email content for all recipients..." />
                    </F>
                    <button type="submit" disabled={importing || !importFile} className={`${btnP} px-6 py-3 text-sm`}>
                      <Zap className="w-4 h-4" />
                      {importing ? '[ SENDING BULK... ]' : `[ SEND TO ${importPreview.length > 0 ? importPreview.length + '+' : 'CSV'} RECIPIENTS ]`}
                    </button>
                  </form>

                  {importPreview.length > 0 ? (
                    <div>
                      <div className="text-xs text-green-900 mb-2">[ CSV_PREVIEW — first 10 rows ]</div>
                      <div className="border border-green-500/20 overflow-auto max-h-96">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-green-500/10 border-b border-green-500/20">
                              {Object.keys(importPreview[0] || {}).map(h => (
                                <th key={h} className="text-left px-2 py-1.5 text-green-700 font-normal whitespace-nowrap">{h.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((row, i) => (
                              <tr key={i} className="border-b border-green-500/10 hover:bg-green-500/5">
                                {Object.values(row).map((v, j) => (
                                  <td key={j} className="px-2 py-1.5 text-green-400 max-w-[120px] truncate">{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-xs text-green-900 mt-1">Showing first 10 rows of all records in file</div>
                    </div>
                  ) : (
                    <div className="border border-green-500/20 p-6 flex flex-col items-center justify-center text-center space-y-3">
                      <FileText className="w-10 h-10 text-green-900" />
                      <div className="text-xs text-green-900 space-y-1">
                        <div className="text-green-700 font-bold mb-2">CSV FORMAT GUIDE</div>
                        <div>Required: <span className="text-green-500">email</span> column</div>
                        <div>Optional: name, company, phone</div>
                        <pre className="mt-3 text-left border border-green-900 p-2 text-green-800 text-xs leading-relaxed">
{`email,name,company
alice@co.com,Alice,ACME
bob@co.com,Bob,Corp Inc`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ══ PROFILE ══ */}
            {activeTab === 'profile' && (
              <section>
                <SH title="PROFILE_MANAGER.exe" sub="Update your account details and security settings" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
                  <div className="flex flex-col items-center border border-green-500/20 p-6 bg-green-500/5 space-y-4">
                    {profileAvatarPreview ? (
                      <img src={profileAvatarPreview} alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-green-500/50" />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-green-500/30 bg-green-500/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-green-700" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-sm text-green-400">{profileData.username || 'OPERATOR'}</div>
                      <div className="text-xs text-green-700">{profileData.email}</div>
                    </div>
                    <label className={`${btnP} cursor-pointer`}>
                      <Upload className="w-3 h-3" /> UPLOAD_AVATAR
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const f = e.target.files[0];
                          if (f) { setProfileAvatar(f); setProfileAvatarPreview(URL.createObjectURL(f)); }
                        }} />
                    </label>
                    <div className="text-xs text-green-900">Max 5MB · JPG / PNG / GIF</div>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <F label="FULL_NAME">
                      <input value={profileData.full_name}
                        onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))}
                        className={inp} placeholder="Your full name" />
                    </F>
                    <F label="EMAIL (read-only)">
                      <input value={profileData.email} readOnly className={`${inp} opacity-50 cursor-not-allowed`} />
                    </F>
                    <F label="USERNAME (read-only)">
                      <input value={profileData.username} readOnly className={`${inp} opacity-50 cursor-not-allowed`} />
                    </F>
                    <div className="border border-green-500/20 p-3 space-y-3">
                      <div className="text-xs text-green-700 tracking-wider">[ CHANGE_PASSWORD ]</div>
                      <F label="NEW_PASSWORD">
                        <input type="password" value={profilePassword}
                          onChange={e => setProfilePassword(e.target.value)}
                          className={inp} placeholder="Leave blank to keep current" minLength={6} />
                      </F>
                      <F label="CONFIRM_PASSWORD">
                        <input type="password" value={profileConfirm}
                          onChange={e => setProfileConfirm(e.target.value)}
                          className={`${inp}${profilePassword && profileConfirm && profilePassword !== profileConfirm ? ' border-red-500/60' : ''}`}
                          placeholder="Confirm new password" />
                        {profilePassword && profileConfirm && profilePassword !== profileConfirm && (
                          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </F>
                    </div>
                    {profileMsg && (
                      <div className={`text-xs flex items-center gap-2 px-3 py-2 border ${
                        profileMsg.type === 'success'
                          ? 'border-green-500/30 text-green-400 bg-green-500/10'
                          : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {profileMsg.type === 'success'
                          ? <CheckCircle className="w-3 h-3" />
                          : <XCircle className="w-3 h-3" />}
                        {profileMsg.text}
                      </div>
                    )}
                    <button type="submit" disabled={profileSaving} className={`${btnP} px-6 py-2.5`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {profileSaving ? 'SAVING...' : '[ SAVE_PROFILE ]'}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* ══ SETTINGS ══ */}
            {activeTab === 'settings' && (
              <section>
                <SH title="SYSTEM_CONFIG.exe" sub="SMTP settings, rate limiting, and app configuration" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
                  <form onSubmit={handleConfigSave} className="space-y-4">
                    <div className="border border-green-500/20 p-4 space-y-3 bg-green-500/5">
                      <div className="text-xs text-green-700 tracking-wider">[ SMTP_CONFIGURATION ]</div>
                      <F label="SMTP_HOST">
                        <input value={config.smtp_host || 'smtp.gmail.com'}
                          onChange={e => setConfig(p => ({ ...p, smtp_host: e.target.value }))}
                          className={inp} placeholder="smtp.gmail.com" />
                      </F>
                      <F label="SMTP_PORT">
                        <input type="number" value={config.smtp_port || '587'}
                          onChange={e => setConfig(p => ({ ...p, smtp_port: e.target.value }))}
                          className={inp} placeholder="587" />
                      </F>
                    </div>
                    <div className="border border-green-500/20 p-4 space-y-3 bg-green-500/5">
                      <div className="text-xs text-green-700 tracking-wider">[ RATE_LIMITING ]</div>
                      <F label={`DELAY_BETWEEN_EMAILS — ${config.delay_ms || 200}ms`}>
                        <input type="range" min={0} max={5000} step={100}
                          value={config.delay_ms || 200}
                          onChange={e => setConfig(p => ({ ...p, delay_ms: e.target.value }))}
                          className="w-full accent-green-500" />
                        <div className="flex justify-between text-xs text-green-900 mt-0.5">
                          <span>0ms (fastest)</span>
                          <span className="text-green-500">{config.delay_ms || 200}ms</span>
                          <span>5000ms (safest)</span>
                        </div>
                      </F>
                      <F label="BATCH_SIZE (emails per batch)">
                        <input type="number" min={1} max={500} value={config.batch_size || 10}
                          onChange={e => setConfig(p => ({ ...p, batch_size: e.target.value }))}
                          className={inp} />
                        <div className="text-xs text-green-900 mt-1">Gmail free: ~500/day · 100/hour</div>
                      </F>
                    </div>
                    {configMsg && (
                      <div className={`text-xs flex items-center gap-2 px-3 py-2 border ${
                        configMsg.type === 'success'
                          ? 'border-green-500/30 text-green-400 bg-green-500/10'
                          : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {configMsg.type === 'success'
                          ? <CheckCircle className="w-3 h-3" />
                          : <XCircle className="w-3 h-3" />}
                        {configMsg.text}
                      </div>
                    )}
                    <button type="submit" disabled={configSaving} className={`${btnP} px-6 py-2.5`}>
                      <Settings className="w-3.5 h-3.5" />
                      {configSaving ? 'SAVING...' : '[ SAVE_CONFIG ]'}
                    </button>
                  </form>

                  <div className="space-y-4">
                    <div className="border border-cyan-500/20 p-4 bg-cyan-500/5 space-y-2">
                      <div className="text-xs text-cyan-500 tracking-wider flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> GMAIL_LIMITS
                      </div>
                      {[
                        { l: 'Free accounts',     v: '500 emails/day'   },
                        { l: 'Google Workspace',  v: '2,000 emails/day' },
                        { l: 'Per hour limit',    v: '~100 emails'      },
                        { l: 'Recommended delay', v: '200-500ms'        },
                        { l: 'Max BCC per send',  v: '500 recipients'   },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between text-xs">
                          <span className="text-green-900">{l}:</span>
                          <span className="text-cyan-400">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border border-green-500/20 p-4 bg-green-500/5 space-y-2">
                      <div className="text-xs text-green-700 tracking-wider mb-1">[ SYSTEM_INFO ]</div>
                      {[
                        { l: 'Backend',  v: 'Express + SQLite'   },
                        { l: 'Auth',     v: 'JWT Bearer Token'   },
                        { l: 'Email',    v: 'Nodemailer + Gmail' },
                        { l: 'Export',   v: 'XLSX (SheetJS)'     },
                        { l: 'Frontend', v: 'React + Vite'       },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between text-xs">
                          <span className="text-green-900">{l}:</span>
                          <span className="text-green-500">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* TERMINAL LOG */}
          <div className="border-t border-green-500/20 bg-black/98 h-32 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-green-500/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-green-900" />
                <span className="text-xs text-green-900 tracking-widest">SYSTEM_LOG</span>
              </div>
              <button onClick={() => setLog(['> LOG_CLEARED', '> AWAITING COMMANDS...'])}
                className="text-xs text-green-900 hover:text-green-700 transition">CLEAR</button>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              {log.map((l, i) => (
                <div key={i} className={`text-xs leading-relaxed ${
                  l.includes('ERROR')   ? 'text-red-500'    :
                  l.includes('SUCCESS') ? 'text-green-300'  :
                  l.includes('WARNING') ? 'text-yellow-500' :
                                          'text-green-900'}`}>{l}</div>
              ))}
              <div className="text-xs text-green-700">{blink ? '█' : ' '}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SH = ({ title, sub, noMargin }) => (
  <div className={noMargin ? '' : 'mb-5'}>
    <div className="text-xs text-green-700 tracking-wider">&gt; {title}</div>
    {sub && <div className="text-xs text-green-900 mt-0.5">// {sub}</div>}
  </div>
);

const F = ({ label, children }) => (
  <div>
    <label className="text-xs text-green-700 block mb-1">&gt; {label}:</label>
    {children}
  </div>
);

export default CyberpunkDashboard;
"""

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

import os
size = os.path.getsize(path)
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f"SUCCESS: {len(lines)} lines, {size} bytes")
print(f"First: {lines[0][:60]!r}")
print(f"Last:  {lines[-1][:60]!r}")
