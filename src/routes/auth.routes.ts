import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} from '../validators/auth.validators';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.post('/verify-email', verifyEmailValidator, validate, authController.verifyEmail);

export default router;
