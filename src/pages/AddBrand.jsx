import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrand } from '../utils/api';
import { useToast } from '../components/Toast';

const CATEGORIES = ['skincare', 'wellness', 'beauty', 'lifestyle', 'selfcare', 'grooming', 'health', 'fashion', 'fitness'];

export default function AddBrand() {
    const [form, setForm] = useState({ name: '', email: '', website: '', instagram: '', category: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const addToast = useToast();

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            Object.keys(payload).forEach(k => {
                if (payload[k] === '') delete payload[k];
            });
            const brand = await createBrand(payload);
            addToast(`${brand.name} added successfully!`);
            navigate('/brands');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Add Brand</h1>
                <p>Add a new brand to your outreach pipeline</p>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
                <div className="card">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Brand Name <span className="required">*</span></label>
                            <input className="form-input" type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. GlowRecipe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email <span className="required">*</span></label>
                            <input className="form-input" type="email" required value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="pr@brand.com" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input className="form-input" type="url" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://www.brand.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram Handle</label>
                            <input className="form-input" type="text" value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="@brandhandle" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                            <option value="">Select a category...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-textarea" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Anything about this brand that might help the AI write a better pitch..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/brands')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Adding...' : 'Add Brand'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
