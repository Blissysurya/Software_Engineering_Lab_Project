import Shop from '../models/Shop.js';

export const getShops = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isApproved: true };
    if (category) filter.category = category;
    const shops = await Shop.find(filter).populate('owner', 'name email phone').sort('-createdAt');
    res.json(shops);
  } catch (err) { next(err); }
};

export const getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email phone');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) { next(err); }
};

export const getMyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'No shop found for this account' });
    res.json(shop);
  } catch (err) { next(err); }
};

export const createShop = async (req, res, next) => {
  try {
    const existing = await Shop.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already have a shop' });
    const shop = await Shop.create({ ...req.body, owner: req.user._id, isApproved: false });
    res.status(201).json(shop);
  } catch (err) { next(err); }
};

export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const allowed = ['name', 'description', 'category', 'location'];
    allowed.forEach(f => { if (req.body[f] !== undefined) shop[f] = req.body[f]; });
    await shop.save();
    res.json(shop);
  } catch (err) { next(err); }
};

export const toggleOpen = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.isOpen = !shop.isOpen;
    await shop.save();
    res.json(shop);
  } catch (err) { next(err); }
};
