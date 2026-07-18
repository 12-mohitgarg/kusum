import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      showToast("Access granted! Welcome back to Amrit Bhoomi.", "success");
      navigate('/admin');
    } catch (err: any) {
      showToast(err.message || "Failed to log in. Please check credentials.", "error");
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
            Amrit Bhoomi Portals
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Demo Mode Alert Banner */}
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-accent)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '28px',
          fontSize: '0.82rem',
          lineHeight: '1.5',
          color: 'var(--color-primary-dark)'
        }}>
          <strong>🌾 Demonstration Access:</strong>
          <div style={{ marginTop: '6px' }}>
            <strong>Email:</strong> admin@amritbhoomi.com<br />
            <strong>Password:</strong> admin
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            {submitting ? "Verifying..." : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
