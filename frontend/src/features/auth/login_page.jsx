import { useState } from 'react';
import { Lock, User, LogIn, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/auth_context';
import { ROUTE_PATHS } from '../../routes/route_paths';
import { Logo } from '../../components';

export function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Harap masukkan username dan kata sandi.');
      return;
    }

    try {
      setIsLoading(true);
      await login(username.trim(), password);
      setPage(ROUTE_PATHS.USER_DASHBOARD);
    } catch (err) {
      setErrorMsg(err.message || 'Username atau password tidak sesuai.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-modal)',
        padding: '36px 32px'
      }}>
        {/* Header Login */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Logo height="36px" style={{ borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <span className="hanko-stamp">PORTAL</span>
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 700, margin: '4px 0' }}>
            Login
          </h2>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid rgba(176, 58, 46, 0.2)'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="zen-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="zen-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                style={{ paddingLeft: '38px' }}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div>
            <label className="zen-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="zen-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="zen-btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Back Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setPage(ROUTE_PATHS.LANDING)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
