import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccounts, createAccount, deposit } from '../api/swiftbank';
import TransferModal from '../components/TransferModal';
import TransactionHistory from '../components/TransactionHistory';
import PinModal from '../components/PinModal';

export default function Dashboard() {
    const { user, logoutUser } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [showDepositPin, setShowDepositPin] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        try {
            const res = await getAccounts();
            setAccounts(res.data);
            if (res.data.length > 0) setSelectedAccount(res.data[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleCreateAccount = async (type) => {
        try {
            await createAccount(type);
            await fetchAccounts();
            showToast(`${type} account created successfully!`);
        } catch (err) {
            showToast('Failed to create account');
        }
    };

    const handleDepositConfirmed = async () => {
        setShowDepositPin(false);
        try {
            await deposit({
                accountId: selectedAccount.id,
                amount: parseFloat(depositAmount),
                description: 'Deposit'
            });
            setDepositAmount('');
            showToast('Deposit successful!');
            await fetchAccounts();
        } catch (err) {
            showToast(err.response?.data?.error || 'Deposit failed');
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    if (loading) return (
        <div style={s.loadingScreen}>
            <div style={s.loadingIcon}>⚡</div>
            <p style={s.loadingText}>Loading your accounts...</p>
        </div>
    );

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.sidebarTop}>
                    <div style={s.logo}>
                        <span style={s.logoIcon}>⚡</span>
                        <span style={s.logoText}>SwiftBank</span>
                    </div>
                    <nav style={s.nav}>
                        {[
                            { id: 'overview', icon: '◉', label: 'Overview' },
                            { id: 'transactions', icon: '↕', label: 'Transactions' },
                            { id: 'accounts', icon: '▣', label: 'Accounts' },
                        ].map(item => (
                            <button key={item.id}
                                style={{ ...s.navItem, ...(activeTab === item.id ? s.navActive : {}) }}
                                onClick={() => setActiveTab(item.id)}>
                                <span style={s.navIcon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div style={s.sidebarBottom}>
                    <div style={s.userInfo}>
                        <div style={s.avatar}>{user.fullName?.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style={s.userName}>{user.fullName}</div>
                            <div style={s.userEmail}>{user.email}</div>
                        </div>
                    </div>
                    <button style={s.logoutBtn} onClick={logoutUser}>Sign out</button>
                </div>
            </div>

            {/* Main */}
            <div style={s.main}>
                {/* Toast */}
                {toast && <div style={s.toast}>{toast}</div>}

                {activeTab === 'overview' && (
                    <div style={s.content}>
                        <div style={s.pageHeader}>
                            <div>
                                <h1 style={s.pageTitle}>Good day, {user.fullName?.split(' ')[0]} 👋</h1>
                                <p style={s.pageSubtitle}>Here's your financial overview</p>
                            </div>
                        </div>

                        {/* Total Balance Card */}
                        <div style={s.heroCard}>
                            <div style={s.heroLabel}>Total Portfolio Balance</div>
                            <div style={s.heroBalance}>
                                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={s.heroSub}>{accounts.length} account{accounts.length !== 1 ? 's' : ''} · All active</div>
                            <div style={s.heroActions}>
                                <button style={s.heroBtn} onClick={() => setShowTransfer(true)}>
                                    ⚡ Transfer
                                </button>
                                <button style={{ ...s.heroBtn, background: 'rgba(255,255,255,0.08)' }}
                                    onClick={() => setActiveTab('accounts')}>
                                    + New Account
                                </button>
                            </div>
                        </div>

                        {/* Account Cards */}
                        <h2 style={s.sectionTitle}>Your Accounts</h2>
                        <div style={s.accountsGrid}>
                            {accounts.map(acc => (
                                <div key={acc.id}
                                    style={{ ...s.accountCard, ...(selectedAccount?.id === acc.id ? s.accountCardSelected : {}) }}
                                    onClick={() => setSelectedAccount(acc)}>
                                    <div style={s.accountCardTop}>
                                        <span style={s.accountType}>{acc.type}</span>
                                        <span style={s.accountStatusDot}>●</span>
                                    </div>
                                    <div style={s.accountNumber}>{acc.accountNumber}</div>
                                    <div style={s.accountBalance}>
                                        ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deposit */}
                        {selectedAccount && (
                            <div style={s.depositSection}>
                                <h2 style={s.sectionTitle}>Quick Deposit</h2>
                                <div style={s.depositCard}>
                                    <div style={s.depositInfo}>
                                        <div style={s.depositAccLabel}>Depositing to</div>
                                        <div style={s.depositAccNum}>{selectedAccount.accountNumber}</div>
                                    </div>
                                    <div style={s.depositRow}>
                                        <div style={s.amountWrapper}>
                                            <span style={s.rupeeSign}>₹</span>
                                            <input style={s.amountInput} type="number"
                                                placeholder="Enter amount"
                                                value={depositAmount}
                                                onChange={e => setDepositAmount(e.target.value)} />
                                        </div>
                                        <button style={s.depositBtn}
                                            onClick={() => { if (depositAmount) setShowDepositPin(true); }}>
                                            Deposit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent transactions */}
                        {selectedAccount && <TransactionHistory accountId={selectedAccount.id} />}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div style={s.content}>
                        <div style={s.pageHeader}>
                            <h1 style={s.pageTitle}>Transactions</h1>
                            <p style={s.pageSubtitle}>Full transaction history</p>
                        </div>
                        <div style={s.accountTabs}>
                            {accounts.map(acc => (
                                <button key={acc.id}
                                    style={{ ...s.accountTab, ...(selectedAccount?.id === acc.id ? s.accountTabActive : {}) }}
                                    onClick={() => setSelectedAccount(acc)}>
                                    {acc.accountNumber}
                                </button>
                            ))}
                        </div>
                        {selectedAccount && <TransactionHistory accountId={selectedAccount.id} />}
                    </div>
                )}

                {activeTab === 'accounts' && (
                    <div style={s.content}>
                        <div style={s.pageHeader}>
                            <h1 style={s.pageTitle}>Accounts</h1>
                            <p style={s.pageSubtitle}>Manage your bank accounts</p>
                        </div>
                        <div style={s.newAccountSection}>
                            <h2 style={s.sectionTitle}>Open New Account</h2>
                            <div style={s.accountTypeCards}>
                                <div style={s.typeCard} onClick={() => handleCreateAccount('SAVINGS')}>
                                    <div style={s.typeCardIcon}>💰</div>
                                    <div style={s.typeCardName}>Savings Account</div>
                                    <div style={s.typeCardDesc}>Earn interest on your balance</div>
                                    <button style={s.typeCardBtn}>Open Account</button>
                                </div>
                                <div style={s.typeCard} onClick={() => handleCreateAccount('CURRENT')}>
                                    <div style={s.typeCardIcon}>🔄</div>
                                    <div style={s.typeCardName}>Current Account</div>
                                    <div style={s.typeCardDesc}>For everyday transactions</div>
                                    <button style={s.typeCardBtn}>Open Account</button>
                                </div>
                            </div>
                        </div>
                        <h2 style={s.sectionTitle}>All Accounts</h2>
                        <div style={s.accountsList}>
                            {accounts.map(acc => (
                                <div key={acc.id} style={s.accountListItem}>
                                    <div style={s.accountListLeft}>
                                        <div style={s.accountListIcon}>
                                            {acc.type === 'SAVINGS' ? '💰' : '🔄'}
                                        </div>
                                        <div>
                                            <div style={s.accountListNumber}>{acc.accountNumber}</div>
                                            <div style={s.accountListType}>{acc.type} · {acc.status}</div>
                                        </div>
                                    </div>
                                    <div style={s.accountListBalance}>
                                        ₹{Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showTransfer && selectedAccount && (
                <TransferModal
                    fromAccount={selectedAccount}
                    accounts={accounts}
                    onClose={() => setShowTransfer(false)}
                    onSuccess={() => { fetchAccounts(); setShowTransfer(false); showToast('Transfer successful!'); }}
                />
            )}

            {showDepositPin && (
                <PinModal
                    onConfirm={handleDepositConfirmed}
                    onClose={() => setShowDepositPin(false)}
                />
            )}
        </div>
    );
}

const s = {
    page: {
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0a0f',
    },
    loadingScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' },
    loadingIcon: { fontSize: '3rem' },
    loadingText: { color: '#6b7280' },
    sidebar: {
        width: '220px',
        background: '#0d0d15',
        borderRight: '1px solid #1f1f3a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        flexShrink: 0,
        height: '100vh',
        overflow: 'hidden',
    },
    sidebarTop: {},
    logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' },
    logoIcon: { fontSize: '1.5rem' },
    logoText: { fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#6b7280', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, textAlign: 'left', width: '100%' },
    navActive: { background: 'rgba(79,70,229,0.15)', color: '#818cf8' },
    navIcon: { fontSize: '1rem', width: '20px', textAlign: 'center' },
    sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
    userName: { fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb' },
    userEmail: { fontSize: '0.75rem', color: '#4b5563' },
    logoutBtn: { padding: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
    main: {
        flex: 1,
        overflowY: 'auto',
        height: '100vh',
    },
    toast: {
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        background: '#111118',
        border: '1px solid #34d399',
        color: '#34d399',
        padding: '0.8rem 1.5rem',
        borderRadius: '12px',
        fontSize: '0.9rem',
        zIndex: 3000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    },
    content: {
        padding: '2rem',
        maxWidth: '860px',
    },
    pageHeader: { marginBottom: '2rem' },
    pageTitle: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' },
    pageSubtitle: { color: '#6b7280', fontSize: '0.95rem' },
    heroCard: { background: 'linear-gradient(135deg, #1e1b4b 0%, #2d1b69 50%, #1e1b4b 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', border: '1px solid #3730a3' },
    heroLabel: { fontSize: '0.85rem', color: '#a78bfa', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    heroBalance: { fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' },
    heroSub: { color: '#a78bfa', fontSize: '0.9rem', marginBottom: '1.5rem' },
    heroActions: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap' },
    heroBtn: { padding: '0.7rem 1.5rem', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#9ca3af', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' },
    accountsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    accountCard: { background: '#111118', border: '1px solid #1f1f3a', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' },
    accountCardSelected: { border: '1px solid #4f46e5', background: 'rgba(79,70,229,0.08)' },
    accountCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    accountType: { fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
    accountStatusDot: { color: '#34d399', fontSize: '0.7rem' },
    accountNumber: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' },
    accountBalance: { fontSize: '1.4rem', fontWeight: 700 },
    depositSection: { marginBottom: '2rem' },
    depositCard: { background: '#111118', border: '1px solid #1f1f3a', borderRadius: '16px', padding: '1.5rem' },
    depositInfo: { marginBottom: '1rem' },
    depositAccLabel: { fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem' },
    depositAccNum: { fontSize: '0.95rem', fontWeight: 600 },
    depositRow: { display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' },
    amountWrapper: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' },
    rupeeSign: { position: 'absolute', left: '1rem', color: '#6b7280' },
    amountInput: { width: '100%', padding: '0.85rem 1rem 0.85rem 2rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '10px', color: '#fff', fontSize: '0.95rem' },
    depositBtn: { padding: '0.85rem 2rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap' },
    accountTabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    accountTab: { padding: '0.5rem 1rem', background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: '20px', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' },
    accountTabActive: { background: 'rgba(79,70,229,0.2)', border: '1px solid #4f46e5', color: '#818cf8' },
    newAccountSection: { marginBottom: '2rem' },
    accountTypeCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    typeCard: { background: '#111118', border: '1px solid #1f1f3a', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center' },
    typeCardIcon: { fontSize: '2rem', marginBottom: '0.8rem' },
    typeCardName: { fontWeight: 600, marginBottom: '0.4rem' },
    typeCardDesc: { color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.2rem' },
    typeCardBtn: { padding: '0.6rem 1.2rem', background: 'rgba(79,70,229,0.2)', color: '#818cf8', border: '1px solid #4f46e5', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' },
    accountsList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    accountListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111118', border: '1px solid #1f1f3a', borderRadius: '12px', padding: '1.2rem' },
    accountListLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    accountListIcon: { fontSize: '1.5rem' },
    accountListNumber: { fontWeight: 600, marginBottom: '0.2rem' },
    accountListType: { color: '#6b7280', fontSize: '0.8rem' },
    accountListBalance: { fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }
};