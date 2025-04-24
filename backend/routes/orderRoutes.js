import express from 'express';
import { placeOrder, placeOrderStripe, placeOrderBankSlip, allOrders, updateStatus, userOrders, verifyStripe,deleteOrder } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const orderRouter = express.Router();

orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/bankslip', authUser, upload.single('bankSlip'), placeOrderBankSlip);

orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.delete('/delete/:id',  deleteOrder);

export default orderRouter;
