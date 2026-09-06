import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiSave, FiClock, FiCalendar, FiUser, FiPhone, FiMapPin, FiScissors, FiUpload, FiStar } from 'react-icons/fi';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ManageSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    barberName: '',
    phone: '',
    experience: 0,
    specialization: '',
    shopLocation: '',
    availableDays: [],
    startTime: '09:00',
    endTime: '18:00',
    profileImage: '',
  });

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      api.get(`/barbers/${user._id}`)
        .then(({ data }) => {
          const prof = data.data;
          const timeParts = (prof.availableTime || '09:00 - 18:00').split('-');
          const start = timeParts[0]?.trim() || '09:00';
          const end = timeParts[1]?.trim() || '18:00';

          setForm({
            barberName: prof.barberName || user.name || '',
            phone: user.phone || '',
            experience: prof.experience || 0,
            specialization: prof.specialization || '',
            shopLocation: prof.shopLocation || '',
            availableDays: prof.availableDays || [],
            startTime: start,
            endTime: end,
            profileImage: prof.profileImage || '',
          });
        })
        .catch(() => {
          // Fallback if Barber profile does not exist yet
          setForm({
            barberName: user.name || '',
            phone: user.phone || '',
            experience: 0,
            specialization: '',
            shopLocation: '',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '18:00',
            profileImage: '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const toggleDay = (day) => {
    const updated = form.availableDays.includes(day)
      ? form.availableDays.filter((d) => d !== day)
      : [...form.availableDays, day];
    setForm({ ...form, availableDays: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        barberName: form.barberName,
        experience: Number(form.experience),
        specialization: form.specialization,
        profileImage: form.profileImage,
        availableDays: form.availableDays,
        availableTime: `${form.startTime} - ${form.endTime}`,
        shopLocation: form.shopLocation,
        phone: form.phone,
      };

      await api.put('/barbers/profile', payload);
      toast.success('Profile and schedule updated successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper font-outfit">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-10 animate-in">
          <h1 className="text-3xl font-black text-white mb-2">Manage Profile & Schedule</h1>
          <p className="text-gray-400 mb-8">Update your profile info, shop location, and availability schedule</p>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Top row: Profile image and basic info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Upload Card */}
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                <div className="relative group mb-4">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Barber profile"
                      className="w-32 h-32 rounded-3xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-gold-gradient flex items-center justify-center text-5xl font-bold text-dark-300 shadow-gold">
                      {form.barberName?.charAt(0)}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-all duration-200">
                    <FiUpload size={20} className="mb-1" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-white font-bold text-sm">Profile Image</p>
                <p className="text-gray-500 text-xs mt-1">Accepts PNG, JPG under 2MB</p>
              </div>

              {/* Basic Fields */}
              <div className="glass-card p-6 md:col-span-2 space-y-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2 border-b border-white/5 pb-2">
                  <FiUser size={16} className="text-gold-500" /> Basic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label" htmlFor="barber-name-input">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiUser size={14} /></span>
                      <input
                        id="barber-name-input"
                        type="text"
                        value={form.barberName}
                        onChange={(e) => setForm({ ...form, barberName: e.target.value })}
                        required
                        className="input-field pl-10 text-sm"
                        placeholder="Marcus Johnson"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="barber-phone-input">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiPhone size={14} /></span>
                      <input
                        id="barber-phone-input"
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field pl-10 text-sm"
                        placeholder="+1-555-0101"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties, Experience, and Location */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <FiScissors size={16} className="text-gold-500" /> Specialties & Shop
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label" htmlFor="barber-specialization">Specialization (comma-separated)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiScissors size={14} /></span>
                    <input
                      id="barber-specialization"
                      type="text"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      placeholder="Fade, Beard Trim, Hot Towel Shave"
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label" htmlFor="barber-experience">Experience (Years)</label>
                  <input
                    id="barber-experience"
                    type="number"
                    min={0}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="input-label" htmlFor="barber-shop-location">Shop Location</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiMapPin size={14} /></span>
                    <input
                      id="barber-shop-location"
                      type="text"
                      value={form.shopLocation}
                      onChange={(e) => setForm({ ...form, shopLocation: e.target.value })}
                      placeholder="123 Barber Shop Lane, Downtown"
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Time */}
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <FiClock size={16} className="text-gold-500" /> Working Hours
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label" htmlFor="barber-start-time">Start Time</label>
                    <input
                      id="barber-start-time"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="input-label" htmlFor="barber-end-time">End Time</label>
                    <input
                      id="barber-end-time"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <FiCalendar size={16} className="text-gold-500" /> Available Days
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAYS.map((day) => {
                    const active = form.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        id={`day-${day.toLowerCase()}`}
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-gold-gradient text-dark-300 shadow-gold'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              id="save-barber-profile-btn"
              type="submit"
              disabled={saving}
              className="btn-gold w-full justify-center py-4 text-base shadow-gold mt-4"
            >
              {saving ? 'Saving...' : <><FiSave size={18} /> Save Profile & Schedule</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;
