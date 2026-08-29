import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Booking, BookingStatus } from '../../types';
import api from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { StarRating } from '../../components/ui/StarRating';
import { SplitVisualizer } from '../../components/ui/SplitVisualizer';
import {
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Star,
  AlertCircle,
  CreditCard,
  Phone,
  Radio,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const STATUS_STEPS: BookingStatus[] = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

export const ConsumerBookings: React.FC = () => {
  const { user } = useAuth();
  const { lastEvent } = useSocket();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rating modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Payment modal state
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI_MOCK');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessLedger, setPaymentSuccessLedger] = useState<any>(null);

  // Grievance modal state
  const [grievanceBooking, setGrievanceBooking] = useState<Booking | null>(null);
  const [grievanceText, setGrievanceText] = useState<string>('');
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState<boolean>(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState<boolean>(false);

  const fetchBookings = async () => {
    try {
      const data = await api.getMyBookings();
      setBookings(data || []);
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Real-time listener: refresh bookings list whenever a socket status event arrives
  useEffect(() => {
    if (lastEvent?.eventName === 'booking:statusChanged') {
      fetchBookings();
    }
  }, [lastEvent]);

  const handleOpenRating = (b: Booking) => {
    setRatingBooking(b);
    setStars(5);
    setRatingComment('');
  };

  const handleSubmitRating = async () => {
    if (!ratingBooking) return;
    setIsSubmittingRating(true);
    try {
      await api.rateBooking(ratingBooking.id, stars, ratingComment);
      await fetchBookings();
      setRatingBooking(null);
    } catch (e: any) {
      alert(e.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenPayment = (b: Booking) => {
    setPayingBooking(b);
    setPaymentSuccessLedger(null);
  };

  const handleProcessPayment = async () => {
    if (!payingBooking) return;
    setIsProcessingPayment(true);
    try {
      const res = await api.payBooking(payingBooking.id, paymentMethod);
      setPaymentSuccessLedger(res.ledger);
      await fetchBookings();
    } catch (e: any) {
      alert(e.message || 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOpenGrievance = (b: Booking) => {
    setGrievanceBooking(b);
    setGrievanceText('');
    setGrievanceSuccess(false);
  };

  const handleSubmitGrievance = async () => {
    if (!grievanceBooking || !grievanceText) return;
    setIsSubmittingGrievance(true);
    try {
      await api.fileGrievance({
        bookingId: grievanceBooking.id,
        description: grievanceText,
      });
      setGrievanceSuccess(true);
      setTimeout(() => {
        setGrievanceBooking(null);
        setGrievanceSuccess(false);
      }, 1800);
    } catch (e: any) {
      alert(e.message || 'Failed to file grievance');
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="amber">Awaiting Provider Confirmation</Badge>;
      case 'ACCEPTED':
        return <Badge variant="blue">Confirmed / Scheduled</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="purple">Worker On Site (In Progress)</Badge>;
      case 'COMPLETED':
        return <Badge variant="green">Completed & Settled</Badge>;
      case 'CANCELLED':
        return <Badge variant="red">Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">My Service Bookings</h1>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              Live Socket Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time status of your cooperative service appointments and review ledger receipts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bookings Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't requested any services yet. Explore our verified cooperative trades to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const providerUser = b.provider?.user;
            const coop = b.provider?.cooperative;
            const currentStepIdx = STATUS_STEPS.indexOf(b.status);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Booking Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900">
                        {b.listing?.title || 'Household Service'}
                      </h3>
                      {getStatusBadge(b.status)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Booking Ref: <span className="font-mono text-slate-700">#{b.id.slice(0, 8)}</span> • Scheduled for{' '}
                      <strong>{new Date(b.scheduledAt).toLocaleDateString()} at {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Amount</span>
                      <span className="text-lg font-extrabold text-slate-900">₹{b.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Live Status Stepper */}
                {b.status !== 'CANCELLED' && (
                  <div className="px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between relative">
                        {/* Stepper track background */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        />

                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                                    : isDone
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-slate-400 border-2 border-slate-200'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] mt-1.5 font-semibold text-center uppercase tracking-wider ${
                                  isCurrent ? 'text-emerald-800 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                                }`}
                              >
                                {step.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Body Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Provider Info */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Assigned Cooperative Member
                    </span>
                    <div className="flex items-center gap-3">
                      {providerUser?.avatarUrl ? (
                        <img
                          src={providerUser.avatarUrl}
                          alt={providerUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                          {providerUser?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{providerUser?.name}</p>
                        <p className="text-[10px] text-slate-500">{coop?.name}</p>
                        {providerUser?.phone && (
                          <a
                            href={`tel:${providerUser.phone}`}
                            className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5 hover:underline"
                          >
                            <Phone className="w-3 h-3" /> {providerUser.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location & Instructions */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Service Location & Notes
                    </span>
                    <p className="text-xs text-slate-700 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{b.serviceAddress || 'Address on file'}</span>
                    </p>
                    {b.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{b.notes}"
                      </p>
                    )}
                  </div>

                  {/* Payment & Transparent Ledger Summary */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Ledger Settlement Breakdown
                    </span>
                    {b.ledgerEntry ? (
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span>Status: Settled (100% Transparent)</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Provider Direct Pay:</span>
                            <span className="font-semibold text-slate-800">₹{b.ledgerEntry.providerShare}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coop Welfare & Health Fund:</span>
                            <span className="font-semibold text-slate-800">₹{b.ledgerEntry.cooperativeFundShare}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Cloud Fee (2%):</span>
                            <span className="font-semibold text-slate-800">₹{b.ledgerEntry.platformShare}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                        <p className="text-slate-500 text-[11px]">
                          Payment held in escrow / settled upon service completion.
                        </p>
                        {b.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleOpenPayment(b)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay ₹{b.totalAmount} (Simulated UPI)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Actions Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {b.rating ? (
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
                        <span className="text-amber-800 font-semibold">Your Review:</span>
                        <StarRating rating={b.rating.stars} size="sm" />
                        {b.rating.comment && (
                          <span className="text-slate-600 italic">"{b.rating.comment}"</span>
                        )}
                      </div>
                    ) : b.status === 'COMPLETED' ? (
                      <button
                        onClick={() => handleOpenRating(b)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Rate Provider Experience
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenGrievance(b)}
                      className="text-slate-500 hover:text-rose-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Report Issue to Coop
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {ratingBooking && (
        <Modal
          isOpen={!!ratingBooking}
          onClose={() => !isSubmittingRating && setRatingBooking(null)}
          title="Rate Cooperative Service"
          subtitle={`How was your experience with ${ratingBooking.provider?.user?.name}?`}
        >
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="text-xs text-slate-500 block mb-2">Tap stars to rate:</span>
              <div className="flex justify-center">
                <StarRating rating={stars} size="lg" interactive onChange={(s) => setStars(s)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Feedback / Review (Visible to cooperative members)
              </label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="e.g. Arrived right on time, excellent quality work, transparent pricing."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRatingBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Simulated Payment Modal */}
      {payingBooking && (
        <Modal
          isOpen={!!payingBooking}
          onClose={() => !isProcessingPayment && setPayingBooking(null)}
          title="Settle Payment via Cooperative Ledger"
          subtitle={`Booking #${payingBooking.id.slice(0, 8)} • Total: ₹${payingBooking.totalAmount}`}
          maxWidth="lg"
        >
          {paymentSuccessLedger ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Payment Settled Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Transaction Ref: <span className="font-mono">{paymentSuccessLedger.transactionRef}</span>
                </p>
              </div>
              <SplitVisualizer
                totalAmount={paymentSuccessLedger.totalAmount}
                providerShare={paymentSuccessLedger.providerShare}
                welfareShare={paymentSuccessLedger.cooperativeFundShare}
                platformShare={paymentSuccessLedger.platformShare}
              />
              <button
                onClick={() => setPayingBooking(null)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <SplitVisualizer
                totalAmount={payingBooking.totalAmount}
                commissionRatePercent={payingBooking.provider?.cooperative?.commissionRatePercent || 8}
                showComparison={true}
              />

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Select Mock Payment Method</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_MOCK')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 ${
                      paymentMethod === 'UPI_MOCK'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-emerald-600 bg-emerald-600" />
                    <span>Instant UPI (GPay/PhonePe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING_MOCK')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 ${
                      paymentMethod === 'NETBANKING_MOCK'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
                    <span>Cooperative Bank Card</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  {isProcessingPayment ? 'Processing Split...' : `Pay ₹${payingBooking.totalAmount}`}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Grievance Modal */}
      {grievanceBooking && (
        <Modal
          isOpen={!!grievanceBooking}
          onClose={() => !isSubmittingGrievance && setGrievanceBooking(null)}
          title="Raise Grievance Ticket"
          subtitle={`Primary Service Cooperative Society Disciplinary & Dispute Desk`}
        >
          {grievanceSuccess ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900">Grievance Ticket Lodged</h4>
              <p className="text-xs text-slate-500">
                The cooperative society committee has received your grievance for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Cooperative gig platforms resolve issues democratically through member peer review committees.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe the Issue in Detail
                </label>
                <textarea
                  rows={4}
                  value={grievanceText}
                  onChange={(e) => setGrievanceText(e.target.value)}
                  placeholder="Explain what happened regarding service quality, arrival delay, or pricing..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGrievanceBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitGrievance}
                  disabled={isSubmittingGrievance || !grievanceText}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {isSubmittingGrievance ? 'Filing...' : 'Submit Grievance'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
