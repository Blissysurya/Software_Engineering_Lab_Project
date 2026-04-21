import { Router } from 'express';
import { placeOrder, getMyOrders, getOrder, getShopOrders, getShopPickupHistory, updateOrderStatus, cancelOrder, markPickupCollected } from '../controllers/orderController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, allow('student'), placeOrder);
router.get('/my', protect, allow('student'), getMyOrders);
router.get('/shop/:shopId', protect, allow('vendor'), getShopOrders);
router.get('/shop/:shopId/pickup-history', protect, allow('vendor'), getShopPickupHistory);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, allow('vendor', 'admin'), updateOrderStatus);
router.patch('/:id/pickup-collected', protect, allow('vendor', 'admin'), markPickupCollected);
router.patch('/:id/cancel', protect, allow('student'), cancelOrder);
export default router;
