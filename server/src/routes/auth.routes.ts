import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken, requireAuth } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse({
      identifier: req.body.email || req.body.phone || req.body.identifier,
      password: req.body.password,
    });

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const { identifier, password } = parsed.data;

    // Search user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'No account found with this email or phone',
      });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password entered',
      });
    }

    // Determine cooperative tenancy context
    let cooperativeId: string | null = null;

    if (user.role === UserRole.PROVIDER && user.providerProfile) {
      cooperativeId = user.providerProfile.cooperativeId;
    } else if (user.role === UserRole.COOP_ADMIN) {
      // Resolve assigned cooperative by admin context
      if (user.email.includes('pune') || user.name.toLowerCase().includes('pune')) {
        const puneCoop = await prisma.cooperative.findFirst({ where: { district: 'Pune' } });
        cooperativeId = puneCoop?.id || null;
      } else {
        const delhiCoop = await prisma.cooperative.findFirst({ where: { district: 'South Delhi' } });
        cooperativeId = delhiCoop?.id || null;
      }
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      cooperativeId,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cooperativeId,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error]', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
});

export default router;
