import { Router } from 'express';
import { createReview, getShopReviews } from '../controllers/reviewController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, allow('student'), createReview);
router.get('/shop/:shopId', getShopReviews);
export default router;
