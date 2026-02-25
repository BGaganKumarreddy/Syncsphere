import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        try {
            setLoading(true);
            await register(name, email, password);
            addToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            addToast(error.message || 'Failed to sign up', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl w-full transition-all">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white">Create an Account</h1>
                <p className="text-slate-400 mt-2 text-sm">Join SyncSphere today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-slate-600"
                    />
                </div>

                {/* Email */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-slate-600"
                    />
                </div>

                {/* Password */}
                <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-slate-600"
                    />
                </div>



                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account…
                        </>
                    ) : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Log in
                </Link>
            </div>
        </div>
    );
}
