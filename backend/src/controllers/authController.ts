import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateTokens, verifyRefreshToken } from '../lib/jwt';
import { AuthenticatedRequest } from '../middlewares/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role).default(Role.CONSUMER),
  // Optional provider fields
  cooperativeId: z.string().optional(),
  skills: z.array(z.string()).optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
      },
    });

    if (existingUser) {
      res.status(400).json({ error: 'A user with this email or phone already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        role: validatedData.role,
      },
    });

    // If role is PROVIDER, create ProviderProfile
    if (validatedData.role === Role.PROVIDER) {
      // If no coopId given, assign to the first available cooperative
      let coopId = validatedData.cooperativeId;
      if (!coopId) {
        const firstCoop = await prisma.cooperative.findFirst();
        coopId = firstCoop?.id;
      }

      if (coopId) {
        await prisma.providerProfile.create({
          data: {
            userId: user.id,
            cooperativeId: coopId,
            skills: validatedData.skills || ['General Household Services'],
            verified: false,
            verificationStatus: VerificationStatus.PENDING,
            address: validatedData.address || 'Delhi NCR',
            lat: validatedData.lat || 28.6139,
            lng: validatedData.lng || 77.2090,
          },
        });
      }
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        providerProfile: {
          include: { cooperative: true },
        },
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userProfile?.id,
        name: userProfile?.name,
        email: userProfile?.email,
        phone: userProfile?.phone,
        role: userProfile?.role,
        avatarUrl: userProfile?.avatarUrl,
        providerProfile: userProfile?.providerProfile,
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: {
          include: { cooperative: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        providerProfile: user.providerProfile,
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required.' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        providerProfile: {
          include: { cooperative: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        providerProfile: user.providerProfile,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        providerProfile: {
          include: {
            cooperative: true,
            listings: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      providerProfile: user.providerProfile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
