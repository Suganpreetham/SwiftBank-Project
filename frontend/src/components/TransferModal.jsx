import { useState } from 'react';
import { transfer } from '../api/swiftbank';
import PinModal from './PinModal';

export default function TransferModal({ fromAccount, accounts, onClose, onSuccess }) {
    const [form, setForm] = useState({ toAccountId: '', amount: '', description: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const otherAccounts = accounts.filter(a => a.id !== fromAccount.id);

    const handleSubmit = () => {
        if (!form.toAccountId || !form.amount) { setError('Fill all required fields'); return; }
        if (parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0'); return; }
        setError('');
        setShowPin(true);
    };

    const handleConfirmed = async () => {
        setShowPin(false);
        setLoading(true);
        try {
            await transfer({
                fromAccountId: fromAccount.id,
                toAccountId: form.toAccountId,
                amount: parseFloat(form.amount),
                description: form.description || 'Transfer',
                idempotencyKey: `${fromAccount.id}-${Date.now()}`
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={s.overlay}>
                <div style={s.modal}>
                    <div style={s.header}>
                        <div>
                            <h3 style={s.title}>Send Money</h3>
                            <p style={s.subtitle}>Transfer between accounts</p>
                        </div>
                        <button style={s.closeBtn} onClick={onClose}>✕</button>
                    </div>

                    <div style={s.fromCard}>
                        <div style={s.fromLabel}>From</div>
                        <div style={s.fromNumber}>{fromAccount.accountNumber}</div>
                        <div style={s.fromBalance}>₹{Number(fromAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>

                    {error && <div style={s.error}>{error}</div>}

                    <div style={s.field}>
                        <label style={s.label}>To Account</label>
                        <select style={s.input} value={form.toAccountId}
                            onChange={e => setForm({ ...form, toAccountId: e.target.value })}>
                            <option value="">Select destination account</option>
                            {otherAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountNumber} ({acc.type}) — ₹{Number(acc.balance).toLocaleString('en-IN')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Amount</label>
                        <div style={s.amountWrapper}>
                            <span style={s.rupee}>₹</span>
                            <input style={s.amountInput} type="number" placeholder="0.00"
                                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </div>
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Description <span style={s.optional}>(optional)</span></label>
                        <input style={s.input} type="text" placeholder="What's this for?"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <button style={s.transferBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? '↻ Processing...' : '⚡ Send Money'}
                    </button>
                </div>
            </div>
            {showPin && <PinModal onConfirm={handleConfirmed} onClose={() => setShowPin(false)} />}
        </>
    );
}

const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' },
    modal: { background: '#111118', border: '1px solid #2d2d4e', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '460px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
    title: { fontSize: '1.3rem', fontWeight: 700 },
    subtitle: { color: '#6b7280', fontSize: '0.85rem', marginTop: '0.2rem' },
    closeBtn: { background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#9ca3af', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
    fromCard: { background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' },
    fromLabel: { fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    fromNumber: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem' },
    fromBalance: { fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' },
    field: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 },
    optional: { color: '#4b5563', fontWeight: 400 },
    input: { width: '100%', padding: '0.85rem 1rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' },
    amountWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    rupee: { position: 'absolute', left: '1rem', color: '#6b7280', fontSize: '1rem' },
    amountInput: { width: '100%', padding: '0.85rem 1rem 0.85rem 2rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '10px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' },
    transferBtn: { width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.8rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }
};