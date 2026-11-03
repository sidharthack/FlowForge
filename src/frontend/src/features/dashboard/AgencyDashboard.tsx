export const AgencyDashboard = () => {
    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px' }}>
            <h2>Agency Dashboard</h2>
            <p style={{ color: '#6c757d', fontSize: '15px', lineHeight: '1.6' }}>
                Welcome back to FlowForge. Use the sidebar to manage your Clients, Projects, and Team Settings.
            </p>

            <div style={{ marginTop: '30px', padding: '20px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', color: '#495057' }}>Quick Actions</h3>
                <ul style={{ paddingLeft: '20px', color: '#007bff' }}>
                    <li style={{ marginBottom: '10px' }}>Navigate to <strong>Projects</strong> to check task progress.</li>
                    <li style={{ marginBottom: '10px' }}>Navigate to <strong>Clients</strong> to onboard new accounts.</li>
                    <li>Navigate to <strong>Team Settings</strong> to invite members or clients to the platform.</li>
                </ul>
            </div>
        </div>
    );
};