const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/order', createOrder);

module.exports = router;
