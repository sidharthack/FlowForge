import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/auth/register', { email, password, organizationName });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
        } catch (err: any) {
            // In a real app, parse the specific Identity errors
            setError('Registration failed. Ensure your password has 8+ chars and a digit.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
            <h2>Create your FlowForge account</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>Registration successful! Redirecting to login...</div>}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Organization Name (e.g. Acme Agency)"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="password"
                    placeholder="Password (min 8 chars, 1 number)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Register
                </button>
            </form>
            <p style={{ marginTop: '15px', fontSize: '14px' }}>
                Already have an account? <Link to="/login">Log in here</Link>
            </p>
        </div>
    );
};