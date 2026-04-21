import { Router } from 'express';
import { placeOrder, getMyOrders, getOrder, getShopOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, allow('student'), placeOrder);
router.get('/my', protect, allow('student'), getMyOrders);
router.get('/shop/:shopId', protect, allow('vendor'), getShopOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, allow('vendor', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', protect, allow('student'), cancelOrder);
export default router;
