const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const Notification = require('../models/Notification');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Customer)
const crypto = require('crypto');
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || keySecret === 'YOUR_RAZORPAY_KEY_SECRET') return true; // local mock bypass

  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const generated = hmac.digest('hex');
  return generated === signature;
};

const createAppointment = async (req, res, next) => {
  try {
    const {
      barberId,
      serviceId,
      date,
      timeSlot,
      time,
      notes,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;
    const bookingTime = timeSlot || time;

    const [barber, service] = await Promise.all([
      Barber.findById(barberId),
      Service.findOne({ _id: serviceId, isActive: true }),
    ]);

    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Validate payment signature if Razorpay is selected
    if (paymentMethod === 'razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Missing Razorpay payment parameters' });
      }
      const verified = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!verified) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Check slot availability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await Appointment.findOne({
      barber: barberId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: bookingTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      customer: req.user._id,
      barber: barberId,
      service: serviceId,
      date,
      time: bookingTime,
      notes,
      totalPrice: service.price,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'unpaid',
      razorpayOrderId,
      razorpayPaymentId,
    });

    try {
      const customerUser = await User.findById(req.user._id);
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      await Notification.create({
        recipient: barberId,
        sender: req.user._id,
        message: `New appointment booked by ${customerUser.name} on ${formattedDate} at ${bookingTime}.`,
        type: 'booked',
        appointment: appointment._id
      });
    } catch (notifErr) {
      console.error('Notification failed:', notifErr);
    }

    const populated = await appointment.populate([
      { path: 'barber', select: 'barberName profileImage' },
      { path: 'service', select: 'name duration price' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's appointments
// @route   GET /api/appointments/my
// @access  Private (Customer)
const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('barber', 'barberName profileImage')
      .populate('service', 'name duration price category')
      .sort('-date');

    const data = await Promise.all(
      appointments.map(async (appt) => {
        const apptObj = appt.toObject();
        if (apptObj.barber) {
          const reviews = await Review.find({ barber: apptObj.barber._id });
          const reviewCount = reviews.length;
          const rating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 4.8;
          apptObj.barber.rating = rating;
          apptObj.barber.reviewCount = reviewCount;
        }
        return apptObj;
      })
    );

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get barber's appointments
// @route   GET /api/appointments/barber
// @access  Private (Barber)
const getBarberAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = { barber: req.user._id };
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('customer', 'name phone')
      .populate('service', 'name duration price')
      .sort('date time');

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (barber: confirm/complete; customer: cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private (Barber or Customer)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    const isBarber = req.user.role === 'barber' && appointment.barber.toString() === req.user._id.toString();
    const isCustomer = req.user.role === 'customer' && appointment.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBarber && !isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Role-based status transitions
    if (isCustomer && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Customers can only cancel appointments' });
    }
    if (isBarber && !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancelledBy = req.user._id;
      appointment.cancellationReason = cancellationReason || '';
    }

    await appointment.save();

    try {
      const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (status === 'confirmed') {
        const barberProfileObj = await Barber.findById(appointment.barber);
        await Notification.create({
          recipient: appointment.customer,
          sender: req.user._id,
          message: `Your appointment with ${barberProfileObj?.barberName || 'your barber'} on ${formattedDate} at ${appointment.time} has been confirmed.`,
          type: 'confirmed',
          appointment: appointment._id
        });
      } else if (status === 'completed') {
        const barberProfileObj = await Barber.findById(appointment.barber);
        await Notification.create({
          recipient: appointment.customer,
          sender: req.user._id,
          message: `Your appointment with ${barberProfileObj?.barberName || 'your barber'} is complete. Please leave a review!`,
          type: 'completed',
          appointment: appointment._id
        });
      } else if (status === 'cancelled') {
        if (isCustomer) {
          const customerUser = await User.findById(req.user._id);
          await Notification.create({
            recipient: appointment.barber,
            sender: req.user._id,
            message: `Appointment on ${formattedDate} at ${appointment.time} has been cancelled by ${customerUser.name}. Reason: ${cancellationReason || 'None'}`,
            type: 'cancelled',
            appointment: appointment._id
          });
        } else {
          const cancellerName = req.user.role === 'admin' ? 'Admin' : 'your barber';
          await Notification.create({
            recipient: appointment.customer,
            sender: req.user._id,
            message: `Your appointment on ${formattedDate} at ${appointment.time} has been cancelled by ${cancellerName}. Reason: ${cancellationReason || 'None'}`,
            type: 'cancelled',
            appointment: appointment._id
          });
        }
      }
    } catch (notifErr) {
      console.error('Notification failed:', notifErr);
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit review for completed appointment
// @route   POST /api/appointments/:id/review
// @access  Private (Customer)
const submitReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    }

    const existing = await Review.findOne({ appointment: appointment._id });
    if (existing) return res.status(400).json({ success: false, message: 'Review already submitted' });

    const review = await Review.create({
      customer: req.user._id,
      barber: appointment.barber,
      appointment: appointment._id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    if (search) {
      const [matchedUsers, matchedBarbers] = await Promise.all([
        User.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
        Barber.find({ barberName: { $regex: search, $options: 'i' } }).select('_id'),
      ]);

      const userIds = matchedUsers.map((u) => u._id);
      const barberIds = matchedBarbers.map((b) => b._id);

      filter.$or = [
        { customer: { $in: userIds } },
        { barber: { $in: barberIds } },
      ];
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('customer', 'name email phone')
      .populate('barber', 'barberName')
      .populate('service', 'name price duration')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: appointments.length, total, data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getBarberAppointments,
  updateAppointmentStatus,
  submitReview,
  getAllAppointments,
};
