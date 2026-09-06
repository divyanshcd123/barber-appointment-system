const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalBarbers,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      revenueData,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer', isActive: true }),
      User.countDocuments({ role: 'barber', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Appointment.find()
        .populate('customer', 'name')
        .populate('barber', 'barberName')
        .populate('service', 'name price')
        .sort('-createdAt')
        .limit(5),
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Appointment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalBarbers,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue: revenueData[0]?.total || 0,
        monthlyRevenue,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: users.length, total, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: { isActive: user.isActive }, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create barber account (admin only)
// @route   POST /api/admin/barbers
// @access  Private (Admin)
const createBarber = async (req, res, next) => {
  try {
    const { name, email, password, phone, bio, specialties, experience } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const barber = await User.create({
      name, email, password, phone, bio, specialties, experience,
      role: 'barber',
    });

    res.status(201).json({ success: true, data: { _id: barber._id, name: barber.name, email: barber.email, role: barber.role } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, deleteUser, createBarber };
