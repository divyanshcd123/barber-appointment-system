import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookAppointment from './pages/customer/BookAppointment';
import MyAppointments from './pages/customer/MyAppointments';
import BarbersList from './pages/customer/BarbersList';
import BarberProfile from './pages/customer/BarberProfile';
import Profile from './pages/customer/Profile';
import AIAssistant from './pages/customer/AIAssistant';

// Barber pages
import BarberDashboard from './pages/barber/BarberDashboard';
import ManageSchedule from './pages/barber/ManageSchedule';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBarbers from './pages/admin/ManageBarbers';
import ManageServices from './pages/admin/ManageServices';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAppointments from './pages/admin/ManageAppointments';

// Redirect logged-in users away from auth pages
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    const paths = { customer: '/customer', barber: '/barber', admin: '/admin' };
    return <Navigate to={paths[user.role] || '/'} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

    {/* Customer routes */}
    <Route path="/customer" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerDashboard />
      </ProtectedRoute>
    } />
    <Route path="/customer/book" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <BookAppointment />
      </ProtectedRoute>
    } />
    <Route path="/customer/appointments" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <MyAppointments />
      </ProtectedRoute>
    } />
    <Route path="/customer/barbers" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <BarbersList />
      </ProtectedRoute>
    } />
    <Route path="/customer/barbers/:id" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <BarberProfile />
      </ProtectedRoute>
    } />
    <Route path="/customer/ai-assistant" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <AIAssistant />
      </ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute allowedRoles={['customer', 'barber', 'admin']}>
        <Profile />
      </ProtectedRoute>
    } />

    {/* Barber routes */}
    <Route path="/barber" element={
      <ProtectedRoute allowedRoles={['barber']}>
        <BarberDashboard />
      </ProtectedRoute>
    } />
    <Route path="/barber/schedule" element={
      <ProtectedRoute allowedRoles={['barber']}>
        <ManageSchedule />
      </ProtectedRoute>
    } />

    {/* Admin routes */}
    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/barbers" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <ManageBarbers />
      </ProtectedRoute>
    } />
    <Route path="/admin/services" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <ManageServices />
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <ManageUsers />
      </ProtectedRoute>
    } />
    <Route path="/admin/appointments" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <ManageAppointments />
      </ProtectedRoute>
    } />

    {/* Catch-all */}
    <Route path="*" element={
      <div className="min-h-screen flex flex-col items-center justify-center font-outfit" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-gold-gradient text-8xl font-black mb-4">404</p>
        <p className="text-gray-400 text-lg mb-8">Page not found</p>
        <a href="/" className="btn-gold">← Go Home</a>
      </div>
    } />
  </Routes>
);

const App = () => (
  <Router>
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(24px)',
            fontFamily: 'Outfit, sans-serif',
          },
          success: { iconTheme: { primary: 'var(--gold)', secondary: '#121214' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </Router>
);

export default App;
