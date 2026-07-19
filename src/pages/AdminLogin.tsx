import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Mail, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminLogin: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegister && !displayName.trim()) {
      showToast("Please enter your name.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, displayName);
        showToast("Registration successful! Welcome to Amrit Bhoomi. 🌾", "success");
        navigate('/profile');
      } else {
        await login(email, password);
        showToast("Access granted! Welcome back to Amrit Bhoomi. ✨", "success");
        
        // Redirect based on role
        const isAdmin = email === 'admin@amritbhoomi.com' || email.endsWith('@amritbhoomi.com');
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      showToast(err.message || "Authentication failed. Please check details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 24px',
      backgroundColor: 'var(--color-bg-base)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px'
      }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(30,63,32,0.05)',
            color: 'var(--color-primary)',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={26} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.8rem', marginBottom: '6px' }}>
            {isRegister ? 'Create Account' : 'Amrit Bhoomi Portals'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            {isRegister ? 'Register your account to manage orders' : 'Sign in to access your administrative dashboard or profile'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', gap: '8px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setDisplayName(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isRegister ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: !isRegister ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isRegister ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: isRegister ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </button>
        </div>



        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isRegister && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '8px' }}
          >
            {submitting ? "Verifying..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
