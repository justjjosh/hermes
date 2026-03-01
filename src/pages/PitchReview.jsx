import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPitch, updatePitch, sendPitch, getBrand, generatePitch } from '../utils/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PitchReview() {
    const { id } = useParams();
    const [pitch, setPitch] = useState(null);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [sending, setSending] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const navigate = useNavigate();
    const addToast = useToast();

    useEffect(() => {
        loadPitch();
    }, [id]);

    async function loadPitch() {
        try {
            const p = await getPitch(id);
            setPitch(p);
            setEditSubject(p.subject);
            setEditBody(p.body);
            try {
                const b = await getBrand(p.brand_id);
                setBrand(b);
            } catch { }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        try {
            const updated = await updatePitch(id, { subject: editSubject, body: editBody });
            setPitch(updated);
            setEditing(false);
            addToast('Pitch updated!');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleSend = async () => {
        setShowSendModal(false);
        setSending(true);
        try {
            const updated = await sendPitch(id);
            setPitch(updated);
            addToast('Pitch sent successfully!');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSending(false);
        }
    };

    const handleRegenerate = async () => {
        if (!pitch?.brand_id) return;
        setRegenerating(true);
        try {
            const newPitch = await generatePitch(pitch.brand_id);
            addToast('New pitch generated!');
            navigate(`/pitches/${newPitch.id}/review`);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading pitch..." />;
    if (!pitch) return <div className="empty-state"><h3>Pitch not found</h3></div>;

    const isDraft = pitch.status === 'draft';

    return (
        <div>
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <h1>Review Pitch</h1>
                        <p>Review and send your AI-generated pitch to {brand?.name || 'the brand'}</p>
                    </div>
                    <StatusBadge status={pitch.status} />
                </div>
            </div>

            <div className="detail-layout">
                {/* Main Content */}
                <div>
                    <div className="pitch-preview">
                        <div className="pitch-preview-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {editing ? (
                                <input
                                    className="form-input"
                                    value={editSubject}
                                    onChange={e => setEditSubject(e.target.value)}
                                    style={{ flex: 1, fontWeight: 600 }}
                                />
                            ) : (
                                <div className="pitch-preview-subject">{pitch.subject}</div>
                            )}
                        </div>
                        <div className="pitch-preview-body">
                            {editing ? (
                                <textarea
                                    className="form-textarea"
                                    value={editBody}
                                    onChange={e => setEditBody(e.target.value)}
                                    style={{ minHeight: 300, fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}
                                />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: pitch.body }} />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
                        {isDraft && (
                            <>
                                {editing ? (
                                    <>
                                        <button className="btn btn-primary" onClick={handleSave}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save Changes</button>
                                        <button className="btn btn-secondary" onClick={() => { setEditing(false); setEditSubject(pitch.subject); setEditBody(pitch.body); }}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary btn-lg" onClick={() => setShowSendModal(true)} disabled={sending}>
                                            {sending ? 'Sending...' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> Send Pitch</>}
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditing(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> Edit</button>
                                        <button className="btn btn-secondary" onClick={handleRegenerate} disabled={regenerating}>
                                            {regenerating ? 'Generating...' : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg> Re-generate</>}
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        <button className="btn btn-ghost" onClick={() => navigate('/pitches')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg> Back to History</button>
                    </div>
                </div>

                {/* Brand Info Sidebar */}
                <div className="info-sidebar">
                    {brand && (
                        <div className="info-card">
                            <h3>Brand Info</h3>
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{brand.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value" style={{ wordBreak: 'break-all', fontSize: 'var(--text-xs)' }}>{brand.email}</span>
                            </div>
                            {brand.category && (
                                <div className="info-row">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">{brand.category}</span>
                                </div>
                            )}
                            {brand.website && (
                                <div className="info-row">
                                    <span className="info-label">Website</span>
                                    <span className="info-value">
                                        <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-xs)' }}>
                                            {(() => { try { return new URL(brand.website).hostname; } catch { return brand.website; } })()}
                                        </a>
                                    </span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="info-label">Status</span>
                                <StatusBadge status={brand.status} />
                            </div>
                        </div>
                    )}

                    <div className="info-card" style={{ marginTop: 'var(--sp-4)' }}>
                        <h3>Pitch Info</h3>
                        <div className="info-row">
                            <span className="info-label">Status</span>
                            <StatusBadge status={pitch.status} />
                        </div>
                        <div className="info-row">
                            <span className="info-label">Mode</span>
                            <span className="info-value">{pitch.mode}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Created</span>
                            <span className="info-value" style={{ fontSize: 'var(--text-xs)' }}>
                                {new Date(pitch.created_at + 'Z').toLocaleString()}
                            </span>
                        </div>
                        {pitch.sent_at && (
                            <div className="info-row">
                                <span className="info-label">Sent</span>
                                <span className="info-value" style={{ fontSize: 'var(--text-xs)' }}>
                                    {new Date(pitch.sent_at + 'Z').toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSendModal && (
                <Modal
                    title="Send this pitch?"
                    message={`This will send the email to ${brand?.email || 'the brand'}. Make sure you've reviewed the content carefully.`}
                    confirmText="Send Pitch"
                    onConfirm={handleSend}
                    onCancel={() => setShowSendModal(false)}
                />
            )}
        </div>
    );
}
