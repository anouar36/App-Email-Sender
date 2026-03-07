import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type User } from '@/lib/api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authApi.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authApi.getCurrentUser(token);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      authApi.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });
      authApi.saveToken(response.token);
      authApi.saveUser(response.user);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.register({ email, username, password });
      authApi.saveToken(response.token);
      authApi.saveUser(response.user);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
