import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import Navbar from '../../components/common/Navbar';
import AppointmentCard from '../../components/customer/AppointmentCard';
import Loader from '../../components/common/Loader';
import { FiCalendar, FiClock, FiCheckCircle, FiPlusCircle, FiScissors, FiCpu, FiUser, FiArrowRight } from 'react-icons/fi';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading, updateStatus, submitReview } = useAppointments('customer');

  const upcoming = appointments.filter(a => ['pending','confirmed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const pending = appointments.filter(a => a.status === 'pending');

  const nextAppt = upcoming.sort((a,b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Welcome header with dynamic banner */}
          <div className="glass-card p-8 mb-10 border border-white/5 relative overflow-hidden animate-in">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-5 bg-gold-500 blur-2xl" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <span className="text-xs text-gold-500 font-bold uppercase tracking-widest">Dashboard Hub</span>
                <h1 className="text-3xl font-black text-white mt-1 mb-2">
                  Welcome back, <span className="text-gold-gradient">{user?.name?.split(' ')[0]} 👋</span>
                </h1>
                <p className="text-gray-400 text-sm">Review your active grooming schedules and book your next appointment.</p>
              </div>
              <Link to="/customer/book" className="btn-gold shadow-gold shrink-0">
                <FiPlusCircle size={18} /> Book New Appointment
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger">
            {[
              { label: 'Upcoming', value: upcoming.length, icon: FiCalendar, color: 'text-blue-400' },
              { label: 'Pending', value: pending.length, icon: FiClock, color: 'text-yellow-400' },
              { label: 'Completed', value: completed.length, icon: FiCheckCircle, color: 'text-green-400' },
              { label: 'Total', value: appointments.length, icon: FiScissors, color: 'text-gold-500' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5 animate-in">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Two-Column split: Next Appointment & Studio Hub Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Next Appointment Card (Left Column) */}
            {nextAppt ? (
              <div className="glass-card p-6 border-gold-500/20 relative overflow-hidden flex flex-col justify-between min-h-[220px] animate-in lg:col-span-1">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
                <div>
                  <p className="text-gold-500 text-[10px] font-bold uppercase tracking-wider mb-2">Upcoming Cut</p>
                  <h3 className="text-white text-lg font-bold truncate">{nextAppt.barber?.barberName}</h3>
                  <p className="text-gray-400 text-xs mt-1">{nextAppt.service?.name}</p>
                  <p className="text-gold-500 text-xs mt-3 font-semibold">
                    📅 {new Date(nextAppt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {nextAppt.time}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-gray-500">Price: <b className="text-gold-500 font-bold">₹{nextAppt.totalPrice}</b></span>
                  <span className="text-xs text-gold-500 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/customer/appointments')}>View Details</span>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 border-white/5 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[220px] animate-in lg:col-span-1">
                <div className="text-3xl mb-3">💈</div>
                <h3 className="text-white font-bold text-sm">No Active Booking</h3>
                <p className="text-gray-500 text-xs mt-1 max-w-[200px]">Keep your hair looking fresh and clean!</p>
                <Link to="/customer/book" className="text-xs text-gold-500 font-bold hover:underline mt-4">Book Slot Now →</Link>
              </div>
            )}

            {/* Style Studio Actions Hub (Right Columns) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/customer/ai-assistant" className="glass-card-hover p-5 flex flex-col justify-between group min-h-[105px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                      <FiCpu size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">AI Style Recommender</h4>
                      <p className="text-gray-500 text-[10px] mt-0.5">Find cuts matching your face shape</p>
                    </div>
                  </div>
                </div>
                <span className="text-gold-500 text-[10px] font-semibold mt-3 flex items-center gap-1">Open Recommender <FiArrowRight size={10} /></span>
              </Link>

              <Link to="/customer/appointments" className="glass-card-hover p-5 flex flex-col justify-between group min-h-[105px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                      <FiCalendar size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">My Bookings & History</h4>
                      <p className="text-gray-500 text-[10px] mt-0.5">View your active and past appointments</p>
                    </div>
                  </div>
                </div>
                <span className="text-gold-500 text-[10px] font-semibold mt-3 flex items-center gap-1">Manage Schedules <FiArrowRight size={10} /></span>
              </Link>

              <Link to="/customer/barbers" className="glass-card-hover p-5 flex flex-col justify-between group min-h-[105px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                      <FiScissors size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Elite Barbers List</h4>
                      <p className="text-gray-500 text-[10px] mt-0.5">Meet Habib, Aalim, and Vikas</p>
                    </div>
                  </div>
                </div>
                <span className="text-gold-500 text-[10px] font-semibold mt-3 flex items-center gap-1">View Barber Roster <FiArrowRight size={10} /></span>
              </Link>

              <Link to="/profile" className="glass-card-hover p-5 flex flex-col justify-between group min-h-[105px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                      <FiUser size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Manage Profile</h4>
                      <p className="text-gray-500 text-[10px] mt-0.5">Configure account contact settings</p>
                    </div>
                  </div>
                </div>
                <span className="text-gold-500 text-[10px] font-semibold mt-3 flex items-center gap-1">Edit Account <FiArrowRight size={10} /></span>
              </Link>
            </div>
          </div>

          {/* Recent appointments */}
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Recent Appointments</h2>
            {loading ? (
              <div className="flex justify-center py-12"><Loader size="lg" /></div>
            ) : appointments.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">✂️</div>
                <h3 className="text-white font-bold text-lg mb-2">No appointments yet</h3>
                <p className="text-gray-400 mb-6">Book your first appointment and experience the BarberElite difference</p>
                <Link to="/customer/book" className="btn-gold">
                  <FiPlusCircle size={16} /> Book Your First Cut
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                {appointments.slice(0, 6).map((appt) => (
                  <div key={appt._id} className="animate-in">
                    <AppointmentCard
                      appointment={appt}
                      onCancel={(id) => updateStatus(id, 'cancelled')}
                      onReview={submitReview}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
