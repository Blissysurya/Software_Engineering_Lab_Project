import Product from '../models/Product.js';
import Shop from '../models/Shop.js';

const getVendorShop = async (userId) => Shop.findOne({ owner: userId });

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ shop: req.params.shopId }).sort('category name');
    res.json(products);
  } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try {
    const shop = await getVendorShop(req.user._id);
    if (!shop) return res.status(404).json({ message: 'Create a shop first' });
    const product = await Product.create({ ...req.body, shop: shop._id });
    res.status(201).json(product);
  } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const shop = await getVendorShop(req.user._id);
    const product = await Product.findOne({ _id: req.params.id, shop: shop?._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const allowed = ['name', 'description', 'price', 'category', 'preparationTime'];
    allowed.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    await product.save();
    res.json(product);
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const shop = await getVendorShop(req.user._id);
    await Product.findOneAndDelete({ _id: req.params.id, shop: shop?._id });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const shop = await getVendorShop(req.user._id);
    const product = await Product.findOne({ _id: req.params.id, shop: shop?._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json(product);
  } catch (err) { next(err); }
};
