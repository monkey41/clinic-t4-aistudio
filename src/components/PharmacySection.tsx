import React, { useState, useRef } from 'react';
import { Product, CartItem, DarkColorOption } from '../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CLINIC_CONFIG, getThemePalette } from '../data/clinicData';

interface PharmacySectionProps {
  products: Product[];
  t: Record<string, string>;
  defaultCategory?: 'all' | 'physio' | 'medicines';
  isDark?: boolean;
  darkColor?: DarkColorOption;
}

export const PharmacySection: React.FC<PharmacySectionProps> = ({
  products,
  t,
  defaultCategory = 'all',
  isDark = false,
  darkColor = 'ocean',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const theme = getThemePalette(isDark, darkColor);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -160 : 160;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', label: t.allCategories || 'All Products', icon: '🏪' },
    { id: 'physio', label: t.physio || 'Physiotherapy', icon: '🦵' },
    { id: 'medicines', label: t.pharmacy || 'Pharmacy & Meds', icon: '💊' },
    { id: 'wellness', label: 'Immunity & Wellness', icon: '🍊' },
    { id: 'babycare', label: 'Baby Care', icon: '👶' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' ||
      p.category === selectedCategory ||
      (selectedCategory === 'physio' && p.isPhysio);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;
    const itemList = cart
      .map(
        (item) =>
          `• ${item.product.name} (x${item.quantity}) - ₹${
            item.product.price * item.quantity
          }`
      )
      .join('\n');
    const msg = `Hello Life Care Medicine Store and Poly Clinic,\nI would like to order/inquire about the following products:\n\n${itemList}\n\n*Estimated Total: ₹${totalAmount}*\nPatient/Customer: ${
      customerName || 'Customer'
    }\nPhone: ${
      customerPhone || 'Not provided'
    }\nPlease confirm availability and delivery/pickup.`;
    const url = `https://wa.me/${CLINIC_CONFIG.whatsapp.replace(
      /[^0-9]/g,
      ''
    )}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="pt-4 pb-6 px-4 relative" id="store-section">
      {/* Store Section Heading (No duplicate frozen bag here) */}
      <div className="mb-3">
        <h2
          className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 ${theme.headingText}`}
        >
          <span>💊</span> {t.pharmacyTitle || 'Pharmacy & Physio Supplies'}
        </h2>
        <p className={`text-xs mt-0.5 ${theme.subText}`}>
          Genuine medicines, braces & physiotherapy supplies
        </p>
      </div>

      {/* Single Floating Bag Pill that moves with scrolling */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-20 right-4 z-30 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-extrabold transition-all active:scale-95 cursor-pointer border ${theme.primaryBtn}`}
        title="Open Life Care Order Bag"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Bag ({totalItems})</span>
        {totalAmount > 0 && <span>• ₹{totalAmount}</span>}
      </button>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.subText}`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search medicines, knee braces, thermometers, baby cream..."
          className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-hidden shadow-2xs transition-colors border ${
            isDark
              ? `${theme.cardBg} placeholder:opacity-60`
              : 'bg-white border-teal-200 text-slate-900 focus:border-teal-700'
          }`}
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="relative flex items-center gap-1.5 pb-2">
        <button
          type="button"
          onClick={() => scrollCategories('left')}
          className={`shrink-0 p-1.5 rounded-xl border shadow-xs cursor-pointer active:scale-95 transition-all ${theme.cardBg}`}
          title="Scroll Left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={categoryScrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                selectedCategory === cat.id ? theme.primaryBtn : theme.cardBg
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollCategories('right')}
          className={`shrink-0 p-1.5 rounded-xl border shadow-xs cursor-pointer active:scale-95 transition-all ${theme.cardBg}`}
          title="Scroll Right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Physiotherapy Dedicated Highlight Banner if viewing physio */}
      {selectedCategory === 'physio' && (
        <div className={`mt-3 p-3.5 rounded-2xl shadow-sm space-y-1 border ${theme.softCardBg}`}>
          <div className={`flex items-center gap-2 font-bold text-xs ${theme.headingText}`}>
            <span>🦵</span> Physiotherapy & Rehabilitation Center
          </div>
          <p className={`text-[11px] leading-relaxed ${theme.subText}`}>
            {t.physioBody ||
              'Certified orthopedic supports, cervical collars, hot/cold gel pads, and mobility aids verified by our in-house therapists.'}
          </p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {filteredProducts.map((product) => {
          const inCart = cart.find((item) => item.product.id === product.id);
          return (
            <div
              key={product.id}
              className={`rounded-2xl p-3.5 border shadow-xs flex flex-col justify-between hover:shadow-lg transition-all ${theme.cardBg}`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 relative border ${theme.border}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {product.isPhysio && (
                    <span
                      className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${theme.primaryBtn}`}
                    >
                      Physio
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-xs leading-snug line-clamp-2 ${theme.headingText}`}>
                    {product.name}
                  </h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${theme.subText}`}>
                    {product.description}
                  </p>
                  <span className={`text-[10px] block mt-1 ${theme.accentText}`}>
                    Pack: {product.unit}
                  </span>
                </div>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between ${theme.border}`}
              >
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-extrabold ${theme.headingText}`}>
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold block ${theme.accentText}`}>
                    ✓ {t.inStock || 'In Stock'}
                  </span>
                </div>

                {inCart ? (
                  <div
                    className={`flex items-center gap-1.5 border rounded-lg p-1 ${theme.subtleBg}`}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-6 h-6 rounded bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`text-xs font-bold px-1.5 ${theme.headingText}`}>
                      {inCart.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, 1)}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer ${theme.primaryBtn}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className={`active:scale-95 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${theme.primaryBtn}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.addToCart || 'Add'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className={`text-center py-10 rounded-2xl border mt-3 p-6 ${theme.cardBg}`}>
          <p className={`text-xs font-bold ${theme.headingText}`}>
            No products match your search
          </p>
          <p className={`text-[11px] mt-1 ${theme.subText}`}>
            Need a specific prescription medicine or custom physio brace? Call our pharmacy desk directly.
          </p>
          <a
            href={`tel:${CLINIC_CONFIG.phone}`}
            className={`inline-block mt-3 text-xs font-bold px-3.5 py-2 rounded-xl ${theme.primaryBtn}`}
          >
            Call Pharmacy ({CLINIC_CONFIG.phone})
          </a>
        </div>
      )}

      {/* Cart Modal / Drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center"
          onClick={() => setCartOpen(false)}
        >
          <div
            className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-200 border ${theme.cardBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className={`flex items-center justify-between pb-3 border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                  <ShoppingBag className={`w-5 h-5 ${theme.accentText}`} />
                  <h3 className={`font-bold text-base ${theme.headingText}`}>
                    Life Care Order Bag
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className={`text-xs font-bold p-1 cursor-pointer ${theme.subText}`}
                >
                  ✕ Close
                </button>
              </div>

              {cart.length === 0 ? (
                <div className={`py-12 text-center text-xs ${theme.subText}`}>
                  Your bag is currently empty. Add medicines or physiotherapy products.
                </div>
              ) : (
                <div className={`divide-y max-h-[35vh] overflow-y-auto my-2 pr-1 ${theme.border}`}>
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <span className={`text-xs font-bold block line-clamp-1 ${theme.headingText}`}>
                          {item.product.name}
                        </span>
                        <span className={`text-[11px] font-semibold ${theme.accentText}`}>
                          ₹{item.product.price} × {item.quantity} = ₹
                          {item.product.price * item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center border ${theme.subtleBg}`}
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${theme.primaryBtn}`}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-red-400 hover:text-red-500 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className={`pt-3 border-t space-y-3 ${theme.border}`}>
                <div className={`flex items-center justify-between text-sm font-bold ${theme.headingText}`}>
                  <span>Total Estimated Cost</span>
                  <span className={`text-base ${theme.accentText}`}>₹{totalAmount}</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className={`w-full px-3 py-2 text-xs border rounded-xl ${theme.subtleBg}`}
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your Mobile for Delivery/Pickup Confirmation"
                    className={`w-full px-3 py-2 text-xs border rounded-xl ${theme.subtleBg}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Inquiry via WhatsApp</span>
                </button>

                <p className={`text-[10px] text-center ${theme.subText}`}>
                  Pharmacy verifies prescription items before dispatch. Free store pickup available.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
