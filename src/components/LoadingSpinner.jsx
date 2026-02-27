export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="spinner" />
            <span>{message}</span>
        </div>
    );
}
