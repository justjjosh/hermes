import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBrands, getPitches } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
    const [brands, setBrands] = useState([]);
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [b, p] = await Promise.all([getBrands(), getPitches()]);
                setBrands(b);
                setPitches(p);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;

    const pitchStats = {
        total: pitches.length,
        draft: pitches.filter(p => p.status === 'draft').length,
        sent: pitches.filter(p => p.status === 'sent').length,
        opened: pitches.filter(p => p.status === 'opened').length,
        replied: pitches.filter(p => p.status === 'replied').length,
    };

    const recentPitches = [...pitches]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6);

    const statusColor = {
        draft: '#8B95A5', sent: '#2D8A7B', opened: '#C4880D',
        clicked: '#9B59B6', replied: '#2D8044'
    };

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Your brand outreach at a glance</p>
            </div>

            {error && (
                <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-6)', fontSize: 'var(--text-sm)' }}>
                    ⚠ Could not connect to backend: {error}. Showing empty state.
                </div>
            )}

            {/* Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card" style={{ '--stat-accent': 'var(--green-600)', '--stat-bg': 'var(--green-50)', '--stat-color': 'var(--green-700)' }}>
                    <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 7l10-4 10 4-10 4L2 7z" /><path d="M6 10v4c0 2 2.7 4 6 4s6-2 6-4v-4" /></svg>
                    </div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Total Brands</div>
                        <div className="stat-card-value">{brands.length}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'var(--status-sent)', '--stat-bg': 'var(--status-sent-bg)', '--stat-color': 'var(--status-sent)' }}>
                    <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Total Pitches</div>
                        <div className="stat-card-value">{pitchStats.total}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'var(--status-sent)', '--stat-bg': 'var(--status-sent-bg)', '--stat-color': 'var(--status-sent)' }}>
                    <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Sent</div>
                        <div className="stat-card-value">{pitchStats.sent}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'var(--status-opened)', '--stat-bg': 'var(--status-opened-bg)', '--stat-color': 'var(--status-opened)' }}>
                    <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Opened</div>
                        <div className="stat-card-value">{pitchStats.opened}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ '--stat-accent': 'var(--status-replied)', '--stat-bg': 'var(--status-replied-bg)', '--stat-color': 'var(--status-replied)' }}>
                    <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
                    </div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Replied</div>
                        <div className="stat-card-value">{pitchStats.replied}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
                {/* Recent Activity */}
                <div className="card" style={{ gridColumn: recentPitches.length === 0 ? '1 / -1' : undefined }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>Recent Activity</h2>
                    {recentPitches.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                            <h3>No activity yet</h3>
                            <p>Start by adding a brand and generating your first pitch!</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {recentPitches.map((pitch) => {
                                const brand = brands.find(b => b.id === pitch.brand_id);
                                return (
                                    <Link to={`/pitches/${pitch.id}`} key={pitch.id} className="activity-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="activity-dot" style={{ background: statusColor[pitch.status] || '#8B95A5' }} />
                                        <div className="activity-info">
                                            <div className="activity-title">
                                                {brand?.name || 'Unknown Brand'} — {pitch.subject?.slice(0, 50) || 'No subject'}
                                            </div>
                                            <div className="activity-time">
                                                <StatusBadge status={pitch.status} />
                                                <span style={{ marginLeft: 'var(--sp-2)' }}>
                                                    {new Date(pitch.updated_at + 'Z').toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                {recentPitches.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>Quick Actions</h2>
                        <div className="quick-actions" style={{ gridTemplateColumns: '1fr' }}>
                            <Link to="/brands/new" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                </div>
                                <div className="quick-action-text">
                                    <h3>Add Brand</h3>
                                    <p>Add a new brand to pitch</p>
                                </div>
                            </Link>
                            <Link to="/pitches/generate" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'var(--status-sent-bg)', color: 'var(--status-sent)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
                                </div>
                                <div className="quick-action-text">
                                    <h3>Generate Pitch</h3>
                                    <p>AI-powered pitch for a brand</p>
                                </div>
                            </Link>
                            <Link to="/pitches" className="quick-action">
                                <div className="quick-action-icon" style={{ background: 'var(--status-opened-bg)', color: 'var(--status-opened)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                                </div>
                                <div className="quick-action-text">
                                    <h3>View History</h3>
                                    <p>Track all your pitches</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* If totally empty, show getting started */}
            {brands.length === 0 && pitches.length === 0 && !error && (
                <div style={{ marginTop: 'var(--sp-8)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>Get Started</h2>
                    <div className="quick-actions">
                        <Link to="/profile" className="quick-action">
                            <div className="quick-action-icon" style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <div className="quick-action-text">
                                <h3>1. Set Up Profile</h3>
                                <p>Tell AI about yourself for personalized pitches</p>
                            </div>
                        </Link>
                        <Link to="/brands/new" className="quick-action">
                            <div className="quick-action-icon" style={{ background: 'var(--status-sent-bg)', color: 'var(--status-sent)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                            </div>
                            <div className="quick-action-text">
                                <h3>2. Add a Brand</h3>
                                <p>Add the first brand you want to pitch</p>
                            </div>
                        </Link>
                        <Link to="/pitches/generate" className="quick-action">
                            <div className="quick-action-icon" style={{ background: 'var(--status-opened-bg)', color: 'var(--status-opened)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
                            </div>
                            <div className="quick-action-text">
                                <h3>3. Generate a Pitch</h3>
                                <p>Let AI craft the perfect partnership email</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
