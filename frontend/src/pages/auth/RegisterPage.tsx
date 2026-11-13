import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';
import { Mail, Lock, User, Building2, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';

  const [role, setRole] = useState<UserRole>(initialRole as UserRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        organizationName: role === 'RECRUITER' ? organizationName : undefined,
      });

      if (user.role === 'RECRUITER') {
        navigate('/recruiter');
      } else {
        navigate('/candidate');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Get Started with HireFlow</h1>
        <p className="text-xs text-slate-500">
          Create your account to start managing recruitment or applying to open roles.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setRole('CANDIDATE')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            role === 'CANDIDATE'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Candidate / Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('RECRUITER')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            role === 'RECRUITER'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Employer / Recruiter
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Jane Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="jane@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        {role === 'RECRUITER' && (
          <Input
            label="Company / Organization Name"
            placeholder="Acme Innovations"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
        )}

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Password (min. 8 characters)"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

