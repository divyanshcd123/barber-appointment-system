const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getBarberAppointments,
  updateAppointmentStatus,
  submitReview,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllAppointments);
router.post('/', protect, authorize('customer'), createAppointment);
router.get('/my', protect, authorize('customer'), getMyAppointments);
router.get('/barber', protect, authorize('barber'), getBarberAppointments);
router.put('/:id/status', protect, authorize('customer', 'barber', 'admin'), updateAppointmentStatus);
router.post('/:id/review', protect, authorize('customer'), submitReview);

module.exports = router;
