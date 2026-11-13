import React from 'react';
import { Shield, Sparkles, Target, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About HireFlow</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We are dedicated to building modern, human-centric recruitment tools that streamline hiring workflows without sacrificing personalization.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Eliminate friction in talent acquisition. We provide hiring managers and candidates with intuitive interfaces that accelerate decision-making while ensuring data security and fairness.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Collaborative Hiring</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hiring isn't just an HR function—it's a team effort. HireFlow bridges the gap between recruiters, interviewers, and team leaders with real-time feedback and structured scorecards.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Enterprise Security</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            With strict multi-tenant database isolation, hashed refresh token rotation, and end-to-end access control, enterprise hiring data remains isolated and protected.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Modern Architecture</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Built on MongoDB Atlas, Express, Prisma ORM, and React 18, HireFlow delivers lightning-fast responses, reactive WebSockets, and high availability.
          </p>
        </div>
      </div>
    </div>
  );
};

