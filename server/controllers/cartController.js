import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('shop', 'name location')
      .populate('items.product', 'name price isAvailable');
    res.json(cart || { items: [], shop: null });
  } catch (err) { next(err); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (cart && cart.shop && cart.shop.toString() !== product.shop.toString()) {
      return res.status(400).json({
        message: 'Your cart has items from another shop. Clear it first.',
      });
    }

    if (!cart) {
      cart = new Cart({ user: req.user._id, shop: product.shop, items: [] });
    }

    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
    cart.shop = product.shop;
    await cart.save();
    res.json(cart);
  } catch (err) { next(err); }
};

export const updateItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }
    if (cart.items.length === 0) cart.shop = null;
    await cart.save();
    res.json(cart);
  } catch (err) { next(err); }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};
