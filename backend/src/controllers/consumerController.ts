import { Response } from 'express';
import { z } from 'zod';
import { BookingStatus, Role, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middlewares/auth';
import { notifyNewBookingRequest, notifyBookingStatusChange } from '../lib/socket';
import { paymentService } from '../services/paymentService';

// 1. List Services & Categories
export const getServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, search, district, coopId } = req.query;

    const categories = await prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const whereClause: any = {
      provider: {
        // Only show verified and active providers to consumers
        verificationStatus: VerificationStatus.VERIFIED,
      },
    };

    if (category) {
      whereClause.category = {
        slug: String(category),
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { provider: { user: { name: { contains: String(search), mode: 'insensitive' } } } },
      ];
    }

    if (district) {
      whereClause.provider.cooperative = {
        district: { contains: String(district), mode: 'insensitive' },
      };
    }

    if (coopId) {
      whereClause.provider.cooperativeId = String(coopId);
    }

    const listings = await prisma.serviceListing.findMany({
      where: whereClause,
      include: {
        category: true,
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                phone: true,
              },
            },
            cooperative: {
              select: {
                id: true,
                name: true,
                district: true,
                state: true,
                commissionRatePercent: true,
              },
            },
          },
        },
      },
      orderBy: {
        provider: {
          rating: 'desc',
        },
      },
    });

    res.json({
      categories,
      listings,
    });
  } catch (error) {
    console.error('getServices error:', error);
    res.status(500).json({ error: 'Failed to fetch services and categories.' });
  }
};

// 2. Create Booking Request
const createBookingSchema = z.object({
  listingId: z.string().uuid(),
  scheduledAt: z.string(),
  serviceAddress: z.string().min(5, 'Service address is required'),
  notes: z.string().optional(),
});

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { listingId, scheduledAt, serviceAddress, notes } = createBookingSchema.parse(req.body);

    const listing = await prisma.serviceListing.findUnique({
      where: { id: listingId },
      include: {
        provider: {
          include: {
            user: true,
            cooperative: true,
          },
        },
        category: true,
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Service listing not found' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        consumerId: req.user.userId,
        providerId: listing.providerId,
        listingId: listing.id,
        status: BookingStatus.REQUESTED,
        scheduledAt: new Date(scheduledAt),
        totalAmount: listing.basePrice,
        serviceAddress,
        notes,
      },
      include: {
        listing: {
          include: { category: true },
        },
        consumer: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            cooperative: true,
          },
        },
      },
    });

    // Notify provider via real-time Socket.io
    notifyNewBookingRequest(listing.providerId, booking);

    res.status(201).json({
      message: 'Booking request created successfully',
      booking,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('createBooking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// 3. Get Booking Details
export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: { category: true },
        },
        consumer: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            cooperative: true,
          },
        },
        ledgerEntry: true,
        rating: true,
        grievance: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};

// 4. Get Consumer's Bookings
export const getMyBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { consumerId: req.user.userId },
      include: {
        listing: {
          include: { category: true },
        },
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            cooperative: true,
          },
        },
        ledgerEntry: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
};

// 5. Rate a Booking
const rateBookingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const rateBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { stars, comment } = rateBookingSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.consumerId !== req.user.userId) {
      res.status(403).json({ error: 'You can only rate your own bookings' });
      return;
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      res.status(400).json({ error: 'Can only rate completed bookings' });
      return;
    }

    // Upsert rating
    const rating = await prisma.rating.upsert({
      where: { bookingId: id },
      update: { stars, comment },
      create: {
        bookingId: id,
        consumerId: req.user.userId,
        providerId: booking.providerId,
        stars,
        comment,
      },
    });

    // Recompute provider average rating
    const allRatings = await prisma.rating.findMany({
      where: { providerId: booking.providerId },
      select: { stars: true },
    });

    const avgRating =
      allRatings.reduce((sum, r) => sum + r.stars, 0) / (allRatings.length || 1);

    await prisma.providerProfile.update({
      where: { id: booking.providerId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: allRatings.length,
      },
    });

    res.json({
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('rateBooking error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// 6. Pay for a Booking (Payment Stub & Revenue Ledger Calculation)
export const payBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { paymentMethod = 'UPI_MOCK' } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: {
          include: { cooperative: true },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const ledgerResult = await paymentService.processPayment({
      bookingId: id,
      amount: booking.totalAmount,
      paymentMethod,
    });

    res.json({
      message: 'Payment settled successfully with cooperative revenue split',
      ledger: ledgerResult,
    });
  } catch (error: any) {
    console.error('payBooking error:', error);
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
};

// 7. File Grievance Ticket
const grievanceSchema = z.object({
  bookingId: z.string().uuid().optional(),
  description: z.string().min(10, 'Grievance description must be at least 10 characters'),
});

export const fileGrievance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { bookingId, description } = grievanceSchema.parse(req.body);

    const grievance = await prisma.grievanceTicket.create({
      data: {
        raisedById: req.user.userId,
        bookingId: bookingId || null,
        description,
      },
    });

    res.status(201).json({
      message: 'Grievance ticket raised with cooperative support committee',
      grievance,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('fileGrievance error:', error);
    res.status(500).json({ error: 'Failed to file grievance' });
  }
};
