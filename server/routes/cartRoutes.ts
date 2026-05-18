
import express from 'express';
import { getCart, addToCart, removeFromCart, checkout, guestCheckout, getMyOrders, confirmCheckout, trackOrder, getOrderDelivery } from '../controllers/cartController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout/guest', guestCheckout);
router.post('/checkout/confirm', optionalAuthenticate, confirmCheckout);
router.get('/orders/:orderNumber/track', optionalAuthenticate, trackOrder);
router.get('/orders/:orderNumber/delivery', optionalAuthenticate, getOrderDelivery);

router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.delete('/cart/:itemId', authenticate, removeFromCart);
router.post('/checkout', authenticate, checkout);
router.get('/orders/my', authenticate, getMyOrders);

export default router;
