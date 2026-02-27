import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPitch, updatePitch, deletePitch, getBrand, sendPitch } from '../utils/api';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const TIMELINE_STEPS = ['draft', 'sent', 'opened', 'replied'];

export default function PitchDetail() {
    const { id } = useParams();
    const [pitch, setPitch] = useState(null);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyNotes, setReplyNotes] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const addToast = useToast();

    useEffect(() => {
        loadPitch();
    }, [id]);

    async function loadPitch() {
        try {
            const p = await getPitch(id);
            setPitch(p);
            setReplyNotes(p.reply_notes || '');
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

    const handleMarkReplied = async () => {
        setSaving(true);
        try {
            const updated = await updatePitch(id, { status: 'replied', reply_notes: replyNotes });
            setPitch(updated);
            addToast('Marked as replied!');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            const updated = await updatePitch(id, { reply_notes: replyNotes });
            setPitch(updated);
            addToast('Notes saved!');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePitch(id);
            addToast('Pitch deleted');
            navigate('/pitches');
        } catch (err) {
            addToast(err.message, 'error');
        }
        setShowDeleteModal(false);
    };

    const handleSend = async () => {
        setShowSendModal(false);
        setSaving(true);
        try {
            const updated = await sendPitch(id);
            setPitch(updated);
            addToast('🚀 Pitch sent successfully!');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const getStepStatus = (step) => {
        const statusOrder = { draft: 0, sent: 1, opened: 2, replied: 3 };
        const currentIndex = statusOrder[pitch.status] ?? 0;
        const stepIndex = statusOrder[step];
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const getStepTime = (step) => {
        const timeMap = {
            draft: pitch.created_at,
            sent: pitch.sent_at,
            opened: pitch.opened_at,
            replied: pitch.replied_at,
        };
        const t = timeMap[step];
        if (!t) return '';
        return new Date(t + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return <LoadingSpinner message="Loading pitch..." />;
    if (!pitch) return <div className="empty-state"><h3>Pitch not found</h3><Link to="/pitches" className="btn btn-primary">Back to History</Link></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-actions">
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                            Pitch to {brand?.name || 'Brand'}
                            <StatusBadge status={pitch.status} />
                        </h1>
                        <p>Created {new Date(pitch.created_at + 'Z').toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                        {pitch.status === 'draft' && (
                            <>
                                <Link to={`/pitches/${id}/review`} className="btn btn-primary">✏️ Edit & Send</Link>
                                <button className="btn btn-primary" onClick={() => setShowSendModal(true)} disabled={saving}>
                                    🚀 Send Now
                                </button>
                            </>
                        )}
                        <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="status-timeline">
                    {TIMELINE_STEPS.map((step) => {
                        const status = getStepStatus(step);
                        return (
                            <div key={step} className={`timeline-step ${status}`}>
                                <div className="timeline-dot">
                                    {status === 'completed' ? '✓' : status === 'current' ? '●' : '○'}
                                </div>
                                <span className="timeline-label">{step}</span>
                                <span className="timeline-time">{getStepTime(step)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="detail-layout">
                {/* Main Content */}
                <div>
                    {/* Pitch Content */}
                    <div className="pitch-preview" style={{ marginBottom: 'var(--sp-6)' }}>
                        <div className="pitch-preview-header">
                            <div className="pitch-preview-subject">{pitch.subject}</div>
                        </div>
                        <div className="pitch-preview-body" dangerouslySetInnerHTML={{ __html: pitch.body }} />
                    </div>

                    {/* Reply Notes */}
                    <div className="card">
                        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--green-700)' }}>
                            Reply Notes
                        </h2>
                        <textarea
                            className="form-textarea"
                            value={replyNotes}
                            onChange={e => setReplyNotes(e.target.value)}
                            placeholder="Add notes about the brand's reply, follow-up plans, etc..."
                            style={{ minHeight: 120 }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                            <button className="btn btn-secondary" onClick={handleSaveNotes} disabled={saving}>
                                💾 Save Notes
                            </button>
                            {pitch.status !== 'replied' && (
                                <button className="btn btn-primary" onClick={handleMarkReplied} disabled={saving}>
                                    ✅ Mark as Replied
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="info-sidebar">
                    {brand && (
                        <div className="info-card" style={{ marginBottom: 'var(--sp-4)' }}>
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
                            <div className="info-row">
                                <span className="info-label">Status</span>
                                <StatusBadge status={brand.status} />
                            </div>
                        </div>
                    )}

                    <div className="info-card">
                        <h3>Tracking</h3>
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
                        {pitch.opened_at && (
                            <div className="info-row">
                                <span className="info-label">Opened</span>
                                <span className="info-value" style={{ fontSize: 'var(--text-xs)' }}>
                                    {new Date(pitch.opened_at + 'Z').toLocaleString()}
                                </span>
                            </div>
                        )}
                        {pitch.clicked_at && (
                            <div className="info-row">
                                <span className="info-label">Clicked</span>
                                <span className="info-value" style={{ fontSize: 'var(--text-xs)' }}>
                                    {new Date(pitch.clicked_at + 'Z').toLocaleString()}
                                </span>
                            </div>
                        )}
                        {pitch.replied_at && (
                            <div className="info-row">
                                <span className="info-label">Replied</span>
                                <span className="info-value" style={{ fontSize: 'var(--text-xs)' }}>
                                    {new Date(pitch.replied_at + 'Z').toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="info-row">
                            <span className="info-label">Mode</span>
                            <span className="info-value" style={{ textTransform: 'capitalize' }}>{pitch.mode}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <Modal
                    title="Delete this pitch?"
                    message="This action cannot be undone. The pitch will be permanently removed."
                    confirmText="Delete Pitch"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {showSendModal && (
                <Modal
                    title="Send this pitch?"
                    message={`This will send the email to ${brand?.email || 'the brand'}. Make sure you've reviewed the content.`}
                    confirmText="Send Pitch"
                    onConfirm={handleSend}
                    onCancel={() => setShowSendModal(false)}
                />
            )}
        </div>
    );
}
