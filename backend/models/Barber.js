const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    barberName: {
      type: String,
      required: [true, 'Barber name is required'],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    specialization: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    availableDays: {
      type: [String],
      default: [],
    },
    availableTime: {
      type: String,
      default: '',
    },
    shopLocation: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Barber', barberSchema);
