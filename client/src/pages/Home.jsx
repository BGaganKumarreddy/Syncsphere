import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, color, delay }) => (
  <div
    className="animate-fade-in-up group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 cursor-default overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-slate-700/80 flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
    </div>
  </div>
);

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({ num, title, description, delay }) => (
  <div className="animate-fade-in-up text-center" style={{ animationDelay: `${delay}ms` }}>
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg shadow-indigo-900/50">
      {num}
    </div>
    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
  </div>
);

// ─── Stat Item ────────────────────────────────────────────────────────────────
const StatItem = ({ value, label }) => (
  <div className="text-center px-6 py-4">
    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{value}</p>
    <p className="text-slate-400 text-sm mt-1">{label}</p>
  </div>
);

// ─── Dashboard Preview (pure CSS mock) ───────────────────────────────────────
const DashboardPreview = () => (
  <div className="relative w-full max-w-4xl mx-auto">
    {/* Glow behind the preview */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 to-violet-600/10 blur-3xl rounded-3xl scale-95" />

    <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900 overflow-hidden shadow-2xl shadow-black/60">
      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <div className="flex-1 mx-4 h-5 bg-slate-700 rounded-full flex items-center px-3">
          <span className="text-[10px] text-slate-500">localhost:5173/dashboard</span>
        </div>
      </div>

      {/* App layout mockup */}
      <div className="flex h-56 sm:h-72">
        {/* Sidebar */}
        <div className="w-14 sm:w-44 bg-slate-950/80 border-r border-slate-800 flex flex-col p-3 gap-2 shrink-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0" />
            <span className="text-xs font-bold text-white hidden sm:block">SyncSphere</span>
          </div>
          {['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Teams', 'Chat'].map((item, i) => (
            <div key={item}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${i === 0 ? 'bg-indigo-600/30 text-indigo-400' : 'text-slate-500'}`}>
              <div className="w-3 h-3 rounded bg-current opacity-60 shrink-0" />
              <span className="text-[10px] font-medium hidden sm:block">{item}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="text-sm font-bold text-white mb-4">Good morning, Admin 👋</div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Projects', val: '12', color: 'from-indigo-500/20 to-violet-500/20' },
              { label: 'Tasks', val: '38', color: 'from-amber-500/20 to-orange-500/20' },
              { label: 'Done', val: '24', color: 'from-emerald-500/20 to-teal-500/20' },
              { label: 'Teams', val: '4', color: 'from-rose-500/20 to-pink-500/20' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} border border-slate-700/50 rounded-xl p-2.5`}>
                <p className="text-lg font-bold text-white">{s.val}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Two mini panels */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Recent Projects</p>
              {['Website Redesign', 'Mobile App v2', 'API Gateway'].map(p => (
                <div key={p} className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-[10px] text-slate-300 truncate">{p}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">My Tasks</p>
              {['Fix login bug', 'Update docs', 'Code review'].map(t => (
                <div key={t} className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[10px] text-slate-300 truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* ── Background Orbs ─────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-float absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/12 rounded-full blur-[120px]" />
        <div className="animate-float-reverse absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[130px]" />
        <div className="animate-float absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px]" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-black/20' : ''}`}>
        <div className="animate-fade-in-down flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SyncSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                Get Started →
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="px-6 pt-20 pb-16 lg:pt-28 lg:pb-20 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
          <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-indigo-400" />
          ✨ Your all-in-one team workspace
        </div>

        <h1 className="animate-fade-in-up text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight" style={{ animationDelay: '100ms' }}>
          Manage projects with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            clarity
          </span>{' '}
          and{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            speed
          </span>
          .
        </h1>

        <p className="animate-fade-in-up text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '200ms' }}>
          SyncSphere brings your team's work together in one shared space — projects, tasks, chat, and invites — all in a beautiful interface.
        </p>

        <div className="animate-fade-in-up flex justify-center gap-4 flex-wrap mb-20" style={{ animationDelay: '300ms' }}>
          <Link to="/signup">
            <button className="group px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1">
              Start for free
              <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </Link>
          <Link to="/login">
            <button className="px-8 py-3.5 text-base font-semibold text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-500 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5">
              Sign In
            </button>
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <DashboardPreview />
        </div>
      </header>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-800/60 bg-slate-900/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-800">
          <StatItem value="5" label="Sharing platforms" />
          <StatItem value="3" label="Access roles" />
          <StatItem value="48h" label="Invite link validity" />
          <StatItem value="∞" label="Team members" />
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Everything your team needs</h2>
            <p className="text-slate-400 max-w-md mx-auto">Powerful tools to keep your team in sync, on time, and always delivering.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon="📁" title="Project Management" description="Create and track projects with statuses, due dates, and team ownership. See all your work at a glance." color="from-indigo-500/15 to-violet-500/15" delay={400} />
            <FeatureCard icon="✅" title="Task Tracking" description="Assign tasks with priorities, due dates, and assignees. Filter by project, status, or team member." color="from-amber-500/15 to-orange-500/15" delay={480} />
            <FeatureCard icon="💬" title="Direct Messaging" description="Chat one-on-one with any team member. Instant message delivery with real-time updates." color="from-emerald-500/15 to-teal-500/15" delay={560} />
            <FeatureCard icon="📅" title="Calendar View" description="Visualize all your tasks on a monthly calendar. Never miss a deadline again." color="from-sky-500/15 to-cyan-500/15" delay={640} />
            <FeatureCard icon="👥" title="Team Management" description="Create teams, assign members, and control access with three role levels — Admin, Member, and Guest." color="from-rose-500/15 to-pink-500/15" delay={720} />
            <FeatureCard icon="🔗" title="Smart Invites" description="Invite teammates via Email, WhatsApp, Telegram, Slack, or a copyable link. Links expire in 48 hours." color="from-purple-500/15 to-violet-500/15" delay={800} />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-slate-400">No complex setup. Just sign up and start collaborating.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <StepCard num="1" title="Create your account" description="Sign up in seconds. No credit card required. Choose your role and get instant access." delay={400} />
            <StepCard num="2" title="Invite your team" description="Send invite links via email, WhatsApp, Telegram, or Slack. Your team joins with one click." delay={500} />
            <StepCard num="3" title="Start collaborating" description="Create projects, assign tasks, track progress, and chat — all in one beautiful workspace." delay={600} />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-800/50 rounded-3xl p-12 overflow-hidden">
            {/* Orb inside CTA */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-4xl mb-4">🚀</p>
              <h2 className="text-3xl font-bold text-white mb-4">Ready to sync your team?</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">Join SyncSphere today and see why teams love working together in one shared space.</p>
              <Link to="/signup">
                <button className="px-10 py-4 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1">
                  Get Started for Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="text-slate-400 text-sm font-medium">SyncSphere</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Log In</Link>
            <Link to="/signup" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Sign Up</Link>
          </div>
          <p className="text-slate-600 text-sm">© 2026 SyncSphere · Built for modern teams.</p>
        </div>
      </footer>

    </div>
  );
}
