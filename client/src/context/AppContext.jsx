import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const initialState = {
    users: [],
    projects: [],
    loading: false,
    error: null,
};

const APP_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_PROJECTS: 'SET_PROJECTS',
    ADD_PROJECT: 'ADD_PROJECT',
    UPDATE_PROJECT: 'UPDATE_PROJECT',
    DELETE_PROJECT: 'DELETE_PROJECT',
    SET_USERS: 'SET_USERS',
    DELETE_USER: 'DELETE_USER',
    SET_ERROR: 'SET_ERROR',
};

const appReducer = (state, action) => {
    switch (action.type) {
        case APP_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case APP_ACTIONS.SET_PROJECTS:
            return { ...state, projects: action.payload, loading: false };
        case APP_ACTIONS.ADD_PROJECT:
            return { ...state, projects: [action.payload, ...state.projects] };
        case APP_ACTIONS.UPDATE_PROJECT:
            return { ...state, projects: state.projects.map(p => p._id === action.payload._id ? action.payload : p) };
        case APP_ACTIONS.DELETE_PROJECT:
            return { ...state, projects: state.projects.filter(p => p._id !== action.payload) };
        case APP_ACTIONS.SET_USERS:
            return { ...state, users: action.payload, loading: false };
        case APP_ACTIONS.DELETE_USER:
            return { ...state, users: state.users.filter(u => u._id !== action.payload) };
        case APP_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

const AppContext = createContext(initialState);

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { isAuthenticated } = useAuth();

    // ── Fetch projects on login ────────────────────────────────────────────
    const fetchProjects = useCallback(async () => {
        dispatch({ type: APP_ACTIONS.SET_LOADING, payload: true });
        try {
            const data = await api.get('/projects');
            dispatch({ type: APP_ACTIONS.SET_PROJECTS, payload: data });
        } catch (err) {
            dispatch({ type: APP_ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    // ── Fetch users (for admin panel) ──────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        dispatch({ type: APP_ACTIONS.SET_LOADING, payload: true });
        try {
            const data = await api.get('/users');
            dispatch({ type: APP_ACTIONS.SET_USERS, payload: data });
        } catch (err) {
            dispatch({ type: APP_ACTIONS.SET_ERROR, payload: err.message });
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProjects();
        }
    }, [isAuthenticated, fetchProjects]);

    // ── Project actions ────────────────────────────────────────────────────
    const addProject = async (project) => {
        const data = await api.post('/projects', project);
        dispatch({ type: APP_ACTIONS.ADD_PROJECT, payload: data });
        return data;
    };

    const updateProject = async (id, updates) => {
        const data = await api.put(`/projects/${id}`, updates);
        dispatch({ type: APP_ACTIONS.UPDATE_PROJECT, payload: data });
        return data;
    };

    const deleteProject = async (id) => {
        await api.delete(`/projects/${id}`);
        dispatch({ type: APP_ACTIONS.DELETE_PROJECT, payload: id });
    };

    // ── User actions ───────────────────────────────────────────────────────
    const deleteUser = async (id) => {
        await api.delete(`/users/${id}`);
        dispatch({ type: APP_ACTIONS.DELETE_USER, payload: id });
    };

    return (
        <AppContext.Provider value={{
            ...state,
            fetchProjects,
            fetchUsers,
            addProject,
            updateProject,
            deleteProject,
            deleteUser,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
