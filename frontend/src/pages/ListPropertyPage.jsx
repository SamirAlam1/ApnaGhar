import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Building2, MapPin, IndianRupee, Home, Layers, Upload, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/api';

const CITIES    = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Vadodara', 'Bihar','Uttar Pradesh'];
const TYPES     = ['Flat', 'Villa', 'PG', 'Plot'];
const BHKS      = [1, 2, 3, 4, 5];
const FURNISH   = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITIES = ['Lift', 'Parking', 'Gym', 'Swimming Pool', 'Club House', 'Security', 'Power Backup', 'Metro Nearby', 'WiFi', 'Garden'];

export default function ListPropertyPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '',
    city: '',
    locality: '',
    price: '',
    listingType: 'sale',
    propertyType: '',
    bhk: '',
    bathrooms: '',
    area: '',
    furnishing: '',
    reraApproved: false,
    amenities: [],
    description: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append all text fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'amenities') {
          formData.append('amenities', JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Append images
      images.forEach((file) => formData.append('images', file));

      await propertyService.create(formData);
      toast.success('Property listed successfully! 🏡');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to list property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== 'seller') return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Only sellers can list properties</p>
        <button
          onClick={() => navigate('/register?role=seller')}
          className="btn-primary"
        >
          Register as Seller
        </button>
      </div>
    </div>
  );

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">List Your Property</h1>
          <p className="text-gray-500 dark:text-gray-400">Reach thousands of verified buyers across India</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>{s}</div>
              {s < 4 && <div className={`h-1 w-10 rounded-full transition-all ${step > s ? 'bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
          <span className="text-sm text-gray-500 ml-2">Step {step} of 4</span>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sm:p-8">
          <form
            onSubmit={step < 4 ? (e) => { e.preventDefault(); setStep((s) => s + 1); } : handleSubmit}
            encType="multipart/form-data"
          >
            {/* ── STEP 1: Basic Details ── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" /> Basic Details
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Title *</label>
                  <input
                    value={form.title}
                    onChange={set('title')}
                    required
                    placeholder="e.g. 3 BHK Flat in Bandra West"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                    <select value={form.city} onChange={set('city')} required className={inputClass}>
                      <option value="">Select city</option>
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Locality *</label>
                    <input
                      value={form.locality}
                      onChange={set('locality')}
                      required
                      placeholder="Area / Locality"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Listing Type *</label>
                  <div className="flex gap-3">
                    {[['sale', '🏠 For Sale'], ['rent', '🔑 For Rent']].map(([v, label]) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setForm((f) => ({ ...f, listingType: v }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.listingType === v
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Property Details ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Home size={20} className="text-blue-600" /> Property Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Type *</label>
                    <select value={form.propertyType} onChange={set('propertyType')} required className={inputClass}>
                      <option value="">Select type</option>
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">BHK</label>
                    <select value={form.bhk} onChange={set('bhk')} className={inputClass}>
                      <option value="">Select BHK</option>
                      {BHKS.map((b) => <option key={b} value={b}>{b} BHK</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Area (sq.ft) *</label>
                    <input
                      type="number"
                      value={form.area}
                      onChange={set('area')}
                      required
                      min="1"
                      placeholder="e.g. 1200"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={set('price')}
                      required
                      min="1"
                      placeholder="e.g. 5000000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Furnishing</label>
                    <select value={form.furnishing} onChange={set('furnishing')} className={inputClass}>
                      <option value="">Select</option>
                      {FURNISH.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bathrooms</label>
                    <select value={form.bathrooms} onChange={set('bathrooms')} className={inputClass}>
                      <option value="">Select</option>
                      {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reraApproved}
                    onChange={(e) => setForm((f) => ({ ...f, reraApproved: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RERA Approved</span>
                </label>
              </div>
            )}

            {/* ── STEP 3: Amenities, Description & Images ── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-blue-600" /> Amenities & Media
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          form.amenities.includes(a)
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    required
                    rows={4}
                    placeholder="Describe your property in detail..."
                    className={inputClass + ' resize-none'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Photos</label>
                  <label className="block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload photos</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — up to 10 MB each</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {previews.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Submit ── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> Review & Submit
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your contact details from your profile will be shown to buyers.
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail size={14} /> {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone size={14} /> {user.phone}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm space-y-1">
                  <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">📋 Property Summary</p>
                  <p className="text-gray-600 dark:text-gray-400">🏠 {form.title || '—'}</p>
                  <p className="text-gray-600 dark:text-gray-400">📍 {form.locality}, {form.city}</p>
                  <p className="text-gray-600 dark:text-gray-400">💰 ₹{Number(form.price || 0).toLocaleString('en-IN')}</p>
                  <p className="text-gray-600 dark:text-gray-400">📐 {form.area} sq.ft {form.bhk ? `| ${form.bhk} BHK` : ''} | {form.propertyType}</p>
                  <p className="text-gray-600 dark:text-gray-400">📸 {images.length} photo(s) selected</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-7">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold hover:shadow-lg disabled:opacity-60 transition-all hover:scale-[1.02]"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : step < 4 ? 'Next Step →' : '🚀 List Property'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
