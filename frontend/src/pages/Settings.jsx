import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Mail, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Sender configuration state
  const [senders, setSenders] = useState([
    // Example sender - remove this when implementing backend
    // { id: 1, email: 'sender@example.com', name: 'John Doe', smtp: 'smtp.gmail.com' }
  ]);
  const [showAddSender, setShowAddSender] = useState(false);
  const [newSender, setNewSender] = useState({
    email: '',
    name: '',
    smtp: '',
    password: ''
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Only JPG, PNG, or GIF files are allowed');
        return;
      }
      
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSender = () => {
    if (!newSender.email || !newSender.name || !newSender.smtp || !newSender.password) {
      alert('Please fill in all fields');
      return;
    }
    
    const sender = {
      id: Date.now(),
      ...newSender
    };
    
    setSenders([...senders, sender]);
    setNewSender({ email: '', name: '', smtp: '', password: '' });
    setShowAddSender(false);
  };

  const handleDeleteSender = (id) => {
    setSenders(senders.filter(s => s.id !== id));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-900/5 via-black to-amber-800/10"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-amber-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-orange-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(251, 191, 36, 0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your profile and email senders</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-white/10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.username || user?.email || 'User')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-300">Profile Picture</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm text-white transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Change Avatar
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                
                {/* User Info */}
                <div className="mt-6 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Username</label>
                    <p className="text-sm font-medium">{user?.username || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <p className="text-sm font-medium">{user?.email || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sender Configuration */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Email Senders</h2>
                <p className="text-sm text-gray-500 mt-1">Configure SMTP senders for your campaigns</p>
              </div>
              <button
                onClick={() => setShowAddSender(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-sm text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Sender
              </button>
            </div>

            {/* No Senders Message */}
            {senders.length === 0 && !showAddSender && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No senders configured</h3>
                <p className="text-sm text-amber-500 mb-4">Please add a sender to start sending emails</p>
                <button
                  onClick={() => setShowAddSender(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-sm text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Sender
                </button>
              </div>
            )}

            {/* Add Sender Form */}
            {showAddSender && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
                <h3 className="text-lg font-semibold mb-4">Add New Sender</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Sender Name</label>
                      <input
                        type="text"
                        value={newSender.name}
                        onChange={(e) => setNewSender({...newSender, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        value={newSender.email}
                        onChange={(e) => setNewSender({...newSender, email: e.target.value})}
                        placeholder="sender@example.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">SMTP Server</label>
                      <input
                        type="text"
                        value={newSender.smtp}
                        onChange={(e) => setNewSender({...newSender, smtp: e.target.value})}
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Password</label>
                      <input
                        type="password"
                        value={newSender.password}
                        onChange={(e) => setNewSender({...newSender, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddSender}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-sm text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Sender
                    </button>
                    <button
                      onClick={() => setShowAddSender(false)}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium text-sm text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Senders List */}
            {senders.length > 0 && (
              <div className="space-y-3">
                {senders.map((sender) => (
                  <div
                    key={sender.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-white">
                        {getInitials(sender.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{sender.name}</h4>
                        <p className="text-xs text-gray-400">{sender.email}</p>
                        <p className="text-xs text-gray-600">SMTP: {sender.smtp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteSender(sender.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
