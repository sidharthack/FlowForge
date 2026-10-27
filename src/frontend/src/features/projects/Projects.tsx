import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

interface ProjectDto {
    id: string;
    name: string;
    description: string;
    status: string;
    clientName: string;
}

interface ClientDto {
    id: string;
    name: string;
}

export const Projects = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');

    // Fetch Projects
    const { data: projects, isLoading: projectsLoading } = useQuery<ProjectDto[]>({
        queryKey: ['projects'],
        queryFn: async () => (await api.get('/api/projects')).data
    });

    // Fetch Clients (for the dropdown)
    const { data: clients } = useQuery<ClientDto[]>({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/api/clients')).data
    });

    // Create Project Mutation
    const createProject = useMutation({
        mutationFn: async (newProject: { name: string; description: string; clientId: string }) => {
            const response = await api.post('/api/projects', newProject);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setName('');
            setDescription('');
            setClientId('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return alert('Please select a client');
        createProject.mutate({ name, description, clientId });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '800px' }}>
            <h2>Projects</h2>

            {/* Create Project Form */}
            <div style={{ background: '#fff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '20px' }}>
                <h3>Add New Project</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text" placeholder="Project Name" value={name}
                            onChange={e => setName(e.target.value)} required style={{ padding: '8px', flexGrow: 1 }}
                        />
                        <select
                            value={clientId} onChange={e => setClientId(e.target.value)}
                            required style={{ padding: '8px', flexGrow: 1 }}
                        >
                            <option value="">-- Select Client --</option>
                            {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <input
                        type="text" placeholder="Brief Description" value={description}
                        onChange={e => setDescription(e.target.value)} style={{ padding: '8px' }}
                    />
                    <button type="submit" disabled={createProject.isPending} style={{ padding: '9px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', alignSelf: 'flex-start' }}>
                        {createProject.isPending ? 'Saving...' : 'Add Project'}
                    </button>
                </form>
            </div>

            {/* Project List */}
            {projectsLoading ? <p>Loading projects...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #dee2e6' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Project Name</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Client</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects?.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: '12px', textAlign: 'center' }}>No projects found.</td></tr>
                        ) : projects?.map(project => (
                            <tr key={project.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <strong>{project.name}</strong><br />
                                    <small style={{ color: '#6c757d' }}>{project.description}</small>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.clientName}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <span style={{ padding: '4px 8px', background: '#e2e3e5', borderRadius: '12px', fontSize: '12px' }}>
                                        {project.status}
                                    </span>
                                </td>
                                {/* NEW COLUMN: Action link */}
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'right' }}>
                                    <Link
                                        to={`/projects/${project.id}/board`}
                                        style={{ padding: '6px 12px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}
                                    >
                                        View Board
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};