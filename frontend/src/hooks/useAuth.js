import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/auth/profile`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    setIsGuest(true);
                    return;
                }

                const data = await response.json();
                setUser(data.user);
                setIsGuest(false);
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                setIsGuest(true);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
            setIsGuest(true);
        }
    };

    return {
        user,
        loading,
        isGuest,
        logout,
        isAuthenticated: !!user && !isGuest
    };
};
