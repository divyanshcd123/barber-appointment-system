import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import UserTable from '../../components/admin/UserTable';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

const ManageBarbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bio: '', specialties: '', experience: 0 });
  const [saving, setSaving] = useState(false);

  const fetchBarbers = async () => {
    const { data } = await api.get('/admin/users?role=barber');
    setBarbers(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchBarbers(); }, []);

  const filtered = barbers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/barbers', {
        ...form,
        specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(form.experience),
      });
      toast.success('Barber added!');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', phone: '', bio: '', specialties: '', experience: 0 });
      fetchBarbers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add barber');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    fetchBarbers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this barber?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('Barber deleted');
    fetchBarbers();
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8 animate-in">
            <div>
              <h1 className="text-3xl font-black text-white">Manage Barbers</h1>
              <p className="text-gray-400 mt-1">{barbers.length} barbers registered</p>
            </div>
            <button id="add-barber-btn" onClick={() => setShowAdd(true)} className="btn-gold">
              <FiPlus size={16} /> Add Barber
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="barber-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search barbers..."
              className="input-field pl-11"
            />
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><Loader size="lg" /></div>
            ) : (
              <UserTable users={filtered} onToggle={handleToggle} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>

      {/* Add barber modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Barber" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Name" className="input-field" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="email@shop.com" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} placeholder="Min 6 chars" className="input-field" />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={2} placeholder="Brief description..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Specialties (comma-separated)</label>
              <input value={form.specialties} onChange={e => setForm({...form, specialties: e.target.value})} placeholder="Fade, Beard, Classic" className="input-field" />
            </div>
            <div>
              <label className="input-label">Years Experience</label>
              <input type="number" min={0} value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button id="add-barber-submit" type="submit" disabled={saving} className="btn-gold flex-1 justify-center">
              {saving ? 'Adding...' : 'Add Barber'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageBarbers;
