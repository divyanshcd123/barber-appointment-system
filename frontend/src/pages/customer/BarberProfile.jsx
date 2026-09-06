import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { FiStar, FiScissors, FiMapPin, FiClock, FiCalendar, FiArrowLeft, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} size={16} className={rating >= s ? 'text-gold-500 fill-current' : 'text-gray-600'} />
    ))}
  </div>
);

const BarberProfile = () => {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/barbers/${id}`)
      .then(({ data }) => setBarber(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-wrapper font-outfit">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="dashboard-wrapper font-outfit">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <p className="text-white text-xl font-bold mb-4">Barber not found</p>
          <Link to="/customer/barbers" className="btn-gold"><FiArrowLeft size={16} /> Back to Barbers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10 animate-in">
          {/* Back button */}
          <Link to="/customer/barbers" className="text-gray-400 hover:text-gold-500 flex items-center gap-1.5 text-sm mb-6 transition-colors">
            <FiArrowLeft size={16} /> Back to Barbers
          </Link>

          {/* Barber Details Card */}
          <div className="glass-card p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row gap-8">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
            
            {/* Left: Avatar */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-28 h-28 rounded-3xl bg-gold-gradient flex items-center justify-center text-5xl font-bold text-dark-300 shadow-gold-lg">
                {barber.barberName?.charAt(0)}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-black text-white">{barber.barberName}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <StarRating rating={Math.round(barber.rating)} />
                  <span className="text-sm text-gray-400 font-medium">
                    {barber.rating?.toFixed(1)} ({barber.reviewCount} Reviews)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300 pt-2">
                <div className="flex items-center gap-2">
                  <FiClock size={16} className="text-gold-500 shrink-0" />
                  <span>Available: {barber.availableTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiScissors size={16} className="text-gold-500 shrink-0" />
                  <span>Experience: {barber.experience} years</span>
                </div>
                <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <FiMapPin size={16} className="text-gold-500 shrink-0" />
                  <span>Shop: {barber.shopLocation || 'Main Street Barbershop'}</span>
                </div>
              </div>

              {barber.specialization && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {barber.specialization.split(',').map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20 font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Days */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Working Days</p>
                <div className="flex gap-1.5 flex-wrap">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isAvailable = barber.availableDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`text-xs px-3 py-1 rounded-xl font-medium ${
                          isAvailable
                            ? 'bg-gold-500/15 text-gold-500 border border-gold-500/20'
                            : 'bg-white/3 text-gray-600'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action: Book */}
            <div className="shrink-0 flex items-center md:items-end justify-center">
              <Link
                id="book-this-barber-btn"
                to={`/customer/book?barber=${barber._id}`}
                className="btn-gold px-8 py-4 shadow-gold hover:scale-105 transition-transform"
              >
                <FiCalendar size={18} /> Book Appointment
              </Link>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div>
            <h2 className="text-xl font-black text-white mb-5">Customer Reviews</h2>
            {barber.reviews?.length === 0 ? (
              <div className="glass-card p-10 text-center text-gray-400">
                ⭐ No reviews left for this barber yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {barber.reviews?.map((review) => (
                  <div key={review._id} className="glass-card p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-semibold text-gray-400">
                          <FiUser size={16} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{review.customer?.name || 'Anonymous'}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-gray-300 text-sm mt-3.5 leading-relaxed bg-white/3 p-3 rounded-xl border border-white/5">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile;
