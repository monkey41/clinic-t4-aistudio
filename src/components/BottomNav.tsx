import React from 'react';
import { Home, Users, Pill, CalendarCheck, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin';
  onTabChange: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers' | 'admin') => void;
  t: Record<string, string>;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  t,
}) => {
  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-xl h-16 backdrop-blur-xl border-t flex items-center justify-between z-40 px-2 sm:px-3 shadow-lg transition-colors bg-[#FCFBF7]/95 border-[#EAE4D3]"
    >
      {/* Left Pair: Doctors & Store */}
      <div className="flex-1 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onTabChange('doctors')}
          className={`flex flex-col items-center justify-center py-1 min-w-[48px] transition-all cursor-pointer ${
            activeTab === 'doctors'
              ? 'text-[#059669] font-black scale-105'
              : 'text-[#6A7F75] hover:text-[#059669]'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.doctorsNav || 'Doctors'}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('store')}
          className={`flex flex-col items-center justify-center py-1 min-w-[48px] transition-all cursor-pointer ${
            activeTab === 'store'
              ? 'text-[#059669] font-black scale-105'
              : 'text-[#6A7F75] hover:text-[#059669]'
          }`}
        >
          <Pill className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.storeNav || 'Store'}</span>
        </button>
      </div>

      {/* Middle: Raised Home Button */}
      <div className="relative flex flex-col items-center justify-center px-3 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          aria-label="Home"
          className="w-12 h-12 -mt-5 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 border-3 cursor-pointer border-[#FCFBF7] bg-gradient-to-tr from-[#065F46] via-[#059669] to-[#10B981] text-white shadow-emerald-900/25 ring-2 ring-[#F59E0B]/40"
        >
          <Home className="w-5 h-5" />
        </button>
        <span
          className={`text-[10px] mt-0.5 font-black ${
            activeTab === 'home' ? 'text-[#059669]' : 'text-[#6A7F75]'
          }`}
        >
          {t.home || 'Home'}
        </span>
      </div>

      {/* Right Pair: Offers & Bookings (WhatsApp moved beside Notification icon) */}
      <div className="flex-1 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onTabChange('offers')}
          className={`flex flex-col items-center justify-center py-1 min-w-[48px] transition-all cursor-pointer ${
            activeTab === 'offers'
              ? 'text-[#D97706] font-black scale-105'
              : 'text-[#6A7F75] hover:text-[#D97706]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Offers</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('appointments')}
          className={`flex flex-col items-center justify-center py-1 min-w-[48px] transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'text-[#059669] font-black scale-105'
              : 'text-[#6A7F75] hover:text-[#059669]'
          }`}
        >
          <CalendarCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bookings</span>
        </button>
      </div>
    </nav>
  );
};
