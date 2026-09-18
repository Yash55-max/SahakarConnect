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
      // Resolve assigned cooperative by admin context across all seeded cooperatives
      const adminCtx = (user.email + ' ' + user.name).toLowerCase();
      if (adminCtx.includes('pune')) {
        const puneCoop = await prisma.cooperative.findFirst({ where: { district: 'Pune' } });
        cooperativeId = puneCoop?.id || null;
      } else if (adminCtx.includes('mumbai')) {
        const mumbaiCoop = await prisma.cooperative.findFirst({ where: { district: 'Mumbai Suburban' } });
        cooperativeId = mumbaiCoop?.id || null;
      } else if (adminCtx.includes('bengaluru') || adminCtx.includes('blr') || adminCtx.includes('gowda')) {
        const blrCoop = await prisma.cooperative.findFirst({ where: { district: 'Bengaluru Urban' } });
        cooperativeId = blrCoop?.id || null;
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Public self-registration is strictly restricted to Consumer and Provider roles
  role: z.enum([UserRole.CONSUMER, UserRole.PROVIDER]).optional().default(UserRole.CONSUMER),
  skills: z.array(z.string()).optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const { name, email, phone, password, role, skills } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Account already exists',
        message: existing.email === email ? 'Email is already registered' : 'Phone number is already registered',
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
      },
    });

    let assignedCoopId: string | null = null;

    if (role === UserRole.PROVIDER) {
      // Assign new provider to default primary service cooperative for onboarding
      const defaultCoop =
        (await prisma.cooperative.findFirst({ where: { district: 'South Delhi' } })) ||
        (await prisma.cooperative.findFirst());

      assignedCoopId = defaultCoop ? defaultCoop.id : null;

      if (assignedCoopId) {
        // New self-registered providers require e-KYC and police clearance before becoming available
        await prisma.providerProfile.create({
          data: {
            userId: user.id,
            cooperativeId: assignedCoopId,
            membershipClass: 'CLASS_A_VOTING',
            shareCapitalAmount: 500.0,
            skills: skills && skills.length > 0 ? skills : ['General Maintenance'],
            isAadhaarVerified: false,
            isPoliceClearVerified: false,
            nsqfLevel: 1,
            ratingAverage: 0.0,
            isAvailable: false,
            h3IndexRes8: '8861969527fffff',
          },
        });
      }
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      cooperativeId: assignedCoopId,
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cooperativeId: assignedCoopId,
      },
    });
  } catch (error: any) {
    console.error('[Register Error]', error);
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
