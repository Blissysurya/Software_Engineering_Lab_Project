import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['food', 'beverages', 'stationery', 'grocery', 'other'],
    default: 'food',
  },
  location: { type: String, default: '' },
  isOpen: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Shop', shopSchema);
