import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Home,
  Building2,
  Heart,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
  ChevronDown,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";

const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef(null);
  const userRef = useRef(null);

  // Only homepage gets transparent navbar
  const isHome = location.pathname === "/";
  // Navbar is "solid" when: scrolled, dark mode, OR not on homepage
  const solid = scrolled || dark || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/properties", label: t("nav.properties"), icon: Building2 },
  ];

  const isActive = (path) => location.pathname === path;
  const currentLang = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="ApnaGhar Logo"
              className="h-9 w-9 group-hover:scale-110 transition-transform drop-shadow-md"
            />
            <span
              className={`font-display font-bold text-xl transition-colors ${
                solid
                  ? "text-gray-900 dark:text-white"
                  : "text-white"
              }`}
            >
              Apna<span className="text-teal-400">Ghar</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : solid
                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  solid
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Globe size={15} />
                <span>
                  {currentLang.flag} {currentLang.code.toUpperCase()}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50"
                  >
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          i18n.changeLanguage(l.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          i18n.language === l.code
                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className={`p-2 rounded-lg transition-all ${
                solid
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className={`relative p-2 rounded-lg transition-all ${
                  solid
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white text-sm font-medium hover:shadow-md transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${userOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {user.role?.toUpperCase()}
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {user.email}
                        </p>
                      </div>
                      {[
                        {
                          to: "/dashboard",
                          icon: LayoutDashboard,
                          label: t("nav.dashboard"),
                        },
                        ...(user.role === "seller"
                          ? [
                              {
                                to: "/list-property",
                                icon: Plus,
                                label: t("nav.listProperty"),
                              },
                            ]
                          : []),
                        {
                          to: "/wishlist",
                          icon: Heart,
                          label: t("nav.wishlist"),
                        },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <item.icon size={15} /> {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} /> {t("nav.logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    solid
                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white text-sm font-semibold hover:shadow-md hover:scale-105 transition-all"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              solid
                ? "text-gray-700 dark:text-gray-300"
                : "text-white"
            }`}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={17} /> {label}
                </Link>
              ))}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => i18n.changeLanguage(l.code)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        i18n.language === l.code
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500"
                      }`}
                    >
                      {l.flag}
                    </button>
                  ))}
                </div>
                <button
                  onClick={toggle}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white text-sm font-semibold"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
