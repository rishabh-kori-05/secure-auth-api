import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 timestamp: { type: string, format: date-time }
 *                 version: { type: string }
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

export default router;
