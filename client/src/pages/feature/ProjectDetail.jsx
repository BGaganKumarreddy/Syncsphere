import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isOverdue = (d) => d && new Date(d) < new Date();

const Avatar = ({ name = '?' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    return (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
};

const STATUS_CHIP = {
    'Todo': 'bg-slate-700/60 text-slate-400 border-slate-600',
    'In Progress': 'bg-amber-900/50 text-amber-400 border-amber-800',
    'In Review': 'bg-indigo-900/50 text-indigo-400 border-indigo-800',
    'Done': 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
};
const PRIORITY_CHIP = {
    'Low': 'bg-slate-700/50 text-slate-400 border-slate-600',
    'Medium': 'bg-blue-900/50  text-blue-400  border-blue-800',
    'High': 'bg-amber-900/50 text-amber-400 border-amber-800',
    'Urgent': 'bg-rose-900/50  text-rose-400  border-rose-800',
};
const PROJECT_STATUS = {
    'Active': 'bg-indigo-900/50 text-indigo-400 border-indigo-800',
    'In Progress': 'bg-amber-900/50  text-amber-400  border-amber-800',
    'Completed': 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    'On Hold': 'bg-slate-700/50  text-slate-400  border-slate-600',
};

// ─── Task Modal ───────────────────────────────────────────────────────────────
const TaskModal = ({ task, users, projectId, onClose, onSave }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const isAdmin = user?.role === 'ADMIN';
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'Todo',
        priority: task?.priority || 'Medium',
        assignee: task?.assignee?._id || task?.assignee || '',
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { addToast('Task title is required', 'error'); return; }
        setSaving(true);
        try {
            await onSave({ ...form, project: projectId, assignee: form.assignee || null });
            onClose();
        } catch (err) {
            addToast(err.message || 'Failed to save task', 'error');
        } finally { setSaving(false); }
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-white">{task ? '✏️ Edit Task' : '➕ New Task'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">✕</button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    {field('Title *', 'title', 'text', 'Task name…')}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            rows={2} placeholder="What needs to be done?"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                {['Todo', 'In Progress', 'In Review', 'Done'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    {isAdmin && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Assignee</label>
                            <select value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}
                    {field('Due Date', 'dueDate', 'date')}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {task ? 'Save' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main ProjectDetail ───────────────────────────────────────────────────────
export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskModal, setTaskModal] = useState(null); // null | 'new' | task-object

    const isAdmin = user?.role === 'ADMIN';

    const load = useCallback(async () => {
        try {
            const [proj, taskData, userData] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks?project_id=${id}`),
                api.get('/users'),
            ]);
            setProject(proj);
            setTasks(taskData);
            setUsers(userData);
        } catch (err) {
            addToast('Could not load project', 'error');
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // ── Task CRUD ──────────────────────────────────────────────────────────
    const handleCreateTask = async (form) => {
        const created = await api.post('/tasks', form);
        setTasks(prev => [created, ...prev]);
        addToast('Task created ✓', 'success');
    };

    const handleEditTask = async (form) => {
        const updated = await api.put(`/tasks/${taskModal._id}`, form);
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        addToast('Task updated ✓', 'success');
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
            addToast('Task deleted', 'success');
        } catch (err) { addToast(err.message || 'Failed to delete', 'error'); }
    };

    const cycleStatus = async (task) => {
        const order = ['Todo', 'In Progress', 'In Review', 'Done'];
        const next = order[(order.indexOf(task.status) + 1) % order.length];
        try {
            const updated = await api.put(`/tasks/${task._id}`, { status: next });
            setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        } catch (err) { addToast(err.message || 'Failed to update', 'error'); }
    };

    // ── Stats ──────────────────────────────────────────────────────────────
    const done = tasks.filter(t => t.status === 'Done').length;
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    const urgent = tasks.filter(t => t.priority === 'Urgent').length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!project) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">

            {/* ── Breadcrumb ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 animate-fade-in-down">
                <Link to="/projects" className="hover:text-indigo-400 transition-colors">Projects</Link>
                <span>/</span>
                <span className="text-slate-300 font-medium truncate">{project.name}</span>
            </div>

            {/* ── Project header card ──────────────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-xl font-bold text-white">{project.name}</h1>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${PROJECT_STATUS[project.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {project.status}
                            </span>
                        </div>
                        {project.description && (
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">{project.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            {project.owner?.name && (
                                <div className="flex items-center gap-1.5">
                                    <Avatar name={project.owner.name} />
                                    <span>{project.owner.name}</span>
                                </div>
                            )}
                            {project.dueDate && (
                                <span className={isOverdue(project.dueDate) && project.status !== 'Completed' ? 'text-rose-400 font-medium' : ''}>
                                    {isOverdue(project.dueDate) && project.status !== 'Completed' ? '⚠️ Overdue · ' : '📅 Due '}
                                    {fmt(project.dueDate)}
                                </span>
                            )}
                            <span>📋 {tasks.length} tasks</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 min-w-[180px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-medium">Progress</span>
                            <span className="text-sm font-bold text-indigo-400">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                            <span>{done} done</span>
                            <span>{tasks.length - done} remaining</span>
                        </div>
                    </div>
                </div>

                {/* Mini stats */}
                {tasks.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
                        {[
                            { label: 'Total Tasks', value: tasks.length, color: 'text-indigo-400' },
                            { label: 'Urgent', value: urgent, color: 'text-rose-400' },
                            { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-rose-400' : 'text-slate-500' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Tasks section ────────────────────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <h2 className="font-bold text-white text-base">Tasks</h2>
                    {isAdmin && (
                        <button onClick={() => setTaskModal('new')}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5">
                            + Add Task
                        </button>
                    )}
                </div>

                {/* Column headers */}
                {tasks.length > 0 && (
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-slate-800/60 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        <span>Task</span><span>Status</span><span>Priority</span><span>Assignee</span><span>Actions</span>
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div className="py-14 text-center">
                        <p className="text-3xl mb-3">📋</p>
                        <p className="text-slate-400 font-medium mb-1">No tasks yet</p>
                        <p className="text-slate-600 text-sm">Click "+ Add Task" to create the first one</p>
                    </div>
                ) : (
                    tasks.map((t, i) => (
                        <div key={t._id} style={{ animationDelay: `${200 + i * 40}ms` }}
                            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors animate-fade-in-up group">

                            {/* Title */}
                            <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${t.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.title}</p>
                                {t.dueDate && (
                                    <p className={`text-[10px] mt-0.5 ${isOverdue(t.dueDate) && t.status !== 'Done' ? 'text-rose-400' : 'text-slate-600'}`}>
                                        {isOverdue(t.dueDate) && t.status !== 'Done' ? '⚠️ ' : ''}Due {fmt(t.dueDate)}
                                    </p>
                                )}
                            </div>

                            {/* Status — click to cycle */}
                            <button onClick={() => cycleStatus(t)} title="Click to advance status"
                                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border text-left hover:opacity-80 transition-opacity w-fit ${STATUS_CHIP[t.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {t.status}
                            </button>

                            {/* Priority */}
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border w-fit ${PRIORITY_CHIP[t.priority] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {t.priority}
                            </span>

                            {/* Assignee */}
                            <div className="flex items-center gap-1.5 min-w-0">
                                {t.assignee?.name ? (
                                    <>
                                        <Avatar name={t.assignee.name} />
                                        <span className="text-xs text-slate-400 truncate">{t.assignee.name.split(' ')[0]}</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-slate-600">—</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => setTaskModal(t)} title="Edit"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-xs">✏️</button>
                                {isAdmin && (
                                    <button onClick={() => handleDeleteTask(t._id)} title="Delete"
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors text-xs">🗑️</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Task modal ───────────────────────────────────────────────── */}
            {taskModal && (
                <TaskModal
                    task={taskModal === 'new' ? null : taskModal}
                    users={users}
                    projectId={id}
                    onClose={() => setTaskModal(null)}
                    onSave={taskModal === 'new' ? handleCreateTask : handleEditTask}
                />
            )}
        </div>
    );
}
