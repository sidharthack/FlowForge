import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileSettings = () => {
    const { role } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const changePassword = useMutation({
        mutationFn: async () => {
            const response = await api.post('/api/auth/change-password', { currentPassword, newPassword });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.[0] || 'Failed to change password. Please check your current password.';
            toast.error(typeof errorMsg === 'string' ? errorMsg : 'An error occurred.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        changePassword.mutate();
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '600px' }}>
            <h2>Profile Settings</h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>Update your account details and security preferences.</p>

            <div style={{ display: 'inline-block', padding: '4px 8px', background: '#e2e3e5', borderRadius: '12px', fontSize: '12px', marginBottom: '20px' }}>
                Current Role: <strong>{role}</strong>
            </div>

            <div style={{ background: '#fff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                <h3>Change Password</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>New Password</label>
                        <input
                            type="password"
                            placeholder="Minimum 8 characters, at least 1 number"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={changePassword.isPending}
                        style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}
                    >
                        {changePassword.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};