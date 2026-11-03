import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface ProjectDto {
    id: string;
    name: string;
    description: string;
    status: string;
    clientName: string;
}

export const ClientDashboard = () => {
    // Fetch projects - Backend automatically scopes this to the Client's ID!
    const { data: projects, isLoading } = useQuery<ProjectDto[]>({
        queryKey: ['projects'],
        queryFn: async () => (await api.get('/api/projects')).data
    });

    if (isLoading) return <p>Loading your portal...</p>;

    const activeProjects = projects?.filter(p => p.status !== 'Completed') || [];

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px' }}>
            <h2 style={{ marginBottom: '20px' }}>Client Portal Overview</h2>

            {/* Metrics Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px', textTransform: 'uppercase' }}>Active Projects</h3>
                    <p style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold', color: '#007bff' }}>{activeProjects.length}</p>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px', textTransform: 'uppercase' }}>Total Projects</h3>
                    <p style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold', color: '#495057' }}>{projects?.length || 0}</p>
                </div>
            </div>

            <h3 style={{ marginBottom: '15px', color: '#343a40' }}>Your Projects</h3>

            {/* Project Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {projects?.length === 0 ? <p style={{ color: '#6c757d' }}>No projects found.</p> : null}

                {projects?.map(project => (
                    <div key={project.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>{project.name}</h4>
                            <span style={{ padding: '4px 8px', background: '#e2e3e5', borderRadius: '12px', fontSize: '12px', color: '#495057', fontWeight: '500' }}>
                                {project.status}
                            </span>
                        </div>
                        <p style={{ color: '#6c757d', fontSize: '14px', flexGrow: 1, marginBottom: '20px', lineHeight: '1.5' }}>
                            {project.description || 'No description provided.'}
                        </p>
                        <Link
                            to={`/projects/${project.id}/board`}
                            style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', color: '#007bff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #dee2e6' }}
                        >
                            View Project Board &rarr;
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};