import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

export const getPendingShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ isApproved: false }).populate('owner', 'name email');
    res.json(shops);
  } catch (err) { next(err); }
};

export const getAllShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({}).populate('owner', 'name email').sort('-createdAt');
    res.json(shops);
  } catch (err) { next(err); }
};

export const approveShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) { next(err); }
};

export const suspendShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) { next(err); }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { next(err); }
};

export const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const [totalOrders, totalUsers, totalShops, revenueData] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Shop.countDocuments({ isApproved: true }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);
    res.json({
      totalOrders,
      totalUsers,
      totalShops,
      revenue: revenueData[0]?.total || 0,
    });
  } catch (err) { next(err); }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('student', 'name')
      .populate('shop', 'name')
      .sort('-createdAt')
      .limit(200);
    res.json(orders);
  } catch (err) { next(err); }
};
