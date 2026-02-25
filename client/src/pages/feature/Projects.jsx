import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
    'Active': { chip: 'bg-indigo-900/50 text-indigo-400 border-indigo-800', dot: 'bg-indigo-400' },
    'In Progress': { chip: 'bg-amber-900/50  text-amber-400  border-amber-800', dot: 'bg-amber-400' },
    'Completed': { chip: 'bg-emerald-900/50 text-emerald-400 border-emerald-800', dot: 'bg-emerald-400' },
    'On Hold': { chip: 'bg-slate-700/50  text-slate-400  border-slate-600', dot: 'bg-slate-500' },
};

// ─── Avatar initials ──────────────────────────────────────────────────────────
const Avatar = ({ name = '?' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    return (
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isOverdue = (d) => d && new Date(d) < new Date() ? true : false;

// ─── Create/Edit Modal ────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose, onSave }) => {
    const { addToast } = useToast();
    const [form, setForm] = useState({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'Active',
        dueDate: project?.dueDate ? project.dueDate.slice(0, 10) : '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { addToast('Project name is required', 'error'); return; }
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            addToast(err.message || 'Failed to save project', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-bold text-white">{project ? '✏️ Edit Project' : '✨ New Project'}</h2>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Project Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Website Redesign"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="What is this project about?"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                <option value="Active">Active</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {project ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Projects Page ───────────────────────────────────────────────────────
export default function Projects() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEdit] = useState(null);

    const isAdmin = user?.role === 'ADMIN';

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetch = useCallback(async () => {
        try {
            const data = await api.get('/projects');
            setProjects(data);
        } catch {
            addToast('Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    // ── CRUD ───────────────────────────────────────────────────────────────────
    const handleCreate = async (form) => {
        const created = await api.post('/projects', form);
        setProjects(prev => [created, ...prev]);
        addToast('Project created ✓', 'success');
    };

    const handleEdit = async (form) => {
        const updated = await api.put(`/projects/${editProject._id}`, form);
        setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
        addToast('Project updated ✓', 'success');
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(prev => prev.filter(p => p._id !== id));
            addToast('Project deleted', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to delete', 'error');
        }
    };

    // ── Filtering ──────────────────────────────────────────────────────────────
    const filtered = projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── Stats ──────────────────────────────────────────────────────────────────
    const counts = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'In Progress').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        overdue: projects.filter(p => isOverdue(p.dueDate) && p.status !== 'Completed').length,
    };

    return (
        <div className="p-6">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-slate-400 text-sm mt-1">Track and manage all your team's work</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5 text-sm w-fit">
                    + New Project
                </button>
            </div>

            {/* ── Stats ───────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total', value: counts.total, color: 'text-indigo-400', icon: '📁' },
                    { label: 'In Progress', value: counts.inProgress, color: 'text-amber-400', icon: '⚡' },
                    { label: 'Completed', value: counts.completed, color: 'text-emerald-400', icon: '✅' },
                    { label: 'Overdue', value: counts.overdue, color: 'text-rose-400', icon: '⚠️' },
                ].map((s, i) => (
                    <div key={i} style={{ animationDelay: `${i * 60}ms` }}
                        className="animate-fade-in-up bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <div>
                            <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
                            <p className="text-[10px] text-slate-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search projects…"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
                    {['ALL', 'Active', 'In Progress', 'Completed', 'On Hold'].map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Projects table ──────────────────────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Table head */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <span>Project</span>
                    <span>Status</span>
                    <span>Owner</span>
                    <span>Due Date</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-14 text-center">
                        <p className="text-3xl mb-3">📁</p>
                        <p className="text-slate-400 font-medium mb-1">No projects found</p>
                        <p className="text-slate-600 text-sm">Click "+ New Project" to get started!</p>
                    </div>
                ) : (
                    filtered.map((p, i) => {
                        const overdue = isOverdue(p.dueDate) && p.status !== 'Completed';
                        return (
                            <div key={p._id}
                                onClick={() => navigate(`/projects/${p._id}`)}
                                style={{ animationDelay: `${i * 40}ms` }}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer group animate-fade-in-up">

                                {/* Project name + description */}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{p.name}</p>
                                    {p.description && (
                                        <p className="text-xs text-slate-600 truncate mt-0.5">{p.description}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border w-fit ${STATUS[p.status]?.chip || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                    {p.status}
                                </span>

                                {/* Owner */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {p.owner?.name ? (
                                        <>
                                            <Avatar name={p.owner.name} />
                                            <span className="text-xs text-slate-400 truncate">{p.owner.name.split(' ')[0]}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-600">—</span>
                                    )}
                                </div>

                                {/* Due date */}
                                <span className={`text-xs ${overdue ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
                                    {overdue && '⚠️ '}{fmt(p.dueDate)}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => { setEdit(p); setShowModal(true); }} title="Edit"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-sm">✏️</button>
                                    {isAdmin && (
                                        <button onClick={(e) => handleDelete(p._id, e)} title="Delete"
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm">🗑️</button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Modal ───────────────────────────────────────────────────────── */}
            {showModal && (
                <ProjectModal
                    project={editProject}
                    onClose={() => { setShowModal(false); setEdit(null); }}
                    onSave={editProject ? handleEdit : handleCreate}
                />
            )}
        </div>
    );
}
