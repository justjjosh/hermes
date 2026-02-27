export default function StatusBadge({ status }) {
    const label = status ? status.replace(/_/g, ' ') : 'unknown';
    return <span className={`badge badge-${status || 'draft'}`}>{label}</span>;
}
