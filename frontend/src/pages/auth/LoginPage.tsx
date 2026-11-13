import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, AlertCircle, ArrowRight, Shield, Briefcase, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      const redirectPath = (location.state as any)?.returnUrl || (location.state as any)?.from?.pathname;
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'CANDIDATE') {
        navigate('/candidate');
      } else {
        navigate('/recruiter');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">
          Enter your credentials to access your HireFlow workspace.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill helper for smooth review and testing */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Demo Accounts (One-Click Pre-fill):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('recruiter@acme.com')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-400 text-slate-700 font-medium text-left flex items-center gap-1.5 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-primary-600" />
            <span>Recruiter</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('alex.rivera@example.com')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-400 text-slate-700 font-medium text-left flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('manager@acme.com')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-400 text-slate-700 font-medium text-left flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Interviewer</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@hireflow.io')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-400 text-slate-700 font-medium text-left flex items-center gap-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

