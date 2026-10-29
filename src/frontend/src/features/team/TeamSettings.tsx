import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface UserDto {
    id: string;
    name: string;
}

interface ClientDto {
    id: string;
    name: string;
}

interface InviteResponse {
    message: string;
    email: string;
    temporaryPassword: string;
}

export const TeamSettings = () => {
    const { role } = useAuth();
    const queryClient = useQueryClient();

    const [email, setEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('AgencyMember');
    const [clientId, setClientId] = useState(''); // NEW: Track selected client
    const [lastInvite, setLastInvite] = useState<InviteResponse | null>(null);

    if (role !== 'AgencyAdmin') {
        return <Navigate to="/" replace />;
    }

    // Fetch Team Members
    const { data: users = [], isLoading: usersLoading } = useQuery<UserDto[]>({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/api/users')).data,
    });

    // NEW: Fetch Clients for the dropdown
    const { data: clients = [], isLoading: clientsLoading } = useQuery<ClientDto[]>({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/api/clients')).data,
    });

    // Invite User Mutation
    const inviteUser = useMutation({
        mutationFn: async (payload: { email: string; role: string; clientId: string | null }) => {
            const response = await api.post('/api/users/invite', payload);
            return response.data as InviteResponse;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEmail('');
            setClientId(''); // Reset client selection
            setLastInvite(data);
            toast.success(`${inviteRole} invited successfully!`);
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data || 'Failed to invite user';
            toast.error(typeof errorMsg === 'string' ? errorMsg : 'Check credentials and try again.');
            setLastInvite(null);
        }
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // NEW: Validation to ensure a client is selected if the role is Client
        if (inviteRole === 'Client' && !clientId) {
            toast.error('Please select a client organization for this user.');
            return;
        }

        inviteUser.mutate({
            email,
            role: inviteRole,
            clientId: inviteRole === 'Client' ? clientId : null
        });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '800px' }}>
            <h2>Team Settings</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>Manage agency members and external clients.</p>

            {/* Invite Form */}
            <div style={{ background: '#fff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '20px' }}>
                <h3>Invite New User</h3>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="email" placeholder="User's Email Address" value={email}
                        onChange={e => setEmail(e.target.value)} required style={{ padding: '8px', flexGrow: 1, minWidth: '200px' }}
                    />

                    <select
                        value={inviteRole} onChange={e => {
                            setInviteRole(e.target.value);
                            if (e.target.value !== 'Client') setClientId(''); // Clear client if switching back
                        }}
                        style={{ padding: '8px', width: '160px' }}
                    >
                        <option value="AgencyMember">Agency Member</option>
                        <option value="Client">Client</option>
                    </select>

                    {/* NEW: Conditional Client Dropdown */}
                    {inviteRole === 'Client' && (
                        <select
                            value={clientId} onChange={e => setClientId(e.target.value)}
                            required style={{ padding: '8px', width: '200px' }}
                            disabled={clientsLoading}
                        >
                            <option value="">-- Select Client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}

                    <button type="submit" disabled={inviteUser.isPending} style={{ padding: '9px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {inviteUser.isPending ? 'Inviting...' : 'Send Invite'}
                    </button>
                </form>

                {/* Temporary Password Display Box */}
                {lastInvite && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', color: '#155724' }}>
                        <strong>Success!</strong> The account for <code>{lastInvite.email}</code> has been created.
                        <div style={{ marginTop: '10px', fontSize: '14px' }}>
                            Please securely share this temporary password with them:<br />
                            <code style={{ fontSize: '18px', background: '#fff', padding: '4px 8px', display: 'inline-block', marginTop: '5px', border: '1px solid #ccc' }}>
                                {lastInvite.temporaryPassword}
                            </code>
                        </div>
                    </div>
                )}
            </div>

            {/* User Directory */}
            <h3>Organization Directory</h3>
            {usersLoading ? <p>Loading users...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #dee2e6', marginTop: '10px' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' }}>Email / Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td style={{ padding: '12px', textAlign: 'center' }}>No users found.</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{user.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};