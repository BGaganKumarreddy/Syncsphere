import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ROLES } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Lazy Loaded Pages
const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/feature/Dashboard"));
const Projects = lazy(() => import("./pages/feature/Projects"));
const ProjectDetail = lazy(() => import("./pages/feature/ProjectDetail"));
const Tasks = lazy(() => import("./pages/feature/Tasks"));
const Teams = lazy(() => import("./pages/feature/Teams"));
const Calendar = lazy(() => import("./pages/feature/Calendar"));
const Profile = lazy(() => import("./pages/feature/Profile"));
const Settings = lazy(() => import("./pages/feature/Settings"));
const Chat = lazy(() => import("./pages/feature/Chat"));
const Users = lazy(() => import("./pages/Admin/Users"));
const InviteAccept = lazy(() => import("./pages/Auth/InviteAccept"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loaders
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/invite/accept" element={<InviteAccept />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/chat" element={<Chat />} />

                    {/* Admin Only Route */}
                    <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
                      <Route path="/admin/users" element={<Users />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
