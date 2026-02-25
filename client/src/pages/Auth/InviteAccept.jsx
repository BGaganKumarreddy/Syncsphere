import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';


/** Decode the JWT payload (no verification — that's the server's job) */
function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export default function InviteAccept() {
    const [params] = useSearchParams();
    const { addToast } = useToast();
    const token = params.get('token');

    // Pre-fill email if it was embedded in the token
    const decoded = token ? decodeToken(token) : null;
    const prefilledEmail = decoded?.inviteeEmail || '';
    const invitedRole = decoded?.invitedRole || 'MEMBER';

    const [form, setForm] = useState({ name: '', email: prefilledEmail, password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [invalid, setInvalid] = useState(!token);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            addToast('All fields are required', 'error'); return;
        }
        if (form.password !== form.confirm) {
            addToast('Passwords do not match', 'error'); return;
        }
        if (form.password.length < 6) {
            addToast('Password must be at least 6 characters', 'error'); return;
        }
        setLoading(true);
        try {
            // acceptInvite already creates the user AND returns a JWT — use it
            // directly so we don't have to make a second login API call.
            const data = await api.post('/invites/accept', {
                token,
                name: form.name,
                email: form.email,
                password: form.password,
            });
            // Store the user in AuthContext + localStorage the same way login() does
            localStorage.setItem('authUser', JSON.stringify(data));
            // Trigger a page reload so AuthContext re-reads localStorage on mount
            addToast(`Welcome to SyncSphere, ${data.name}! 🎉`, 'success');
            window.location.href = '/dashboard';
        } catch (err) {
            addToast(err.message || 'Failed to accept invite', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (invalid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="text-center">
                    <p className="text-5xl mb-4">❌</p>
                    <h1 className="text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
                    <p className="text-slate-400 text-sm mb-6">This invite link is missing or malformed.</p>
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm underline">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-indigo-900/50">🔗</div>
                    <h1 className="text-2xl font-bold text-white">You've been invited!</h1>
                    <p className="text-slate-400 text-sm mt-2">Create your SyncSphere account to join the workspace.</p>
                    {invitedRole && (
                        <span className="inline-block mt-2 text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700 text-indigo-300">
                            Role: {invitedRole}
                        </span>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@company.com', locked: !!prefilledEmail },
                            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                                    {f.label}
                                    {f.locked && <span className="ml-2 text-[9px] bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded-full">Pre-filled</span>}
                                </label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    disabled={f.locked}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${f.locked
                                        ? 'bg-slate-800/40 border-slate-700/50 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
                                        }`}
                                />
                            </div>
                        ))}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60 text-sm">
                            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? 'Creating Account…' : 'Join Workspace 🎉'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-600 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
