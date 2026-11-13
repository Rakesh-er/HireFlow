import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  KanbanSquare,
  Calendar,
  BarChart3,
  Building2,
  Settings,
  UserCheck,
  FileText,
  ShieldCheck,
  Activity,
  FolderGit2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const recruiterNav = [
    { label: 'Overview', to: '/recruiter', icon: LayoutDashboard, end: true },
    { label: 'Job Openings', to: '/recruiter/jobs', icon: Briefcase },
    { label: 'Applications', to: '/recruiter/applications', icon: FolderGit2 },
    { label: 'ATS Pipeline', to: '/recruiter/kanban', icon: KanbanSquare },
    { label: 'Candidate Pool', to: '/recruiter/candidates', icon: Users },
    { label: 'Interviews', to: '/recruiter/interviews', icon: Calendar },
    { label: 'Analytics', to: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Team Members', to: '/recruiter/team', icon: UserCheck },
    { label: 'Company Settings', to: '/recruiter/settings', icon: Building2 },
    { label: 'My Profile', to: '/recruiter/profile', icon: Settings },
  ];

  const candidateNav = [
    { label: 'Overview', to: '/candidate', icon: LayoutDashboard, end: true },
    { label: 'Find Jobs', to: '/candidate/jobs', icon: Briefcase },
    { label: 'My Applications', to: '/candidate/applications', icon: FolderGit2 },
    { label: 'Interviews', to: '/candidate/interviews', icon: Calendar },
    { label: 'Resume & Profile', to: '/candidate/profile', icon: FileText },
    { label: 'Settings', to: '/candidate/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'System Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Organizations', to: '/admin/organizations', icon: Building2 },
    { label: 'Users Directory', to: '/admin/users', icon: Users },
    { label: 'Platform Jobs', to: '/admin/jobs', icon: Briefcase },
    { label: 'Audit Logs', to: '/admin/logs', icon: Activity },
    { label: 'System Health', to: '/admin/health', icon: ShieldCheck },
  ];

  let navItems = recruiterNav;
  if (user.role === 'CANDIDATE') navItems = candidateNav;
  if (user.role === 'SUPER_ADMIN') navItems = adminNav;

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <span>Hire<span className="text-primary-600">Flow</span></span>
        </NavLink>
        {user.organization && (
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600 max-w-[80px] truncate">
            {user.organization.name}
          </span>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
          {user.role === 'SUPER_ADMIN' ? 'Platform Administration' : user.role === 'CANDIDATE' ? 'Candidate Portal' : 'Recruitment Hub'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User footer badge */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0 text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

