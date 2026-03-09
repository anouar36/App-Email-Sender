import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const CyberpunkLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [blink, setBlink] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const fullText = 'AUTO_MAILER_v2.0 // TERMINAL ACCESS';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const b = setInterval(() => setBlink(v => !v), 500);
    return () => clearInterval(b);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(username, email, password);
      else await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-3 sm:p-4 overflow-hidden relative">
      {/* Scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)' }} />

      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="mb-4 sm:mb-8 border border-green-500/50 p-3 sm:p-4 bg-black/80">
          <div className="text-xs text-green-600 mb-1">[ SYSTEM BOOT ]</div>
          <div className="text-green-400 text-base sm:text-lg tracking-widest break-all">
            {typedText}<span className={`${blink ? 'opacity-100' : 'opacity-0'}`}>█</span>
          </div>
          <div className="text-xs text-green-700 mt-1">STATUS: AWAITING_AUTHENTICATION...</div>
        </div>

        {/* Terminal window */}
        <div className="border border-green-500/60 bg-black/90 shadow-[0_0_30px_rgba(0,255,65,0.15)]">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-green-500/30 bg-green-500/5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/70 shrink-0" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70 shrink-0" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/70 shrink-0" />
            <span className="ml-2 text-xs text-green-600 tracking-widest truncate">
              {isRegister ? 'NEW_USER_REGISTRATION.exe' : 'AUTH_LOGIN.exe'}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="text-green-600 text-xs mb-4">
              &gt; {isRegister ? 'INIT REGISTRATION PROTOCOL' : 'INIT LOGIN PROTOCOL'} ...<br />
              &gt; ENCRYPTION: AES-256 // JWT_TOKEN_ACTIVE
            </div>

            {error && (
              <div className="border border-red-500/50 bg-red-500/10 text-red-400 p-3 mb-4 text-xs break-words">
                [ERROR] {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {isRegister && (
                <div>
                  <label className="text-xs text-green-600 block mb-1">&gt; USERNAME:</label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)} required
                    className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition font-mono"
                    placeholder="enter_username"
                    autoComplete="username"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-green-600 block mb-1">&gt; EMAIL_ADDRESS:</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition font-mono"
                  placeholder="user@domain.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-xs text-green-600 block mb-1">&gt; PASSWORD_HASH:</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-black border border-green-500/40 text-green-300 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition font-mono"
                  placeholder="••••••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full border border-green-500 bg-green-500/10 text-green-400 py-3 text-sm font-mono tracking-widest hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition disabled:opacity-40 disabled:cursor-not-allowed mt-1 active:scale-[0.98]"
              >
                {loading ? '[ AUTHENTICATING... ]' : isRegister ? '[ REGISTER_ACCESS ]' : '[ GRANT_ACCESS ]'}
              </button>
            </form>

            <div className="mt-4 sm:mt-5 border-t border-green-500/20 pt-4 text-xs text-green-700">
              &gt; {isRegister ? 'EXISTING_USER?' : 'NEW_USER?'}{' '}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-green-400 hover:text-green-300 underline"
              >
                {isRegister ? 'LOGIN_PROTOCOL' : 'REGISTER_PROTOCOL'}
              </button>
            </div>
          </div>
        </div>        <div className="mt-3 sm:mt-4 text-xs text-green-800 text-center tracking-widest">
          SECURE_CONNECTION_ESTABLISHED // TLS_v1.3
        </div>
      </div>
    </div>
  );
};

export default CyberpunkLogin;
