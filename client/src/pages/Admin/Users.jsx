import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_STYLES = {
    ADMIN: { chip: 'bg-violet-900/60 text-violet-300 border border-violet-700', dot: 'bg-violet-400' },
    MEMBER: { chip: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700', dot: 'bg-indigo-400' },
    GUEST: { chip: 'bg-slate-700/60  text-slate-400  border border-slate-600', dot: 'bg-slate-500' },
};

const STATUS_STYLES = {
    Active: 'text-emerald-400',
    Inactive: 'text-slate-500',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = '?', size = 'md' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
        'from-sky-500 to-blue-500', 'from-fuchsia-500 to-purple-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    const sz = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => (
    <div className={`${bg} border rounded-2xl px-5 py-4 animate-fade-in-up`}>
        <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
        </div>
        <p className="text-xs text-slate-500">{label}</p>
    </div>
);

// ─── Invite Modal ─────────────────────────────────────────────────────────────
const InviteModal = ({ onClose }) => {
    const { addToast } = useToast();
    const [role, setRole] = useState('MEMBER');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/invites/generate', { role });
            setLink(res.link);
        } catch (err) {
            addToast(err.message || 'Failed to generate link', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        addToast('Link copied to clipboard! ✓', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">🔗 Invite to Workspace</h2>
                        <p className="text-slate-500 text-xs mt-1">Generate a shareable invite link valid for 7 days</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">✕</button>
                </div>

                {/* Role picker */}
                <div className="mb-5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Invite as</label>
                    <div className="flex gap-2">
                        {['MEMBER', 'GUEST', 'ADMIN'].map(r => (
                            <button key={r} type="button" onClick={() => { setRole(r); setLink(''); }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${role === r
                                    ? ROLE_STYLES[r].chip + ' scale-105 shadow-lg'
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                {r === 'ADMIN' ? '🛡️' : r === 'MEMBER' ? '🧑‍💻' : '👁️'} {r}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                        {role === 'ADMIN' && '⚠️ Admins have full access — use with caution.'}
                        {role === 'MEMBER' && 'Members can create tasks and manage their own work.'}
                        {role === 'GUEST' && 'Guests have read-only access to the workspace.'}
                    </p>
                </div>

                {/* Generate button */}
                {!link && (
                    <button onClick={generate} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60 text-sm">
                        {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✨'}
                        {loading ? 'Generating…' : 'Generate Invite Link'}
                    </button>
                )}

                {/* Generated link */}
                {link && (
                    <div className="animate-fade-in-up">
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Invite Link</label>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 mb-3">
                            <span className="text-xs text-slate-400 truncate flex-1 font-mono">{link}</span>
                            <button onClick={copyLink}
                                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700' : 'bg-indigo-700 hover:bg-indigo-600 text-white'}`}>
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-800/40 rounded-xl p-3">
                            <span className="text-amber-400 shrink-0">⚠️</span>
                            <p className="text-xs text-amber-300/80">
                                Anyone with this link can join as <strong>{role}</strong>. Link expires in 7 days. Generate a new link to revoke access.
                            </p>
                        </div>

                        <button onClick={() => setLink('')}
                            className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                            ↺ Generate a new link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Edit Role Modal ──────────────────────────────────────────────────────────
const EditRoleModal = ({ target, onClose, onSave }) => {
    const [role, setRole] = useState(target.role);
    const [status, setStatus] = useState(target.status);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(target._id, { role, status });
            onClose();
        } catch (err) {
            addToast(err.message || 'Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-5">
                    <Avatar name={target.name} size="lg" />
                    <div>
                        <p className="font-bold text-white">{target.name}</p>
                        <p className="text-xs text-slate-500">{target.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Role</label>
                        <div className="flex gap-2">
                            {['ADMIN', 'MEMBER', 'GUEST'].map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase border transition-all ${role === r ? ROLE_STYLES[r].chip : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status</label>
                        <div className="flex gap-2">
                            {['Active', 'Inactive'].map(s => (
                                <button key={s} type="button" onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${status === s
                                        ? s === 'Active' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : 'bg-slate-700 text-slate-400 border-slate-600'
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                    {s === 'Active' ? '🟢' : '⚫'} {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                        {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Users Page ──────────────────────────────────────────────────────────
export default function Users() {
    const { user: me } = useAuth();
    const { addToast } = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showInvite, setShowInvite] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // ── Fetch users ───────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (err) {
            addToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Update role / status ──────────────────────────────────────────────────
    const handleUpdate = async (id, fields) => {
        const updated = await api.put(`/users/${id}`, fields);
        setUsers(prev => prev.map(u => u._id === id ? { ...u, ...updated } : u));
        addToast('User updated ✓', 'success');
    };

    // ── Delete user ───────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            addToast('User deleted', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to delete', 'error');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const memberCount = users.filter(u => u.role === 'MEMBER').length;
    const guestCount = users.filter(u => u.role === 'GUEST').length;
    const activeCount = users.filter(u => u.status === 'Active').length;

    const joinedAgo = (dateStr) => {
        if (!dateStr) return '—';
        const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days}d ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    };

    return (
        <div className="p-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage workspace access and member roles</p>
                </div>
                <button onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5 text-sm">
                    🔗 Invite People
                </button>
            </div>

            {/* ── Stats strip ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <StatCard icon="👥" label="Total Users" value={loading ? '—' : users.length} color="text-indigo-400" bg="bg-indigo-900/20 border-indigo-800/50" />
                <StatCard icon="🛡️" label="Admins" value={loading ? '—' : adminCount} color="text-violet-400" bg="bg-violet-900/20 border-violet-800/50" />
                <StatCard icon="🧑‍💻" label="Members" value={loading ? '—' : memberCount} color="text-sky-400" bg="bg-sky-900/20 border-sky-800/50" />
                <StatCard icon="✅" label="Active Now" value={loading ? '—' : activeCount} color="text-emerald-400" bg="bg-emerald-900/20 border-emerald-800/50" />
            </div>

            {/* ── Filters bar ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
                    {['ALL', 'ADMIN', 'MEMBER', 'GUEST'].map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${roleFilter === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Users table ────────────────────────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <span>User</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span>Joined</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-600">
                        <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-3xl mb-3">👤</p>
                        <p className="text-slate-500 font-medium">No users found</p>
                    </div>
                ) : (
                    <div>
                        {filtered.map((u, i) => (
                            <div key={u._id} style={{ animationDelay: `${i * 40}ms` }}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors animate-fade-in-up">

                                {/* User info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar name={u.name} size="lg" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                                            {u._id === me?._id && (
                                                <span className="text-[9px] bg-indigo-900/50 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">You</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                        {u.title && <p className="text-[10px] text-slate-600 truncate">{u.title}</p>}
                                    </div>
                                </div>

                                {/* Role */}
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border w-fit ${ROLE_STYLES[u.role]?.chip}`}>
                                    {u.role}
                                </span>

                                {/* Status */}
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                    <span className={`text-xs font-medium ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                                </div>

                                {/* Joined */}
                                <span className="text-xs text-slate-500">{joinedAgo(u.createdAt)}</span>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {u._id !== me?._id && (
                                        <>
                                            <button onClick={() => setEditTarget(u)} title="Edit role"
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-sm">✏️</button>
                                            <button onClick={() => handleDelete(u._id)} title="Delete user"
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm">🗑️</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ─────────────────────────────────────────────────────── */}
            {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
            {editTarget && <EditRoleModal target={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
        </div>
    );
}
