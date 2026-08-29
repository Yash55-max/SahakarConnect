import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ServiceListing, ServiceCategory } from '../../types';
import api from '../../lib/api';
import { StarRating } from '../../components/ui/StarRating';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SplitVisualizer } from '../../components/ui/SplitVisualizer';
import {
  Search,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  Zap,
  Cpu,
  Hammer,
  HeartHandshake,
  GraduationCap,
  UtensilsCrossed,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  plumbing: <Wrench className="w-5 h-5" />,
  electrical: <Zap className="w-5 h-5" />,
  cleaning: <Sparkles className="w-5 h-5" />,
  'appliance-repair': <Cpu className="w-5 h-5" />,
  carpentry: <Hammer className="w-5 h-5" />,
  'elder-care': <HeartHandshake className="w-5 h-5" />,
  tutoring: <GraduationCap className="w-5 h-5" />,
  cooking: <UtensilsCrossed className="w-5 h-5" />,
};

export const ConsumerHome: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Modal State
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [serviceAddress, setServiceAddress] = useState<string>('Flat 402, Green Park Residency, South Delhi');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Load services and categories
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await api.getServices({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        district: districtFilter || undefined,
      });
      setCategories(res.categories || []);
      setListings(res.listings || []);
    } catch (e) {
      console.error('Failed to load services:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, districtFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleOpenBooking = (listing: ServiceListing) => {
    // If not logged in, auto-login as demo consumer for smooth testing
    if (!user) {
      login('rahul.sharma@example.com', 'password123');
    }
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setScheduledDate(today.toISOString().split('T')[0]);
    setSelectedListing(listing);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedListing) return;
    setIsSubmittingBooking(true);
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      const res = await api.createBooking({
        listingId: selectedListing.id,
        scheduledAt: scheduledDateTime.toISOString(),
        serviceAddress,
        notes: bookingNotes,
      });

      setBookingSuccessId(res.booking.id);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccessId(null);
        navigate('/bookings');
      }, 1800);
    } catch (e: any) {
      alert(e.message || 'Failed to create booking');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Cooperative Mission */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cooperative Gig Economy Platform (SIH26089)
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Book Verified Local Experts with <span className="text-emerald-400">Zero Exploitative Cuts</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Directly connect with household plumbers, electricians, cleaners, and tutors registered with
            local Primary Service Cooperative Societies (PSCS). Over <strong>90% of your payment</strong> goes directly to the worker + cooperative welfare fund.
          </p>

          {/* Search & Location Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-3 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plumbing, AC repair, deep cleaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="relative sm:w-48">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-slate-800/90 text-white rounded-xl border border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">All Districts</option>
                <option value="Delhi">South Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Bengaluru">Bengaluru Urban</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Find Services
            </button>
          </form>

          {/* Value props ticker */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Cooperative KYC Verified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent Revenue Ledger
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Job Tracking
            </span>
          </div>
        </div>
      </section>

      {/* Categories Filter Tabs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Service Categories</h2>
            <p className="text-xs text-slate-500">Select a trade to view certified cooperative members</p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                className={`p-3.5 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-2 group ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                    : 'bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-700 hover:border-emerald-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                  }`}
                >
                  {CATEGORY_ICONS[cat.slug] || <Layers className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Service Listings Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available Cooperative Services
            </h2>
            <p className="text-xs text-slate-500">
              Showing {listings.length} verified listings across primary cooperative societies
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Wrench className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verified provider listings match your current filters. Try resetting the category or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setDistrictFilter('');
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              View All Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const provider = listing.provider;
              const user = provider?.user;
              const coop = provider?.cooperative;
              const commissionRate = coop?.commissionRatePercent || 10;
              const providerTakeHome = Math.round((listing.basePrice * ((100 - commissionRate) / 100)));

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:border-emerald-300"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Category + Verified Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                        {CATEGORY_ICONS[listing.category?.slug || ''] || <Wrench className="w-3 h-3" />}
                        {listing.category?.name}
                      </span>
                      <Badge variant="green" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                        PSCS Verified
                      </Badge>
                    </div>

                    {/* Listing Title & Description */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>
                    </div>

                    {/* Provider Info Card */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                            {user?.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {coop?.name ? coop.name.slice(0, 22) + '...' : 'Coop Member'}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={provider?.rating || 5.0} size="sm" showNumber count={provider?.ratingCount} />
                    </div>

                    {/* Transparent Take-Home Callout */}
                    <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-200/60 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-semibold block">
                          Coop Worker Direct Share ({100 - commissionRate}%)
                        </span>
                        <span className="text-xs font-extrabold text-emerald-900">
                          ₹{providerTakeHome} to {user?.name?.split(' ')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {commissionRate}% Coop & Tech
                      </span>
                    </div>
                  </div>

                  {/* Pricing Footer + Book Action */}
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Base Price
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-900">₹{listing.basePrice}</span>
                        <span className="text-[10px] text-slate-500">{listing.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(listing)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 hover:scale-102"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking Modal with Live Revenue Split Preview */}
      {selectedListing && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => !isSubmittingBooking && setIsBookingModalOpen(false)}
          title={`Book ${selectedListing.title}`}
          subtitle={`Verified Service by ${selectedListing.provider?.user?.name} (${selectedListing.provider?.cooperative?.name})`}
          maxWidth="lg"
        >
          {bookingSuccessId ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Booking Request Dispatched!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Real-time alert sent to {selectedListing.provider?.user?.name}. Redirecting to your active bookings...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Split Visualizer */}
              <SplitVisualizer
                totalAmount={selectedListing.basePrice}
                commissionRatePercent={selectedListing.provider?.cooperative?.commissionRatePercent || 8}
                showComparison={true}
              />

              {/* Form details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Preferred Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Preferred Time
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="10:00">10:00 AM (Morning Slot)</option>
                    <option value="14:00">02:00 PM (Afternoon Slot)</option>
                    <option value="17:00">05:00 PM (Evening Slot)</option>
                    <option value="19:00">07:00 PM (Night Slot)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Service Location / Address
                </label>
                <input
                  type="text"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Apartment, Street, Locality, City"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Specific Issue or Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Pipe is leaking beneath kitchen sink. Bring 1-inch pipe sealant."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  disabled={isSubmittingBooking}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmittingBooking || !scheduledDate || !serviceAddress}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Dispatching Request...' : `Confirm & Book (₹${selectedListing.basePrice})`}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
