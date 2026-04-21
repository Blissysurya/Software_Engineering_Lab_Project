import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
