import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPitches, getBrands } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
    { label: 'All', value: '' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Opened', value: 'opened' },
    { label: 'Replied', value: 'replied' },
];

const PAGE_SIZE = 10;

export default function PitchHistory() {
    const [pitches, setPitches] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadData();
    }, [statusFilter, page]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { skip: page * PAGE_SIZE, limit: PAGE_SIZE, sort: 'desc' };
            if (statusFilter) params.status = statusFilter;
            const [p, b] = await Promise.all([getPitches(params), getBrands()]);
            setPitches(p);
            setBrands(b);
            setTotal(p.length);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        return brand?.name || 'Unknown';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr + 'Z').toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <h1>Pitch History</h1>
                        <p>Track all your brand pitches</p>
                    </div>
                    <Link to="/pitches/generate" className="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
                        New Pitch
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.value}
                        className={`filter-tab ${statusFilter === tab.value ? 'active' : ''}`}
                        onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="filters-bar" style={{ marginBottom: 'var(--sp-4)' }}>
                <div className="search-input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Search by brand name..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                </div>
            </div>

            {loading ? (
                <LoadingSpinner message="Loading pitches..." />
            ) : pitches.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        <h3>No pitches yet</h3>
                        <p>Generate your first AI pitch to get started!</p>
                        <Link to="/pitches/generate" className="btn btn-primary">Generate Your First Pitch</Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Brand</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Mode</th>
                                    <th>Sent</th>
                                    <th>Opened</th>
                                    <th>Replied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pitches
                                    .filter(p => !search || getBrandName(p.brand_id).toLowerCase().includes(search.toLowerCase()))
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                    .map(pitch => (
                                        <tr key={pitch.id} className="clickable">
                                            <td>
                                                <Link to={`/pitches/${pitch.id}`} style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>
                                                    {getBrandName(pitch.brand_id)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={`/pitches/${pitch.id}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                                                    {pitch.subject?.slice(0, 50)}{pitch.subject?.length > 50 ? '...' : ''}
                                                </Link>
                                            </td>
                                            <td><StatusBadge status={pitch.status} /></td>
                                            <td style={{ textTransform: 'capitalize' }}>{pitch.mode}</td>
                                            <td style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{formatDate(pitch.sent_at)}</td>
                                            <td style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{formatDate(pitch.opened_at)}</td>
                                            <td style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{formatDate(pitch.replied_at)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg> Previous
                        </button>
                        <span className="pagination-info">Page {page + 1}</span>
                        <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={total < PAGE_SIZE}>
                            Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
