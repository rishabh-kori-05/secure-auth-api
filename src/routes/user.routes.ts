import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateProfileValidator } from '../validators/auth.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.put('/profile', updateProfileValidator, validate, userController.updateProfile);

export default router;
