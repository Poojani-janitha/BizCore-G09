import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('modules');
        
        // Optional: notify backend (fire and forget)
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            fetch('http://localhost:5000/api/users/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            }).catch(err => console.log("Logout notification failed", err));
            localStorage.removeItem('refresh_token');
        }

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
