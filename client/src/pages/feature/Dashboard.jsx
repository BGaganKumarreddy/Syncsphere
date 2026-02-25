import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

// ─── Greeting ─────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, gradient, delay = 0 }) => (
  <div
    style={{ animationDelay: `${delay}ms` }}
    className="animate-fade-in-up group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-default"
  >
    {/* top gradient line */}
    <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
    {/* glow blob */}
    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />

    <div className="flex items-start justify-between">
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <p className="text-3xl font-bold text-white mt-2 group-hover:scale-105 transition-transform origin-left">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <span className="text-2xl opacity-70">{icon}</span>
    </div>
  </div>
);

// ─── Status chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    'Completed': 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    'In Progress': 'bg-amber-900/50   text-amber-400   border-amber-800',
    'Active': 'bg-indigo-900/50  text-indigo-400  border-indigo-800',
    'On Hold': 'bg-slate-700/50   text-slate-400   border-slate-600',
    // task priorities
    'High': 'bg-rose-900/50   text-rose-400   border-rose-800',
    'Medium': 'bg-amber-900/50  text-amber-400  border-amber-800',
    'Low': 'bg-slate-700/50  text-slate-400  border-slate-600',
    'Done': 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    'Todo': 'bg-slate-700/50   text-slate-400  border-slate-600',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${map[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {status}
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = '?' }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
  const color = colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHead = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-bold text-white">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
        {linkLabel} →
      </Link>
    )}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const Empty = ({ icon, msg }) => (
  <div className="py-8 text-center">
    <p className="text-2xl mb-2">{icon}</p>
    <p className="text-slate-600 text-sm">{msg}</p>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t, u, tm] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
          api.get('/users'),
          api.get('/teams'),
        ]);
        setProjects(p);
        setTasks(t);
        setUsers(u);
        setTeams(tm);
      } catch {
        addToast('Could not load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived numbers ──────────────────────────────────────────────────────
  const myTasks = tasks.filter(t => t.assignee?._id === user?._id || t.assignee === user?._id);
  const doneTasks = myTasks.filter(t => t.status === 'Done').length;
  const pendingTasks = myTasks.filter(t => t.status !== 'Done').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const myPendingTasks = myTasks
    .filter(t => t.status !== 'Done')
    .slice(0, 5);

  // ── Today's date ─────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // ── Quick progress bar ───────────────────────────────────────────────────
  const totalMyTasks = myTasks.length;
  const pct = totalMyTasks > 0 ? Math.round((doneTasks / totalMyTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">

      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">{today}</p>
        </div>

        {/* My progress pill */}
        {totalMyTasks > 0 && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">My task progress</span>
              <span className="text-xs font-bold text-indigo-400">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              {doneTasks} of {totalMyTasks} tasks done
            </p>
          </div>
        )}
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📁" label="Total Projects" value={projects.length} sub={`${inProgress} in progress`} gradient="from-indigo-500 to-violet-500" delay={0} />
        <StatCard icon="✅" label="Completed" value={completed} sub="projects done" gradient="from-emerald-500 to-teal-500" delay={80} />
        <StatCard icon="🎯" label="My Open Tasks" value={pendingTasks} sub={`${doneTasks} done`} gradient="from-amber-500 to-orange-500" delay={160} />
        <StatCard icon="🏢" label="Teams" value={teams.length} sub={`${users.length} members`} gradient="from-rose-500 to-pink-500" delay={240} />
      </div>

      {/* ── Main content grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Projects */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <SectionHead title="Recent Projects" linkTo="/projects" linkLabel="View all" />
          {recentProjects.length === 0 ? (
            <Empty icon="📁" msg="No projects yet" />
          ) : (
            <div className="space-y-2">
              {recentProjects.map((p, i) => (
                <div key={p._id} style={{ animationDelay: `${300 + i * 50}ms` }}
                  className="flex items-center justify-between gap-3 px-3 py-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 group animate-fade-in-up">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{p.name}</p>
                    {p.dueDate && (
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        Due {new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <StatusChip status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <SectionHead title="My Open Tasks" linkTo="/tasks" linkLabel="View all" />
          {myPendingTasks.length === 0 ? (
            <Empty icon="🎉" msg="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {myPendingTasks.map((t, i) => (
                <div key={t._id} style={{ animationDelay: `${380 + i * 50}ms` }}
                  className="flex items-center justify-between gap-3 px-3 py-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 group animate-fade-in-up">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-amber-400 transition-colors">{t.title}</p>
                    {t.project?.name && (
                      <p className="text-[10px] text-slate-600 mt-0.5">{t.project.name}</p>
                    )}
                  </div>
                  <StatusChip status={t.priority || t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Teams quick view */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
          <SectionHead title="Teams" linkTo="/teams" linkLabel="See all" />
          {teams.length === 0 ? (
            <Empty icon="🏢" msg="No teams yet" />
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 4).map(team => (
                <div key={team._id}
                  className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {team.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{team.name}</p>
                    <p className="text-[10px] text-slate-600">{team.members?.length || 0} members</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workspace Members */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '440ms' }}>
          <SectionHead title="Workspace Members" linkTo="/admin/users" linkLabel="Manage" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {users.slice(0, 6).map(u => (
              <div key={u._id}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors">
                <Avatar name={u.name} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate">{u.name}</p>
                  <p className="text-[9px] text-slate-600 uppercase font-medium">{u.role}</p>
                </div>
              </div>
            ))}
            {users.length > 6 && (
              <div className="flex items-center justify-center px-3 py-2.5 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl">
                <p className="text-xs text-slate-600">+{users.length - 6} more</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
