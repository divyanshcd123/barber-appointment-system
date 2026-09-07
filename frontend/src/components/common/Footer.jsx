import { Link } from 'react-router-dom';
import { FiScissors, FiInstagram, FiTwitter, FiFacebook, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 pt-16 pb-8 bg-white text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <FiScissors className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Barber<span className="text-blue-600">X</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Executive barbershop platform. Book your haircut with verified barbers.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Book Appointment', to: '/register' },
                { label: 'Our Barbers', to: '/#barbers' },
                { label: 'Services', to: '/#services' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-slate-500 hover:text-slate-900 text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['Classic Haircut', 'Fade & Taper', 'Beard Trim', 'Hot Towel Shave', 'Hair Coloring', 'Scalp Treatment'].map((s) => (
                <li key={s}>
                  <span className="text-slate-500 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <FiMapPin size={15} className="text-slate-900 shrink-0" />
                <span>123 Main Street, Suite 100<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <FiPhone size={15} className="text-slate-900 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <FiMail size={15} className="text-slate-900 shrink-0" />
                <span>hello@barberx.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-divider" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} BarberX. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map((t) => (
              <a key={t} href="#" className="text-gray-500 hover:text-gold-500 text-sm transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
