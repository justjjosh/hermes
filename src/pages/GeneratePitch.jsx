import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBrands, generatePitch } from '../utils/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GeneratePitch() {
    const { brandId: paramBrandId } = useParams();
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(paramBrandId || '');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();
    const addToast = useToast();

    useEffect(() => {
        async function loadBrands() {
            try {
                const data = await getBrands();
                setBrands(data);
                if (paramBrandId) setSelectedBrand(paramBrandId);
            } catch (err) {
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        }
        loadBrands();
    }, []);

    const handleGenerate = async () => {
        if (!selectedBrand) return;
        setGenerating(true);
        try {
            const pitch = await generatePitch(parseInt(selectedBrand));
            addToast('Pitch generated successfully!');
            navigate(`/pitches/${pitch.id}/review`);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setGenerating(false);
        }
    };

    const selected = brands.find(b => b.id === parseInt(selectedBrand));

    if (loading) return <LoadingSpinner message="Loading brands..." />;

    return (
        <div>
            <div className="page-header">
                <h1>Generate Pitch</h1>
                <p>Let AI craft the perfect partnership email for a brand</p>
            </div>

            <div style={{ maxWidth: 600 }}>
                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <div className="form-group">
                        <label className="form-label">Select Brand</label>
                        <select className="form-select" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                            <option value="">Choose a brand...</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} — {b.email} ({b.status.replace(/_/g, ' ')})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selected && (
                        <div className="info-card" style={{ marginTop: 'var(--sp-4)', background: 'var(--warm-gray-50)' }}>
                            <h3 style={{ marginBottom: 'var(--sp-3)' }}>Brand Details</h3>
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{selected.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{selected.email}</span>
                            </div>
                            {selected.category && (
                                <div className="info-row">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">{selected.category}</span>
                                </div>
                            )}
                            {selected.website && (
                                <div className="info-row">
                                    <span className="info-label">Website</span>
                                    <span className="info-value">
                                        <a href={selected.website} target="_blank" rel="noopener noreferrer">{selected.website}</a>
                                    </span>
                                </div>
                            )}
                            {selected.notes && (
                                <div style={{ padding: 'var(--sp-3) 0 0', borderTop: '1px solid var(--border)', marginTop: 'var(--sp-2)' }}>
                                    <span className="info-label">Notes</span>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginTop: 'var(--sp-1)' }}>{selected.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleGenerate}
                        disabled={!selectedBrand || generating}
                        style={{ marginTop: 'var(--sp-6)', width: '100%' }}
                    >
                        {generating ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                Generating with AI... (this may take a few seconds)
                            </span>
                        ) : (
                            <>✨ Generate AI Pitch</>
                        )}
                    </button>
                </div>

                {generating && (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                        <div style={{ fontSize: 48, marginBottom: 'var(--sp-4)' }}>🤖</div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
                            AI is crafting your pitch...
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            Analyzing {selected?.name}'s brand and creating a personalized email. This usually takes 3-10 seconds.
                        </p>
                        <div className="spinner" style={{ margin: 'var(--sp-6) auto 0' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}
