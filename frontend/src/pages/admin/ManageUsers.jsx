import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import UserTable from '../../components/admin/UserTable';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter } from 'react-icons/fi';

const ROLE_FILTERS = ['all', 'customer', 'barber'];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    toast.success('Status updated');
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-8 animate-in">
            <h1 className="text-3xl font-black text-white">Manage Users</h1>
            <p className="text-gray-400 mt-1">{total} total users</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1">
              <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="user-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="input-field pl-11"
              />
            </form>
            <div className="flex gap-2">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r}
                  id={`role-filter-${r}`}
                  onClick={() => { setRoleFilter(r); setPage(1); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    roleFilter === r ? 'bg-gold-gradient text-dark-300' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden animate-in">
            {loading ? (
              <div className="flex justify-center py-16"><Loader size="lg" /></div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-gray-500">No users found</div>
            ) : (
              <UserTable users={users} onToggle={handleToggle} onDelete={handleDelete} />
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30">← Prev</button>
              <span className="flex items-center px-4 text-gray-400 text-sm">Page {page}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page*20 >= total}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
