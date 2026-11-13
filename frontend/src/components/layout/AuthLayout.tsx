import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Briefcase, CheckCircle2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left / Form column */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span>Hire<span className="text-primary-600">Flow</span></span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12">
          <Outlet />
        </div>

        <div className="text-xs text-slate-400 text-center lg:text-left">
          © {new Date().getFullYear()} HireFlow SaaS Platform. Protected by enterprise security.
        </div>
      </div>

      {/* Right / Hero visual column */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 text-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-primary-200 border border-white/15">
            Enterprise Recruitment OS
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Streamline your recruitment pipeline from opening to offer.
          </h2>
          <p className="text-primary-100/80 text-base leading-relaxed">
            Empower your HR teams, hiring managers, and candidates with automated interview scheduling, collaborative scorecards, and multi-tenant data isolation.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-primary-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Full ATS Kanban Pipeline with Stage Tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Conflict-Free Multi-Interviewer Scheduling</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Real-Time Notifications via Socket.IO</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-primary-300">
          Trusted by high-growth startups and global enterprises.
        </div>
      </div>
    </div>
  );
};

