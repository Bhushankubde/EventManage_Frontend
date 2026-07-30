import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { SEO } from '../components/SEO';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || '');

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
      const from = location.state?.from?.pathname || '/admin';
      navigate(from);
    } else {
      setError(result.error || 'Authentication failed. Please verify admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070914] text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <SEO title="Admin Gatekeeper Login" description="Restricted Access Administrative login portal." />

      {/* Decorative Premium Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-md w-full space-y-8 bg-[#0f1224]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative z-10 shadow-2xl">
        <div>
          <div className="mx-auto h-14 w-14 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            E
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-wide">
            Admin Console
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Authorized Personnel Only
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-sm p-3.5 rounded-xl text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Administrator Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-11 py-3 bg-[#070914] border border-white/10 placeholder-slate-600 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                  placeholder="admin@eventdeco.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Console Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-xl relative block w-full px-11 py-3 bg-[#070914] border border-white/10 placeholder-slate-600 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-amber-500 hover:bg-amber-400 active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></span>
              ) : null}
              Access Console
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
