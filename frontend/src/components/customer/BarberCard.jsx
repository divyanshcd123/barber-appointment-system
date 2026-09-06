import { FiStar, FiScissors, FiMapPin, FiClock } from 'react-icons/fi';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} size={13} className={rating >= s ? 'star-filled fill-current' : 'star-empty'} />
    ))}
  </div>
);

const BarberCard = ({ barber, onSelect, selected }) => {
  const dayLabels = [
    { short: 'Sun', full: 'Sunday' },
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
  ];

  return (
    <div
      onClick={() => onSelect?.(barber)}
      className={`glass-card p-5 cursor-pointer transition-all duration-300 group ${
        selected
          ? 'border-gold-500/60 shadow-gold'
          : 'border-white/5 hover:border-gold-500/30 hover:shadow-gold'
      }`}
    >
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-xl font-bold text-dark-300 shadow-gold">
            {barber.barberName?.charAt(0)}
          </div>
          {barber.isAvailable && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-gold-400 transition-colors">
            {barber.barberName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={Math.round(barber.rating)} />
            <span className="text-xs text-gray-400">
              {barber.rating?.toFixed(1)} ({barber.reviewCount || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Specialties */}
      {barber.specialization && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {barber.specialization.split(',').slice(0, 3).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="space-y-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <FiClock size={12} className="text-gold-500/70" />
          <span>{barber.availableTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiScissors size={12} className="text-gold-500/70" />
          <span>{barber.experience} years experience</span>
        </div>
        {barber.shopLocation && (
          <div className="flex items-center gap-2">
            <FiMapPin size={12} className="text-gold-500/70" />
            <span>{barber.shopLocation}</span>
          </div>
        )}
      </div>

      {/* Working days */}
      <div className="flex gap-1 mt-3">
        {dayLabels.map((d) => (
          <span
            key={d.short}
            className={`text-[10px] w-7 h-7 flex items-center justify-center rounded-lg font-medium ${
              barber.availableDays?.includes(d.full)
                ? 'bg-gold-500/15 text-gold-500'
                : 'bg-white/3 text-gray-600'
            }`}
          >
            {d.short[0]}
          </span>
        ))}
      </div>

      {selected && (
        <div className="mt-3 text-center text-xs text-gold-500 font-semibold">✓ Selected</div>
      )}
    </div>
  );
};

export default BarberCard;
