import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1, min: 1 },
      price: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
