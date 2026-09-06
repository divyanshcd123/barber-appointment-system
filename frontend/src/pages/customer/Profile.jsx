import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import { FiUser, FiPhone, FiLock, FiMail, FiCheck } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    const result = await updateProfile(payload);
    if (result.success) {
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md px-4 py-8 animate-in">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
            <h1 className="text-3xl font-black text-white mb-2 text-center">Edit Profile</h1>
            <p className="text-gray-400 text-sm text-center mb-8">Update your personal information</p>

            {error && (
              <div className="p-3 mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="input-label" htmlFor="profile-name">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiUser size={16} /></span>
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field pl-11"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="input-label" htmlFor="profile-email">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><FiMail size={16} /></span>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="input-field pl-11 bg-white/5 border-white/5 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="input-label" htmlFor="profile-phone">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiPhone size={16} /></span>
                  <input
                    id="profile-phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs text-gold-500 font-semibold mb-3">Change Password (optional)</p>
              </div>

              {/* Password */}
              <div>
                <label className="input-label" htmlFor="profile-password">New Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiLock size={16} /></span>
                  <input
                    id="profile-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="input-label" htmlFor="profile-confirm-password">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiLock size={16} /></span>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="update-profile-btn"
                type="submit"
                disabled={loading}
                className="btn-gold w-full justify-center mt-6"
              >
                {loading ? <Loader size="sm" /> : <>Save Changes <FiCheck size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
