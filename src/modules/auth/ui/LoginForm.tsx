import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { loginUser } from '../auth.server';

export function LoginForm({ tenantName }: { tenantName: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginUser({
        data: {
          email,
          password,
        },
      });

      // Invalidate router cache & navigate to protected admin dashboard
      await router.invalidate();
      window.location.href = '/admin';
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-slate-200 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-heading text-slate-900">{tenantName}</h2>
        <p className="text-sm text-slate-500 mt-1">Store Management Portal</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="admin@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 disabled:opacity-50 transition text-sm cursor-pointer"
        >
          {isSubmitting ? 'Verifying...' : 'Sign In to Dashboard'}
        </button>
      </form>
    </div>
  );
}