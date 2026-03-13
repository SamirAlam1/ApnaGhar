import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Vadodara'];
const TYPES  = ['Flat', 'Villa', 'PG', 'Plot'];
const BHKS   = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];

export default function SearchBar({ hero = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query,  setQuery]  = useState('');
  const [city,   setCity]   = useState('');
  const [type,   setType]   = useState('');
  const [bhk,    setBhk]    = useState('');
  const [showAdv, setShowAdv] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q',    query);
    if (city)  params.set('city', city);
    if (type)  params.set('type', type);
    if (bhk)   params.set('bhk',  bhk);
    navigate(`/properties?${params.toString()}`);
  };

  const selectClass = `flex-1 min-w-[120px] px-3 py-2.5 text-sm rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer`;

  return (
    <form onSubmit={handleSearch} className={`w-full ${hero ? 'max-w-2xl mx-auto' : ''}`}>
      <div className={`flex items-center gap-2 p-2 rounded-2xl shadow-2xl ${
        hero ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}>
        <Search size={18} className="ml-2 text-gray-400 flex-shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 px-2 py-2 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm focus:outline-none min-w-0"
        />
        <select value={city} onChange={e => setCity(e.target.value)} className={selectClass}>
          <option value="">{t('search.city')}</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setShowAdv(!showAdv)}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          title="Advanced filters"
        >
          <SlidersHorizontal size={17} />
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white text-sm font-semibold hover:shadow-md hover:scale-105 transition-all flex-shrink-0"
        >
          {t('search.button')}
        </button>
      </div>

      {showAdv && (
        <div className="mt-2 flex flex-wrap gap-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">{t('search.type')}</option>
            {TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
          <select value={bhk} onChange={e => setBhk(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">{t('search.bhk')}</option>
            {BHKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}
    </form>
  );
}
