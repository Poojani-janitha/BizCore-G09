import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('modules', JSON.stringify(data.modules));
                alert('Login successful!');
                window.location.href = '/home'; // Force reload to refresh sidebar/header state
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f1f5f9'
        }}>
            <form onSubmit={handleLogin} style={{ 
                padding: '40px', 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#0f172a' }}>Login to BizCore</h2>
                
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        required
                    />
                </div>

                <button type="submit" style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: '#41b883', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
