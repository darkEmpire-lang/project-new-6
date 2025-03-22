import express from 'express';
import authUser from '../middleware/auth.js';
import {
  addDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/add', authUser, addDelivery);
router.get('/', authUser, getDeliveries);
router.get('/:id', authUser, getDeliveryById);
router.put('/:id', authUser, updateDelivery);
router.delete('/:id', authUser, deleteDelivery);

export default router;
