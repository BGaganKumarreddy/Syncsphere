import React, { createContext, useState, useEffect, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
    // User State
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : {
            name: "User",
            email: "user@example.com",
            bio: "Software Developer | Tech Enthusiast",
            notifications: {
                email: true,
                push: false
            }
        };
    });

    // Projects State
    const [projects, setProjects] = useState(() => {
        const savedProjects = localStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : [
            {
                id: 1,
                name: "Website Redesign",
                status: "Active",
                statusColor: "bg-green-100 text-green-800",
                dueDate: "Feb 08, 2026",
                team: [
                    { initials: "JD", color: "bg-slate-200 text-slate-600" },
                    { initials: "AS", color: "bg-indigo-200 text-indigo-600" },
                    { initials: "+3", color: "bg-slate-100 text-slate-500", isCount: true }
                ]
            },
            {
                id: 2,
                name: "Mobile App Development",
                status: "In Progress",
                statusColor: "bg-yellow-100 text-yellow-800",
                dueDate: "Feb 10, 2026",
                team: [
                    { initials: "MK", color: "bg-purple-200 text-purple-600" },
                    { initials: "TR", color: "bg-slate-200 text-slate-600" }
                ]
            },
            {
                id: 3,
                name: "Marketing Campaign",
                status: "Planning",
                statusColor: "bg-slate-100 text-slate-800",
                dueDate: "Feb 12, 2026",
                team: [
                    { initials: "SJ", color: "bg-blue-200 text-blue-600" }
                ]
            }
        ];
    });

    // Persist User
    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    // Persist Projects
    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    const addProject = (newProject) => {
        setProjects(prev => [...prev, { ...newProject, id: Date.now() }]);
    };

    const updateProject = (projectId, updatedData) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updatedData } : p));
    };

    const deleteProject = (projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
    };

    const addTask = (projectId, newTask) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const updatedTasks = [...(p.tasks || []), { ...newTask, id: Date.now() }];
                return { ...p, tasks: updatedTasks };
            }
            return p;
        }));
    };

    const updateTaskStatus = (projectId, taskId, newStatus) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
                return { ...p, tasks: updatedTasks };
            }
            return p;
        }));
    };

    const deleteTask = (projectId, taskId) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const updatedTasks = p.tasks?.filter(t => t.id !== taskId) || [];
                return { ...p, tasks: updatedTasks };
            }
            return p;
        }));
    };

    return (
        <AppDataContext.Provider value={{
            user,
            updateUser,
            projects,
            addProject,
            updateProject,
            deleteProject,
            addTask,
            updateTaskStatus,
            deleteTask
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
