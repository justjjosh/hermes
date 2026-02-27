import { useState } from 'react';

export default function TagInput({ value = [], onChange, suggestions = [], placeholder = 'Type and press Enter...' }) {
    const [input, setInput] = useState('');

    const addTag = (tag) => {
        const normalized = tag.toLowerCase().trim();
        if (normalized && !value.includes(normalized)) {
            onChange([...value, normalized]);
        }
        setInput('');
    };

    const removeTag = (tag) => {
        onChange(value.filter((t) => t !== tag));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    const availableSuggestions = suggestions.filter((s) => !value.includes(s));

    return (
        <div>
            <div className="tag-input-container">
                {value.map((tag) => (
                    <span key={tag} className="tag">
                        {tag}
                        <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                    </span>
                ))}
                <input
                    className="tag-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            </div>
            {availableSuggestions.length > 0 && (
                <div className="tag-suggestions">
                    {availableSuggestions.map((s) => (
                        <button key={s} type="button" className="tag-suggestion" onClick={() => addTag(s)}>
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
