import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import AppointmentItem from '../../components/barber/AppointmentItem';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FiCalendar, FiClock, FiDollarSign, FiCheckCircle, FiStar, FiTrendingUp, FiUser, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const TABS = ['appointments', 'earnings', 'reviews'];
const APPT_SUB_TABS = ['today', 'upcoming', 'completed'];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} size={14} className={rating >= s ? 'text-gold-500 fill-current' : 'text-gray-600'} />
    ))}
  </div>
);

const BarberDashboard = () => {
  const { user } = useAuth();
  const { appointments, loading, fetchAppointments, updateStatus } = useAppointments('barber');
  const [barberProfile, setBarberProfile] = useState(null);
  
  // Navigation & filtering state
  const [activeTab, setActiveTab] = useState('appointments');
  const [apptSubTab, setApptSubTab] = useState('today');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelApptId, setCancelApptId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (user?._id) {
      api.get(`/barbers/${user._id}`).then(({ data }) => {
        setBarberProfile(data.data);
      });
    }
  }, [user]);

  // Appointment filters
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.date).toISOString().split('T')[0];
    return d === todayStr && ['pending', 'confirmed'].includes(a.status);
  });

  const upcomingAppts = appointments.filter((a) => {
    const d = new Date(a.date).toISOString().split('T')[0];
    const isFuture = d > todayStr || (d === todayStr && a.status === 'confirmed');
    return isFuture && ['pending', 'confirmed'].includes(a.status);
  });

  const completedAppts = appointments.filter((a) => a.status === 'completed');

  // Stats calculation
  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: completedAppts.length,
    revenue: completedAppts.reduce((sum, a) => sum + (a.totalPrice || 0), 0),
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (apptId) => {
    setCancelApptId(apptId);
    setCancellationReason('');
    setCancelModalOpen(true);
  };

  // Confirm cancel action
  const handleConfirmCancel = async () => {
    if (cancelApptId) {
      await updateStatus(cancelApptId, 'cancelled', cancellationReason);
      setCancelModalOpen(false);
      setCancelApptId(null);
    }
  };

  // Earnings calculations (grouped by month/week for visualization)
  const getMonthlyEarnings = () => {
    const monthly = {};
    completedAppts.forEach((a) => {
      const month = format(new Date(a.date), 'MMM yyyy');
      monthly[month] = (monthly[month] || 0) + (a.totalPrice || 0);
    });
    return Object.entries(monthly).map(([label, value]) => ({ label, value })).reverse();
  };

  const monthlyEarnings = getMonthlyEarnings();
  const maxMonthly = Math.max(...monthlyEarnings.map((m) => m.value), 1);

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 animate-in">
          {/* Header Card */}
          <div className="glass-card p-6 mb-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 stagger">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
            
            {/* Barber info */}
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              {barberProfile?.profileImage ? (
                <img
                  src={barberProfile.profileImage}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center text-3xl font-black text-dark-300 shadow-gold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-white">
                  Welcome back, <span className="text-gold-gradient">{user?.name?.split(' ')[0]} 👋</span>
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">Shop Location: {barberProfile?.shopLocation || 'Main St. Barber Shop'}</p>
              </div>
            </div>

            {/* Rating display */}
            <div className="glass-card px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Rating</p>
                <p className="text-white text-lg font-black">{barberProfile?.rating?.toFixed(1) || '4.8'}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <StarRating rating={Math.round(barberProfile?.rating || 4.8)} />
                <p className="text-xs text-gray-500 mt-0.5">Based on {barberProfile?.reviewCount || 0} reviews</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending Bookings', value: stats.pending, icon: FiClock, color: 'text-yellow-400' },
              { label: 'Confirmed Cuts', value: stats.confirmed, icon: FiCalendar, color: 'text-blue-400' },
              { label: 'Completed Cuts', value: stats.completed, icon: FiCheckCircle, color: 'text-green-400' },
              { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: FiDollarSign, color: 'text-gold-500' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5 animate-in">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs font-semibold">{s.label}</p>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Main Tab Navigation */}
          <div className="flex gap-2 border-b border-white/5 mb-8 pb-px">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Appt Sub-Tabs */}
              <div className="flex gap-2 flex-wrap">
                {APPT_SUB_TABS.map((subTab) => {
                  const subCounts = {
                    today: todayAppts.length,
                    upcoming: upcomingAppts.length,
                    completed: completedAppts.length,
                  };
                  return (
                    <button
                      key={subTab}
                      id={`subtab-${subTab}`}
                      onClick={() => setApptSubTab(subTab)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 capitalize ${
                        apptSubTab === subTab
                          ? 'bg-gold-gradient text-dark-300 shadow-gold'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {subTab} ({subCounts[subTab]})
                    </button>
                  );
                })}
              </div>

              {/* Appointments List */}
              <div className="glass-card p-6 min-h-[300px]">
                {loading ? (
                  <div className="flex justify-center py-20"><Loader size="lg" /></div>
                ) : (
                  <>
                    {apptSubTab === 'today' && (
                      <div className="space-y-3">
                        <h3 className="text-white font-bold text-lg mb-4">Today's Schedule</h3>
                        {todayAppts.length === 0 ? (
                          <p className="text-gray-500 text-center py-12">No appointments scheduled for today.</p>
                        ) : (
                          todayAppts.map((appt) => (
                            <AppointmentItem
                              key={appt._id}
                              appointment={appt}
                              onStatusUpdate={(id, status) => {
                                if (status === 'cancelled') handleOpenCancelModal(id);
                                else updateStatus(id, status);
                              }}
                            />
                          ))
                        )}
                      </div>
                    )}

                    {apptSubTab === 'upcoming' && (
                      <div className="space-y-3">
                        <h3 className="text-white font-bold text-lg mb-4">Upcoming Appointments</h3>
                        {upcomingAppts.length === 0 ? (
                          <p className="text-gray-500 text-center py-12">No future appointments scheduled.</p>
                        ) : (
                          upcomingAppts.map((appt) => (
                            <AppointmentItem
                              key={appt._id}
                              appointment={appt}
                              onStatusUpdate={(id, status) => {
                                if (status === 'cancelled') handleOpenCancelModal(id);
                                else updateStatus(id, status);
                              }}
                            />
                          ))
                        )}
                      </div>
                    )}

                    {apptSubTab === 'completed' && (
                      <div className="space-y-3">
                        <h3 className="text-white font-bold text-lg mb-4">Completed Appointments</h3>
                        {completedAppts.length === 0 ? (
                          <p className="text-gray-500 text-center py-12">No completed appointments yet.</p>
                        ) : (
                          completedAppts.map((appt) => (
                            <AppointmentItem
                              key={appt._id}
                              appointment={appt}
                              onStatusUpdate={updateStatus}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Earnings Summary */}
          {activeTab === 'earnings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in">
              {/* Left stats */}
              <div className="glass-card p-6 space-y-6 md:col-span-1">
                <h3 className="text-white font-bold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
                  <FiTrendingUp className="text-gold-500" /> Earnings Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">Total Revenue</p>
                    <p className="text-gold-500 text-3xl font-black">₹{stats.revenue}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">Completed Bookings</p>
                    <p className="text-white text-3xl font-black">{stats.completed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">Average Ticket</p>
                    <p className="text-white text-3xl font-black">
                      ₹{stats.completed > 0 ? (stats.revenue / stats.completed).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Revenue Chart */}
              <div className="glass-card p-6 md:col-span-2 flex flex-col">
                <h3 className="text-white font-bold text-lg mb-6">Monthly Revenue Breakdown</h3>
                {monthlyEarnings.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    📈 Bookings and completed haircuts will show up here.
                  </div>
                ) : (
                  <div className="flex-1 flex items-end justify-between gap-4 h-64 pt-6 pb-2 px-4">
                    {monthlyEarnings.map((month) => {
                      const heightPercent = Math.max(10, (month.value / maxMonthly) * 80);
                      return (
                        <div key={month.label} className="flex-1 flex flex-col items-center group">
                          <span className="text-gold-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                            ₹{month.value}
                          </span>
                          <div
                            className="w-full bg-gold-gradient rounded-t-xl transition-all duration-500 group-hover:scale-y-105 origin-bottom shadow-gold"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-gray-400 text-xs mt-3 select-none text-center truncate w-full">
                            {month.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="glass-card p-6 min-h-[300px] animate-in">
              <h3 className="text-white font-bold text-lg mb-6">Reviews & Customer Feedback</h3>
              {!barberProfile?.reviews || barberProfile.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No reviews left for you yet.</p>
              ) : (
                <div className="space-y-4">
                  {barberProfile.reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                            <FiUser size={14} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{rev.customer?.name || 'Anonymous'}</p>
                            <p className="text-gray-500 text-[10px]">{format(new Date(rev.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      {rev.comment && (
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed bg-white/3 p-3 rounded-lg border border-white/5">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Decline/Cancel Appointment" size="sm">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Are you sure you want to cancel this appointment? Please state a reason for the customer:
          </p>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="e.g. Unforeseen schedule conflict, store is closing early..."
            rows={3}
            className="input-field resize-none text-sm"
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="btn-outline flex-1 justify-center"
            >
              Keep Appointment
            </button>
            <button
              id="confirm-cancel-appt-btn"
              onClick={handleConfirmCancel}
              disabled={!cancellationReason.trim()}
              className="btn-danger flex-1 justify-center text-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Yes, Cancel <FiXCircle size={14} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BarberDashboard;
