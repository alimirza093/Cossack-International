import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthFormField from '../components/auth/AuthFormField';
import { getAuthErrorMessage, useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Access your account to shop, track orders, and checkout.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700"
          >
            <span className="material-icons-round text-base shrink-0">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        <AuthFormField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          placeholder="you@company.com"
        />

        <AuthFormField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full text-sm disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-zinc-500 pt-2">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-bold text-[#0B0B0B] hover:text-[#39FF14] uppercase tracking-wider transition-colors"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
