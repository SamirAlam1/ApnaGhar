import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin, BedDouble, Bath, Maximize2, Shield, Heart,
  Phone, MessageCircle, Share2, ChevronLeft, ChevronRight,
  Car, Wifi, Dumbbell, Train, CheckCircle2,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { propertyService, SERVER_URL } from '@/services/api';

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${SERVER_URL}${src}`;
}

const AMENITY_ICONS = {
  'Parking': Car,
  'WiFi': Wifi,
  'Gym': Dumbbell,
  'Metro Nearby': Train,
};

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggle, isWishlisted } = useWishlist();
  const [property, setProperty] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await propertyService.getById(id);
        if (!cancelled) setProperty(data.data.property);
      } catch {
        if (!cancelled) setError('Property not found or could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏚️</div>
        <h2 className="font-display font-bold text-2xl text-gray-800 dark:text-white mb-2">Property Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'This property may no longer be available.'}</p>
        <button onClick={() => navigate('/properties')} className="btn-primary">Browse Properties</button>
      </div>
    </div>
  );

  const wishlisted = isWishlisted(property._id);
  const imgs = property.images?.length
    ? property.images.map(getImageUrl)
    : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 mt-4">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight size={14} />
          <Link to="/properties" className="hover:text-blue-600 dark:hover:text-blue-400">{t('nav.properties')}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-white line-clamp-1">{property.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-72 sm:h-96">
                <img
                  src={imgs[imgIdx]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % imgs.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imgs.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${property.listingType === 'rent' ? 'bg-purple-600' : 'bg-blue-700'}`}>
                    {property.listingType === 'rent' ? t('property.for_rent') : t('property.for_sale')}
                  </span>
                  {property.reraApproved && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1">
                      <Shield size={10} /> {t('property.rera_approved')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <MapPin size={15} />
                    <span>{property.locality}, {property.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-3xl text-blue-700 dark:text-blue-400">{formatPrice(property.price)}</div>
                  {property.listingType === 'rent' && <div className="text-gray-500 text-sm">/ month</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-gray-700">
                {property.bhk && (
                  <div className="text-center">
                    <BedDouble size={22} className="mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">{property.bhk} BHK</div>
                    <div className="text-xs text-gray-500">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath size={22} className="mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">{property.bathrooms}</div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center">
                    <Maximize2 size={22} className="mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">{property.area}</div>
                    <div className="text-xs text-gray-500">sq.ft</div>
                  </div>
                )}
                {property.furnishing && (
                  <div className="text-center">
                    <div className="text-xl mb-1">🛋️</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{property.furnishing}</div>
                    <div className="text-xs text-gray-500">Furnishing</div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-2">{t('property.description')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{property.description}</p>
              </div>
            </motion.div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">{t('property.amenities')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((a) => {
                    const Icon = AMENITY_ICONS[a] || CheckCircle2;
                    return (
                      <div key={a} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                          <Icon size={14} className="text-teal-600 dark:text-teal-400" />
                        </div>
                        <span className="text-sm">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-24">
              <div className="text-center mb-5">
                <div className="font-display font-bold text-3xl text-blue-700 dark:text-blue-400">{formatPrice(property.price)}</div>
                {property.listingType === 'rent' && <div className="text-sm text-gray-500 mt-1">per month</div>}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.propertyType} • {property.city}</div>
              </div>

              <div className="space-y-3">
                {property.seller?.phone ? (
                  <a
                    href={`tel:${property.seller.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <Phone size={16} /> {t('property.contact_seller')}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 font-semibold cursor-not-allowed"
                  >
                    <Phone size={16} /> Contact Unavailable
                  </button>
                )}

                {property.seller?.phone && (
                  <a
                    href={`https://wa.me/${property.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${property.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(property)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                      wishlisted
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-500'
                    }`}
                  >
                    <Heart size={15} className={wishlisted ? 'fill-red-500' : ''} />
                    {wishlisted ? 'Saved' : t('property.add_wishlist')}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 font-semibold text-sm transition-colors"
                  >
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-2">
                {[
                  ['Property ID', property._id?.slice(-8).toUpperCase()],
                  ['Type', property.propertyType],
                  ['Listed On', new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                  ...(property.seller ? [['Seller', property.seller.name]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{k}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}