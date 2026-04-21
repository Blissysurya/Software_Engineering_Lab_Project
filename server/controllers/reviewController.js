import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Shop from '../models/Shop.js';

export const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment = '' } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ message: 'orderId and rating are required' });
    }

    const order = await Order.findOne({ _id: orderId, student: req.user._id });
    if (!order || order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this order' });

    const review = await Review.create({
      order: orderId,
      student: req.user._id,
      shop: order.shop,
      rating,
      comment,
    });

    const reviews = await Review.find({ shop: order.shop });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Shop.findByIdAndUpdate(order.shop, { rating: avg.toFixed(1), totalReviews: reviews.length });

    res.status(201).json(review);
  } catch (err) { next(err); }
};

export const getShopReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ shop: req.params.shopId })
      .populate('student', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) { next(err); }
};
