import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ag_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ag_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = (property) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === property._id);
      if (exists) {
        toast.success('Removed from wishlist');
        return prev.filter((p) => p._id !== property._id);
      }
      toast.success('Added to wishlist ❤️');
      return [...prev, property];
    });
  };

  const isWishlisted = (id) => wishlist.some((p) => p._id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
