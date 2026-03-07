import { useState } from 'react';
import { Mail, Upload, Send, FileText, Users, BarChart3, Settings, LogOut, Sparkles, Zap, Database, ChevronDown, X, Eye, Download } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const PremiumDashboard = () => {
  const [selectedMode, setSelectedMode] = useState('1:1');  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSender, setSelectedSender] = useState('');
  const [senders] = useState([]); // This will be populated from backend/settings
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Create preview URL for the file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePreview = () => {
    if (uploadedFile) {
      setShowPreviewModal(true);
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const closeModal = () => {
    setShowPreviewModal(false);
  };
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Dot Pattern Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-900/5 via-black to-amber-800/10"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-amber-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-600/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(251, 191, 36, 0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Compact Top Bar */}
      <nav className="relative border-b border-white/5 backdrop-blur-xl bg-black/60">
        <div className="max-w-[1920px] mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight">AUTO MAILER</span>
              </div>
            </div>            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-xs flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-xs flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{user?.username || 'User'}</span>
                <button
                  onClick={handleLogout}
                  className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/20 transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>      {/* Main Content - Two Column Layout */}
      <div className="relative max-w-[1920px] mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-120px)]">
          
          {/* LEFT PANEL - Input Section */}
          <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold tracking-tight">Input</h2>
              </div>
            </div>            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Mode</label>
              <div className="relative">
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/[0.07] hover:border-amber-500/30 transition-all focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                >
                  <option value="1:1" className="bg-gray-900">1:1 Personal Email</option>
                  <option value="bulk" className="bg-gray-900">Bulk Campaign</option>
                  <option value="csv" className="bg-gray-900">CSV Import</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Sender Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Select Sender</label>
              <div className="relative">
                <select
                  value={selectedSender}
                  onChange={(e) => setSelectedSender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/[0.07] hover:border-amber-500/30 transition-all focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                  disabled={senders.length === 0}
                >
                  <option value="" className="bg-gray-900">Choose a sender...</option>
                  {senders.map((sender) => (
                    <option key={sender.id} value={sender.id} className="bg-gray-900">
                      {sender.name} ({sender.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              {senders.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-500">
                  <span>⚠️ No senders configured. Please add a sender in Settings.</span>
                </div>
              )}
            </div>

            {/* Subject Input */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all hover:bg-white/[0.07]"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email Content</label>
                <button className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Compose your message here...&#10;&#10;Use professional tone and clear formatting."
                rows={10}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none hover:bg-white/[0.07] font-mono"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Assistant Available</span>
                </div>
                <span className="text-gray-600">{emailContent.length} characters</span>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Attachments</label>
              
              <div className="grid grid-cols-2 gap-4">                {/* Primary Upload */}
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-24 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/30 hover:bg-white/[0.07] transition-all flex flex-col items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-gray-500 group-hover:text-amber-500 transition-colors" />
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-400">Upload File</p>
                      <p className="text-[10px] text-gray-600">Attachments</p>
                    </div>
                  </div>
                  {uploadedFile && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-black animate-pulse"></div>
                  )}
                </div>

                {/* Secondary Upload */}
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-24 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/30 hover:bg-white/[0.07] transition-all flex flex-col items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-gray-500 group-hover:text-amber-500 transition-colors" />
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-400">Import CSV</p>
                      <p className="text-[10px] text-gray-600">(optional)</p>
                    </div>
                  </div>
                </div>
              </div>              {uploadedFile && (
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-300 mb-1">File Details</h3>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Filename</p>
                          <p className="text-xs font-medium text-amber-400 truncate">{uploadedFile.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Size</p>
                          <p className="text-xs font-bold text-white">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Uploaded</p>
                          <p className="text-xs text-gray-400">{new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handlePreview}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-sm text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg font-medium text-sm text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group">
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Run Campaign
            </button>
          </div>          {/* RIGHT PANEL - Result Section */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold tracking-tight">Result</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                {/* Large Icon Placeholder */}
                <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <svg 
                    className="w-16 h-16 text-gray-700" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>

                <h3 className="text-base font-semibold mb-2 text-gray-300">
                  Ready to generate
                </h3>
                <p className="text-xs text-gray-600 mb-8 leading-relaxed">
                  Configure your email campaign on the left and click "Run" to preview results and view analytics.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xl font-bold text-gray-400">0</p>
                    <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">Sent</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xl font-bold text-gray-400">0%</p>
                    <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">Opened</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xl font-bold text-gray-400">0%</p>
                    <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">Clicked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01]">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                <a href="#" className="hover:text-amber-500 transition-colors">
                  open in v0 ↗
                </a>
                <span>•</span>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  feedback? send me a DM! ↗
                </a>
              </div>
            </div>
          </div>        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">File Preview</h2>
                  <p className="text-xs text-gray-500">{uploadedFile?.name}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-auto custom-scrollbar">
              {uploadedFile && (
                <>
                  {/* File Details Card */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">File Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Filename</p>
                        <p className="text-sm font-medium text-amber-400 truncate">{uploadedFile.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Size</p>
                        <p className="text-sm font-bold text-white">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Uploaded</p>
                        <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {uploadedFile.type.includes('pdf') ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-[500px]"
                        title="PDF Preview"
                      />
                    ) : uploadedFile.type.includes('image') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    ) : uploadedFile.type.includes('text') || uploadedFile.name.endsWith('.csv') ? (
                      <div className="p-6">
                        <p className="text-xs text-gray-400 font-mono">Text file preview...</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-sm text-gray-400">Preview not available for this file type</p>
                        <p className="text-xs text-gray-600 mt-2">Click download to view the file</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-5 border-t border-white/10 bg-black/40">
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-sm text-white transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-sm text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.3);
        }
      `}</style>
    </div>
  );
};

export default PremiumDashboard;
