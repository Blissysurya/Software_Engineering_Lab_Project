import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleAvailability } from '../controllers/productController.js';
import { protect, allow } from '../middleware/auth.js';

const router = Router();
router.get('/shop/:shopId', getProducts);
router.post('/', protect, allow('vendor'), createProduct);
router.put('/:id', protect, allow('vendor'), updateProduct);
router.delete('/:id', protect, allow('vendor'), deleteProduct);
router.patch('/:id/toggle', protect, allow('vendor'), toggleAvailability);
export default router;
