import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiScissors, FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const ROLES = [
  { value: 'customer', label: 'Customer', desc: 'Book appointments', icon: '👤' },
  { value: 'barber', label: 'Barber', desc: 'Manage my schedule', icon: '✂️' },
];

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [showPwd, setShowPwd] = useState(false);

  const getDashboardPath = (role) => {
    const paths = { customer: '/customer', barber: '/barber' };
    return paths[role] || '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) navigate(getDashboardPath(result.user.role));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-outfit" style={{
      background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.05) 0%, transparent 50%), linear-gradient(180deg, #121214 0%, #1A1A1E 100%)',
    }}>
      <div className="w-full max-w-lg animate-slide-up glass-card p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <FiScissors size={20} className="text-dark-300" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Barber<span className="text-blue-600">X</span></span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm">Join BarberX today — it's free</p>
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <p className="input-label">I am a...</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.value}
                id={`role-${role.value}-btn`}
                type="button"
                onClick={() => setForm({ ...form, role: role.value })}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  form.role === role.value
                    ? 'border-gold-500/50 bg-gold-500/10 shadow-gold'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}
              >
                <span className="text-xl block mb-1">{role.icon}</span>
                <p className={`font-semibold text-sm ${form.role === role.value ? 'text-gold-500' : 'text-white'}`}>
                  {role.label}
                </p>
                <p className="text-gray-500 text-xs">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="input-label">Full Name</label>
            <div className="relative">
              <FiUser size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="input-label">Email Address</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-phone" className="input-label">Phone Number <span className="text-gray-500">(optional)</span></label>
            <div className="relative">
              <FiPhone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="input-label">Password</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="input-field pl-11 pr-11"
                required
                minLength={6}
                autoComplete="new-password"
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

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center py-4 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-dark-300/30 border-t-dark-300 animate-spin" />
                Creating account...
              </span>
            ) : (
              <>Create Account <FiArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
