import { Router } from 'express';
import { getShops, getShop, getMyShop, createShop, updateShop, toggleOpen } from '../controllers/shopController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.get('/', getShops);
router.get('/my-shop', protect, allow('vendor'), getMyShop);
router.get('/:id', getShop);
router.post('/', protect, allow('vendor'), createShop);
router.put('/:id', protect, allow('vendor'), updateShop);
router.patch('/:id/toggle-open', protect, allow('vendor'), toggleOpen);
export default router;
