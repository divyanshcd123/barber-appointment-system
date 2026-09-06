import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import StatsCard from '../../components/admin/StatsCard';
import RevenueChart from '../../components/admin/RevenueChart';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { FiUsers, FiScissors, FiCalendar, FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-10 animate-in">
            <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
            <p className="text-gray-400">Complete overview of BarberElite operations</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
            <StatsCard label="Total Customers" value={stats?.totalCustomers ?? 0} icon={FiUsers} color="blue" />
            <StatsCard label="Total Barbers" value={stats?.totalBarbers ?? 0} icon={FiScissors} color="gold" />
            <StatsCard label="Total Appointments" value={stats?.totalAppointments ?? 0} icon={FiCalendar} color="purple" />
            <StatsCard label="Total Revenue" value={stats?.totalRevenue ?? 0} icon={FiDollarSign} color="green" prefix="₹" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatsCard label="Pending" value={stats?.pendingAppointments ?? 0} icon={FiClock} color="gold" />
            <StatsCard label="Completed" value={stats?.completedAppointments ?? 0} icon={FiCheckCircle} color="green" />
            <StatsCard label="Cancelled" value={stats?.cancelledAppointments ?? 0} icon={FiXCircle} color="red" />
          </div>

          {/* Revenue Chart + Recent Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart monthlyRevenue={stats?.monthlyRevenue || []} />
            </div>

            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {(stats?.recentAppointments || []).map((appt) => (
                  <div key={appt._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-xs font-bold text-dark-300 shrink-0">
                      {appt.customer?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{appt.customer?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{appt.service?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gold-500 text-sm font-bold">₹{appt.service?.price}</p>
                      <span className={`text-[10px] ${STATUS_BADGE[appt.status]}`}>{appt.status}</span>
                    </div>
                  </div>
                ))}
                {(!stats?.recentAppointments?.length) && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent appointments</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick nav cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 stagger">
            {[
              { label: 'Manage Barbers', desc: 'Add, edit, or remove barbers', to: '/admin/barbers', icon: FiScissors },
              { label: 'Manage Services', desc: 'Update your service catalog', to: '/admin/services', icon: FiCalendar },
              { label: 'Manage Appointments', desc: 'Overview and cancel bookings', to: '/admin/appointments', icon: FiClock },
              { label: 'Manage Users', desc: 'View and control user accounts', to: '/admin/users', icon: FiUsers },
            ].map((nav) => (
              <a key={nav.label} href={nav.to} className="glass-card-hover p-6 animate-in block">
                <nav.icon size={24} className="text-gold-500 mb-3" />
                <h4 className="text-white font-semibold mb-1">{nav.label}</h4>
                <p className="text-gray-400 text-sm">{nav.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
