import { Router } from 'express';
import authRoutes from './authRoutes';
import consumerRoutes from './consumerRoutes';
import providerRoutes from './providerRoutes';
import coopRoutes from './coopRoutes';
import regulatorRoutes from './regulatorRoutes';
import prisma from '../lib/prisma';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      app: 'SahakarConnect API',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Database disconnected' });
  }
});

// Seed data summary endpoint for demo switcher helper
router.get('/demo-accounts', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        providerProfile: {
          select: {
            id: true,
            cooperativeId: true,
            verificationStatus: true,
            skills: true,
            cooperative: {
              select: { id: true, name: true, district: true, state: true },
            },
          },
        },
      },
    });

    const cooperatives = await prisma.cooperative.findMany({
      select: { id: true, name: true, district: true, state: true },
    });

    res.json({
      users,
      cooperatives,
      defaultPassword: 'password123',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch demo accounts' });
  }
});

router.use('/auth', authRoutes);
router.use('/', consumerRoutes);
router.use('/providers', providerRoutes);
router.use('/coop', coopRoutes);
router.use('/regulator', regulatorRoutes);

export default router;
