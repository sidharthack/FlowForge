import { useAuth } from '../../contexts/AuthContext';
import { ClientDashboard } from './ClientDashboard';
import { AgencyDashboard } from './AgencyDashboard';

export const Dashboard = () => {
    const { role } = useAuth();

    // Route to the correct dashboard based on the JWT role
    return role === 'Client' ? <ClientDashboard /> : <AgencyDashboard />;
};