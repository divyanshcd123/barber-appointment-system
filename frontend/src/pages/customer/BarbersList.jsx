import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BarberCard from '../../components/customer/BarberCard';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import { FiSearch, FiSliders, FiCalendar, FiArrowRight } from 'react-icons/fi';

const BarbersList = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableDay, setAvailableDay] = useState('');

  const fetchBarbers = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (specialization) params.specialization = specialization;
    if (minExperience) params.minExperience = minExperience;
    if (minRating) params.minRating = minRating;
    if (availableDay) params.availableDay = availableDay;

    api.get('/barbers', { params })
      .then(({ data }) => {
        setBarbers(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBarbers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, specialization, minExperience, minRating, availableDay]);

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-10 animate-in">
            <h1 className="text-3xl font-black text-white mb-2">Our Barbers</h1>
            <p className="text-gray-400">Find the perfect expert for your style and schedule</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card p-5 mb-8 animate-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiSearch size={16} /></span>
                <input
                  id="barber-search-input"
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-11"
                />
              </div>

              {/* Specialization */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><FiSliders size={16} /></span>
                <input
                  id="barber-specialization-input"
                  type="text"
                  placeholder="Specialty (e.g. Fade)..."
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="input-field pl-11"
                />
              </div>

              {/* Experience Filter */}
              <div>
                <select
                  id="barber-experience-select"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="input-field"
                >
                  <option value="">Any Experience</option>
                  <option value="3">3+ Years Experience</option>
                  <option value="5">5+ Years Experience</option>
                  <option value="8">8+ Years Experience</option>
                  <option value="10">10+ Years Experience</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <select
                  id="barber-rating-select"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="input-field"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0★ & Up</option>
                  <option value="4.5">4.5★ & Up</option>
                  <option value="4.8">4.8★ & Up</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <select
                  id="barber-availability-select"
                  value={availableDay}
                  onChange={(e) => setAvailableDay(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Any Workday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Barbers Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader size="lg" /></div>
          ) : barbers.length === 0 ? (
            <div className="glass-card p-16 text-center animate-in">
              <div className="text-5xl mb-4">💈</div>
              <h3 className="text-white font-bold text-lg mb-2">No barbers found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {barbers.map((barber) => (
                <div key={barber._id} className="relative group animate-in">
                  <Link to={`/customer/barbers/${barber._id}`} className="block">
                    <BarberCard barber={barber} />
                  </Link>
                  <div className="absolute bottom-5 right-5 z-10 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Link
                      to={`/customer/book?barber=${barber._id}`}
                      className="btn-gold p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-gold hover:scale-105 transition-transform"
                    >
                      <FiCalendar size={14} /> Book <FiArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarbersList;
