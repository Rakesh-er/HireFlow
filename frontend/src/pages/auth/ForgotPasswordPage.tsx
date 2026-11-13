import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      if (response.data?.data?.devToken) {
        setDevToken(response.data.data.devToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Your Password</h1>
        <p className="text-xs text-slate-500">
          Enter your registered email and we'll dispatch password reset instructions.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-900">Reset Link Dispatched</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            If an account exists with that email address, password reset instructions have been sent.
          </p>
          {devToken && (
            <div className="p-3 bg-white rounded-lg border border-emerald-300 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Local Dev Reset Token:</span>
              <p className="font-mono text-xs text-slate-800 break-all select-all">{devToken}</p>
              <Link to={`/reset-password?token=${devToken}`} className="text-xs font-semibold text-primary-600 underline block mt-2">
                Click here to reset with this token
              </Link>
            </div>
          )}
          <Link to="/login" className="inline-block pt-2">
            <Button size="sm" variant="outline">
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Instructions
          </Button>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

