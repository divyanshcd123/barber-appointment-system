const User = require('../models/User');
const Barber = require('../models/Barber');
const Review = require('../models/Review');

// @desc    Get all barbers (public)
// @route   GET /api/barbers
// @access  Public
const getBarbers = async (req, res, next) => {
  try {
    const { search, specialization, minExperience, minRating, availableDay } = req.query;
    const query = {};
    if (search) {
      query.barberName = { $regex: search, $options: 'i' };
    }
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }
    if (availableDay) {
      query.availableDays = availableDay;
    }

    const barbers = await Barber.find(query);

    // Calculate ratings and reviewCount dynamically from Reviews
    let data = await Promise.all(
      barbers.map(async (b) => {
        const reviews = await Review.find({ barber: b._id });
        const reviewCount = reviews.length;
        const rating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 4.8; // Default rating for new barbers is 4.8
        return {
          ...b.toObject(),
          rating,
          reviewCount,
        };
      })
    );

    if (minRating) {
      data = data.filter((b) => b.rating >= Number(minRating));
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get barber by ID (public)
// @route   GET /api/barbers/:id
// @access  Public
const getBarberById = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    // Fetch reviews for this barber
    const reviews = await Review.find({ barber: req.params.id }).populate('customer', 'name');
    const reviewCount = reviews.length;
    const rating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 4.8;

    res.json({
      success: true,
      data: {
        ...barber.toObject(),
        rating,
        reviewCount,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get barber availability (time slots for a given date)
// @route   GET /api/barbers/:id/slots?date=YYYY-MM-DD
// @access  Public
const getBarberSlots = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });

    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeekNames[new Date(date).getDay()];
    if (!barber.availableDays.includes(dayName)) {
      return res.json({ success: true, data: [], message: 'Barber is not working on this day' });
    }

    // Parse availableTime e.g., "09:00 - 18:00"
    const timeParts = barber.availableTime.split('-');
    if (timeParts.length !== 2) {
      return res.status(500).json({ success: false, message: 'Barber availability time format is invalid' });
    }
    const [startH, startM] = timeParts[0].trim().split(':').map(Number);
    const [endH, endM] = timeParts[1].trim().split(':').map(Number);

    const slots = [];
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (current < end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current += 30;
    }

    // Remove already booked slots
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      barber: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('time');

    const bookedSlots = booked.map((a) => a.time);
    const available = slots.filter((s) => !bookedSlots.includes(s));

    res.json({ success: true, data: available });
  } catch (error) {
    next(error);
  }
};

// @desc    Update barber availability/working hours
// @route   PUT /api/barbers/availability
// @access  Private (Barber)
const updateAvailability = async (req, res, next) => {
  try {
    const { availableTime, availableDays } = req.body;
    const barber = await Barber.findById(req.user._id);
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber profile not found' });
    }

    if (availableTime) barber.availableTime = availableTime;
    if (availableDays) barber.availableDays = availableDays;

    await barber.save();
    res.json({ success: true, data: barber });
  } catch (error) {
    next(error);
  }
};

// @desc    Update barber profile
// @route   PUT /api/barbers/profile
// @access  Private (Barber)
const updateBarberProfile = async (req, res, next) => {
  try {
    const {
      barberName,
      experience,
      specialization,
      profileImage,
      availableDays,
      availableTime,
      shopLocation,
    } = req.body;

    let barber = await Barber.findById(req.user._id);
    if (!barber) {
      barber = new Barber({ _id: req.user._id });
    }

    if (barberName !== undefined) barber.barberName = barberName;
    if (experience !== undefined) barber.experience = Number(experience);
    if (specialization !== undefined) barber.specialization = specialization;
    if (profileImage !== undefined) barber.profileImage = profileImage;
    if (availableDays !== undefined) barber.availableDays = availableDays;
    if (availableTime !== undefined) barber.availableTime = availableTime;
    if (shopLocation !== undefined) barber.shopLocation = shopLocation;

    await barber.save();

    // Sync to User model if name or phone changed
    const user = await User.findById(req.user._id);
    if (user) {
      if (barberName) user.name = barberName;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      await user.save();
    }

    res.json({ success: true, data: barber });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBarbers,
  getBarberById,
  getBarberSlots,
  updateAvailability,
  updateBarberProfile,
};
