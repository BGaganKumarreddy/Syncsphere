import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = '?', size = 'lg' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    const sz = size === 'xl' ? 'w-24 h-24 text-3xl' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0 ring-4 ring-slate-800`}>
            {initials}
        </div>
    );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4">
        <div>
            <p className="text-sm font-medium text-slate-200">{label}</p>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
            <span className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// ─── Role badge ───────────────────────────────────────────────────────────────
const ROLE_CHIP = {
    ADMIN: 'bg-violet-900/60 text-violet-300 border border-violet-700',
    MEMBER: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700',
    GUEST: 'bg-slate-700/60  text-slate-400  border border-slate-600',
};

// ─── Stat box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, icon }) => (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
        <p className="text-2xl mb-1">{icon}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
);

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const { addToast } = useToast();

    const [tab, setTab] = useState('info');   // 'info' | 'activity'
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ tasks: 0, projects: 0, teams: 0 });

    const [form, setForm] = useState({
        name: '',
        bio: '',
        title: '',
    });

    // ── Load user data ────────────────────────────────────────────────────────
    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', bio: user.bio || '', title: user.title || '' });
        }
    }, [user]);

    // ── Fetch real stats ──────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [tasks, projects, teams] = await Promise.all([
                    api.get('/tasks'),
                    api.get('/projects'),
                    api.get('/teams'),
                ]);
                const myTaskCount = tasks.filter(t => t.assignee?._id === user?._id).length;
                const myTeamCount = teams.filter(t => t.members?.some(m => (m._id || m) === user?._id)).length;
                setStats({ tasks: myTaskCount, projects: projects.length, teams: myTeamCount });
            } catch (_) { }
        };
        if (user) load();
    }, [user]);

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { addToast('Name is required', 'error'); return; }
        setSaving(true);
        try {
            await updateProfile(form);
            addToast('Profile updated ✓', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { id: 'info', label: 'Edit Profile' },
        { id: 'activity', label: 'Activity' },
    ];

    // Mock recent activity
    const activity = [
        { icon: '✅', text: 'Completed task "Update API docs"', time: '2h ago' },
        { icon: '💬', text: 'Commented on "Landing page redesign"', time: '5h ago' },
        { icon: '📁', text: 'Created project "SyncSphere v2"', time: '1d ago' },
        { icon: '🏢', text: 'Joined team "Development"', time: '2d ago' },
        { icon: '🎯', text: 'Assigned to task "Build Chat feature"', time: '3d ago' },
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* ── Hero banner ───────────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-6 animate-fade-in-down">
                <div className="h-32 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700" />
                <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <Avatar name={user?.name || 'U'} size="xl" />
                </div>
            </div>

            {/* ── Name / role row ───────────────────────────────────────────────── */}
            <div className="pl-36 mb-6 flex items-end justify-between gap-4 animate-fade-in-up">
                <div>
                    <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ROLE_CHIP[user?.role]}`}>
                            {user?.role}
                        </span>
                        {user?.title && <span className="text-sm text-slate-400">{user.title}</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
                </div>
            </div>

            {/* ── Stats strip ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up">
                <StatBox label="Assigned Tasks" value={stats.tasks} icon="✅" />
                <StatBox label="Projects" value={stats.projects} icon="📁" />
                <StatBox label="Teams" value={stats.teams} icon="🏢" />
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 mb-6 w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Tab content ───────────────────────────────────────────────────── */}
            {tab === 'info' && (
                <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title</label>
                            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. Senior Developer"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input value={user?.email} disabled
                            className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-500 text-sm cursor-not-allowed" />
                        <p className="text-xs text-slate-600 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                        <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Tell your team a bit about yourself…"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none" />
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            )}

            {tab === 'activity' && (
                <div className="space-y-3 animate-fade-in-up">
                    {activity.map((a, i) => (
                        <div key={i} style={{ animationDelay: `${i * 60}ms` }}
                            className="flex items-start gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 hover:border-slate-700 transition-colors animate-fade-in-up">
                            <span className="text-xl shrink-0">{a.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-200">{a.text}</p>
                            </div>
                            <span className="text-xs text-slate-600 shrink-0">{a.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
