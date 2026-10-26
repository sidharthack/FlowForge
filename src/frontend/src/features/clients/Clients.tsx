import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

// Define the shape of our data (matches our backend DTO)
interface ClientDto {
    id: string;
    name: string;
    contactEmail: string;
}

export const Clients = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    // Fetch Clients
    const { data: clients, isLoading, error } = useQuery<ClientDto[]>({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get('/api/clients');
            return response.data;
        }
    });

    // Create Client Mutation
    const createClient = useMutation({
        mutationFn: async (newClient: { name: string; contactEmail: string }) => {
            const response = await api.post('/api/clients', newClient);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch the clients list immediately after a successful creation
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setName('');
            setContactEmail('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createClient.mutate({ name, contactEmail });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '800px' }}>
            <h2>Clients</h2>

            {/* Create Client Form */}
            <div style={{ background: '#fff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '20px' }}>
                <h3>Add New Client</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text" placeholder="Client Name" value={name}
                        onChange={e => setName(e.target.value)} required style={{ padding: '8px', flexGrow: 1 }}
                    />
                    <input
                        type="email" placeholder="Contact Email" value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)} required style={{ padding: '8px', flexGrow: 1 }}
                    />
                    <button type="submit" disabled={createClient.isPending} style={{ padding: '9px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {createClient.isPending ? 'Saving...' : 'Add Client'}
                    </button>
                </form>
            </div>

            {/* Client List */}
            {isLoading ? <p>Loading clients...</p> : error ? <p style={{ color: 'red' }}>Error loading clients.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #dee2e6' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients?.length === 0 ? (
                            <tr><td colSpan={2} style={{ padding: '12px', textAlign: 'center' }}>No clients found.</td></tr>
                        ) : clients?.map(client => (
                            <tr key={client.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{client.name}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{client.contactEmail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};