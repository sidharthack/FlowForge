import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItemStyle = (path: string) => ({
        display: 'block',
        padding: '10px 15px',
        color: location.pathname === path ? '#fff' : '#adb5bd',
        textDecoration: 'none',
        backgroundColor: location.pathname === path ? '#343a40' : 'transparent',
        borderRadius: '4px',
        marginBottom: '5px'
    });

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa' }}>

            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#212529', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #343a40' }}>
                    FlowForge
                </div>
                <nav style={{ padding: '15px', flexGrow: 1 }}>
                    <Link to="/" style={navItemStyle('/')}>Dashboard</Link>
                    <Link to="/projects" style={navItemStyle('/projects')}>Projects</Link>
                    <Link to="/clients" style={navItemStyle('/clients')}>Clients</Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Top Header */}
                <header style={{ height: '60px', backgroundColor: '#fff', borderBottom: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px' }}>
                    <button
                        onClick={logout}
                        style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Log Out
                    </button>
                </header>

                {/* Page Content (Dynamic) */}
                <main style={{ padding: '20px', overflowY: 'auto' }}>
                    <Outlet /> {/* React Router renders the matched child route here */}
                </main>

            </div>
        </div>
    );
};