import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Avatar = ({ name = '?', size = 'md' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
    const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0`}>
            {initials}
        </div>
    );
};

const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function Chat() {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [contacts, setContacts] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    // ── Fetch contacts ────────────────────────────────────────────────────────
    useEffect(() => {
        api.get('/users')
            .then(data => {
                const others = data.filter(u => u._id !== user?._id);
                setContacts(others);
                if (others.length > 0) setSelected(others[0]);
            })
            .catch(() => addToast('Could not load contacts', 'error'));
    }, []);

    // ── Fetch thread whenever selected contact changes ─────────────────────────
    const loadThread = useCallback(async (contactId) => {
        if (!contactId) return;
        setLoadingMsgs(true);
        try {
            const data = await api.get(`/messages/${contactId}`);
            setMessages(data);
        } catch {
            addToast('Could not load messages', 'error');
        } finally {
            setLoadingMsgs(false);
        }
    }, []);

    useEffect(() => {
        if (selected) loadThread(selected._id);
    }, [selected, loadThread]);

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selected || sending) return;
        const text = input.trim();
        setInput('');
        setSending(true);

        // Optimistic update
        const optimistic = {
            _id: `opt_${Date.now()}`,
            from: { _id: user._id, name: user.name },
            to: { _id: selected._id, name: selected.name },
            text,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const saved = await api.post(`/messages/${selected._id}`, { text });
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));
        } catch (err) {
            // Rollback on failure
            setMessages(prev => prev.filter(m => m._id !== optimistic._id));
            setInput(text);
            addToast(err.message || 'Failed to send', 'error');
        } finally {
            setSending(false);
        }
    };

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const ROLE_CHIP = {
        ADMIN: 'bg-violet-900/50 text-violet-400',
        MEMBER: 'bg-indigo-900/50 text-indigo-400',
        GUEST: 'bg-slate-700 text-slate-400',
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

            {/* ── Contacts sidebar ────────────────────────────────────── */}
            <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white mb-3">Messages</h2>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search people…"
                            className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {filtered.length === 0 ? (
                        <p className="text-slate-600 text-xs text-center py-6">No contacts found</p>
                    ) : filtered.map(c => (
                        <button key={c._id} onClick={() => setSelected(c)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${selected?._id === c._id ? 'bg-indigo-900/30 border-r-2 border-indigo-500' : 'hover:bg-slate-800/50'}`}>
                            <div className="relative">
                                <Avatar name={c.name} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-200 truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-600 truncate">{c.email}</p>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${ROLE_CHIP[c.role]}`}>{c.role}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Chat window ─────────────────────────────────────────── */}
            {selected ? (
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900/40">
                        <Avatar name={selected.name} />
                        <div>
                            <p className="text-sm font-bold text-white">{selected.name}</p>
                            <p className="text-[10px] text-slate-500">{selected.email} · {selected.role}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {loadingMsgs ? (
                            <div className="flex items-center justify-center h-32">
                                <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <p className="text-3xl mb-3">💬</p>
                                <p className="text-slate-400 font-medium text-sm">No messages yet</p>
                                <p className="text-slate-600 text-xs mt-1">Send the first message to {selected.name}!</p>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isMe = msg.from?._id === user?._id || msg.from === user?._id;
                                return (
                                    <div key={msg._id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        {!isMe && <Avatar name={selected.name} size="sm" />}
                                        <div className={`max-w-[68%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-600 px-1">{fmtTime(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend}
                        className="px-5 py-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3">
                        <input value={input} onChange={e => setInput(e.target.value)}
                            placeholder={`Message ${selected.name}…`}
                            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                        <button type="submit" disabled={!input.trim() || sending}
                            className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-40 shrink-0">
                            {sending
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            }
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-slate-400 font-medium">Select a contact to start chatting</p>
                    </div>
                </div>
            )}
        </div>
    );
}
