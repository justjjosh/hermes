import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { discoverSearch, discoverPitch, getDiscoverCache } from '../utils/api';
import { useToast } from '../components/Toast';

const CONFIDENCE_MAP = {
    high: { label: 'High', className: 'confidence-high' },
    medium: { label: 'Medium', className: 'confidence-medium' },
    low: { label: 'Low', className: 'confidence-low' },
};

export default function DiscoverBrand() {
    const [brandName, setBrandName] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [sending, setSending] = useState(false);
    const [sendResults, setSendResults] = useState(null);
    const [cachedBrands, setCachedBrands] = useState([]);
    const [loadingCache, setLoadingCache] = useState(true);
    const [wasCached, setWasCached] = useState(false);
    const addToast = useToast();

    useEffect(() => {
        loadCache();
    }, []);

    const loadCache = async () => {
        try {
            const data = await getDiscoverCache();
            setCachedBrands(Array.isArray(data) ? data : []);
        } catch {
            // Cache endpoint may not exist yet
        } finally {
            setLoadingCache(false);
        }
    };

    const handleSearch = async (e, forceRefresh = false, overrideName = null) => {
        if (e) e.preventDefault();
        const name = overrideName || brandName;
        if (!name.trim()) return;
        setSearching(true);
        setResult(null);
        setSendResults(null);
        setWasCached(false);
        try {
            const start = Date.now();
            const data = await discoverSearch(name.trim(), forceRefresh);
            const elapsed = Date.now() - start;
            const cached = elapsed < 500;
            setWasCached(cached);
            setResult(data);
            setSelectedEmails(new Set(data.contacts.map(c => c.email)));
            if (cached && !forceRefresh) {
                addToast('Loaded from cache', 'success');
            }
            loadCache();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSearching(false);
        }
    };

    const handleRefresh = () => {
        handleSearch(null, true);
    };

    const toggleEmail = (email) => {
        setSelectedEmails(prev => {
            const next = new Set(prev);
            if (next.has(email)) next.delete(email);
            else next.add(email);
            return next;
        });
    };

    const toggleAll = () => {
        if (!result) return;
        if (selectedEmails.size === result.contacts.length) {
            setSelectedEmails(new Set());
        } else {
            setSelectedEmails(new Set(result.contacts.map(c => c.email)));
        }
    };

    const handleSendPitches = async (shouldSend = true) => {
        if (selectedEmails.size === 0) return;
        setSending(true);
        try {
            const payload = {
                brand_name: result.brand_name,
                website: result.website,
                instagram: result.instagram,
                category: result.category,
                description: result.description,
                send: shouldSend,
                selected_contacts: result.contacts
                    .filter(c => selectedEmails.has(c.email))
                    .map(c => ({ email: c.email, type: c.type, confidence: c.confidence, source: c.source })),
            };
            const data = await discoverPitch(payload);
            setSendResults({ ...data, reviewMode: !shouldSend });
            if (shouldSend) {
                addToast(`${data.results.filter(r => r.status === 'sent').length} pitch(es) sent!`);
            } else {
                addToast(`${data.results.filter(r => r.status === 'sent' || r.status === 'draft').length} pitch(es) ready for review!`);
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSending(false);
        }
    };

    const sentCount = sendResults?.results.filter(r => r.status === 'sent').length || 0;
    const dupCount = sendResults?.results.filter(r => r.status === 'duplicate').length || 0;
    const failCount = sendResults?.results.filter(r => r.status === 'failed').length || 0;

    return (
        <div>
            <div className="page-header">
                <h1>Discover Brand</h1>
                <p>Find brand contacts with AI and send personalized pitches</p>
            </div>

            {/* Step 1: Search */}
            <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--green-700)' }}>
                    Search for a Brand
                </h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="form-label">Brand Name</label>
                        <input
                            className="form-input"
                            type="text"
                            value={brandName}
                            onChange={e => setBrandName(e.target.value)}
                            placeholder="e.g. CeraVe, Gymshark, Fenty Beauty"
                            required
                            disabled={searching}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={searching || !brandName.trim()} style={{ whiteSpace: 'nowrap' }}>
                        {searching ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                Searching...
                            </span>
                        ) : (
                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> Search</>
                        )}
                    </button>
                </form>
            </div>

            {/* Recent Discoveries */}
            {!result && !sendResults && !searching && cachedBrands.length > 0 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--green-700)' }}>
                        Recent Discoveries
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
                        {cachedBrands.map((brand, i) => (
                            <div
                                key={i}
                                className="card card-clickable"
                                onClick={() => {
                                    setBrandName(brand.brand_name);
                                    handleSearch(null, false, brand.brand_name);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{brand.brand_name}</h3>
                                    {brand.category && <span className="badge badge-olive" style={{ fontSize: '0.65rem' }}>{brand.category}</span>}
                                </div>
                                {brand.description && (
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {brand.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                    {brand.contacts_count != null && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                            {brand.contacts_count} contact{brand.contacts_count !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {brand.website && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                            {(() => { try { return new URL(brand.website).hostname; } catch { return brand.website; } })()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {/* Searching indicator */}
            {
                searching && (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                        <div style={{ marginBottom: 'var(--sp-4)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                        </div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
                            Researching {brandName}...
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            AI is searching the web for brand info and contact emails. This usually takes 5-10 seconds.
                        </p>
                        <div className="spinner" style={{ margin: 'var(--sp-6) auto 0' }}></div>
                    </div>
                )
            }

            {/* Step 2: Results & Review */}
            {
                result && !sendResults && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        {/* Brand Info */}
                        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                                            {result.brand_name}
                                        </h2>
                                        {wasCached && (
                                            <span className="badge badge-sent" style={{ fontSize: '0.65rem' }}>
                                                Cached
                                            </span>
                                        )}
                                    </div>
                                    {result.description && (
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 'var(--sp-3)' }}>
                                            {result.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                    {result.category && (
                                        <span className="badge badge-olive">{result.category}</span>
                                    )}
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={handleRefresh}
                                        disabled={searching}
                                        title="Re-search this brand for fresh data"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap', fontSize: 'var(--text-sm)' }}>
                                {result.website && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-secondary)' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                        <a href={result.website} target="_blank" rel="noopener noreferrer">{result.website}</a>
                                    </span>
                                )}
                                {result.instagram && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-secondary)' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                        {result.instagram}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Discovered Contacts */}
                        <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--green-700)' }}>
                                    Review Discovered Contacts ({result.contacts.length})
                                </h2>
                                <button className="btn btn-ghost" onClick={toggleAll} style={{ fontSize: 'var(--text-xs)' }}>
                                    {selectedEmails.size === result.contacts.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {result.contacts.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No contacts found</h3>
                                    <p>Try a different brand name or check spelling.</p>
                                </div>
                            ) : (
                                <div className="discover-contacts-list">
                                    {result.contacts.map((contact, i) => {
                                        const conf = CONFIDENCE_MAP[contact.confidence] || CONFIDENCE_MAP.low;
                                        return (
                                            <label key={i} className={`discover-contact-card ${selectedEmails.has(contact.email) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmails.has(contact.email)}
                                                    onChange={() => toggleEmail(contact.email)}
                                                    className="discover-checkbox"
                                                />
                                                <div className="discover-contact-info">
                                                    <div className="discover-contact-email">{contact.email}</div>
                                                    <div className="discover-contact-meta">
                                                        <span className={`badge badge-type`}>{contact.type}</span>
                                                        <span className={`badge ${conf.className}`}>{conf.label}</span>
                                                        {contact.source && (
                                                            <span className="discover-source" title={contact.source}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>{contact.source.length > 50 ? contact.source.slice(0, 50) + '...' : contact.source}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {result.contacts.length > 0 && (
                            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => handleSendPitches(true)}
                                    disabled={sending || selectedEmails.size === 0}
                                >
                                    {sending ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                            Processing...
                                        </span>
                                    ) : (
                                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> Send Pitches ({selectedEmails.size})</>
                                    )}
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => handleSendPitches(false)}
                                    disabled={sending || selectedEmails.size === 0}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    Review First
                                </button>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                    {selectedEmails.size} of {result.contacts.length} contacts selected
                                </span>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Results Modal */}
            {
                sendResults && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div className="card discover-results-card">
                            <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
                                <div style={{ marginBottom: 'var(--sp-3)' }}>
                                    {failCount === 0 ? (
                                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--status-replied)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    ) : (
                                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                    )}
                                </div>
                                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
                                    {sendResults.reviewMode ? 'Pitches Ready for Review' : `Pitches ${failCount === 0 ? 'Sent Successfully' : 'Processed'}`}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                    {sendResults.reviewMode
                                        ? `${(sendResults.results.filter(r => r.status === 'sent' || r.status === 'draft').length)} draft(s) created · ${dupCount} duplicate${dupCount !== 1 ? 's' : ''} skipped · ${failCount} failed`
                                        : `${sentCount} sent · ${dupCount} duplicate${dupCount !== 1 ? 's' : ''} skipped · ${failCount} failed`
                                    }
                                </p>
                            </div>

                            {/* Stat pills */}
                            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', marginBottom: 'var(--sp-6)', flexWrap: 'wrap' }}>
                                {sentCount > 0 && <span className="badge badge-sent" style={{ fontSize: 'var(--text-sm)', padding: '6px 16px' }}>{sentCount} Sent</span>}
                                {dupCount > 0 && <span className="badge badge-draft" style={{ fontSize: 'var(--text-sm)', padding: '6px 16px' }}>{dupCount} Duplicates</span>}
                                {failCount > 0 && <span className="badge badge-rejected" style={{ fontSize: 'var(--text-sm)', padding: '6px 16px' }}>{failCount} Failed</span>}
                            </div>

                            {/* Individual results */}
                            <div className="discover-results-list">
                                {sendResults.results.map((r, i) => (
                                    <div key={i} className={`discover-result-item discover-result-${r.status}`}>
                                        <div className="discover-result-email">
                                            <span style={{ fontWeight: 600 }}>{r.email}</span>
                                            <span className={`badge badge-${r.status === 'sent' ? 'sent' : r.status === 'duplicate' ? 'draft' : 'rejected'}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        {(r.status === 'sent' || r.status === 'draft') && (
                                            <div className="discover-result-links">
                                                {r.brand_id && <Link to={`/brands`} className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}>View Brand</Link>}
                                                {r.pitch_id && sendResults.reviewMode
                                                    ? <Link to={`/pitches/${r.pitch_id}/review`} className="btn btn-primary btn-sm">Review Pitch</Link>
                                                    : r.pitch_id && <Link to={`/pitches/${r.pitch_id}`} className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}>View Pitch</Link>
                                                }
                                            </div>
                                        )}
                                        {r.status === 'failed' && r.error && (
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--status-rejected)', marginTop: 'var(--sp-1)' }}>{r.error}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', marginTop: 'var(--sp-6)' }}>
                                <button className="btn btn-primary" onClick={() => { setResult(null); setSendResults(null); setBrandName(''); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> Discover Another Brand
                                </button>
                                <Link to="/pitches" className="btn btn-secondary">View Pitch History</Link>
                                <Link to="/brands" className="btn btn-secondary">View Brands</Link>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
