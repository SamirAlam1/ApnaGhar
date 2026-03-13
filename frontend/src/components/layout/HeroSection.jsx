import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Shield, Home, ArrowRight } from 'lucide-react';
import SearchBar from '@/components/property/SearchBar';
import { useAuth } from '@/context/AuthContext';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
];

const stats = [
  { icon: Home,   value: '10,000+', label: 'Verified Properties' },
  { icon: Star,   value: '50,000+', label: 'Happy Families' },
  { icon: Shield, value: '100%',    label: 'RERA Compliant' },
];

export default function HeroSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setImgIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Smart redirect for "List Your Property" button
  const handleListProperty = () => {
    if (user && user.role === 'seller') {
      navigate('/list-property');
    } else if (user && user.role !== 'seller') {
      navigate('/dashboard');
    } else {
      navigate('/register?role=seller');
    }
  };

  return (
    <section
      className="relative w-full"
      style={{ height: '100vh', minHeight: '600px', maxHeight: '900px' }}
    >
      {/* Background images */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === imgIdx ? 1 : 0 }}
        >
          <img
            src={src}
            alt="Indian housing society"
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-white text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          🇮🇳 India's AI-Powered Real Estate Platform
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="font-display font-bold text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          {t('hero.heading')}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/85 text-lg sm:text-xl max-w-2xl mb-8"
        >
          {t('hero.subheading')}
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-2xl mb-8"
        >
          <SearchBar hero />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <Link
            to="/properties"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-base hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            {t('hero.explore')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Smart "List Your Property" button */}
          <button
            onClick={handleListProperty}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-white text-white font-semibold text-base hover:bg-white hover:text-blue-800 transition-all duration-200"
          >
            {t('hero.list')}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10"
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="flex items-center gap-2 text-white"
            >
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                <Icon size={16} className="text-teal-300" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">{value}</div>
                <div className="text-white/70 text-xs">{label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setImgIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}