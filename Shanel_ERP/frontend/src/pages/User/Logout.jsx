import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Optional: notify backend (fire and forget)
        const accessToken = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (accessToken && refreshToken) {
            fetch(API_ENDPOINTS.users.logout, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            }).catch(err => console.log("Logout notification failed", err));
        }

        // Clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('modules');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');

        // Redirect to login page and force a reload to reset app state
        window.location.href = '/login';
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Logging out...
        </div>
    );
};

export default Logout;
