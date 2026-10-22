const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // custom id like 'bkg_xyz'
  resource_id: { type: String, required: true },
  department: { type: String, required: true },
  user_name: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  event_title: { type: String, required: true },
  status: { type: String, default: 'CONFIRMED' }
}, { timestamps: true });

bookingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
