import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const initialState = {
    user: JSON.parse(localStorage.getItem('authUser')) || null,
    isAuthenticated: !!localStorage.getItem('authUser'),
    loading: false,
    error: null,
};

const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
};

const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return { ...state, loading: true, error: null };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return { ...state, loading: false, isAuthenticated: true, user: action.payload };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case AUTH_ACTIONS.LOGOUT:
            return { ...state, user: null, isAuthenticated: false };
        case AUTH_ACTIONS.UPDATE_PROFILE:
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
};

const AuthContext = createContext(initialState);

export const ROLES = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    GUEST: 'GUEST',
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Persist user (including JWT token) to localStorage
    useEffect(() => {
        if (state.user) {
            localStorage.setItem('authUser', JSON.stringify(state.user));
        } else {
            localStorage.removeItem('authUser');
        }
    }, [state.user]);

    // Register a new account
    const register = async (name, email, password, role) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        try {
            const data = await api.post('/auth/register', { name, email, password, role });
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
            return data;
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
            throw error;
        }
    };

    // Login with existing account
    const login = async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        try {
            const data = await api.post('/auth/login', { email, password });
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
            return data;
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
            throw error;
        }
    };

    const logout = () => {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        localStorage.removeItem('authUser');
    };

    const hasRole = (allowedRoles) => {
        if (!state.user) return false;
        if (!allowedRoles || allowedRoles.length === 0) return true;
        return allowedRoles.includes(state.user.role);
    };

    const updateProfile = async (fields) => {
        const updated = await api.put(`/users/${state.user._id}`, fields);
        dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: updated });
        return updated;
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, hasRole, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
