import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FiScissors, FiCalendar, FiStar, FiArrowRight, FiCheck, FiUsers } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const SERVICES = [
  { name: 'Classic Haircut', price: '₹200', duration: '30 min', icon: '✂️', category: 'haircut' },
  { name: 'Fade Haircut', price: '₹250', duration: '45 min', icon: '💈', category: 'haircut' },
  { name: 'Beard Trim', price: '₹100', duration: '20 min', icon: '🧔', category: 'beard' },
  { name: 'Hot Towel Shave', price: '₹200', duration: '40 min', icon: '🪒', category: 'beard' },
  { name: 'Haircut + Beard Combo', price: '₹350', duration: '60 min', icon: '⭐', category: 'combo' },
  { name: 'Hair Coloring', price: '₹500', duration: '90 min', icon: '🎨', category: 'treatment' },
];

const BARBERS = [
  { name: 'Jawed Habib', specialty: 'Pioneer of modern Indian hair styling & cuts', rating: 4.8, reviews: 124, exp: 15 },
  { name: 'Aalim Hakim', specialty: 'Bollywood celebrity designer, textures & styling', rating: 4.9, reviews: 98, exp: 12 },
  { name: 'Vikas Marwah', specialty: 'Acclaimed transformation stylist & educator', rating: 4.7, reviews: 67, exp: 8 },
];

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= Math.round(rating) ? 'text-gold-500' : 'text-gray-600'}>★</span>
    ))}
  </div>
);

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-wrapper font-outfit">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-grid-pattern">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)',
          }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float"
            style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 animate-float"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-8 animate-fade-in shadow-sm">
            <FiScissors size={14} className="text-blue-600" />
            Premium Barber Experience
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight animate-slide-up">
            Look Your{' '}
            <span className="text-blue-600">Best.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Every Single Day.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up font-medium" style={{ animationDelay: '0.1s' }}>
            Book appointments with elite barbers in seconds. <span className="text-slate-900 font-semibold">Premium cuts, seamless scheduling</span>, and an experience worth talking about.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {user ? (
              <button
                id="hero-dashboard-btn"
                onClick={() => navigate(`/${user.role}`)}
                className="btn-gold text-base px-8 py-4"
              >
                <MdDashboard size={20} /> Go to Dashboard <FiArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link id="hero-book-btn" to="/register" className="btn-gold text-base px-8 py-4">
                  <FiCalendar size={18} /> Book Appointment <FiArrowRight size={16} />
                </Link>
                <Link id="hero-login-btn" to="/login" className="btn-outline text-base px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-8 justify-center mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { label: '500+', sub: 'Happy Clients' },
              { label: '4.9★', sub: 'Average Rating' },
              { label: '3', sub: 'Expert Barbers' },
              { label: '5+', sub: 'Years Experience' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-gold-gradient">{stat.label}</p>
                <p className="text-gray-400 text-sm">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gold-500/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50" />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 bg-grid-pattern relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Book your appointment in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {[
              { step: '01', title: 'Choose a Service', desc: 'Browse our full menu of premium barbering services and find your perfect style.', icon: FiScissors },
              { step: '02', title: 'Pick Your Barber', desc: 'Select from our team of expert barbers, view their profiles, ratings, and availability.', icon: FiUsers },
              { step: '03', title: 'Book Your Slot', desc: 'Choose a date and time that works for you. Instant confirmation, zero hassle.', icon: FiCalendar },
            ].map((item) => (
              <div key={item.step} className="glass-card-hover p-8 text-center animate-in">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
                    <item.icon size={26} className="text-dark-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-black text-gold-500/50">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-24 px-4 bg-grid-pattern relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Premium cuts and grooming for every style</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {SERVICES.map((svc) => (
              <div key={svc.name} className="glass-card-hover p-6 animate-in">
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="text-white font-bold text-lg mb-1">{svc.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{svc.duration}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-gold-gradient">{svc.price}</span>
                  <Link to="/register" className="btn-outline text-xs px-4 py-2">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BARBERS ===== */}
      <section id="barbers" className="py-24 px-4 bg-grid-pattern relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Meet Our Barbers</h2>
            <p className="section-subtitle">Skilled artisans dedicated to your best look</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {BARBERS.map((barber) => (
              <div key={barber.name} className="glass-card-hover p-8 text-center animate-in">
                <div className="w-20 h-20 rounded-2xl bg-gold-gradient mx-auto mb-5 flex items-center justify-center text-3xl font-black text-dark-300 shadow-gold-lg">
                  {barber.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{barber.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{barber.specialty}</p>
                <div className="flex justify-center mb-3">
                  <StarRow rating={barber.rating} />
                </div>
                <div className="flex justify-center gap-4 text-sm text-gray-400">
                  <span className="text-gold-500 font-semibold">{barber.rating}</span>
                  <span>({barber.reviews} reviews)</span>
                  <span>·</span>
                  <span>{barber.exp}y exp</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
            }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4">
                Ready for Your <span className="text-gold-gradient">Best Look?</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join hundreds of satisfied customers. Book your appointment today and experience the BarberX difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link id="cta-register-btn" to="/register" className="btn-gold text-base px-8 py-4">
                  <FiCalendar size={18} /> Book Now — It's Free
                </Link>
                <Link id="cta-login-btn" to="/login" className="btn-outline text-base px-8 py-4">
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
