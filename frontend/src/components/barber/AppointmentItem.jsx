import { format } from 'date-fns';
import { FiClock, FiUser, FiPhone, FiCheck, FiX } from 'react-icons/fi';

const STATUS_BADGE = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const AppointmentItem = ({ appointment, onStatusUpdate }) => {
  const { customer, service, date, time, status, totalPrice, notes } = appointment;

  return (
    <div className="glass-card p-4 flex items-center gap-4 hover:border-gold-500/20 transition-all duration-200">
      {/* Time */}
      <div className="text-center w-16 shrink-0">
        <p className="text-gold-500 text-lg font-bold">{time}</p>
        <p className="text-gray-500 text-xs">{format(new Date(date), 'MMM d')}</p>
      </div>

      <div className="w-px h-12 bg-white/5 shrink-0" />

      {/* Customer info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-gold-500">
            {customer?.name?.charAt(0)}
          </div>
          <span className="text-white font-medium text-sm truncate">{customer?.name}</span>
          {customer?.phone && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <FiPhone size={10} />{customer.phone}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs">{service?.name} • {service?.duration} min</p>
        {notes && <p className="text-gray-500 text-xs mt-1 italic truncate">"{notes}"</p>}
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-gold-500 font-bold">₹{totalPrice}</p>
        <span className={`${STATUS_BADGE[status]} mt-1 inline-block`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex gap-2 shrink-0">
          <button
            id={`confirm-appt-${appointment._id}`}
            onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
            className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/25 transition-all"
            title="Confirm"
          >
            <FiCheck size={14} />
          </button>
          <button
            id={`reject-appt-${appointment._id}`}
            onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
            className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all"
            title="Decline"
          >
            <FiX size={14} />
          </button>
        </div>
      )}
      {status === 'confirmed' && (
        <div className="flex gap-2 shrink-0">
          <button
            id={`complete-appt-${appointment._id}`}
            onClick={() => onStatusUpdate(appointment._id, 'completed')}
            className="btn-gold text-xs px-3 py-2"
          >
            Complete
          </button>
          <button
            id={`cancel-appt-${appointment._id}`}
            onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
            className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all"
            title="Cancel"
          >
            <FiX size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentItem;
