import { useState, useEffect } from 'react';
import { Mail, Send, Users, BarChart3, Settings, LogOut, Plus, Trash2, Upload, Terminal, Zap, Database, ChevronRight, X, Check } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const CyberpunkDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('send');
  const [senders, setSenders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [log, setLog] = useState(['> SYSTEM INITIALIZED', '> AWAITING COMMANDS...']);
  const [blink, setBlink] = useState(true);

  // Send form
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [sending, setSending] = useState(false);

  // Sender form
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newSenderPass, setNewSenderPass] = useState('');
  const [addingSender, setAddingSender] = useState(false);

  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 500);
    return () => clearInterval(b);
  }, []);

  const addLog = (msg) => setLog(prev => [...prev.slice(-20), `> ${msg}`]);

  const fetchSenders = async () => {
    try {
      const res = await fetch(`${API}/senders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSenders(data.senders || []);
    } catch { addLog('ERROR: Failed to fetch senders'); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch { addLog('ERROR: Failed to fetch analytics'); }
  };

  useEffect(() => {
    if (token) { fetchSenders(); fetchAnalytics(); }
  }, [token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedSender) { addLog('ERROR: No sender selected'); return; }
    setSending(true);
    addLog(`SENDING to ${recipients.split(',').length} recipient(s)...`);
    try {
      const recipientList = recipients.split(',').map(r => r.trim()).filter(Boolean);
      const res = await fetch(`${API}/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senderId: selectedSender, subject, content, recipients: recipientList }),
      });
      const data = await res.json();
      if (data.success) {
        addLog(`SUCCESS: ${data.message}`);
        setSubject(''); setContent(''); setRecipients('');
        fetchAnalytics();
      } else {
        addLog(`ERROR: ${data.message}`);
      }
    } catch (err) {
      addLog(`ERROR: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleAddSender = async (e) => {
    e.preventDefault();
    setAddingSender(true);
    addLog(`REGISTERING sender: ${newSenderEmail}`);
    try {
      const res = await fetch(`${API}/senders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSenderName, email: newSenderEmail, password: newSenderPass }),
      });
      const data = await res.json();
      if (data.success) {
        addLog(`SUCCESS: Sender ${newSenderEmail} registered`);
        setNewSenderName(''); setNewSenderEmail(''); setNewSenderPass('');
        fetchSenders();
      } else {
        addLog(`ERROR: ${data.message}`);
      }
    } catch (err) {
      addLog(`ERROR: ${err.message}`);
    } finally {
      setAddingSender(false);
    }
  };

  const handleDeleteSender = async (id, email) => {
    try {
      await fetch(`${API}/senders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      addLog(`DELETED sender: ${email}`);
      fetchSenders();
    } catch { addLog('ERROR: Failed to delete sender'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { id: 'send', icon: Send, label: 'SEND_MAIL' },
    { id: 'senders', icon: Database, label: 'SENDERS' },
    { id: 'analytics', icon: BarChart3, label: 'ANALYTICS' },
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.02) 2px, rgba(0,255,65,0.02) 4px)' }} />

      {/* Header */}
      <div className="border-b border-green-500/30 bg-black/95 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <span className="text-green-400 tracking-widest text-sm">AUTO_MAILER<span className={blink ? 'opacity-100' : 'opacity-0'}>█</span></span>
          <span className="text-xs text-green-700 border border-green-800 px-2 py-0.5">v2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-green-700">USER: <span className="text-green-500">{user?.username || user?.email}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-red-500/70 hover:text-red-400 border border-red-500/30 px-3 py-1 hover:border-red-400 transition">
            <LogOut className="w-3 h-3" /> LOGOUT
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-53px)]">
        {/* Sidebar */}
        <div className="w-48 border-r border-green-500/20 bg-black/80 flex flex-col">
          <div className="p-3 text-xs text-green-700 border-b border-green-500/20">[ NAVIGATION ]</div>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider transition border-l-2 ${activeTab === id ? 'border-green-400 bg-green-500/10 text-green-300' : 'border-transparent text-green-700 hover:text-green-500 hover:bg-green-500/5'}`}>
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}

          {/* Stats sidebar */}
          {analytics && (
            <div className="mt-auto p-3 border-t border-green-500/20 space-y-2">
              <div className="text-xs text-green-800">[ STATS ]</div>
              <div className="text-xs"><span className="text-green-700">CAMPAIGNS: </span><span className="text-green-400">{analytics.total_campaigns}</span></div>
              <div className="text-xs"><span className="text-green-700">SENT: </span><span className="text-green-400">{analytics.total_sent}</span></div>
              <div className="text-xs"><span className="text-green-700">FAILED: </span><span className="text-red-500">{analytics.total_failed}</span></div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">

            {/* SEND TAB */}
            {activeTab === 'send' && (
              <div>
                <div className="text-xs text-green-700 mb-4">&gt; COMPOSE_EMAIL.exe // BATCH_SEND_MODE</div>
                <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="text-xs text-green-600 block mb-1">&gt; SELECT_SENDER:</label>
                    <select value={selectedSender} onChange={e => setSelectedSender(e.target.value)} required
                      className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition font-mono">
                      <option value="">-- SELECT SENDER --</option>
                      {senders.map(s => <option key={s.id} value={s.id}>{s.name} &lt;{s.email}&gt;</option>)}
                    </select>
                    {senders.length === 0 && <p className="text-xs text-yellow-600 mt-1">&gt; WARNING: No senders. Add one in SENDERS tab.</p>}
                  </div>
                  <div>
                    <label className="text-xs text-green-600 block mb-1">&gt; RECIPIENTS (comma separated):</label>
                    <input type="text" value={recipients} onChange={e => setRecipients(e.target.value)} required
                      className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition font-mono"
                      placeholder="a@email.com, b@email.com" />
                  </div>
                  <div>
                    <label className="text-xs text-green-600 block mb-1">&gt; SUBJECT_LINE:</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required
                      className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition font-mono"
                      placeholder="Email subject..." />
                  </div>
                  <div>
                    <label className="text-xs text-green-600 block mb-1">&gt; MESSAGE_BODY:</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} required rows={6}
                      className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition font-mono resize-none"
                      placeholder="Email content..." />
                  </div>
                  <button type="submit" disabled={sending}
                    className="flex items-center gap-2 border border-green-500 bg-green-500/10 text-green-400 px-6 py-3 text-sm tracking-widest hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition disabled:opacity-40">
                    <Zap className="w-4 h-4" />
                    {sending ? '[ TRANSMITTING... ]' : '[ EXECUTE_SEND ]'}
                  </button>
                </form>
              </div>
            )}

            {/* SENDERS TAB */}
            {activeTab === 'senders' && (
              <div>
                <div className="text-xs text-green-700 mb-4">&gt; SENDER_MANAGEMENT.exe // SMTP_CONFIG</div>
                <form onSubmit={handleAddSender} className="border border-green-500/30 p-4 mb-6 max-w-xl space-y-3 bg-green-500/5">
                  <div className="text-xs text-green-600 mb-2">[ ADD NEW SENDER ]</div>
                  <input type="text" value={newSenderName} onChange={e => setNewSenderName(e.target.value)} required
                    className="w-full bg-black border border-green-500/30 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 font-mono"
                    placeholder="Display Name" />
                  <input type="email" value={newSenderEmail} onChange={e => setNewSenderEmail(e.target.value)} required
                    className="w-full bg-black border border-green-500/30 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 font-mono"
                    placeholder="gmail@example.com" />
                  <input type="password" value={newSenderPass} onChange={e => setNewSenderPass(e.target.value)} required
                    className="w-full bg-black border border-green-500/30 text-green-300 px-3 py-2 text-sm focus:outline-none focus:border-green-400 font-mono"
                    placeholder="Gmail App Password (16 chars)" />
                  <button type="submit" disabled={addingSender}
                    className="flex items-center gap-2 border border-green-500 bg-green-500/10 text-green-400 px-4 py-2 text-xs tracking-widest hover:bg-green-500/20 transition disabled:opacity-40">
                    <Plus className="w-3 h-3" /> {addingSender ? 'REGISTERING...' : '[ ADD_SENDER ]'}
                  </button>
                </form>

                <div className="space-y-2 max-w-xl">
                  {senders.length === 0 ? (
                    <div className="text-xs text-green-800 border border-green-900 p-4">&gt; NO_SENDERS_FOUND // Add a Gmail sender above</div>
                  ) : senders.map(s => (
                    <div key={s.id} className="flex items-center justify-between border border-green-500/20 p-3 bg-green-500/5 hover:border-green-500/40 transition">
                      <div>
                        <div className="text-xs text-green-400">{s.name}</div>
                        <div className="text-xs text-green-700">{s.email} // {s.provider?.toUpperCase()}</div>
                      </div>
                      <button onClick={() => handleDeleteSender(s.id, s.email)}
                        className="text-red-500/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 p-1.5 transition">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div>
                <div className="text-xs text-green-700 mb-4">&gt; ANALYTICS_MODULE.exe // CAMPAIGN_STATS</div>
                {analytics ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl">
                      {[
                        { label: 'TOTAL_CAMPAIGNS', value: analytics.total_campaigns, color: 'text-green-400' },
                        { label: 'EMAILS_SENT', value: analytics.total_sent, color: 'text-cyan-400' },
                        { label: 'EMAILS_FAILED', value: analytics.total_failed, color: 'text-red-400' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="border border-green-500/30 p-4 bg-green-500/5">
                          <div className="text-xs text-green-700 mb-1">{label}</div>
                          <div className={`text-3xl font-bold ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="max-w-2xl">
                      <div className="text-xs text-green-700 mb-2">&gt; RECENT_CAMPAIGNS:</div>
                      <div className="border border-green-500/20">
                        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-green-500/10 text-xs text-green-600 border-b border-green-500/20">
                          <span>SUBJECT</span><span>STATUS</span><span>SENT</span><span>FAILED</span>
                        </div>
                        {(analytics.recent_campaigns || []).slice(0, 10).map((c, i) => (
                          <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 text-xs border-b border-green-500/10 hover:bg-green-500/5">
                            <span className="text-green-300 truncate">{c.subject}</span>
                            <span className={c.status === 'completed' ? 'text-green-400' : 'text-yellow-500'}>{c.status?.toUpperCase()}</span>
                            <span className="text-cyan-400">{c.sent_count}</span>
                            <span className="text-red-400">{c.failed_count}</span>
                          </div>
                        ))}
                        {(!analytics.recent_campaigns || analytics.recent_campaigns.length === 0) && (
                          <div className="px-3 py-4 text-xs text-green-800">&gt; NO_CAMPAIGNS_FOUND</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-green-700">&gt; LOADING_ANALYTICS...</div>
                )}
              </div>
            )}
          </div>

          {/* Terminal log */}
          <div className="border-t border-green-500/20 bg-black/95 p-3 h-32 overflow-y-auto">
            <div className="text-xs text-green-800 mb-1">[ SYSTEM_LOG ]</div>
            {log.map((l, i) => (
              <div key={i} className={`text-xs ${l.includes('ERROR') ? 'text-red-500' : l.includes('SUCCESS') ? 'text-green-300' : 'text-green-700'}`}>{l}</div>
            ))}
            <div className="text-xs text-green-700">{blink ? '█' : ' '}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberpunkDashboard;
