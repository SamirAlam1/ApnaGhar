import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Maximize2, BedDouble, Bath, Shield, Car, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/context/WishlistContext';
import { SERVER_URL } from '@/services/api';

const AMENITY_ICONS = { Parking: Car, Gym: Dumbbell };

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${SERVER_URL}${src}`;
}

export default function PropertyCard({ property, index = 0 }) {
  const { t } = useTranslation();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(property._id);

  const imageUrl = getImageUrl(property.images?.[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="card group overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-5xl">🏠</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${
            property.listingType === 'rent' ? 'bg-purple-600' : 'bg-blue-700'
          }`}>
            {property.listingType === 'rent' ? t('property.for_rent') : t('property.for_sale')}
          </span>
          {property.reraApproved && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white flex items-center gap-1">
              <Shield size={10} /> RERA
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(property); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          }`}
        >
          <Heart size={15} className={wishlisted ? 'fill-white' : ''} />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-bold text-lg drop-shadow-lg">{formatPrice(property.price)}</span>
          {property.listingType === 'rent' && <span className="text-white/80 text-xs">/month</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white text-base mb-1 line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
          <MapPin size={13} />
          <span className="truncate">{property.locality}, {property.city}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          {property.bhk && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} /> {property.bhk} BHK
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath size={14} /> {property.bathrooms}
            </span>
          )}
          {property.area && (
            <span className="flex items-center gap-1">
              <Maximize2 size={14} /> {property.area} sqft
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {property.furnishing && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
              {property.furnishing}
            </span>
          )}
          {property.propertyType && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
              {property.propertyType}
            </span>
          )}
        </div>

        <Link
          to={`/properties/${property._id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white text-sm font-semibold hover:shadow-md hover:scale-[1.02] transition-all"
        >
          {t('property.view_details')}
        </Link>
      </div>
    </motion.div>
  );
}