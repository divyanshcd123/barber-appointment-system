import { format } from 'date-fns';
import { FiClock, FiScissors, FiUser, FiDollarSign, FiX, FiStar } from 'react-icons/fi';
import { useState } from 'react';
import Modal from '../common/Modal';

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const StarPicker = ({ rating, setRating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        onClick={() => setRating(s)}
        className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? 'text-gold-500' : 'text-gray-600'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const AppointmentCard = ({ appointment, onCancel, onReview }) => {
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { barber, service, date, time, status, totalPrice, paymentStatus, paymentMethod } = appointment;
  const appointmentDate = new Date(date);
  const isPast = appointmentDate < new Date();
  const canCancel = ['pending', 'confirmed'].includes(status) && !isPast;
  const canReview = status === 'completed';

  return (
    <>
      <div className="glass-card p-5 relative overflow-hidden group hover:border-gold-500/20 transition-all duration-300">
        {/* Status accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
          status === 'completed' ? 'bg-green-500' :
          status === 'confirmed' ? 'bg-blue-500' :
          status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />

        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-sm font-bold text-dark-300 shrink-0">
                {barber?.barberName?.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{barber?.barberName}</p>
                <p className="text-gray-400 text-xs">{service?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 col-span-2">
                <FiClock size={11} className="text-gold-500/70" />
                <span>{format(new Date(date), 'MMM d, yyyy')} at {time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiScissors size={11} className="text-gold-500/70" />
                <span>{service?.duration} min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiDollarSign size={11} className="text-gold-500/70" />
                <span className="text-gold-500 font-medium">₹{totalPrice}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 border-t border-white/5 pt-1.5 mt-0.5">
                <span className="text-gray-500">Payment:</span>
                <span className={`font-semibold capitalize ${paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-500'}`}>
                  {paymentStatus} ({paymentMethod || 'cash'})
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={STATUS_BADGE[status] || 'badge-pending'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {canCancel && (
              <button
                id={`cancel-btn-${appointment._id}`}
                onClick={() => setShowCancel(true)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <FiX size={12} /> Cancel
              </button>
            )}
            {canReview && onReview && (
              <button
                id={`review-btn-${appointment._id}`}
                onClick={() => setShowReview(true)}
                className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors"
              >
                <FiStar size={12} /> Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)} title="Cancel Appointment" size="sm">
        <p className="text-gray-400 mb-6">Are you sure you want to cancel this appointment with <strong className="text-white">{barber?.barberName}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setShowCancel(false)} className="btn-outline flex-1 justify-center">Keep It</button>
          <button
            id={`confirm-cancel-btn-${appointment._id}`}
            onClick={() => { onCancel(appointment._id); setShowCancel(false); }}
            className="btn-danger flex-1 text-center"
          >
            Yes, Cancel
          </button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Leave a Review" size="sm">
        <div className="space-y-4">
          <div>
            <label className="input-label">Rating</label>
            <StarPicker rating={rating} setRating={setRating} />
          </div>
          <div>
            <label className="input-label">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <button
            id={`submit-review-btn-${appointment._id}`}
            onClick={() => { onReview(appointment._id, rating, comment); setShowReview(false); }}
            className="btn-gold w-full justify-center"
          >
            Submit Review ⭐
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AppointmentCard;
