import { Router } from 'express';
import {
  getPendingShops, getAllShops, approveShop, suspendShop,
  getUsers, toggleUser, getStats, getAllOrders,
} from '../controllers/adminController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.use(protect, allow('admin'));
router.get('/shops/pending', getPendingShops);
router.get('/shops', getAllShops);
router.patch('/shops/:id/approve', approveShop);
router.patch('/shops/:id/suspend', suspendShop);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/stats', getStats);
router.get('/orders', getAllOrders);
export default router;
