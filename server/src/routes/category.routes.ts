import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/categories - List all service categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany();
    return res.status(200).json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
