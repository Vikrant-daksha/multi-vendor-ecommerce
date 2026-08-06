import express, { Router } from 'express';
import {
  createStripeConnectLink,
  getSeller,
  getUser,
  loginSeller,
  loginUser,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegisteration,
  verifyUser,
  verifyUserForgotPassword,
} from '../controller/auth.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';
import { createShop, verifySeller } from '../utils/auth.helper';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

const router: Router = express.Router();

router.post('/user-registeration', userRegisteration);
router.post('/login-user', loginUser);

router.post('/verify-user', verifyUser);

router.post('/forgot-user-password', userForgotPassword);
router.post('/reset-password', resetUserPassword);
router.post('/verify-user-forgot-password', verifyUserForgotPassword);

router.post('/refresh-token', refreshToken);
router.get('/logged-in-user', isAuthenticated, getUser);

router.post('/seller-registeration', registerSeller);
router.post('/verify-seller', verifySeller);

router.post('/create-shop', createShop);

router.post('/create-stripe-link', createStripeConnectLink);
router.post('/login-seller', loginSeller);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);

export default router;
