import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import AppointmentCard from '../../components/customer/AppointmentCard';
import Loader from '../../components/common/Loader';
import { useAppointments } from '../../hooks/useAppointments';
import { Link } from 'react-router-dom';
import { FiPlusCircle, FiFilter } from 'react-icons/fi';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const MyAppointments = () => {
  const { appointments, loading, updateStatus, submitReview } = useAppointments('customer');
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">My Appointments</h1>
              <p className="text-gray-400 mt-1">{appointments.length} total appointments</p>
            </div>
            <Link to="/customer/book" id="new-appt-btn" className="btn-gold">
              <FiPlusCircle size={16} /> Book New
            </Link>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap mb-8">
            {STATUSES.map((s) => (
              <button
                key={s}
                id={`filter-${s}`}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                  filter === s
                    ? 'bg-gold-gradient text-dark-300'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s} {s !== 'all' && `(${appointments.filter(a => a.status === s).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-white font-bold text-lg mb-2">
                {filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' ? 'Book your first appointment with one of our expert barbers' : `You don't have any ${filter} appointments`}
              </p>
              {filter === 'all' && (
                <Link to="/customer/book" className="btn-gold">
                  <FiPlusCircle size={16} /> Book Now
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
              {filtered.map((appt) => (
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
  );
};

export default MyAppointments;
