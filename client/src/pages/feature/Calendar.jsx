import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

// ─── Priority colours for calendar dots ──────────────────────────────────────
const PRIORITY_DOT = {
    Urgent: 'bg-red-500',
    High: 'bg-orange-400',
    Medium: 'bg-sky-400',
    Low: 'bg-slate-500',
};

const PRIORITY_CHIP = {
    Urgent: 'bg-red-900/50 text-red-300 border border-red-800',
    High: 'bg-orange-900/50 text-orange-300 border border-orange-800',
    Medium: 'bg-sky-900/50 text-sky-300 border border-sky-800',
    Low: 'bg-slate-700/50 text-slate-400 border border-slate-600',
};

const STATUS_CHIP = {
    'Todo': 'bg-slate-700/50 text-slate-400',
    'In Progress': 'bg-indigo-900/50 text-indigo-300',
    'In Review': 'bg-amber-900/50 text-amber-300',
    'Done': 'bg-emerald-900/50 text-emerald-300',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toISODate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOf = (y, m) => new Date(y, m, 1).getDay();

const diffDays = (isoDate) => {
    const due = new Date(isoDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / 86400000);
};

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Task pill shown inside a calendar cell ───────────────────────────────────
const TaskPill = ({ task, onClick }) => (
    <button
        onClick={e => { e.stopPropagation(); onClick(task); }}
        title={task.title}
        className={`w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-4 transition-opacity hover:opacity-80 ${PRIORITY_DOT[task.priority] ? '' : ''}`}
        style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderLeft: `2px solid ${task.priority === 'Urgent' ? '#ef4444' : task.priority === 'High' ? '#f97316' : task.priority === 'Medium' ? '#38bdf8' : '#64748b'}` }}
    >
        {task.title}
    </button>
);

// ─── Side panel card ──────────────────────────────────────────────────────────
const DeadlineCard = ({ task, onClick }) => {
    const diff = diffDays(task.dueDate);
    const isOverdue = diff < 0;
    const isToday = diff === 0;

    return (
        <button
            onClick={() => onClick(task)}
            className="w-full text-left group p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 animate-fade-in-up"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIORITY_CHIP[task.priority]}`}>
                    {task.priority}
                </span>
                <span className={`text-xs font-mono font-semibold ${isOverdue ? 'text-red-400' : isToday ? 'text-amber-400' : 'text-slate-500'}`}>
                    {isOverdue ? `${Math.abs(diff)}d overdue` : isToday ? 'Today!' : `in ${diff}d`}
                </span>
            </div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1">
                {task.title}
            </p>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_CHIP[task.status]}`}>
                    {task.status}
                </span>
                <span className="text-[10px] text-slate-500">{formatDate(task.dueDate)}</span>
            </div>
            {task.assignee && (
                <p className="text-[10px] text-slate-500 mt-1">👤 {task.assignee.name}</p>
            )}
        </button>
    );
};

// ─── Task details modal ───────────────────────────────────────────────────────
const TaskModal = ({ task, onClose }) => {
    if (!task) return null;
    const diff = diffDays(task.dueDate);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                <div className="flex items-start justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${PRIORITY_CHIP[task.priority]}`}>
                        {task.priority}
                    </span>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">✕</button>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{task.title}</h2>
                {task.description && <p className="text-slate-400 text-sm mb-4">{task.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-800 rounded-xl p-3">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Status</p>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CHIP[task.status]}`}>{task.status}</span>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-3">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Due Date</p>
                        <p className={`text-sm font-semibold ${diff < 0 ? 'text-red-400' : diff === 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {formatDate(task.dueDate)}
                        </p>
                    </div>
                    {task.assignee && (
                        <div className="bg-slate-800 rounded-xl p-3 col-span-2">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Assignee</p>
                            <p className="text-sm text-slate-200">👤 {task.assignee.name} <span className="text-slate-500">({task.assignee.role})</span></p>
                        </div>
                    )}
                    {task.project && (
                        <div className="bg-slate-800 rounded-xl p-3 col-span-2">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Project</p>
                            <p className="text-sm text-slate-200">📁 {task.project.name}</p>
                        </div>
                    )}
                </div>
                <p className={`mt-4 text-center text-sm font-semibold ${diff < 0 ? 'text-red-400' : diff === 0 ? 'text-amber-400' : 'text-indigo-300'}`}>
                    {diff < 0 ? `⚠️ ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue` : diff === 0 ? '⏰ Due today!' : `✅ ${diff} day${diff !== 1 ? 's' : ''} remaining`}
                </p>
            </div>
        </div>
    );
};

// ─── Main Calendar Page ───────────────────────────────────────────────────────
export default function Calendar() {
    const { addToast } = useToast();
    const today = new Date();

    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // ── Real-time polling every 30 s ──────────────────────────────────────────
    const fetchTasks = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        try {
            const data = await api.get('/tasks');
            // Only keep tasks that have a dueDate
            setTasks(data.filter(t => t.dueDate));
            setLastFetched(new Date());
        } catch (err) {
            if (!quiet) addToast('Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(() => fetchTasks(true), 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [fetchTasks]);

    // ── Calendar helpers ──────────────────────────────────────────────────────
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOf(year, month);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today.getDate()); };

    const tasksForDay = (day) => {
        const iso = toISODate(year, month, day);
        return tasks.filter(t => t.dueDate === iso);
    };

    // ── Upcoming deadlines — all tasks with dueDate, sorted soonest first ─────
    const upcoming = [...tasks]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const overdue = upcoming.filter(t => diffDays(t.dueDate) < 0 && t.status !== 'Done');
    const dueToday = upcoming.filter(t => diffDays(t.dueDate) === 0);
    const future = upcoming.filter(t => diffDays(t.dueDate) > 0 && t.status !== 'Done');

    // Tasks for the selected day panel
    const selectedDayTasks = selectedDay ? tasksForDay(selectedDay) : [];

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex gap-5 overflow-hidden">

            {/* ── Left: Calendar grid ────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        {loading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <div className="flex items-center gap-2">
                        {lastFetched && (
                            <span className="text-xs text-slate-600 hidden md:block">
                                Updated {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <button onClick={goToToday}
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-900/40 border border-indigo-800 rounded-lg hover:bg-indigo-900/70 transition-colors">
                            Today
                        </button>
                        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            ‹
                        </button>
                        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            ›
                        </button>
                    </div>
                </div>

                {/* Day names row */}
                <div className="grid grid-cols-7 border-b border-slate-800">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {Array(startDay).fill(null).map((_, i) => (
                        <div key={`e${i}`} className="border-r border-b border-slate-800/50" />
                    ))}

                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                        const dayTasks = tasksForDay(day);
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const isSelected = day === selectedDay;
                        const hasOverdue = dayTasks.some(t => diffDays(t.dueDate) < 0 && t.status !== 'Done');

                        return (
                            <div
                                key={day}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={`border-r border-b border-slate-800/50 p-1.5 cursor-pointer transition-colors min-h-0 overflow-hidden flex flex-col gap-0.5
                  ${isSelected ? 'bg-indigo-900/30 border-indigo-700' : 'hover:bg-slate-800/40'}
                `}
                            >
                                {/* Day number */}
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-0.5 shrink-0
                  ${isToday ? 'bg-indigo-500 text-white' : isSelected ? 'text-indigo-300' : hasOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                                    {day}
                                </span>

                                {/* Task pills — show up to 2, then "+N more" */}
                                {dayTasks.slice(0, 2).map(task => (
                                    <TaskPill key={task._id} task={task} onClick={setSelectedTask} />
                                ))}
                                {dayTasks.length > 2 && (
                                    <span className="text-[9px] text-slate-500 pl-1">+{dayTasks.length - 2} more</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Right: Side panel ──────────────────────────────────────────────── */}
            <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">

                {/* Selected day detail */}
                {selectedDay && (
                    <div className="bg-slate-900/60 border border-indigo-800/60 rounded-2xl p-4 animate-fade-in-up">
                        <h3 className="text-sm font-bold text-indigo-300 mb-3">
                            📅 {toISODate(year, month, selectedDay)}
                        </h3>
                        {selectedDayTasks.length === 0 ? (
                            <p className="text-xs text-slate-600 italic">No tasks due on this day</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {selectedDayTasks.map(t => (
                                    <DeadlineCard key={t._id} task={t} onClick={setSelectedTask} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Overdue */}
                {overdue.length > 0 && (
                    <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-4 animate-fade-in-up">
                        <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                            ⚠️ Overdue <span className="text-xs bg-red-900/50 px-2 py-0.5 rounded-full">{overdue.length}</span>
                        </h3>
                        <div className="flex flex-col gap-2">
                            {overdue.map(t => <DeadlineCard key={t._id} task={t} onClick={setSelectedTask} />)}
                        </div>
                    </div>
                )}

                {/* Due today */}
                {dueToday.length > 0 && (
                    <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-4 animate-fade-in-up">
                        <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                            ⏰ Due Today <span className="text-xs bg-amber-900/50 px-2 py-0.5 rounded-full">{dueToday.length}</span>
                        </h3>
                        <div className="flex flex-col gap-2">
                            {dueToday.map(t => <DeadlineCard key={t._id} task={t} onClick={setSelectedTask} />)}
                        </div>
                    </div>
                )}

                {/* Upcoming */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex-1 animate-fade-in-up">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        📋 Upcoming
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{future.length}</span>
                        <button onClick={() => fetchTasks()} title="Refresh" className="ml-auto text-slate-600 hover:text-indigo-400 transition-colors text-base">
                            ↻
                        </button>
                    </h3>
                    {future.length === 0 && !loading ? (
                        <p className="text-xs text-slate-600 italic">
                            {tasks.length === 0 ? 'No tasks with deadlines yet. Add due dates on the Tasks page.' : 'All caught up! No upcoming deadlines.'}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {future.map(t => <DeadlineCard key={t._id} task={t} onClick={setSelectedTask} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Task detail modal */}
            <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        </div>
    );
}
