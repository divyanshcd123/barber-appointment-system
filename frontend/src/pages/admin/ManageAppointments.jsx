import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiCalendar, FiClock, FiXCircle, FiSliders, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Cancel modal state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await api.get('/appointments', { params });
      setAppointments(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
    setCancelReason('');
    setShowCancel(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await api.put(`/appointments/${cancelId}/status`, {
        status: 'cancelled',
        cancellationReason: cancelReason,
      });
      toast.success('Appointment cancelled successfully');
      setShowCancel(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-8 animate-in">
            <h1 className="text-3xl font-black text-white">Manage Appointments</h1>
            <p className="text-gray-400 mt-1">{total} total appointments in the system</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="appt-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or barber name..."
                className="input-field pl-11"
              />
            </form>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  id={`status-filter-${status}`}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-gold-gradient text-dark-300 shadow-gold'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments Table Card */}
          <div className="glass-card overflow-hidden animate-in">
            {loading ? (
              <div className="flex justify-center py-20"><Loader size="lg" /></div>
            ) : appointments.length === 0 ? (
              <div className="py-20 text-center text-gray-500">No appointments found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-gray-400 font-medium py-4 px-5">Date & Time</th>
                      <th className="text-left text-gray-400 font-medium py-4 px-5">Customer</th>
                      <th className="text-left text-gray-400 font-medium py-4 px-5">Barber</th>
                      <th className="text-left text-gray-400 font-medium py-4 px-5">Service</th>
                      <th className="text-left text-gray-400 font-medium py-4 px-5">Status</th>
                      <th className="text-right text-gray-400 font-medium py-4 px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="text-white font-medium flex items-center gap-1">
                              <FiCalendar size={12} className="text-gold-500" />
                              {format(new Date(appt.date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                              <FiClock size={11} /> {appt.time}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{appt.customer?.name || 'Anonymous'}</span>
                            <span className="text-gray-500 text-xs">{appt.customer?.phone || 'No phone'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-white font-medium">{appt.barber?.barberName || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{appt.service?.name || 'N/A'}</span>
                            <span className="text-gold-500 text-xs font-bold">₹{appt.service?.price || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={STATUS_BADGE[appt.status] || 'badge-pending'}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          {['pending', 'confirmed'].includes(appt.status) && (
                            <button
                              id={`admin-cancel-appt-${appt._id}`}
                              onClick={() => handleCancelClick(appt._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:text-red-300 text-xs font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <FiXCircle size={12} /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && total > 15 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-gray-400 text-sm">
                Page {page} of {Math.ceil(total / 15)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 15 >= total}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Reason Modal */}
      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)} title="Cancel Appointment" size="sm">
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-gray-400 text-sm">
            Please enter a reason for cancelling this appointment. This will be visible to both customer and barber.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            rows={3}
            placeholder="e.g. Schedule adjustment, shop closure..."
            className="input-field resize-none text-sm"
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCancel(false)} className="btn-outline flex-1 justify-center">
              Keep It
            </button>
            <button
              id="confirm-admin-cancel-btn"
              type="submit"
              disabled={cancelling || !cancelReason.trim()}
              className="btn-danger flex-1 justify-center"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAppointments;
