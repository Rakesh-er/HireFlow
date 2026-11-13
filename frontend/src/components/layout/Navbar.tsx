import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, ArrowRight, UserCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN') return '/admin';
    if (user.role === 'CANDIDATE') return '/candidate';
    return '/recruiter';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="tracking-tight">Hire<span className="text-primary-600">Flow</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/jobs" className="hover:text-primary-600 transition-colors">
            Browse Jobs
          </Link>
          <Link to="/pricing" className="hover:text-primary-600 transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="hover:text-primary-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate(getDashboardLink())}>
              <UserCircle className="w-4 h-4" />
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="hidden sm:inline-flex">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

