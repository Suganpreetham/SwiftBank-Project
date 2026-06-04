import { useState } from 'react';
import { login } from '../api/swiftbank';
import { useAuth } from '../context/AuthContext';

export default function PinModal({ onConfirm, onClose }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleConfirm = async () => {
        if (!password) { setError('Enter your password'); return; }
        setLoading(true);
        setError('');
        try {
            await login({ email: user.email, password });
            onConfirm();
        } catch (err) {
            setError('Incorrect password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.icon}>🔐</div>
                <h3 style={s.title}>Confirm Identity</h3>
                <p style={s.subtitle}>Enter your password to proceed</p>
                {error && <div style={s.error}>{error}</div>}
                <input
                    style={s.input}
                    type="password"
                    placeholder="Your login password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    autoFocus
                />
                <div style={s.buttons}>
                    <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
                    <button style={s.confirmBtn} onClick={handleConfirm} disabled={loading}>
                        {loading ? '↻ Verifying...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
    modal: { background: '#111118', border: '1px solid #2d2d4e', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '380px', textAlign: 'center' },
    icon: { fontSize: '3rem', marginBottom: '1rem' },
    title: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' },
    subtitle: { color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' },
    input: { width: '100%', padding: '0.85rem 1rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', marginBottom: '1.2rem', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.3em' },
    buttons: { display: 'flex', gap: '0.8rem' },
    cancelBtn: { flex: 1, padding: '0.8rem', background: '#1a1a2e', color: '#9ca3af', border: '1px solid #2d2d4e', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 },
    confirmBtn: { flex: 1, padding: '0.8rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 },
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.7rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }
};