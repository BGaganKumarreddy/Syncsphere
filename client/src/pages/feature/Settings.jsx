import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
        <div className="pr-4">
            <p className="text-sm font-medium text-slate-200">{label}</p>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button type="button" onClick={() => onChange(!checked)}
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}>
            <span className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-800">
            <span className="text-lg">{icon}</span>
            <h2 className="text-base font-bold text-white">{title}</h2>
        </div>
        {children}
    </div>
);

// ─── Platform Share Button ────────────────────────────────────────────────────
const PlatformBtn = ({ icon, label, color, onClick, loading, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border transition-all disabled:opacity-50 ${color}`}
    >
        <span className="text-2xl">{loading ? <span className="block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}</span>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

// ─── Team / Invite Section ────────────────────────────────────────────────────
function InviteSection() {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [loadingPlatform, setLoadingPlatform] = useState(null);

    const isAdmin = user?.role === 'ADMIN';

    const getShareData = async (platform) => {
        if (!email.trim()) { addToast('Please enter the invitee\'s email first', 'error'); return null; }
        if (!/\S+@\S+\.\S+/.test(email)) { addToast('Please enter a valid email address', 'error'); return null; }

        setLoadingPlatform(platform);
        try {
            const data = await api.post('/invites/send', {
                email: email.trim(),
                role,
                platforms: [platform],
            });
            return data;
        } catch (err) {
            addToast(err.message || 'Failed to generate invite', 'error');
            return null;
        } finally {
            setLoadingPlatform(null);
        }
    };

    const handleEmail = async () => {
        const data = await getShareData('email');
        if (!data) return;
        if (data.emailSent) {
            addToast(`Invite email sent to ${email} ✓`, 'success');
            setEmail('');
        } else if (data.emailError) {
            addToast(data.emailError, 'error');
        }
    };

    const handleWhatsApp = async () => {
        const data = await getShareData('whatsapp');
        if (!data) return;
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
        addToast('Opening WhatsApp…', 'success');
    };

    const handleTelegram = async () => {
        const data = await getShareData('telegram');
        if (!data) return;
        window.open(data.telegramUrl, '_blank', 'noopener,noreferrer');
        addToast('Opening Telegram…', 'success');
    };

    const handleSlack = async () => {
        const data = await getShareData('slack');
        if (!data) return;
        window.open(data.slackUrl, '_blank', 'noopener,noreferrer');
        addToast('Opening Slack…', 'success');
    };

    const handleCopyLink = async () => {
        const data = await getShareData('copy');
        if (!data) return;
        try {
            await navigator.clipboard.writeText(data.link);
            addToast('Invite link copied to clipboard! 📋', 'success');
        } catch {
            addToast('Copy failed. Link: ' + data.link, 'error');
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-3">🔒</span>
                <p className="text-slate-400 text-sm">Only <span className="text-violet-400 font-semibold">ADMIN</span> users can invite team members.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Section title="Invite Team Members" icon="📨">
                <div className="space-y-5">
                    {/* Email + Role row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                                Invitee Email *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="GUEST">Guest</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="flex items-start gap-3 bg-indigo-900/20 border border-indigo-800/40 rounded-xl px-4 py-3">
                        <span className="text-indigo-400 text-base mt-0.5">ℹ️</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Enter the email address above, then choose how to share the invite link below.
                            The link expires in <span className="text-indigo-400 font-medium">48 hours</span>.
                        </p>
                    </div>

                    {/* Platform buttons */}
                    <div>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Share via</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <PlatformBtn
                                icon="✉️"
                                label="Email"
                                color="bg-blue-900/20 border-blue-800/50 text-blue-300 hover:bg-blue-900/40"
                                onClick={handleEmail}
                                loading={loadingPlatform === 'email'}
                                disabled={loadingPlatform !== null}
                            />
                            <PlatformBtn
                                icon="💬"
                                label="WhatsApp"
                                color="bg-emerald-900/20 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40"
                                onClick={handleWhatsApp}
                                loading={loadingPlatform === 'whatsapp'}
                                disabled={loadingPlatform !== null}
                            />
                            <PlatformBtn
                                icon="✈️"
                                label="Telegram"
                                color="bg-sky-900/20 border-sky-800/50 text-sky-300 hover:bg-sky-900/40"
                                onClick={handleTelegram}
                                loading={loadingPlatform === 'telegram'}
                                disabled={loadingPlatform !== null}
                            />
                            <PlatformBtn
                                icon="🟣"
                                label="Slack"
                                color="bg-purple-900/20 border-purple-800/50 text-purple-300 hover:bg-purple-900/40"
                                onClick={handleSlack}
                                loading={loadingPlatform === 'slack'}
                                disabled={loadingPlatform !== null}
                            />
                            <PlatformBtn
                                icon="🔗"
                                label="Copy Link"
                                color="bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60"
                                onClick={handleCopyLink}
                                loading={loadingPlatform === 'copy'}
                                disabled={loadingPlatform !== null}
                            />
                        </div>
                    </div>


                </div>
            </Section>
        </div>
    );
}

// ─── Settings page ────────────────────────────────────────────────────────────
export default function Settings() {
    const { user, updateProfile, logout } = useAuth();
    const { addToast } = useToast();

    const isAdmin = user?.role === 'ADMIN';
    const [tab, setTab] = useState('account');

    // ── Account form ─────────────────────────────────────────────────────────
    const [accountForm, setAccountForm] = useState({
        name: user?.name || '',
        title: user?.title || '',
        bio: user?.bio || '',
    });
    const [savingAccount, setSavingAccount] = useState(false);

    const handleAccountSave = async (e) => {
        e.preventDefault();
        if (!accountForm.name.trim()) { addToast('Name is required', 'error'); return; }
        setSavingAccount(true);
        try {
            await updateProfile(accountForm);
            addToast('Account info updated ✓', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to update', 'error');
        } finally {
            setSavingAccount(false);
        }
    };

    // ── Password form ─────────────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [savingPw, setSavingPw] = useState(false);

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (!pwForm.current || !pwForm.next) { addToast('All password fields are required', 'error'); return; }
        if (pwForm.next !== pwForm.confirm) { addToast('Passwords do not match', 'error'); return; }
        if (pwForm.next.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
        setSavingPw(true);
        try {
            await updateProfile({ password: pwForm.next, currentPassword: pwForm.current });
            addToast('Password updated ✓', 'success');
            setPwForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            addToast(err.message || 'Failed to update password', 'error');
        } finally {
            setSavingPw(false);
        }
    };

    // ── Notification prefs ────────────────────────────────────────────────────
    const [notifs, setNotifs] = useState({
        taskAssigned: true,
        taskCompleted: true,
        projectUpdates: false,
        teamMessages: true,
        weeklyReport: false,
        deadlineRemind: true,
    });

    // ── Appearance ────────────────────────────────────────────────────────────
    const [compact, setCompact] = useState(false);
    const [animations, setAnimations] = useState(true);

    // ── ROLE badge ────────────────────────────────────────────────────────────
    const ROLE_CHIP = {
        ADMIN: 'bg-violet-900/60 text-violet-300 border-violet-700',
        MEMBER: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
        GUEST: 'bg-slate-700/60  text-slate-400  border-slate-600',
    };

    const TABS = [
        { id: 'account', label: '👤 Account' },
        { id: 'notifications', label: '🔔 Notifications' },
        { id: 'security', label: '🔒 Security' },
        { id: 'appearance', label: '🎨 Appearance' },
        ...(isAdmin ? [{ id: 'team', label: '🧑‍💼 Team' }] : []),
    ];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="mb-8 animate-fade-in-down">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your account preferences and workspace configuration</p>
            </div>

            {/* ── Tab bar ─────────────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 mb-6 overflow-x-auto">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Account ─────────────────────────────────────────────────────── */}
            {tab === 'account' && (
                <div className="space-y-5">
                    {/* Current user info card */}
                    <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl px-5 py-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                            {(user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white text-base truncate">{user?.name}</p>
                            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${ROLE_CHIP[user?.role]}`}>
                            {user?.role}
                        </span>
                    </div>

                    <Section title="Profile Information" icon="📝">
                        <form onSubmit={handleAccountSave} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
                                    <input value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Job Title</label>
                                    <input value={accountForm.title} onChange={e => setAccountForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. Senior Developer"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                                <input value={user?.email} disabled
                                    className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-500 text-sm cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Bio</label>
                                <textarea value={accountForm.bio} onChange={e => setAccountForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="A short bio about yourself…" rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={savingAccount}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                                    {savingAccount && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </Section>
                </div>
            )}

            {/* ── Notifications ────────────────────────────────────────────────── */}
            {tab === 'notifications' && (
                <Section title="Notification Preferences" icon="🔔">
                    <Toggle checked={notifs.taskAssigned} onChange={v => setNotifs(p => ({ ...p, taskAssigned: v }))} label="Task Assigned" description="When a task is assigned to you" />
                    <Toggle checked={notifs.taskCompleted} onChange={v => setNotifs(p => ({ ...p, taskCompleted: v }))} label="Task Completed" description="When a task you own is marked done" />
                    <Toggle checked={notifs.projectUpdates} onChange={v => setNotifs(p => ({ ...p, projectUpdates: v }))} label="Project Updates" description="Status changes on your projects" />
                    <Toggle checked={notifs.teamMessages} onChange={v => setNotifs(p => ({ ...p, teamMessages: v }))} label="Team Messages" description="New messages in team chats" />
                    <Toggle checked={notifs.deadlineRemind} onChange={v => setNotifs(p => ({ ...p, deadlineRemind: v }))} label="Deadline Reminders" description="24h before a task deadline" />
                    <Toggle checked={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} label="Weekly Summary" description="Digest of your week's activity" />
                    <div className="pt-4 flex justify-end">
                        <button onClick={() => addToast('Notification preferences saved ✓', 'success')}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all">
                            Save Preferences
                        </button>
                    </div>
                </Section>
            )}

            {/* ── Security ─────────────────────────────────────────────────────── */}
            {tab === 'security' && (
                <div className="space-y-5">
                    <Section title="Change Password" icon="🔑">
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            {[
                                { label: 'Current Password', key: 'current' },
                                { label: 'New Password', key: 'next' },
                                { label: 'Confirm Password', key: 'confirm' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{f.label}</label>
                                    <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={savingPw}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60">
                                    {savingPw && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </Section>

                    <Section title="Active Sessions" icon="🖥️">
                        <div className="space-y-3">
                            {[
                                { device: 'Chrome on Windows', location: 'Hyderabad, IN', time: 'Active now', current: true },
                                { device: 'Safari on iPhone', location: 'Mumbai, IN', time: '2 days ago', current: false },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 py-3 border-b border-slate-800 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{s.device}
                                            {s.current && <span className="ml-2 text-[9px] bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded-full uppercase font-bold">Current</span>}
                                        </p>
                                        <p className="text-xs text-slate-500">{s.location} · {s.time}</p>
                                    </div>
                                    {!s.current && (
                                        <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Revoke</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Danger Zone" icon="⚠️">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-200">Sign out of all devices</p>
                                <p className="text-xs text-slate-500 mt-0.5">You will be logged out everywhere and need to sign in again.</p>
                            </div>
                            <button onClick={() => { logout(); addToast('Signed out of all devices', 'success'); }}
                                className="px-4 py-2 text-sm font-medium text-red-400 border border-red-900/50 rounded-xl hover:bg-red-900/20 transition-colors shrink-0">
                                Sign Out All
                            </button>
                        </div>
                    </Section>
                </div>
            )}

            {/* ── Appearance ───────────────────────────────────────────────────── */}
            {tab === 'appearance' && (
                <Section title="Display Preferences" icon="🎨">
                    <Toggle checked={animations} onChange={setAnimations} label="Enable Animations" description="Smooth transitions and micro-interactions throughout the app" />
                    <Toggle checked={compact} onChange={setCompact} label="Compact Mode" description="Reduce spacing for a denser information layout" />
                    <div className="pt-5">
                        <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Accent Color</p>
                        <div className="flex gap-3">
                            {['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-sky-500 to-blue-500'].map((g, i) => (
                                <button key={i} title="Set accent"
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-offset-2 ring-offset-slate-900 ${i === 0 ? 'ring-white' : 'ring-transparent hover:ring-white/50'} transition-all`} />
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button onClick={() => addToast('Appearance preferences saved ✓', 'success')}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all">
                            Save Appearance
                        </button>
                    </div>
                </Section>
            )}

            {/* ── Team (ADMIN only) ─────────────────────────────────────────────── */}
            {tab === 'team' && <InviteSection />}
        </div>
    );
}
