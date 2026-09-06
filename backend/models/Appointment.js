const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'razorpay'],
      default: 'cash',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
