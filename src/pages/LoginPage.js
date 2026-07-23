import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || '');
  const [success, setSuccess] = useState(location.state?.message || '');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      // Check the role of the logged in user
      const storedUser = localStorage.getItem('eventdeco_user');
      let isAdmin = false;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const role = user?.role?.toUpperCase();
          isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';
        } catch (err) {}
      }

      const from = location.state?.from?.pathname || '/catalog';
      
      // If they were redirected from an admin page, let's make sure they are actually admin.
      // If not, redirect them to catalog instead of throwing them to homepage or getting stuck.
      if (from.startsWith('/admin') || from.startsWith('/offline-sales')) {
        if (isAdmin) {
          navigate(from);
        } else {
          navigate('/catalog');
        }
      } else {
        // If they logged in as an Admin from a normal page, redirect them to /admin.
        if (isAdmin && (from === '/catalog' || from === '/' || from === '/login')) {
          navigate('/admin');
        } else {
          navigate(from);
        }
      }
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">
            E
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              register for a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-lg text-center font-medium">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-input-background"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-input-background"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              ) : null}
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
