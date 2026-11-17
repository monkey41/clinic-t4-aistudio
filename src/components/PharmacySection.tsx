import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem } from '../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { CLINIC_CONFIG, getThemePalette, addStoreOrder } from '../data/clinicData';
import { syncCustomerOrderToFirestore } from '../services/firebase';

interface PharmacySectionProps {
  products: Product[];
  t: Record<string, string>;
  defaultCategory?: string;
}

export const PharmacySection: React.FC<PharmacySectionProps> = ({
  products,
  t,
  defaultCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('lifecare_customer_name') || '';
    } catch {
      return '';
    }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem('lifecare_customer_phone') || '';
    } catch {
      return '';
    }
  });
  const [customerAddress, setCustomerAddress] = useState(() => {
    try {
      return localStorage.getItem('lifecare_customer_address') || '';
    } catch {
      return '';
    }
  });
  const [addressPromptError, setAddressPromptError] = useState<string | null>(null);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  const theme = getThemePalette();

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -160 : 160;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', label: t.allCategories || 'All Products', icon: '🏪' },
    { id: 'skincare', label: 'Skin Care', icon: '✨' },
    { id: 'babycare', label: 'Baby Products', icon: '👶' },
    { id: 'medicines', label: 'Medicines', icon: '💊' },
    { id: 'physio', label: t.physio || 'Physiotherapy', icon: '🦵' },
    { id: 'wellness', label: 'Wellness', icon: '🍊' },
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

  const handleSaveCustomerField = (key: string, val: string) => {
    try {
      localStorage.setItem(key, val);
    } catch {
      // ignore
    }
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    const trimmedAddress = customerAddress.trim();
    if (!trimmedAddress) {
      setAddressPromptError(
        'Please add your delivery address before placing your order.'
      );
      setTimeout(() => {
        addressInputRef.current?.focus();
      }, 50);
      return;
    }

    setAddressPromptError(null);

    const newOrder = addStoreOrder({
      customerName: customerName.trim() || 'WhatsApp Customer',
      customerPhone: customerPhone.trim() || 'Not provided',
      customerAddress: trimmedAddress,
      items: cart.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      source: 'whatsapp',
      paymentStatus: 'Pending',
      orderStatus: 'New',
    });
    syncCustomerOrderToFirestore(newOrder).catch(() => {});

    const itemList = cart
      .map(
        (item) =>
          `• ${item.product.name} (x${item.quantity}) - ₹${
            item.product.price * item.quantity
          }`
      )
      .join('\n');
    const msg = `Hello Life Care Medicine Store and Poly Clinic,\nI would like to order:\n\n${itemList}\n\n*Total: ₹${totalAmount}*\nName: ${
      customerName.trim() || 'Customer'
    }\nPhone: ${customerPhone.trim() || 'Not provided'}\nDelivery Address: ${trimmedAddress}`;
    const url = `https://wa.me/${CLINIC_CONFIG.whatsapp.replace(
      /[^0-9]/g,
      ''
    )}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="pt-4 pb-6 px-4 relative" id="store-section">
      {/* Store Section Heading */}
      <div className="mb-3 flex items-center justify-between">
        <h2
          className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${theme.headingText}`}
        >
          <span>💊</span> Pharmacy & Supplies
        </h2>
        {!customerAddress.trim() && (
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Floating Bag Pill (Bottom Right below PINCH) */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-20 right-4 z-35 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-extrabold transition-all active:scale-95 cursor-pointer border border-white/60 ${theme.primaryBtn}`}
        title="Open Order Bag"
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
          placeholder="Search medicines, skin care, baby products, physio..."
          className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-hidden shadow-2xs transition-colors border bg-white border-[#EAE4D3] text-[#122B22] focus:border-[#059669]"
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
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const activeColorClass =
              cat.id === 'wellness'
                ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                : 'bg-[#059669] text-white border-[#059669] shadow-sm';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? activeColorClass
                    : 'bg-white text-[#122B22] border-[#EAE4D3] hover:bg-[#ECFDF5]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
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
              className={`rounded-2xl p-3.5 border shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${theme.cardBg}`}
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
                  <span className={`text-[10px] font-semibold block mt-1 ${theme.accentText}`}>
                    {product.unit}
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
                      <span className="text-[10px] text-[#7C8F86] line-through">
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
                      className="w-7 h-7 rounded bg-white text-[#122B22] flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`text-xs font-bold px-1.5 ${theme.headingText}`}>
                      {inCart.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, 1)}
                      className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer ${theme.primaryBtn}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className={`active:scale-95 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${theme.primaryBtn}`}
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

      {/* Order Bag Modal (Requires Delivery Address before ordering) */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-[#122B22]/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-200 border border-[#EAE4D3] bg-[#FCFBF7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D3]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#059669]" />
                  <h3 className="font-bold text-base text-[#122B22]">
                    Your Order Bag
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="text-xs font-bold p-1 cursor-pointer text-[#4B6358]"
                >
                  ✕ Close
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#4B6358] space-y-3">
                  <p>Your bag is currently empty. Add medicines or products to order.</p>
                  <div className="text-left p-3 rounded-2xl bg-white border border-[#EAE4D3] space-y-1.5">
                    <label className="text-[11px] font-black text-[#122B22] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Saved Delivery Address</span>
                    </label>
                    <textarea
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        handleSaveCustomerField('lifecare_customer_address', e.target.value);
                      }}
                      placeholder="House/Flat No., Street, Landmark, Baripada..."
                      className="w-full px-3 py-2 text-xs border border-[#EAE4D3] rounded-xl bg-[#FCFBF7] text-[#122B22] focus:outline-[#059669]"
                    />
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE4D3] max-h-[28vh] overflow-y-auto my-2 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <span className="text-xs font-bold block line-clamp-1 text-[#122B22]">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] font-semibold text-[#059669]">
                          ₹{item.product.price} × {item.quantity} = ₹
                          {item.product.price * item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center border border-[#EAE4D3] bg-[#F7F4EC] text-[#122B22]"
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
                          className="p-1 text-rose-500 hover:text-rose-600 ml-1"
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
              <div className="pt-3 border-t border-[#EAE4D3] space-y-2.5">
                <div className="flex items-center justify-between text-sm font-bold text-[#122B22]">
                  <span>Estimated Total</span>
                  <span className="text-base text-[#059669]">₹{totalAmount}</span>
                </div>

                {addressPromptError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[11px] font-extrabold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{addressPromptError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        handleSaveCustomerField('lifecare_customer_name', e.target.value);
                      }}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 text-xs border border-[#EAE4D3] rounded-xl bg-white text-[#122B22]"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        handleSaveCustomerField('lifecare_customer_phone', e.target.value);
                      }}
                      placeholder="Mobile Number"
                      className="w-full px-3 py-2 text-xs border border-[#EAE4D3] rounded-xl bg-white text-[#122B22]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-[#122B22] flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Delivery Address *</span>
                      </span>
                      {!customerAddress.trim() && (
                        <span className="text-[10px] text-[#D97706] font-extrabold">
                          Required to place order
                        </span>
                      )}
                    </label>
                    <textarea
                      ref={addressInputRef}
                      rows={2}
                      required
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        handleSaveCustomerField('lifecare_customer_address', e.target.value);
                        if (e.target.value.trim()) {
                          setAddressPromptError(null);
                        }
                      }}
                      placeholder="Enter House No., Street, Landmark, Baripada..."
                      className={`w-full px-3 py-2 text-xs border rounded-xl bg-white text-[#122B22] focus:outline-none ${
                        addressPromptError
                          ? 'border-[#D97706] ring-2 ring-amber-300'
                          : 'border-[#EAE4D3] focus:border-[#059669]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#059669] to-[#10B981] hover:brightness-105 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
