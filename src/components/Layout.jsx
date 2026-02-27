import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
    {
        section: 'Overview',
        items: [
            { path: '/', label: 'Dashboard', icon: DashboardIcon },
            { path: '/profile', label: 'My Profile', icon: ProfileIcon },
        ]
    },
    {
        section: 'Outreach',
        items: [
            { path: '/brands', label: 'Brands', icon: BrandsIcon },
            { path: '/brands/new', label: 'Add Brand', icon: AddIcon },
            { path: '/pitches/generate', label: 'Generate Pitch', icon: SparkleIcon },
        ]
    },
    {
        section: 'History',
        items: [
            { path: '/pitches', label: 'Pitch History', icon: HistoryIcon },
        ]
    }
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="hamburger" onClick={() => setSidebarOpen(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1>Hermes</h1>
            </div>

            {/* Sidebar Overlay for mobile */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <h1>
                        <svg viewBox="0 0 28 28" fill="none">
                            <path d="M14 3L18 9H10L14 3Z" fill="#A8C686" />
                            <path d="M7 10L14 7L21 10V20L14 24L7 20Z" fill="#6B8F3C" stroke="#4A7C28" strokeWidth="0.5" />
                            <circle cx="14" cy="15" r="2.5" fill="#F5F2E8" />
                        </svg>
                        Hermes
                    </h1>
                    <p>Pitch Automation</p>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            <div className="sidebar-section-label">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-content">
                    <div key={location.pathname} className="page-enter">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

// ---------- Icons ----------
function DashboardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="4" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function BrandsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7l10-4 10 4-10 4L2 7z" /><path d="M6 10v4c0 2 2.7 4 6 4s6-2 6-4v-4" />
        </svg>
    );
}

function AddIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}

function SparkleIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
        </svg>
    );
}
