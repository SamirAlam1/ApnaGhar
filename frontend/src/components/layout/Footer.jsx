import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Instagram,
  Twitter,import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Instagram, Twitter, Linkedin, Facebook, Github } from "lucide-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Ahmedabad", "Vadodara"];
const TYPES  = ["Flat", "Villa", "PG", "Plot"];

const SOCIAL_LINKS = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/samir.alam_1/",
    label: "Instagram",
    hover: "hover:bg-pink-600",
  },
  {
    icon: Twitter,
    href: "https://x.com/SamirAlamIT1",
    label: "Twitter / X",
    hover: "hover:bg-sky-500",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/samir-alam1/",
    label: "LinkedIn",
    hover: "hover:bg-blue-600",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61586364971233",
    label: "Facebook",
    hover: "hover:bg-blue-700",
  },
  {
    icon: Github,
    href: "https://github.com/SamirAlam1",
    label: "GitHub",
    hover: "hover:bg-gray-600",
  },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="ApnaGhar Logo" className="h-9 w-9 drop-shadow-md" />
              <span className="font-display font-bold text-xl text-white">
                Apna<span className="text-teal-400">Ghar</span>
              </span>
            </div>
            <p className="text-sm mb-5 leading-relaxed">
              India's smart real estate marketplace. Find verified
              properties across top Indian cities.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3 flex-wrap">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center transition-colors ${hover}`}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Properties by City</h4>
            <ul className="space-y-2">
              {CITIES.map((c) => (
                <li key={c}>
                  <Link to={`/properties?city=${c}`} className="text-sm hover:text-teal-400 transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Types */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Property Types</h4>
            <ul className="space-y-2">
              {TYPES.map((tp) => (
                <li key={tp}>
                  <Link to={`/properties?type=${tp}`} className="text-sm hover:text-teal-400 transition-colors">
                    {tp}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {[
                ["About",          "/about"],
                ["Careers",        "#"],
                ["Blog",           "#"],
                ["Contact",        "/contact"],
                ["Privacy Policy", "#"],
                ["Terms",          "#"],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2025 ApnaGhar. Made with ❤️ in India 🇮🇳
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Building2 size={12} /> RERA Registered Platform
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>MahaRERA | DDA | RERA GJ</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
  Linkedin,
  Facebook,
} from "lucide-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Ahmedabad", "Vadodara"];
const TYPES = ["Flat", "Villa", "PG", "Plot"];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.svg"
                alt="ApnaGhar Logo"
                className="h-9 w-9 drop-shadow-md"
              />
              <span className="font-display font-bold text-xl text-white">
                Apna<span className="text-teal-400">Ghar</span>
              </span>
            </div>
            <p className="text-sm mb-5 leading-relaxed">
              India's AI-powered real estate marketplace. Find verified
              properties across top Indian cities.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Properties by City
            </h4>
            <ul className="space-y-2">
              {CITIES.map((c) => (
                <li key={c}>
                  <Link
                    to={`/properties?city=${c}`}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Types */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Property Types
            </h4>
            <ul className="space-y-2">
              {TYPES.map((tp) => (
                <li key={tp}>
                  <Link
                    to={`/properties?type=${tp}`}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {tp}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {[
                ["About", "/about"],
                ["Careers", "#"],
                ["Blog", "#"],
                ["Contact", "/contact"],
                ["Privacy Policy", "#"],
                ["Terms", "#"],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2025 ApnaGhar. Made with ❤️ in India 🇮🇳
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Building2 size={12} /> RERA Registered Platform
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>MahaRERA | DDA | RERA GJ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
