import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Briefcase } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const apiDocsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '/api-docs');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <span>HireFlow</span>
          </div>
          <div className="flex gap-6">
            <Link to="/jobs" className="hover:text-primary-600">Jobs</Link>
            <Link to="/pricing" className="hover:text-primary-600">Pricing</Link>
            <Link to="/about" className="hover:text-primary-600">About</Link>
            <a href={apiDocsUrl} target="_blank" rel="noreferrer" className="hover:text-primary-600">API Documentation</a>
          </div>
          <p>© {new Date().getFullYear()} HireFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

