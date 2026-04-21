import { Router } from 'express';
import { getAvailable, assignOrder, markDelivered, getMyDeliveries } from '../controllers/deliveryController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.use(protect, allow('delivery'));
router.get('/available', getAvailable);
router.post('/assign/:orderId', assignOrder);
router.patch('/deliver/:orderId', markDelivered);
router.get('/my', getMyDeliveries);
export default router;
