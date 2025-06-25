import express from 'express';
import {
    getAllOrders,
    createOrder,
    getOrderDetails,
    updateOrder,
    deleteOrder,
} from '../controllers/orderController.js'; 

import { isAuthenticated } from '../middleware/auth.js';
const router = express.Router();
router.use(isAuthenticated);
router.route('/').get(getAllOrders).post(createOrder);
router.route('/:id').get(getOrderDetails).put(updateOrder).delete(deleteOrder);
export default router;