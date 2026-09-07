import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BarberCard from '../../components/customer/BarberCard';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowRight, FiArrowLeft, FiCheck, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const STEPS = ['Service', 'Barber', 'Date & Time', 'Confirm'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createAppointment } = useAppointments('customer');

  const queryParams = new URLSearchParams(location.search);
  const queryBarberId = queryParams.get('barber');
  const queryServiceId = queryParams.get('service');

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Razorpay simulation state
  const [mockOrder, setMockOrder] = useState(null);
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const [selected, setSelected] = useState({
    service: null,
    barber: null,
    date: '',
    time: '',
    notes: '',
    paymentMethod: 'cash', // 'cash' or 'razorpay'
  });

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // Load services and auto-select query service
  useEffect(() => {
    api.get('/services').then(({ data }) => {
      setServices(data.data);
      if (queryServiceId) {
        const match = data.data.find(s => s._id === queryServiceId);
        if (match) {
          setSelected(prev => ({ ...prev, service: match }));
          setStep(1); // Advance to Barber step
        }
      }
    });
  }, [queryServiceId]);

  // Load barbers and auto-select query barber
  useEffect(() => {
    if (step === 1 || queryBarberId) {
      api.get('/barbers').then(({ data }) => {
        setBarbers(data.data);
        if (queryBarberId) {
          const match = data.data.find(b => b._id === queryBarberId);
          if (match) {
            setSelected(prev => ({ ...prev, barber: match }));
          }
        }
      });
    }
  }, [step, queryBarberId]);

  // Load slots when date changes
  useEffect(() => {
    if (selected.barber && selected.date) {
      setLoading(true);
      api.get(`/barbers/${selected.barber._id}/slots?date=${selected.date}`)
        .then(({ data }) => setSlots(data.data))
        .finally(() => setLoading(false));
    }
  }, [selected.barber, selected.date]);

  const handleBook = async () => {
    setLoading(true);

    if (selected.paymentMethod === 'razorpay') {
      try {
        // 1. Create Razorpay order on backend
        const { data: orderRes } = await api.post('/payments/order', { amount: selected.service.price });
        const order = orderRes.data;

        // Check if in simulation mode
        if (order.mock) {
          setMockOrder(order);
          setShowMockPaymentModal(true);
          setLoading(false);
          return;
        }

        // 2. Load Razorpay live overlay checkout dialog
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_mockKey',
          amount: order.amount,
          currency: order.currency,
          name: 'BarberX',
          description: selected.service.name,
          order_id: order.id,
          handler: async (response) => {
            setLoading(true);
            const result = await createAppointment({
              barberId: selected.barber._id,
              serviceId: selected.service._id,
              date: selected.date,
              time: selected.time,
              notes: selected.notes,
              paymentMethod: 'razorpay',
              paymentStatus: 'paid',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setLoading(false);
            if (result.success) navigate('/customer/appointments');
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
          },
          theme: { color: '#D4AF37' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error('Failed to initialize Razorpay checkout. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Cash flow
    const result = await createAppointment({
      barberId: selected.barber._id,
      serviceId: selected.service._id,
      date: selected.date,
      time: selected.time,
      notes: selected.notes,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
    });
    setLoading(false);
    if (result.success) navigate('/customer/appointments');
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      // Generate simulated IDs
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
      const mockSignature = `sig_${Math.random().toString(36).substring(2, 10)}`;

      const result = await createAppointment({
        barberId: selected.barber._id,
        serviceId: selected.service._id,
        date: selected.date,
        time: selected.time,
        notes: selected.notes,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        razorpayOrderId: mockOrder.id,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
      });

      setShowMockPaymentModal(false);
      if (result.success) {
        toast.success('Simulated payment successful! 🎉');
        navigate('/customer/appointments');
      }
    } catch (err) {
      toast.error('Simulated payment failed');
    } finally {
      setSimulating(false);
    }
  };

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  const CATEGORY_ICONS = { haircut: '✂️', beard: '🧔', combo: '⭐', treatment: '🌿', other: '💈' };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-white mb-2">Book Appointment</h1>
          <p className="text-gray-400 mb-8">Follow the steps to schedule your visit</p>

          {/* Progress bar */}
          <div className="glass-card p-4 mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      i < step ? 'bg-gold-gradient text-dark-300' :
                      i === step ? 'bg-gold-500/20 border-2 border-gold-500 text-gold-500' :
                      'bg-white/5 text-gray-500'
                    }`}>
                      {i < step ? <FiCheck size={16} /> : i + 1}
                    </div>
                    <p className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-gold-500' : i < step ? 'text-gray-300' : 'text-gray-600'}`}>
                      {s}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 transition-all duration-300 ${i < step ? 'bg-gold-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 0: Service */}
          {step === 0 && (
            <div className="space-y-4 animate-in">
              <h2 className="text-xl font-bold text-white mb-5">Select a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                {services.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => setSelected({ ...selected, service })}
                    className={`glass-card p-5 cursor-pointer flex items-center justify-between border-2 transition-all duration-300 hover:border-gold-500/30 ${
                      selected.service?._id === service._id ? 'border-gold-500/60 shadow-gold' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                        {CATEGORY_ICONS[service.category] || '💈'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{service.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{service.duration} mins</p>
                      </div>
                    </div>
                    <p className="text-gold-500 font-bold text-sm">₹{service.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Barber */}
          {step === 1 && (
            <div className="animate-in">
              <h2 className="text-xl font-bold text-white mb-5">Choose a Barber</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
                {barbers.map((barber) => (
                  <BarberCard
                    key={barber._id}
                    barber={barber}
                    selected={selected.barber?._id === barber._id}
                    onSelect={(b) => setSelected({ ...selected, barber: b })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="animate-in">
              <h2 className="text-xl font-bold text-white mb-5">Pick Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Select Date</label>
                  <input
                    id="date-picker"
                    type="date"
                    min={today}
                    value={selected.date}
                    onChange={(e) => setSelected({ ...selected, date: e.target.value, time: '' })}
                    className="input-field"
                  />
                </div>

                {selected.date && (
                  <div>
                    <label className="input-label">Available Slots</label>
                    {loading ? (
                      <div className="flex justify-center py-6"><Loader /></div>
                    ) : slots.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No slots available for this date. Try another day.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            id={`slot-${slot}`}
                            onClick={() => setSelected({ ...selected, time: slot })}
                            className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              selected.time === slot
                                ? 'bg-gold-gradient text-dark-300 shadow-gold'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="input-label">Notes (optional)</label>
                <textarea
                  value={selected.notes}
                  onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                  placeholder="Any special requests or preferences..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Payment */}
          {step === 3 && (
            <div className="animate-in space-y-6">
              <h2 className="text-xl font-bold text-white">Confirm & Pay</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Confirmation Details */}
                <div className="glass-card p-6 border-gold-500/20 lg:col-span-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient rounded-t-2xl" />
                  <div className="space-y-4">
                    {[
                      { label: 'Service', value: selected.service?.name },
                      { label: 'Duration', value: `${selected.service?.duration} minutes` },
                      { label: 'Barber', value: selected.barber?.barberName },
                      { label: 'Date', value: new Date(selected.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                      { label: 'Time', value: selected.time },
                      { label: 'Price', value: `₹${selected.service?.price}`, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-gray-400">{label}</span>
                        <span className={highlight ? 'text-gold-500 font-bold text-lg' : 'text-white font-medium'}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {selected.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5">
                      <p className="text-gray-500 text-xs mb-1">Notes</p>
                      <p className="text-gray-300 text-sm">{selected.notes}</p>
                    </div>
                  )}
                </div>

                {/* Payment Selection Box */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-white font-bold text-sm">Select Payment Method</h3>
                  <div className="flex flex-col gap-3">
                    {/* Cash */}
                    <button
                      type="button"
                      id="payment-cash-btn"
                      onClick={() => setSelected({ ...selected, paymentMethod: 'cash' })}
                      className={`p-4 rounded-xl border text-left flex flex-col transition-all ${
                        selected.paymentMethod === 'cash'
                          ? 'border-gold-500/60 bg-gold-500/10'
                          : 'border-white/5 bg-white/3 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-white font-bold text-sm flex items-center gap-1.5">
                        💵 Pay at Salon
                      </span>
                      <span className="text-gray-500 text-[10px] mt-1">Pay with Cash/Card after cut</span>
                    </button>

                    {/* Razorpay */}
                    <button
                      type="button"
                      id="payment-razorpay-btn"
                      onClick={() => setSelected({ ...selected, paymentMethod: 'razorpay' })}
                      className={`p-4 rounded-xl border text-left flex flex-col transition-all ${
                        selected.paymentMethod === 'razorpay'
                          ? 'border-gold-500/60 bg-gold-500/10'
                          : 'border-white/5 bg-white/3 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-white font-bold text-sm flex items-center gap-1.5">
                        💳 Pay Now (Razorpay)
                      </span>
                      <span className="text-gray-500 text-[10px] mt-1">Instant card, UPI, NetBanking</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <button
              id="prev-step-btn"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiArrowLeft size={16} /> Previous
            </button>
            <span className="text-gray-500 text-sm">Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button
                id="next-step-btn"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !selected.service) ||
                  (step === 1 && !selected.barber) ||
                  (step === 2 && (!selected.date || !selected.time))
                }
                className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <FiArrowRight size={16} />
              </button>
            ) : (
              <button
                id="confirm-booking-btn"
                onClick={handleBook}
                disabled={loading}
                className="btn-gold"
              >
                {loading ? 'Processing...' : selected.paymentMethod === 'razorpay' ? 'Pay & Confirm' : 'Confirm Booking'}
                {!loading && <FiCheck size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Razorpay Payment Gateway Modal */}
      <Modal isOpen={showMockPaymentModal} onClose={() => setShowMockPaymentModal(false)} title="Razorpay Secure Sandbox Payment" size="sm">
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto text-gold-500 mb-2">
            <FiCreditCard size={28} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Razorpay Checkout</h3>
            <p className="text-gray-500 text-xs mt-1">Simulated Secure Gateway for testing</p>
          </div>

          <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Order ID:</span>
              <span className="text-white font-mono font-medium">{mockOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pay To:</span>
              <span className="text-slate-900 font-medium">BarberX Salon</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 mt-2 font-bold text-sm">
              <span className="text-white">Amount:</span>
              <span className="text-gold-500">₹{selected.service?.price}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowMockPaymentModal(false)}
              className="btn-outline flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              id="simulate-payment-success-btn"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="btn-gold flex-1 justify-center"
            >
              {simulating ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookAppointment;
