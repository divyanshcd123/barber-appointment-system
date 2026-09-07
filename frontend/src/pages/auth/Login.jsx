import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiScissors, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  const getDashboardPath = (role) => {
    const paths = { customer: '/customer', barber: '/barber', admin: '/admin' };
    return paths[role] || '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ ...form, remember });
    if (result.success) {
      navigate(from || getDashboardPath(result.user.role));
    }
  };

  // Demo credential fill
  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@barbershop.com', password: 'admin123' },
      barber: { email: 'jawed@barbershop.com', password: 'barber123' },
      customer: { email: 'customer@example.com', password: 'customer123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen flex font-outfit" style={{
      background: 'radial-gradient(ellipse at top left, rgba(212,175,55,0.05) 0%, transparent 50%), linear-gradient(180deg, #121214 0%, #1A1A1E 100%)',
    }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }} />
        <div className="relative z-10 text-center max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-lg">
              <FiScissors size={24} className="text-dark-300" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Barber<span className="text-blue-600">X</span></span>
          </Link>
          <h2 className="text-4xl font-black text-white mb-4">Welcome Back</h2>
          <p className="text-gray-400 leading-relaxed mb-12">
            Sign in to manage your appointments, view your schedule, and stay connected with your barber.
          </p>
          {/* Feature highlights */}
          <div className="space-y-4 text-left">
            {['Instant booking confirmation', 'Real-time schedule management', 'Secure & fast login'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gold-500" />
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up glass-card p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <FiScissors size={18} className="text-dark-300" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Barber<span className="text-blue-600">X</span></span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white mb-1">Sign In</h1>
            <p className="text-gray-400 text-xs">Enter your credentials to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="glass-card p-4 mb-6 border border-gold-500/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[10px] text-gray-500 mb-3 font-semibold uppercase tracking-wider text-center">Demo Accounts</p>
            <div className="flex gap-2">
              {['admin', 'barber', 'customer'].map((role) => (
                <button
                  key={role}
                  id={`demo-${role}-btn`}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="flex-1 text-xs py-2 px-1 rounded-lg border border-white/5 bg-white/3 text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-all capitalize font-semibold"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="input-label">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="input-label">
                Password
              </label>

              <div className="relative">
                <FiLock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500/50 accent-gold-500"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-dark-300/30 border-t-dark-300 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
