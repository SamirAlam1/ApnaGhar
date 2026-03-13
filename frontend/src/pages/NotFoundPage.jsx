import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl mb-4">🏡</div>
        <h1 className="font-display font-bold text-6xl text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">Page not found</p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">The property you're looking for has moved or doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 btn-primary">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
