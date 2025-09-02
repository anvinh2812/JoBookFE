import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../services/api';
import notify from '../utils/notify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const res = await authAPI.login({ email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return user;
        } catch (error) {
            notify.error(error, 'Đăng nhập thất bại');
            throw error;
        }
    }, []);

    const register = useCallback(async (payload) => {
        try {
            const res = await authAPI.register(payload);
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return user;
        } catch (error) {
            notify.error(error, 'Đăng ký thất bại');
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const res = await authAPI.me();
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error('refreshUser error', error);
            return null;
        }
    }, []);

    const updateUser = useCallback((patch) => {
        setUser((prev) => {
            const next = { ...(prev || {}), ...patch };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
