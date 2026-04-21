import { Router } from 'express';
import { getCart, addToCart, updateItem, clearCart } from '../controllers/cartController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.use(protect, allow('student'));
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateItem);
router.delete('/clear', clearCart);
export default router;
