import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Heart, Eye, TrendingUp, Plus,
  ChevronRight, AlertCircle, Trash2, X, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { propertyService, SERVER_URL } from '@/services/api';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

// Fix image URL — /uploads/... → full URL
function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${SERVER_URL}${src}`;
}

function StatCard({ icon: Icon, label, value, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-6"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  );
}

// Delete Confirmation Modal
function DeleteModal({ property, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-600 dark:text-red-400" />
        </div>

        <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white text-center mb-2">
          Delete Listing?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-1 line-clamp-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">{property?.title}</span>
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs text-center mb-6">
          Yeh action undo nahi ho sakta.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><Loader2 size={15} className="animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 size={15} /> Delete</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [myListings, setMyListings]         = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError]   = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null); // property to delete
  const [deleting, setDeleting]             = useState(false);
  const [deleteError, setDeleteError]       = useState(null);

  const fetchListings = useCallback(async () => {
    if (user?.role !== 'seller') return;
    setListingsLoading(true);
    setListingsError(null);
    try {
      const { data } = await propertyService.getMine();
      setMyListings(data.data.properties || []);
    } catch {
      setListingsError('Listings load nahi hui. Dobara try karo.');
    } finally {
      setListingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await propertyService.delete(deleteTarget._id);
      setMyListings(prev => prev.filter(p => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setDeleteError('Delete nahi hua. Dobara try karo.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please log in to view your dashboard</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    </div>
  );

  const sellerStats = [
    { icon: Building2,  label: 'My Listings',     value: listingsLoading ? '...' : myListings.length.toString(),                                               color: 'bg-blue-600'   },
    { icon: Eye,        label: 'Total Views',      value: listingsLoading ? '...' : myListings.reduce((a, p) => a + (p.views || 0), 0).toString(),              color: 'bg-purple-600' },
    { icon: TrendingUp, label: 'Active Listings',  value: listingsLoading ? '...' : myListings.filter(p => p.isActive !== false).length.toString(),             color: 'bg-teal-600'   },
    { icon: Heart,      label: 'Wishlist Saves',   value: '—',                                                                                                  color: 'bg-red-500'    },
  ];

  const buyerStats = [
    { icon: Heart,      label: 'Wishlist',          value: wishlist.length.toString(),                  color: 'bg-red-500'    },
    { icon: Eye,        label: 'Properties Viewed', value: '—',                                         color: 'bg-blue-600'   },
    { icon: Building2,  label: 'Enquiries Sent',    value: '—',                                         color: 'bg-teal-600'   },
    { icon: TrendingUp, label: 'Saved Searches',    value: (user.savedSearches?.length || 0).toString(), color: 'bg-purple-600' },
  ];

  const stats = user.role === 'seller' ? sellerStats : buyerStats;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                Welcome, {user.name}! 👋
              </h1>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                user.role === 'seller'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
              }`}>
                {user.role === 'seller' ? '🏢 Seller' : '🏠 Buyer'}
              </span>
            </div>
          </div>
          {user.role === 'seller' && (
            <Link
              to="/list-property"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-semibold hover:shadow-md hover:scale-105 transition-all"
            >
              <Plus size={16} /> List New Property
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* Content panels */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Seller listings */}
          {user.role === 'seller' && (
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
                  My Listings
                </h2>
                <Link
                  to="/list-property"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add New
                </Link>
              </div>

              {/* Delete error */}
              {deleteError && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle size={15} /> {deleteError}
                </div>
              )}

              {listingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl shimmer" />
                  ))}
                </div>
              ) : listingsError ? (
                <div className="flex items-center gap-2 text-red-500 py-4">
                  <AlertCircle size={16} />
                  <span className="text-sm">{listingsError}</span>
                  <button
                    onClick={fetchListings}
                    className="ml-2 text-blue-600 underline text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : myListings.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Building2 size={36} className="mx-auto mb-3" />
                  <p className="text-sm mb-1">Abhi tak koi listing nahi hai</p>
                  <Link
                    to="/list-property"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Pehli property list karo →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {myListings.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-3 py-3 group"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                        {p.images?.[0] ? (
                          <img
                            src={getImageUrl(p.images[0])}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 size={18} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {p.city} • {p.propertyType}
                          {p.bhk ? ` • ${p.bhk} BHK` : ''}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-400 flex-shrink-0 mr-2">
                        {formatPrice(p.price)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link
                          to={`/properties/${p._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => { setDeleteError(null); setDeleteTarget(p); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist preview */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
                Saved Properties
              </h2>
              <Link
                to="/wishlist"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Heart size={32} className="mx-auto mb-2" />
                <p className="text-sm">Koi saved property nahi</p>
                <Link
                  to="/properties"
                  className="text-xs text-blue-600 dark:text-blue-400 mt-1 block hover:underline"
                >
                  Explore karo
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {wishlist.slice(0, 4).map(p => (
                  <Link
                    to={`/properties/${p._id}`}
                    key={p._id}
                    className="flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <div className="w-14 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={getImageUrl(p.images[0])}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Building2 size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.city} • {p.propertyType}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex-shrink-0">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Profile Info
            </h2>
            <div className="space-y-3">
              {[
                ['Name',  user.name],
                ['Email', user.email],
                ['Role',  user.role],
                ['Phone', user.phone || 'Not provided'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0"
                >
                  <span className="text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          property={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleting) setDeleteTarget(null); }}
          deleting={deleting}
        />
      )}
    </div>
  );
}