import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthFormField from '../components/auth/AuthFormField';
import { getAuthErrorMessage, useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !success) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_number: phone || undefined,
        address: address || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1200);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Cossack International to shop and manage your orders.">
      {success ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="material-icons-round text-[#39FF14] text-5xl mb-4">check_circle</span>
          <p className="text-sm font-bold text-[#0B0B0B] mb-1">Account created successfully</p>
          <p className="text-xs text-zinc-500">Redirecting you to the store…</p>
        </div>
      ) : (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AuthFormField
              id="reg-first-name"
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              required
              autoComplete="given-name"
            />
            <AuthFormField
              id="reg-last-name"
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              required
              autoComplete="family-name"
            />
          </div>

          <AuthFormField
            id="reg-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />

          <AuthFormField
            id="reg-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          <AuthFormField
            id="reg-phone"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />

          <div>
            <label
              htmlFor="reg-address"
              className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2"
            >
              Address <span className="text-zinc-400 font-bold normal-case tracking-normal"> (optional)</span>
            </label>
            <textarea
              id="reg-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors resize-none"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-sm disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-zinc-500 pt-2">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#0B0B0B] hover:text-[#39FF14] uppercase tracking-wider transition-colors"
            >
              Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default Register;
