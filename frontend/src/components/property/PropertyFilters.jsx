import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CITIES    = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Vadodara'];
const TYPES     = ['Flat', 'Villa', 'PG', 'Plot'];
const BHKS      = ['1', '2', '3', '4'];
const FURNISH   = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const BUDGETS   = [
  { label: 'Under ₹30L',     min: 0,        max: 3000000 },
  { label: '₹30L – ₹60L',   min: 3000000,  max: 6000000 },
  { label: '₹60L – ₹1Cr',   min: 6000000,  max: 10000000 },
  { label: '₹1Cr – ₹3Cr',   min: 10000000, max: 30000000 },
  { label: 'Above ₹3Cr',    min: 30000000, max: 999999999 },
];

export default function PropertyFilters({ filters, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const update = (key, val) => onChange({ ...filters, [key]: val });
  const clear   = () => onChange({ city: '', type: '', bhk: '', furnishing: '', rera: false, budget: '' });
  const hasFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          hasFilters
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <SlidersHorizontal size={16} />
        {t('search.filters')}
        {hasFilters && <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
          {Object.values(filters).filter(v => v && v !== '').length}
        </span>}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-40"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800 dark:text-white">{t('search.filters')}</span>
              <div className="flex gap-2">
                {hasFilters && (
                  <button onClick={clear} className="text-xs text-red-500 hover:underline">{t('common.cancel')}</button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* City */}
              <FilterSection label={t('search.city')}>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => update('city', filters.city === c ? '' : c)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.city === c ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Budget */}
              <FilterSection label={t('search.budget')}>
                <select value={filters.budget || ''} onChange={e => update('budget', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Any Budget</option>
                  {BUDGETS.map(b => <option key={b.label} value={`${b.min}-${b.max}`}>{b.label}</option>)}
                </select>
              </FilterSection>

              {/* Property Type */}
              <FilterSection label={t('search.type')}>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map(tp => (
                    <button key={tp} onClick={() => update('type', filters.type === tp ? '' : tp)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.type === tp ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                      {tp}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* BHK */}
              <FilterSection label={t('search.bhk')}>
                <div className="flex gap-1.5">
                  {BHKS.map(b => (
                    <button key={b} onClick={() => update('bhk', filters.bhk === b ? '' : b)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        filters.bhk === b ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                      {b}{b === '4' ? '+' : ''} BHK
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Furnishing */}
              <FilterSection label={t('search.furnishing')}>
                <div className="flex flex-wrap gap-1.5">
                  {FURNISH.map(f => (
                    <button key={f} onClick={() => update('furnishing', filters.furnishing === f ? '' : f)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.furnishing === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* RERA */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('search.rera')}</span>
                <div
                  onClick={() => update('rera', !filters.rera)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${filters.rera ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${filters.rera ? 'left-6' : 'left-1'}`} />
                </div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}
