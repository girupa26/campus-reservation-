const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // custom string id like 'hall-a'
  name: { type: String, required: true },
  type: { type: String, required: true }, // seminar_hall, lab, etc.
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  equipment: [{ type: String }],
  description: { type: String },
  is_active: { type: Number, default: 1 }
}, { timestamps: true });

// We want to return `id` instead of `_id` in API responses for backward compatibility with the frontend
resourceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
