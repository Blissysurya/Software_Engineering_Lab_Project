import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const placeOrder = async (req, res, next) => {
  try {
    const { deliveryType = 'pickup', deliveryAddress = '', specialInstructions = '' } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map(i => ({
      product: i.product._id,
      name: i.product.name,
      price: i.price,
      quantity: i.quantity,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      student: req.user._id,
      shop: cart.shop,
      items,
      totalAmount,
      deliveryType,
      deliveryAddress,
      specialInstructions,
    });

    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(201).json(order);
  } catch (err) { next(err); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('shop', 'name location')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shop', 'name location')
      .populate('student', 'name phone address')
      .populate('assignedTo', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

export const getShopOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      shop: req.params.shopId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
    })
      .populate('student', 'name phone address')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) { next(err); }
};

export const getShopPickupHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({
      shop: req.params.shopId,
      deliveryType: 'pickup',
      status: 'picked_up',
    })
      .populate('student', 'name phone address')
      .sort('-updatedAt')
      .limit(10);
    res.json(orders);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

export const markPickupCollected = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryType !== 'pickup') {
      return res.status(400).json({ message: 'Only pickup orders can be marked as picked up here' });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({ message: 'Only ready orders can be marked as picked up' });
    }

    order.status = 'picked_up';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, student: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
