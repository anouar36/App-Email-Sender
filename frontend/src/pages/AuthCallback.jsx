import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth(); // We need to expose a way to set token in AuthContext

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setToken(token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, setToken]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-green-500">
            <div>PROCESSING_AUTH_TOKEN...</div>
        </div>
    );
};

export default AuthCallback;
