import { useState, useEffect } from 'react';
import { getProfile, createProfile, updateProfile } from '../utils/api';
import { useToast } from '../components/Toast';
import TagInput from '../components/TagInput';
import LoadingSpinner from '../components/LoadingSpinner';

const NICHE_SUGGESTIONS = ['skincare', 'selfcare', 'wellbeing', 'beauty', 'lifestyle', 'fitness', 'fashion', 'health', 'mental-health', 'grooming'];
const INTEREST_SUGGESTIONS = ['sustainability', 'affordable-luxury', 'mental-health', 'clean-beauty', 'K-beauty', 'vegan', 'cruelty-free', 'mens-grooming', 'inclusive-beauty'];

const defaultProfile = {
    name: '', age: '', sender_email: '', tiktok_url: '', instagram_url: '',
    youtube_url: '', portfolio_url: '', follower_count: '', avg_views: '',
    engagement_rate: '', niches: [], interests: [], bio: '', content_style: '',
    unique_angle: '', top_performing_content: '', pitch_template: ''
};

export default function Profile() {
    const [form, setForm] = useState(defaultProfile);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const addToast = useToast();

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile = await getProfile();
                setForm({
                    ...defaultProfile,
                    ...profile,
                    age: profile.age || '',
                    follower_count: profile.follower_count || '',
                    avg_views: profile.avg_views || '',
                    engagement_rate: profile.engagement_rate || '',
                });
                setIsEdit(true);
            } catch (err) {
                // No profile yet — show create form
                setIsEdit(false);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                age: form.age ? parseInt(form.age) : null,
                follower_count: form.follower_count ? parseInt(form.follower_count) : 0,
                avg_views: form.avg_views ? parseInt(form.avg_views) : 0,
                engagement_rate: form.engagement_rate ? parseFloat(form.engagement_rate) : null,
            };
            // Remove empty strings → null
            Object.keys(payload).forEach(k => {
                if (payload[k] === '') payload[k] = null;
            });

            if (isEdit) {
                await updateProfile(payload);
                addToast('Profile updated successfully!');
            } else {
                await createProfile(payload);
                setIsEdit(true);
                addToast('Profile created successfully!');
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading profile..." />;

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? 'Edit Profile' : 'Set Up Your Profile'}</h1>
                <p>{isEdit ? 'Update your creator info for better AI pitches' : 'Tell us about yourself so AI can craft personalized pitches'}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', color: 'var(--green-700)' }}>
                        Basic Information
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Name <span className="required">*</span></label>
                            <input className="form-input" type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input className="form-input" type="number" value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="e.g. 20" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sender Email <span className="required">*</span></label>
                        <input className="form-input" type="email" required value={form.sender_email} onChange={e => handleChange('sender_email', e.target.value)} placeholder="your@email.com" />
                        <span className="form-hint">Replies from brands will be sent to this email</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea className="form-textarea" value={form.bio || ''} onChange={e => handleChange('bio', e.target.value)} placeholder="Tell brands about yourself..." />
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', color: 'var(--green-700)' }}>
                        Social Media
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">TikTok URL <span className="required">*</span></label>
                            <input className="form-input" type="text" required value={form.tiktok_url} onChange={e => handleChange('tiktok_url', e.target.value)} placeholder="https://www.tiktok.com/@username" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram URL</label>
                            <input className="form-input" type="text" value={form.instagram_url || ''} onChange={e => handleChange('instagram_url', e.target.value)} placeholder="https://www.instagram.com/username" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">YouTube URL</label>
                            <input className="form-input" type="text" value={form.youtube_url || ''} onChange={e => handleChange('youtube_url', e.target.value)} placeholder="https://www.youtube.com/@username" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Portfolio URL <span className="required">*</span></label>
                            <input className="form-input" type="text" required value={form.portfolio_url} onChange={e => handleChange('portfolio_url', e.target.value)} placeholder="Link to your media kit or portfolio" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', color: 'var(--green-700)' }}>
                        Stats & Metrics
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Follower Count</label>
                            <input className="form-input" type="number" value={form.follower_count} onChange={e => handleChange('follower_count', e.target.value)} placeholder="e.g. 1400" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Average Views</label>
                            <input className="form-input" type="number" value={form.avg_views} onChange={e => handleChange('avg_views', e.target.value)} placeholder="e.g. 5000" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Engagement Rate (%)</label>
                        <input className="form-input" type="number" step="0.1" value={form.engagement_rate} onChange={e => handleChange('engagement_rate', e.target.value)} placeholder="e.g. 8.5" />
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-5)', color: 'var(--green-700)' }}>
                        Content & Positioning
                    </h2>

                    <div className="form-group">
                        <label className="form-label">Niches</label>
                        <TagInput value={form.niches || []} onChange={v => handleChange('niches', v)} suggestions={NICHE_SUGGESTIONS} placeholder="Type a niche and press Enter..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Interests</label>
                        <TagInput value={form.interests || []} onChange={v => handleChange('interests', v)} suggestions={INTEREST_SUGGESTIONS} placeholder="Type an interest and press Enter..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content Style</label>
                        <textarea className="form-textarea" value={form.content_style || ''} onChange={e => handleChange('content_style', e.target.value)} placeholder="Describe your content style..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Unique Angle</label>
                        <textarea className="form-textarea" value={form.unique_angle || ''} onChange={e => handleChange('unique_angle', e.target.value)} placeholder="What makes you different from other creators?" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Top Performing Content</label>
                        <textarea className="form-textarea" value={form.top_performing_content || ''} onChange={e => handleChange('top_performing_content', e.target.value)} placeholder="Describe your most viral or successful content..." />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        {saving ? (
                            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Saving...</>
                        ) : (
                            isEdit ? '💾 Update Profile' : '🚀 Create Profile'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
