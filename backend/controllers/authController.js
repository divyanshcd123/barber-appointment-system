const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Only allow customer and barber self-registration (admin via seeder)
    const allowedRoles = ['customer', 'barber'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'customer', phone });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, bio, specialties, experience } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;
    if (user.role === 'barber') {
      user.bio = bio !== undefined ? bio : user.bio;
      user.specialties = specialties || user.specialties;
      user.experience = experience !== undefined ? experience : user.experience;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      success: true,
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        avatar: updated.avatar,
        token: generateToken(updated._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

const firebaseAdmin = require('../config/firebase');

const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, role, phone, name: bodyName } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID Token is required' });
    }

    let email, name, uid;

    // Attempt verification with Firebase Admin if initialized
    if (firebaseAdmin.apps.length > 0) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        email = decodedToken.email;
        name = decodedToken.name;
        uid = decodedToken.uid;
      } catch (verificationErr) {
        // Fallback to mock in development if token is mock
        if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock_')) {
          email = idToken.split('_')[1];
          name = bodyName || email.split('@')[0];
          uid = `mock_uid_${Date.now()}`;
        } else {
          return res.status(401).json({ success: false, message: 'Invalid Firebase ID Token' });
        }
      }
    } else {
      // Simulation mode (if Firebase Admin is not initialized)
      if (process.env.NODE_ENV === 'development' || idToken.startsWith('mock_')) {
        email = idToken.startsWith('mock_') ? idToken.split('_')[1] : idToken;
        name = bodyName || email.split('@')[0];
        uid = `mock_uid_${Date.now()}`;
      } else {
        return res.status(500).json({ success: false, message: 'Firebase Admin SDK not initialized' });
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Token does not contain email' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || bodyName || email.split('@')[0],
        email,
        role: role || 'customer',
        phone: phone || '',
        password: Math.random().toString(36).substring(2, 15),
      });

      if (user.role === 'barber') {
        const Barber = require('../models/Barber');
        await Barber.create({
          _id: user._id,
          barberName: user.name,
          experience: 0,
          specialization: '',
          profileImage: '',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableTime: '09:00 - 18:00',
          shopLocation: 'Downtown Main St.',
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, firebaseLogin };
