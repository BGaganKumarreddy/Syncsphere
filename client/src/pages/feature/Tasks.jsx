import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = ['Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_STYLES = {
    'Todo': { chip: 'bg-slate-700/60 text-slate-300 border border-slate-600', dot: 'bg-slate-400' },
    'In Progress': { chip: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700', dot: 'bg-indigo-400' },
    'In Review': { chip: 'bg-amber-900/60 text-amber-300 border border-amber-700', dot: 'bg-amber-400' },
    'Done': { chip: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700', dot: 'bg-emerald-400' },
};

const PRIORITY_STYLES = {
    'Low': 'bg-slate-700/50 text-slate-400 border border-slate-600',
    'Medium': 'bg-sky-900/50 text-sky-400 border border-sky-800',
    'High': 'bg-orange-900/50 text-orange-400 border border-orange-800',
    'Urgent': 'bg-red-900/50 text-red-400 border border-red-800',
};

const PRIORITY_ICONS = {
    'Low': '↓',
    'Medium': '→',
    'High': '↑',
    'Urgent': '⚡',
};

// ─── Helper: initials avatar ──────────────────────────────────────────────────
const Avatar = ({ name = '?', size = 'sm' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
        'from-sky-500 to-blue-500'];
    const color = colors[name.charCodeAt(0) % colors.length];
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
};

// ─── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, isAdmin, currentUserId, onEdit, onDelete, onStatusChange }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const status = task.status;
    const isAssignee = task.assignee?._id === currentUserId || task.assignee === currentUserId;
    const isCreator = task.createdBy?._id === currentUserId || task.createdBy === currentUserId;
    const canEdit = isAdmin || isAssignee || isCreator;
    const canDelete = isAdmin;

    return (
        <div className="group relative bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up">
            {/* Priority stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${task.priority === 'Urgent' ? 'bg-red-500' :
                task.priority === 'High' ? 'bg-orange-500' :
                    task.priority === 'Medium' ? 'bg-sky-500' : 'bg-slate-600'
                }`} />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-3 pl-2">
                <h3 className="text-sm font-semibold text-slate-100 leading-tight line-clamp-2">{task.title}</h3>
                {canEdit && (
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setMenuOpen(v => !v)}
                            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            ···
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-8 z-20 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
                                <button onClick={() => { onEdit(task); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    ✏️ Edit
                                </button>
                                {canDelete && (
                                    <button onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-2">
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-slate-500 mb-3 pl-2 line-clamp-2">{task.description}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 pl-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                    <span>{PRIORITY_ICONS[task.priority]}</span>
                    {task.priority}
                </span>
                {task.project && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-900/50 text-violet-300 border border-violet-800">
                        📁 {task.project.name}
                    </span>
                )}
                {task.dueDate && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600">
                        📅 {task.dueDate}
                    </span>
                )}
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pl-2">
                {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                        <Avatar name={task.assignee.name} size="sm" />
                        <span className="text-xs text-slate-400">{task.assignee.name}</span>
                    </div>
                ) : (
                    <span className="text-xs text-slate-600 italic">Unassigned</span>
                )}

                {/* Quick status toggle (member can change their own) */}
                {canEdit && (
                    <select
                        value={task.status}
                        onChange={e => onStatusChange(task._id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="text-xs bg-slate-900 border border-slate-700 text-slate-400 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                )}
            </div>
        </div>
    );
};

// ─── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ status, tasks, isAdmin, currentUserId, onEdit, onDelete, onStatusChange }) => {
    const style = STATUS_STYLES[status];
    return (
        <div className="flex-1 min-w-64 max-w-xs flex flex-col gap-3">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${style.chip}`}>
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-sm font-semibold">{status}</span>
                <span className="ml-auto text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5 min-h-24">
                {tasks.length === 0 && (
                    <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-4 text-center text-slate-600 text-xs">
                        No tasks
                    </div>
                )}
                {tasks.map((task, i) => (
                    <div key={task._id} style={{ animationDelay: `${i * 60}ms` }}>
                        <TaskCard
                            task={task}
                            isAdmin={isAdmin}
                            currentUserId={currentUserId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Tasks Page ───────────────────────────────────────────────────────────
export default function Tasks() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const isAdmin = user?.role === 'ADMIN';

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', status: 'Todo',
        priority: 'Medium', assignee: '', dueDate: '',
    });

    // ── Fetch tasks and users ──────────────────────────────────────────────────
    const fetchTasks = useCallback(async () => {
        try {
            const data = await api.get('/tasks');
            setTasks(data);
        } catch (err) {
            addToast(err.message || 'Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        if (isAdmin) {
            api.get('/users').then(setUsers).catch(() => { });
        }
    }, [isAdmin, fetchTasks]);

    // ── Modal ─────────────────────────────────────────────────────────────────
    const openModal = (task = null) => {
        if (task) {
            setCurrentTask(task);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'Todo',
                priority: task.priority || 'Medium',
                assignee: task.assignee?._id || task.assignee || '',
                dueDate: task.dueDate || '',
            });
        } else {
            setCurrentTask(null);
            setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', assignee: '', dueDate: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentTask(null); };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) { addToast('Task title is required', 'error'); return; }
        setSubmitting(true);
        try {
            const payload = { ...formData, assignee: formData.assignee || null };
            if (currentTask) {
                const updated = await api.put(`/tasks/${currentTask._id}`, payload);
                setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
                addToast('Task updated ✓', 'success');
            } else {
                const created = await api.post('/tasks', payload);
                setTasks(prev => [created, ...prev]);
                addToast('Task created ✓', 'success');
            }
            closeModal();
        } catch (err) {
            addToast(err.message || 'Something went wrong', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task permanently?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t._id !== id));
            addToast('Task deleted', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to delete', 'error');
        }
    };

    // ── Quick status change ───────────────────────────────────────────────────
    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await api.put(`/tasks/${id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
            addToast('Status updated ✓', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to update status', 'error');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const tasksByStatus = STATUSES.reduce((acc, s) => {
        acc[s] = filtered.filter(t => t.status === s);
        return acc;
    }, {});

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const urgent = tasks.filter(t => t.priority === 'Urgent').length;
    const myTasks = tasks.filter(t => t.assignee?._id === user?._id || t.assignee === user?._id).length;

    return (
        <div className="p-6 min-h-full">
            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isAdmin ? 'Manage and assign team tasks' : 'View and update your assigned tasks'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-900/60 text-sm"
                    >
                        <span className="text-lg leading-none">+</span>
                        New Task
                    </button>
                )}
            </div>

            {/* ── Stats strip ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total Tasks', value: total, color: 'text-indigo-400', bg: 'bg-indigo-900/20 border-indigo-800/50' },
                    { label: 'Completed', value: done, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/50' },
                    { label: 'Urgent', value: urgent, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/50' },
                    { label: 'My Tasks', value: myTasks, color: 'text-violet-400', bg: 'bg-violet-900/20 border-violet-800/50' },
                ].map((stat, i) => (
                    <div key={stat.label} style={{ animationDelay: `${i * 80}ms` }}
                        className={`${stat.bg} border rounded-2xl px-4 py-3 animate-fade-in-up`}>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Filters / Search ───────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search tasks…"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', ...STATUSES].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                                }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Kanban Board ───────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUSES.map(status => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={tasksByStatus[status]}
                            isAdmin={isAdmin}
                            currentUserId={user?._id}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white">
                                {currentTask ? '✏️ Edit Task' : '＋ New Task'}
                            </h2>
                            <button onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Role notice for MEMBER */}
                        {!isAdmin && (
                            <div className="mx-6 mt-4 px-4 py-2.5 bg-amber-900/20 border border-amber-800/50 rounded-xl text-amber-300 text-xs">
                                ⚠️ As a <strong>Member</strong>, you can only update status and priority on tasks assigned to you.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Task Title *</label>
                                <input
                                    value={formData.title}
                                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Design login flow"
                                    disabled={!isAdmin && currentTask}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                />
                            </div>

                            {/* Description (admin only for new) */}
                            {(isAdmin || currentTask) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Optional details…"
                                        rows={2}
                                        disabled={!isAdmin && currentTask}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            )}

                            {/* Status + Priority row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    >
                                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Assignee — ADMIN only */}
                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Assignee <span className="text-xs text-amber-400 font-normal ml-1">Admin only</span>
                                    </label>
                                    <select
                                        value={formData.assignee}
                                        onChange={e => setFormData(p => ({ ...p, assignee: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    >
                                        <option value="">— Unassigned —</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Due Date — ADMIN only */}
                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {currentTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
