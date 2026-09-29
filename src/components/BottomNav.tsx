import React from 'react';
import { Home, Users, Pill, ShieldCheck } from 'lucide-react';
import { DarkColorOption } from '../types';
import { CLINIC_CONFIG, getThemePalette } from '../data/clinicData';

interface BottomNavProps {
  activeTab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers';
  onTabChange: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers') => void;
  t: Record<string, string>;
  isDark?: boolean;
  darkColor?: DarkColorOption;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  t,
  isDark = false,
  darkColor = 'ocean',
}) => {
  const p = getThemePalette(isDark, darkColor);

  const navBg = !isDark
    ? 'bg-white/95 border-slate-200'
    : darkColor === 'ocean'
    ? 'bg-[#042f2e]/95 border-teal-700/60'
    : darkColor === 'black'
    ? 'bg-[#050505]/95 border-neutral-800'
    : 'bg-[#2a0e1d]/95 border-pink-400/35';

  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-xl h-16 backdrop-blur-md border-t flex items-center justify-between z-40 px-2 sm:px-3 shadow-lg transition-colors ${navBg}`}
    >
      {/* Left Pair: Doctors & Store */}
      <div className="flex-1 flex items-center justify-around">
        {/* Doctors Tab */}
        <button
          type="button"
          onClick={() => onTabChange('doctors')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'doctors'
              ? `${p.accentText} font-bold`
              : `${p.mutedText} hover:opacity-90`
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.doctorsNav || 'Doctors'}</span>
        </button>

        {/* Store Tab */}
        <button
          type="button"
          onClick={() => onTabChange('store')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'store'
              ? `${p.accentText} font-bold`
              : `${p.mutedText} hover:opacity-90`
          }`}
        >
          <Pill className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.storeNav || 'Store'}</span>
        </button>
      </div>

      {/* Middle: Home Button */}
      <div className="relative flex flex-col items-center justify-center px-3 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          aria-label="Home"
          className={`w-12 h-12 -mt-5 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 border-3 cursor-pointer ${
            !isDark
              ? 'border-white'
              : darkColor === 'ocean'
              ? 'border-[#042f2e]'
              : darkColor === 'black'
              ? 'border-[#050505]'
              : 'border-[#2a0e1d]'
          } ${p.primaryBtn}`}
        >
          <Home className="w-5 h-5" />
        </button>
        <span
          className={`text-[10px] mt-0.5 font-bold ${
            activeTab === 'home' ? p.accentText : p.mutedText
          }`}
        >
          {t.home || 'Home'}
        </span>
      </div>

      {/* Right Pair: Bookings & WhatsApp beside Bookings */}
      <div className="flex-1 flex items-center justify-around">
        {/* Bookings Tab */}
        <button
          type="button"
          onClick={() => onTabChange('appointments')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'appointments'
              ? `${p.accentText} font-bold`
              : `${p.mutedText} hover:opacity-90`
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bookings</span>
        </button>

        {/* WhatsApp Chat Beside Bookings */}
        <a
          href={`https://wa.me/${CLINIC_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Life%20Care%20Medicine%20Store%20and%20Poly%20Clinic%2C%20I%20would%20like%20to%20consult%20or%20inquire%20about%20medicines.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Chat"
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer group"
          title="Chat with Clinic on WhatsApp"
        >
          <svg
            className="w-5 h-5 mb-0.5 fill-[#25D366] group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className={`text-[10px] font-semibold ${p.accentText}`}>
            WhatsApp
          </span>
        </a>
      </div>
    </nav>
  );
};
