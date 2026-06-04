import { useState, useEffect } from 'react';
import { getHistory } from '../api/swiftbank';

export default function TransactionHistory({ accountId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchHistory(); }, [accountId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await getHistory(accountId);
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isCredit = (tx) => {
        if (tx.type === 'DEPOSIT') return true;
        return tx.toAccountId === accountId;
    };

    const filtered = transactions.filter(tx =>
        filter === 'ALL' ? true : tx.type === filter
    );

    return (
        <div style={s.section}>
            <div style={s.header}>
                <h2 style={s.title}>Transactions</h2>
                <div style={s.filters}>
                    {['ALL', 'DEPOSIT', 'TRANSFER'].map(f => (
                        <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
                            onClick={() => setFilter(f)}>{f}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={s.empty}>Loading transactions...</div>
            ) : filtered.length === 0 ? (
                <div style={s.empty}>No transactions found.</div>
            ) : (
                <div style={s.list}>
                    {filtered.map(tx => (
                        <div key={tx.id} style={s.row}>
                            <div style={s.rowLeft}>
                                <div style={{ ...s.typeIcon, background: tx.type === 'DEPOSIT' ? 'rgba(52,211,153,0.1)' : 'rgba(99,102,241,0.1)' }}>
                                    {tx.type === 'DEPOSIT' ? '↓' : '↑'}
                                </div>
                                <div>
                                    <div style={s.txType}>{tx.type}</div>
                                    <div style={s.txDesc}>{tx.description || '—'}</div>
                                    <div style={s.txDate}>{new Date(tx.createdAt).toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                            <div style={s.rowRight}>
                                <div style={{ ...s.amount, color: isCredit(tx) ? '#34d399' : '#f87171' }}>
                                    {isCredit(tx) ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ ...s.status, color: tx.status === 'COMPLETED' ? '#34d399' : '#fbbf24' }}>
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const s = {
    section: { background: '#111118', border: '1px solid #1f1f3a', borderRadius: '16px', padding: '1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' },
    title: { fontSize: '1.1rem', fontWeight: 600 },
    filters: { display: 'flex', gap: '0.5rem' },
    filterBtn: { padding: '0.4rem 0.9rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '20px', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 },
    filterActive: { background: 'rgba(79,70,229,0.2)', border: '1px solid #4f46e5', color: '#818cf8' },
    list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#0f0f1a', borderRadius: '12px', border: '1px solid #1f1f3a' },
    rowLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    typeIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
    txType: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
    txDesc: { color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.2rem' },
    txDate: { color: '#4b5563', fontSize: '0.75rem' },
    rowRight: { textAlign: 'right' },
    amount: { fontSize: '1rem', fontWeight: 700 },
    status: { fontSize: '0.75rem', marginTop: '0.2rem' },
    empty: { textAlign: 'center', color: '#4b5563', padding: '2rem', fontSize: '0.9rem' }
};