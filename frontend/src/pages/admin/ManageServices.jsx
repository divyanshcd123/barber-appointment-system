import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiScissors } from 'react-icons/fi';

const CATEGORIES = ['haircut', 'beard', 'combo', 'treatment', 'other'];
const CATEGORY_ICONS = { haircut: '✂️', beard: '🧔', combo: '⭐', treatment: '🌿', other: '💈' };

const emptyForm = { name: '', description: '', duration: 30, price: 25, category: 'haircut' };

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    const { data } = await api.get('/services');
    setServices(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (svc) => { setForm({ name: svc.name, description: svc.description, duration: svc.duration, price: svc.price, category: svc.category }); setEditingId(svc._id); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, form);
        toast.success('Service updated');
      } else {
        await api.post('/services', form);
        toast.success('Service created');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`);
    toast.success('Service removed');
    fetchServices();
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8 animate-in">
            <div>
              <h1 className="text-3xl font-black text-white">Manage Services</h1>
              <p className="text-gray-400 mt-1">{services.length} active services</p>
            </div>
            <button id="add-service-btn" onClick={openAdd} className="btn-gold">
              <FiPlus size={16} /> Add Service
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
              {services.map((svc) => (
                <div key={svc._id} className="glass-card p-5 group hover:border-gold-500/20 transition-all animate-in">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{CATEGORY_ICONS[svc.category]}</span>
                      <div>
                        <h3 className="text-white font-semibold">{svc.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5 mb-3 line-clamp-2">{svc.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gold-500 font-bold">₹{svc.price}</span>
                          <span className="text-gray-500">{svc.duration} min</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">{svc.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button id={`edit-svc-${svc._id}`} onClick={() => openEdit(svc)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gold-500 transition-all">
                        <FiEdit2 size={14} />
                      </button>
                      <button id={`del-svc-${svc._id}`} onClick={() => handleDelete(svc._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Service' : 'Add Service'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="input-label">Service Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Classic Haircut" className="input-field" />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-field resize-none" placeholder="Short description..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Price (₹)</label>
              <input type="number" min={0} value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="input-field" />
            </div>
            <div>
              <label className="input-label">Duration (min)</label>
              <input type="number" min={5} value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required className="input-field" />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-50 capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button id="save-service-btn" type="submit" disabled={saving} className="btn-gold flex-1 justify-center">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageServices;
