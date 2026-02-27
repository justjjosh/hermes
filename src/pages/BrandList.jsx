import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBrands, deleteBrand } from '../utils/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BrandList() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const addToast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadBrands();
    }, [statusFilter, categoryFilter]);

    async function loadBrands() {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            const data = await getBrands(params);
            setBrands(data);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteBrand(deleteTarget.id);
            setBrands(prev => prev.filter(b => b.id !== deleteTarget.id));
            addToast(`${deleteTarget.name} deleted`);
        } catch (err) {
            addToast(err.message, 'error');
        }
        setDeleteTarget(null);
    }

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const categories = [...new Set(brands.map(b => b.category).filter(Boolean))];

    return (
        <div>
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <h1>Brands</h1>
                        <p>{brands.length} brand{brands.length !== 1 ? 's' : ''} in your pipeline</p>
                    </div>
                    <Link to="/brands/new" className="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Brand
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="not_contacted">Not Contacted</option>
                    <option value="pitched">Pitched</option>
                    <option value="opened">Opened</option>
                    <option value="replied">Replied</option>
                    <option value="partnership">Partnership</option>
                    <option value="rejected">Rejected</option>
                </select>
                {categories.length > 0 && (
                    <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
            </div>

            {loading ? (
                <LoadingSpinner message="Loading brands..." />
            ) : filteredBrands.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7l10-4 10 4-10 4L2 7z" /><path d="M6 10v4c0 2 2.7 4 6 4s6-2 6-4v-4" /></svg>
                        <h3>{search ? 'No brands match your search' : 'No brands yet'}</h3>
                        <p>{search ? 'Try a different search term' : 'Add your first brand to start pitching!'}</p>
                        {!search && (
                            <Link to="/brands/new" className="btn btn-primary">Add Your First Brand</Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="brand-grid">
                    {filteredBrands.map(brand => (
                        <div key={brand.id} className="brand-card" onClick={() => navigate(`/pitches/generate/${brand.id}`)}>
                            <div className="brand-card-header">
                                <div>
                                    <div className="brand-card-name">{brand.name}</div>
                                    <div className="brand-card-email">{brand.email}</div>
                                </div>
                                <StatusBadge status={brand.status} />
                            </div>
                            <div className="brand-card-meta">
                                {brand.category && (
                                    <span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                        {brand.category}
                                    </span>
                                )}
                                {brand.website && (
                                    <span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                                        Website
                                    </span>
                                )}
                            </div>
                            <div className="brand-card-actions" onClick={e => e.stopPropagation()}>
                                <Link to={`/pitches/generate/${brand.id}`} className="btn btn-primary btn-sm">
                                    ✨ Generate Pitch
                                </Link>
                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(brand)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteTarget && (
                <Modal
                    title={`Delete ${deleteTarget.name}?`}
                    message="This will permanently delete this brand and all its pitches. This action cannot be undone."
                    confirmText="Delete Brand"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
