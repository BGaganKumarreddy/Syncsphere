import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_STYLES = {
    ADMIN: { chip: 'bg-violet-900/60 text-violet-300 border border-violet-700', dot: 'bg-violet-400' },
    MEMBER: { chip: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700', dot: 'bg-indigo-400' },
    GUEST: { chip: 'bg-slate-700/60 text-slate-400 border border-slate-600', dot: 'bg-slate-500' },
};

const TEAM_GRADIENTS = [
    'from-indigo-600 to-violet-600',
    'from-emerald-600 to-teal-600',
    'from-rose-600 to-pink-600',
    'from-amber-600 to-orange-600',
    'from-sky-600 to-blue-600',
    'from-fuchsia-600 to-purple-600',
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = '?', size = 'md', overlap = false }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
        'from-sky-500 to-blue-500', 'from-fuchsia-500 to-purple-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0 ${overlap ? 'ring-2 ring-slate-900' : ''}`}>
            {initials}
        </div>
    );
};

// ─── Member toggle chip ───────────────────────────────────────────────────────
const MemberChip = ({ user, selected, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(user._id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${selected
            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
    >
        <Avatar name={user.name} size="sm" />
        <span className="truncate max-w-28">{user.name}</span>
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${ROLE_STYLES[user.role]?.chip}`}>{user.role}</span>
        {selected && <span className="text-indigo-400 ml-auto text-base leading-none">✓</span>}
    </button>
);

// ─── Team Card ─────────────────────────────────────────────────────────────────
const TeamCard = ({ team, gradient, isAdmin, onEdit, onDelete, index }) => {
    // members are already populated objects from the API
    const memberDetails = Array.isArray(team.members) ? team.members : [];

    const adminMembers = memberDetails.filter(u => u.role === 'ADMIN');
    const regularMembers = memberDetails.filter(u => u.role !== 'ADMIN');

    return (
        <div
            className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-250 hover:-translate-y-1 animate-fade-in-up flex flex-col"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Gradient banner */}
            <div className={`h-2 bg-gradient-to-r ${gradient}`} />

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}>
                            {team.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white leading-tight">{team.name}</h2>
                            <p className="text-xs text-slate-500">{memberDetails.length} member{memberDetails.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => onEdit(team)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-sm">✏️</button>
                            <button onClick={() => onDelete(team._id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm">🗑️</button>
                        </div>
                    )}
                </div>

                {/* Description */}
                {team.description && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{team.description}</p>
                )}

                {/* Admin badges */}
                {adminMembers.length > 0 && (
                    <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-1.5">Admins</p>
                        <div className="flex flex-wrap gap-1.5">
                            {adminMembers.map(u => (
                                <div key={u._id} className="flex items-center gap-1.5 bg-violet-900/30 border border-violet-800/50 px-2 py-1 rounded-lg">
                                    <Avatar name={u.name} size="sm" />
                                    <span className="text-xs font-medium text-violet-300">{u.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular member avatar stack */}
                {regularMembers.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-slate-800">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">Members</p>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {regularMembers.slice(0, 5).map(u => (
                                    <div key={u._id} title={u.name}>
                                        <Avatar name={u.name} size="sm" overlap />
                                    </div>
                                ))}
                                {regularMembers.length > 5 && (
                                    <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400 ring-2 ring-slate-900">
                                        +{regularMembers.length - 5}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1 ml-2">
                                {regularMembers.slice(0, 3).map(u => (
                                    <span key={u._id} className="text-[10px] text-slate-500">{u.name.split(' ')[0]}{regularMembers.indexOf(u) < regularMembers.length - 1 ? ',' : ''}</span>
                                ))}
                                {regularMembers.length > 3 && <span className="text-[10px] text-slate-600">…</span>}
                            </div>
                        </div>
                    </div>
                )}

                {memberDetails.length === 0 && (
                    <p className="text-xs text-slate-600 italic mt-auto">No members yet</p>
                )}
            </div>
        </div>
    );
};

// ─── Main Teams Page ───────────────────────────────────────────────────────────
export default function Teams() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const isAdmin = user?.role === 'ADMIN';

    const [allUsers, setAllUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', members: [] });
    const [memberSearch, setMemberSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Fetch teams and users ─────────────────────────────────────────────────
    const fetchTeams = useCallback(async () => {
        try {
            const data = await api.get('/teams');
            setTeams(data);
        } catch (err) {
            addToast('Failed to load teams', 'error');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [usersData, teamsData] = await Promise.all([
                    api.get('/users'),
                    api.get('/teams'),
                ]);
                setAllUsers(usersData);
                setTeams(teamsData);
            } catch (err) {
                addToast('Failed to load data', 'error');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const openModal = (team = null) => {
        setMemberSearch('');
        if (team) {
            setCurrentTeam(team);
            // members are populated objects — extract IDs
            setFormData({
                name: team.name,
                description: team.description || '',
                members: team.members.map(m => m._id || m),
            });
        } else {
            setCurrentTeam(null);
            setFormData({ name: '', description: '', members: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setCurrentTeam(null); };

    const toggleMember = (userId) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members.filter(id => id !== userId)
                : [...prev.members, userId],
        }));
    };

    // ── Submit (create or update) ─────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { addToast('Team name is required', 'error'); return; }
        setSubmitting(true);
        try {
            if (currentTeam) {
                const updated = await api.put(`/teams/${currentTeam._id}`, formData);
                setTeams(prev => prev.map(t => t._id === updated._id ? updated : t));
                addToast('Team updated ✓', 'success');
            } else {
                const created = await api.post('/teams', formData);
                setTeams(prev => [created, ...prev]);
                addToast('Team created ✓', 'success');
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
        if (!window.confirm('Delete this team permanently?')) return;
        try {
            await api.delete(`/teams/${id}`);
            setTeams(prev => prev.filter(t => t._id !== id));
            addToast('Team deleted', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to delete', 'error');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // ── Stats ─────────────────────────────────────────────────────────────────
    const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
    const memberCount = allUsers.filter(u => u.role === 'MEMBER').length;

    return (
        <div className="p-6">
            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-2xl font-bold text-white">Teams</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage workspace members and team groups</p>
                </div>
                {isAdmin && (
                    <button onClick={() => openModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-200 hover:-translate-y-0.5 text-sm">
                        <span className="text-lg leading-none">+</span> New Team
                    </button>
                )}
            </div>

            {/* ── Stats strip ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Total Members', value: allUsers.length, icon: '👥', color: 'text-indigo-400', bg: 'bg-indigo-900/20 border-indigo-800/50' },
                    { label: 'Admins', value: adminCount, icon: '🛡️', color: 'text-violet-400', bg: 'bg-violet-900/20 border-violet-800/50' },
                    { label: 'Members', value: memberCount, icon: '🧑‍💻', color: 'text-sky-400', bg: 'bg-sky-900/20 border-sky-800/50' },
                    { label: 'Teams', value: teams.length, icon: '🏢', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/50' },
                ].map((s, i) => (
                    <div key={s.label} style={{ animationDelay: `${i * 80}ms` }}
                        className={`${s.bg} border rounded-2xl px-4 py-3 animate-fade-in-up`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span>{s.icon}</span>
                            <span className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</span>
                        </div>
                        <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Workspace Members grid ────────────────────────────────────────── */}
            <div className="mb-8">
                <h2 className="text-base font-bold text-slate-300 mb-4">Workspace Members</h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {allUsers.map((u, i) => (
                            <div key={u._id} style={{ animationDelay: `${i * 50}ms` }}
                                className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 animate-fade-in-up hover:border-slate-600 transition-colors">
                                <Avatar name={u.name} size="md" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                </div>
                                <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${ROLE_STYLES[u.role]?.chip}`}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                        {allUsers.length === 0 && (
                            <p className="text-slate-600 text-sm italic col-span-full">No users yet. Invite people to sign up!</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Teams grid ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-slate-300">Team Groups</h2>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search teams…"
                    className="w-full sm:w-56 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTeams.map((team, i) => (
                        <TeamCard
                            key={team._id}
                            team={team}
                            gradient={TEAM_GRADIENTS[i % TEAM_GRADIENTS.length]}
                            isAdmin={isAdmin}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            index={i}
                        />
                    ))}
                    {filteredTeams.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-4xl mb-3">🏢</p>
                            <p className="text-slate-400 font-medium">No teams yet</p>
                            {isAdmin && <p className="text-slate-600 text-sm mt-1">Click "New Team" to create your first team group</p>}
                        </div>
                    )}
                </div>
            )}

            {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                            <h2 className="text-lg font-bold text-white">
                                {currentTeam ? '✏️ Edit Team' : '＋ New Team'}
                            </h2>
                            <button onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Name *</label>
                                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Engineering"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        placeholder="What does this team do?"
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Members
                                        {formData.members.length > 0 && (
                                            <span className="ml-2 text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                                                {formData.members.length} selected
                                            </span>
                                        )}
                                    </label>
                                    <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                                        placeholder="Search users…"
                                        className="w-full px-3 py-2 mb-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                                        {filteredUsers.map(u => (
                                            <MemberChip
                                                key={u._id}
                                                user={u}
                                                selected={formData.members.includes(u._id)}
                                                onClick={toggleMember}
                                            />
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <p className="text-xs text-slate-600 italic p-2">No users match your search</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
                                <button type="button" onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                                    {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {currentTeam ? 'Save Changes' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
