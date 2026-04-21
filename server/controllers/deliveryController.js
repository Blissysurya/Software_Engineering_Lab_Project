import Order from '../models/Order.js';

export const getAvailable = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: 'ready',
      deliveryType: 'delivery',
      assignedTo: null,
    })
      .populate('shop', 'name location')
      .populate('student', 'name address phone')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
};

export const assignOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      status: 'ready',
      deliveryType: 'delivery',
      assignedTo: null,
    });
    if (!order) return res.status(400).json({ message: 'Order not available for pickup' });
    order.assignedTo = req.user._id;
    order.status = 'picked_up';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

export const markDelivered = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      assignedTo: req.user._id,
      status: 'picked_up',
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'delivered';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

export const getMyDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ assignedTo: req.user._id })
      .populate('shop', 'name')
      .populate('student', 'name address')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
};
