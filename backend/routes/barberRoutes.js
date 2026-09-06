const express = require('express');
const router = express.Router();
const {
  getBarbers,
  getBarberById,
  getBarberSlots,
  updateAvailability,
  updateBarberProfile,
} = require('../controllers/barberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getBarbers);
router.get('/:id', getBarberById);
router.get('/:id/slots', getBarberSlots);
router.put('/availability', protect, authorize('barber'), updateAvailability);
router.put('/profile', protect, authorize('barber'), updateBarberProfile);

module.exports = router;
