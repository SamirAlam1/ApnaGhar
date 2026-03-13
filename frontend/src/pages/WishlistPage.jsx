import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/context/WishlistContext';
import PropertyCard from '@/components/property/PropertyCard';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Heart size={20} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{t('nav.wishlist')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{wishlist.length} saved properties</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-7xl mb-4">💔</div>
            <h3 className="font-display font-bold text-xl text-gray-700 dark:text-gray-300 mb-2">No saved properties yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start exploring and save properties you love</p>
            <Link to="/properties" className="inline-flex items-center gap-2 btn-primary">
              Explore Properties <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
