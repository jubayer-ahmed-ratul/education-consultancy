import { useState, type FormEvent } from 'react';
import { Compass, Lock } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      addToast('success', 'Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
      addToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] p-4">
      <Helmet>
        <title>Staff Sign In — Zero Compile</title>
      </Helmet>

      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0D3B2E] text-white">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <div className="font-display text-lg font-extrabold text-[#111827]">Zero Compile</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D97706]">
            Admissions & CMS Console
          </div>
        </div>
      </div>

      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0D3B2E]" /> Staff Sign In
          </CardTitle>
          <CardDescription>Authenticate with your counselor or Super Admin credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#111827]">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zerocompile.example"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#111827]">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in...' : 'Sign In to Console'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link to="/" className="mt-6 text-xs text-[#6B7280] hover:text-[#111827] hover:underline">
        ← Return to Zero Compile Public Portal
      </Link>
    </div>
  );
}
