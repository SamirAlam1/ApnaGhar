import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid3X3, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFilters from '@/components/property/PropertyFilters';
import SearchBar from '@/components/property/SearchBar';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { propertyService } from '@/services/api';

export default function PropertiesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    bhk: searchParams.get('bhk') || '',
    furnishing: '',
    rera: false,
    budget: '',
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sort: sortBy,
        q: searchParams.get('q') || undefined,
      };
      if (filters.city) params.city = filters.city;
      if (filters.type) params.type = filters.type;
      if (filters.bhk) params.bhk = filters.bhk;
      if (filters.furnishing) params.furnishing = filters.furnishing;
      if (filters.rera) params.rera = 'true';
      if (filters.budget) {
        const [min, max] = filters.budget.split('-').map(Number);
        params.minPrice = min;
        params.maxPrice = max;
      }

      const { data } = await propertyService.getAll(params);
      setProperties(data.data.properties || []);
      setTotal(data.data.total || 0);
    } catch {
      setError('Failed to load properties. Please try again.');
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, searchParams]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">
            {t('nav.properties')}
          </h1>
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <PropertyFilters filters={filters} onChange={setFilters} />
            {!loading && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> properties found
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="default">Most Relevant</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {[['grid', Grid3X3], ['list', List]].map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-2.5 transition-colors ${view === v ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="font-display font-bold text-xl text-gray-700 dark:text-gray-300 mb-2">Something went wrong</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={loadProperties} className="btn-primary">Try Again</button>
          </motion.div>
        ) : properties.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="font-display font-bold text-xl text-gray-700 dark:text-gray-300 mb-2">{t('common.no_results')}</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl'}`}>
            {properties.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
