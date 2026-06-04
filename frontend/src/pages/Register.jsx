import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/swiftbank';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await register(form);
            loginUser(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.page}>
            <div style={s.left}>
                <div style={s.leftContent}>
                    <div style={s.brandIcon}>⚡</div>
                    <h1 style={s.brandName}>SwiftBank</h1>
                    <p style={s.brandTagline}>Join millions who bank smarter</p>
                    <div style={s.features}>
                        {['Free account creation', 'Zero transfer fees', 'Instant notifications', '256-bit encryption'].map(f => (
                            <div key={f} style={s.feature}>
                                <span style={s.dot}>✦</span>
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={s.right}>
                <div style={s.card}>
                    <h2 style={s.title}>Create account</h2>
                    <p style={s.subtitle}>Start banking in seconds</p>
                    {error && <div style={s.error}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={s.field}>
                            <label style={s.label}>Full Name</label>
                            <input style={s.input} type="text" placeholder="John Doe"
                                value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Email</label>
                            <input style={s.input} type="email" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Password</label>
                            <input style={s.input} type="password" placeholder="Min 8 characters"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <button style={s.btn} type="submit" disabled={loading}>
                            {loading ? '↻ Creating...' : 'Create Account'}
                        </button>
                    </form>
                    <p style={s.link}>
                        Already have an account? <Link to="/login" style={s.linkA}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const s = {
    page: {
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(110deg, #0d0d1f 0%, #0d0d1f 45%, #0a0a0f 55%, #0a0a0f 100%)',
    },
    left: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
    leftContent: { maxWidth: '380px' },
    brandIcon: { fontSize: '2.8rem', marginBottom: '1rem' },
    brandName: { fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
    brandTagline: { color: '#6b7280', fontSize: '1rem', marginBottom: '2.5rem' },
    features: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    feature: { display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#9ca3af', fontSize: '0.95rem' },
    dot: { color: '#818cf8', fontSize: '0.6rem' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
    card: { width: '100%', maxWidth: '400px', background: 'rgba(17,17,24,0.7)', border: '1px solid #1f1f3a', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(20px)' },
    title: { fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.3rem' },
    subtitle: { color: '#6b7280', marginBottom: '1.8rem', fontSize: '0.9rem' },
    field: { marginBottom: '1.1rem' },
    label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 },
    input: { width: '100%', padding: '0.8rem 1rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '10px', color: '#fff', fontSize: '0.93rem' },
    btn: { width: '100%', padding: '0.88rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.88rem' },
    link: { textAlign: 'center', marginTop: '1.4rem', color: '#6b7280', fontSize: '0.88rem' },
    linkA: { color: '#818cf8', textDecoration: 'none', fontWeight: 500 },
};