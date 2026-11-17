import React from 'react';
import {
  BannerColorPreset,
  ClinicPromotionsConfig,
  FestiveThemeId,
  PromoLinkTab,
  SpecialOffer,
} from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface FestivePresetAsset {
  id: string;
  festival: FestiveThemeId;
  label: string;
  badgeText: string;
  cardBg: string;
  accentColor: string;
}

export const FESTIVALS_META: {
  id: FestiveThemeId;
  label: string;
  gradient: string;
}[] = [
  { id: 'none', label: 'None (Off)', gradient: 'from-stone-200 to-stone-300' },
  { id: 'diwali', label: 'Diwali / Deepavali', gradient: 'from-amber-500 via-orange-500 to-rose-500' },
  { id: 'holi', label: 'Holi', gradient: 'from-pink-500 via-emerald-500 to-amber-400' },
  { id: 'dussehra', label: 'Durga Puja / Dussehra', gradient: 'from-rose-500 via-amber-500 to-orange-500' },
  { id: 'eid', label: 'Eid Mubarak', gradient: 'from-emerald-600 via-teal-600 to-amber-500' },
  { id: 'christmas', label: 'Christmas', gradient: 'from-emerald-700 via-red-500 to-amber-400' },
  { id: 'newyear', label: 'New Year', gradient: 'from-emerald-600 via-amber-500 to-emerald-400' },
  { id: 'independence', label: 'Independence / Republic Day', gradient: 'from-orange-500 via-white to-emerald-600' },
  { id: 'healthday', label: 'Health Camp / Wellness & Offers', gradient: 'from-emerald-600 via-teal-500 to-amber-500' },
];

export const FESTIVE_ASSETS: FestivePresetAsset[] = [
  // Diwali (4 options)
  {
    id: 'diwali_diya',
    festival: 'diwali',
    label: 'Glowing Diya Lamp',
    badgeText: 'Shubh Deepavali',
    cardBg: 'from-[#FEF9EB] via-[#FEF3C7] to-[#FFEDD5]',
    accentColor: '#D97706',
  },
  {
    id: 'diwali_lanterns',
    festival: 'diwali',
    label: 'Floating Sky Lanterns',
    badgeText: 'Festival of Lights',
    cardBg: 'from-[#064E3B] via-[#065F46] to-[#78350F]',
    accentColor: '#FBBF24',
  },
  {
    id: 'diwali_rangoli',
    festival: 'diwali',
    label: 'Sparkle Rangoli Floral',
    badgeText: 'Festive Greetings',
    cardBg: 'from-[#FFFDF7] via-[#FEF3C7] to-[#ECFDF5]',
    accentColor: '#D97706',
  },
  {
    id: 'diwali_fireworks',
    festival: 'diwali',
    label: 'Golden Sparkler Burst',
    badgeText: 'Happy Deepavali',
    cardBg: 'from-[#122B22] via-[#064E3B] to-[#92400E]',
    accentColor: '#F59E0B',
  },
  // Holi (3 options)
  {
    id: 'holi_splash',
    festival: 'holi',
    label: 'Gulal Color Splash',
    badgeText: 'Happy Holi',
    cardBg: 'from-[#FCFBF7] via-[#ECFDF5] to-[#FEF3C7]',
    accentColor: '#DB2777',
  },
  {
    id: 'holi_confetti',
    festival: 'holi',
    label: 'Floating Color Dots',
    badgeText: 'Festival of Colors',
    cardBg: 'from-[#FFF1F2] via-[#FEF9C3] to-[#ECFDF5]',
    accentColor: '#059669',
  },
  {
    id: 'holi_pichkari',
    festival: 'holi',
    label: 'Holi Celebration Sprays',
    badgeText: 'Colorful Wishes',
    cardBg: 'from-[#ECFDF5] via-[#FFFBEB] to-[#FCE7F3]',
    accentColor: '#EA580C',
  },
  // Dussehra / Durga Puja (3 options)
  {
    id: 'dussehra_lotus',
    festival: 'dussehra',
    label: 'Sacred Golden Lotus',
    badgeText: 'Shubho Sharodiya',
    cardBg: 'from-[#FFFDF7] via-[#FEF3C7] to-[#FFE4E6]',
    accentColor: '#E11D48',
  },
  {
    id: 'dussehra_toran',
    festival: 'dussehra',
    label: 'Marigold Toran Garland',
    badgeText: 'Happy Dussehra',
    cardBg: 'from-[#FEF3C7] via-[#ECFDF5] to-[#FFEDD5]',
    accentColor: '#EA580C',
  },
  {
    id: 'dussehra_kalash',
    festival: 'dussehra',
    label: 'Mangal Kalash & Leaves',
    badgeText: 'Festive Blessings',
    cardBg: 'from-[#FCFBF7] via-[#ECFDF5] to-[#FEF3C7]',
    accentColor: '#059669',
  },
  // Eid (3 options)
  {
    id: 'eid_crescent',
    festival: 'eid',
    label: 'Crescent Moon & Stars',
    badgeText: 'Eid Mubarak',
    cardBg: 'from-[#064E3B] via-[#047857] to-[#122B22]',
    accentColor: '#FBBF24',
  },
  {
    id: 'eid_lantern',
    festival: 'eid',
    label: 'Hanging Fanous Lanterns',
    badgeText: 'Warm Wishes',
    cardBg: 'from-[#ECFDF5] via-[#FCFBF7] to-[#FEF3C7]',
    accentColor: '#059669',
  },
  {
    id: 'eid_stars',
    festival: 'eid',
    label: 'Golden Mosque Arch & Stars',
    badgeText: 'Eid Greetings',
    cardBg: 'from-[#D1FAE5] via-[#ECFDF5] to-[#FEF3C7]',
    accentColor: '#065F46',
  },
  // Christmas (3 options)
  {
    id: 'christmas_tree',
    festival: 'christmas',
    label: 'Twinkling Pine & Star',
    badgeText: 'Merry Christmas',
    cardBg: 'from-[#ECFDF5] via-[#FCFBF7] to-[#FEF3C7]',
    accentColor: '#059669',
  },
  {
    id: 'christmas_snow',
    festival: 'christmas',
    label: 'Winter Snowfall Glow',
    badgeText: 'Season Greetings',
    cardBg: 'from-[#F0FDF4] via-[#FCFBF7] to-[#FEF9C3]',
    accentColor: '#047857',
  },
  {
    id: 'christmas_bell',
    festival: 'christmas',
    label: 'Golden Bells & Holly',
    badgeText: 'Warm Holiday Wishes',
    cardBg: 'from-[#FFFBEB] via-[#ECFDF5] to-[#FEE2E2]',
    accentColor: '#D97706',
  },
  // New Year (3 options)
  {
    id: 'newyear_confetti',
    festival: 'newyear',
    label: 'Celebration Ribbons',
    badgeText: 'Happy New Year',
    cardBg: 'from-[#FCFBF7] via-[#ECFDF5] to-[#FEF3C7]',
    accentColor: '#059669',
  },
  {
    id: 'newyear_stars',
    festival: 'newyear',
    label: 'Emerald & Gold Starlight',
    badgeText: 'Healthy Year Ahead',
    cardBg: 'from-[#122B22] via-[#064E3B] to-[#065F46]',
    accentColor: '#FBBF24',
  },
  {
    id: 'newyear_sparkles',
    festival: 'newyear',
    label: '2026 Golden Crown Glow',
    badgeText: 'New Year Wellness',
    cardBg: 'from-[#FFFDF7] via-[#FEF3C7] to-[#D1FAE5]',
    accentColor: '#D97706',
  },
  // Independence / Republic Day (2 options)
  {
    id: 'independence_ribbon',
    festival: 'independence',
    label: 'Tricolor Celebration Crest',
    badgeText: 'Jai Hind',
    cardBg: 'from-[#FFF7ED] via-[#FCFBF7] to-[#ECFDF5]',
    accentColor: '#059669',
  },
  {
    id: 'independence_kite',
    festival: 'independence',
    label: 'Tricolor Floating Flags',
    badgeText: 'Proud India',
    cardBg: 'from-[#FFEDD5] via-[#FFFFFF] to-[#D1FAE5]',
    accentColor: '#EA580C',
  },
  // Health Day & Promotional Ads (4 options)
  {
    id: 'healthday_heart',
    festival: 'healthday',
    label: 'Care & Pulse Emblem',
    badgeText: 'Community Health',
    cardBg: 'from-[#ECFDF5] via-[#FCFBF7] to-[#FEF3C7]',
    accentColor: '#059669',
  },
  {
    id: 'promo_flash_sale',
    festival: 'healthday',
    label: 'Golden Discount Badge',
    badgeText: 'Special Offer',
    cardBg: 'from-[#FEF3C7] via-[#FFFDF7] to-[#ECFDF5]',
    accentColor: '#D97706',
  },
  {
    id: 'promo_medicine_bag',
    festival: 'healthday',
    label: 'Pharmacy Express Delivery',
    badgeText: 'Fast Pharmacy',
    cardBg: 'from-[#ECFDF5] via-[#D1FAE5] to-[#FCFBF7]',
    accentColor: '#059669',
  },
  {
    id: 'promo_gift_box',
    festival: 'healthday',
    label: 'Wellness Gift Offer',
    badgeText: 'Health Package',
    cardBg: 'from-[#FFFBEB] via-[#FCFBF7] to-[#ECFDF5]',
    accentColor: '#D97706',
  },
];

export function getAssetsForFestival(festival: FestiveThemeId): FestivePresetAsset[] {
  return FESTIVE_ASSETS.filter((a) => a.festival === festival);
}

export const FestiveArtwork: React.FC<{
  assetId?: string;
  festival?: FestiveThemeId;
  size?: 'sm' | 'md' | 'lg';
}> = ({ assetId, festival = 'diwali', size = 'md' }) => {
  const effectiveId =
    assetId && assetId.startsWith('preset:') ? assetId.replace('preset:', '') : assetId;
  const resolved =
    effectiveId || getAssetsForFestival(festival)[0]?.id || 'diwali_diya';

  const dims =
    size === 'sm' ? 'w-11 h-11' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  if (resolved === 'diwali_diya') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <defs>
          <radialGradient id="flameGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="24" r="18" fill="url(#flameGlow)" className="animate-pulse" />
        <path d="M40 12C45 20 48 27 40 34C32 27 35 20 40 12Z" fill="#FBBF24" />
        <path d="M40 18C43 23 44 27 40 32C36 27 37 23 40 18Z" fill="#FEF9C3" />
        <path d="M16 44C18 58 28 65 40 65C52 65 62 58 64 44H16Z" fill="#D97706" />
        <ellipse cx="40" cy="44" rx="24" ry="6" fill="#F59E0B" />
        <circle cx="24" cy="22" r="2" fill="#FCD34D" className="animate-ping" />
        <circle cx="57" cy="20" r="2" fill="#FDE68A" className="animate-ping" />
      </svg>
    );
  }

  if (resolved === 'diwali_fireworks') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse">
          <line x1="40" y1="12" x2="40" y2="26" />
          <line x1="40" y1="54" x2="40" y2="68" />
          <line x1="12" y1="40" x2="26" y2="40" />
          <line x1="54" y1="40" x2="68" y2="40" />
          <line x1="20" y1="20" x2="30" y2="30" stroke="#10B981" />
          <line x1="60" y1="20" x2="50" y2="30" stroke="#FBBF24" />
          <line x1="20" y1="60" x2="30" y2="50" stroke="#FBBF24" />
          <line x1="60" y1="60" x2="50" y2="50" stroke="#10B981" />
        </g>
        <circle cx="40" cy="40" r="7" fill="#FBBF24" />
        <circle cx="40" cy="40" r="3" fill="#FFFBEB" />
      </svg>
    );
  }

  if (resolved === 'diwali_lanterns' || resolved === 'eid_lantern') {
    const isEid = resolved === 'eid_lantern';
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <line x1="28" y1="4" x2="28" y2="20" stroke={isEid ? '#059669' : '#F59E0B'} strokeWidth="2" />
        <line x1="54" y1="4" x2="54" y2="14" stroke={isEid ? '#10B981' : '#D97706'} strokeWidth="2" />
        <rect x="18" y="20" width="20" height="28" rx="8" fill={isEid ? '#059669' : '#F59E0B'} />
        <rect x="23" y="25" width="10" height="18" rx="4" fill="#FEF3C7" className="animate-pulse" />
        <rect x="44" y="14" width="20" height="30" rx="8" fill={isEid ? '#10B981' : '#D97706'} />
        <rect x="49" y="20" width="10" height="18" rx="4" fill="#FEF3C7" className="animate-pulse" />
        <circle cx="28" cy="54" r="3" fill="#FBBF24" />
        <circle cx="54" cy="50" r="3" fill="#FBBF24" />
      </svg>
    );
  }

  if (resolved === 'diwali_rangoli' || resolved === 'dussehra_lotus') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <g className="origin-center animate-[spin_14s_linear_infinite]">
          <circle cx="40" cy="40" r="28" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" strokeDasharray="5 4" />
          <path d="M40 12L47 32L68 40L47 48L40 68L33 48L12 40L33 32Z" fill="#059669" opacity="0.85" />
        </g>
        <circle cx="40" cy="40" r="10" fill="#D97706" />
        <circle cx="40" cy="40" r="4.5" fill="#FEF9C3" />
      </svg>
    );
  }

  if (resolved === 'dussehra_kalash') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <path d="M26 30Q40 10 54 30" fill="#059669" />
        <circle cx="40" cy="24" r="7" fill="#92400E" />
        <path d="M24 38C20 52 28 66 40 66C52 66 60 52 56 38H24Z" fill="#D97706" />
        <rect x="28" y="32" width="24" height="7" rx="3" fill="#FBBF24" />
      </svg>
    );
  }

  if (resolved === 'holi_splash' || resolved === 'holi_confetti' || resolved === 'holi_pichkari') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <circle cx="28" cy="34" r="16" fill="#EC4899" opacity="0.82" />
        <circle cx="50" cy="30" r="15" fill="#10B981" opacity="0.82" />
        <circle cx="42" cy="50" r="16" fill="#F59E0B" opacity="0.82" />
        <circle cx="24" cy="54" r="9" fill="#06B6D4" opacity="0.85" />
        <circle cx="58" cy="52" r="7" fill="#059669" opacity="0.85" />
        <circle cx="40" cy="38" r="7" fill="#FEF08A" />
      </svg>
    );
  }

  if (resolved === 'dussehra_toran') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <path d="M8 22Q40 46 72 22" fill="none" stroke="#059669" strokeWidth="4" />
        <circle cx="16" cy="28" r="7" fill="#F97316" />
        <circle cx="28" cy="34" r="7" fill="#FACC15" />
        <circle cx="40" cy="37" r="8" fill="#EA580C" className="animate-pulse" />
        <circle cx="52" cy="34" r="7" fill="#FACC15" />
        <circle cx="64" cy="28" r="7" fill="#F97316" />
        <path d="M40 45L45 60H35Z" fill="#059669" />
      </svg>
    );
  }

  if (resolved === 'eid_crescent' || resolved === 'eid_stars') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <path d="M46 16A22 22 0 1 0 64 52A17 17 0 1 1 46 16Z" fill="#FBBF24" />
        <polygon
          points="56,22 58,27 63,27 59,30 60,35 56,32 52,35 53,30 49,27 54,27"
          fill="#FEF08A"
          className="animate-pulse"
        />
        <circle cx="24" cy="24" r="2.5" fill="#10B981" />
        <circle cx="64" cy="40" r="2" fill="#A7F3D0" />
      </svg>
    );
  }

  if (resolved === 'christmas_tree') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <polygon
          points="40,10 43,17 50,17 44,21 46,28 40,24 34,28 36,21 30,17 37,17"
          fill="#FBBF24"
          className="animate-pulse"
        />
        <polygon points="40,22 22,44 58,44" fill="#10B981" />
        <polygon points="40,34 16,60 64,60" fill="#059669" />
        <rect x="35" y="60" width="10" height="10" rx="2" fill="#92400E" />
        <circle cx="34" cy="40" r="3" fill="#EF4444" />
        <circle cx="46" cy="50" r="3" fill="#FDE047" />
        <circle cx="29" cy="54" r="3" fill="#F59E0B" />
      </svg>
    );
  }

  if (resolved === 'christmas_snow') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <g stroke="#059669" strokeWidth="3" strokeLinecap="round">
          <line x1="40" y1="14" x2="40" y2="66" />
          <line x1="17" y1="27" x2="63" y2="53" />
          <line x1="63" y1="27" x2="17" y2="53" />
        </g>
        <circle cx="40" cy="40" r="7" fill="#D1FAE5" stroke="#059669" strokeWidth="2.5" />
        <circle cx="20" cy="18" r="2.5" fill="#F59E0B" className="animate-ping" />
        <circle cx="62" cy="60" r="2.5" fill="#10B981" className="animate-ping" />
      </svg>
    );
  }

  if (resolved === 'christmas_bell') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <path d="M40 18C28 18 22 30 22 46L16 54H64L58 46C58 30 52 18 40 18Z" fill="#F59E0B" />
        <circle cx="40" cy="58" r="6" fill="#B45309" />
        <circle cx="32" cy="18" r="4" fill="#059669" />
        <circle cx="48" cy="18" r="4" fill="#059669" />
        <circle cx="40" cy="16" r="4.5" fill="#DC2626" />
      </svg>
    );
  }

  if (resolved === 'independence_ribbon' || resolved === 'independence_kite') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <rect x="12" y="18" width="56" height="14" rx="4" fill="#F97316" />
        <rect x="12" y="32" width="56" height="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="12" y="46" width="56" height="14" rx="4" fill="#059669" />
        <circle cx="40" cy="39" r="5.5" fill="none" stroke="#1D4ED8" strokeWidth="2" />
        <circle cx="40" cy="39" r="1.5" fill="#1D4ED8" />
      </svg>
    );
  }

  if (resolved === 'healthday_heart') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <path
          d="M40 64C40 64 14 48 14 29C14 20 21 14 29 14C34 14 38 17 40 21C42 17 46 14 51 14C59 14 66 20 66 29C66 48 40 64 40 64Z"
          fill="#059669"
        />
        <polyline
          points="22,38 32,38 36,28 42,46 47,35 58,38"
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (resolved === 'promo_flash_sale') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <polygon
          points="40,8 49,21 64,18 61,33 72,44 59,51 62,66 47,63 38,74 29,61 14,64 17,49 8,38 21,31 18,16 33,19"
          fill="#F59E0B"
        />
        <circle cx="40" cy="40" r="18" fill="#059669" />
        <text x="40" y="45" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">
          %
        </text>
      </svg>
    );
  }

  if (resolved === 'promo_medicine_bag') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <rect x="16" y="24" width="48" height="40" rx="10" fill="#059669" />
        <path d="M28 24V18C28 14 32 12 40 12C48 12 52 14 52 18V24" fill="none" stroke="#D97706" strokeWidth="4" />
        <rect x="36" y="34" width="8" height="20" rx="2" fill="#FCFBF7" />
        <rect x="30" y="40" width="20" height="8" rx="2" fill="#FCFBF7" />
      </svg>
    );
  }

  if (resolved === 'promo_gift_box') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <rect x="16" y="34" width="48" height="32" rx="6" fill="#059669" />
        <rect x="12" y="24" width="56" height="12" rx="4" fill="#10B981" />
        <rect x="36" y="24" width="8" height="42" fill="#F59E0B" />
        <circle cx="33" cy="18" r="6" fill="none" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="47" cy="18" r="6" fill="none" stroke="#D97706" strokeWidth="3.5" />
      </svg>
    );
  }

  // Default / New Year Emerald & Gold Stars
  return (
    <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
      <polygon
        points="40,10 45,27 63,27 49,38 54,55 40,45 26,55 31,38 17,27 35,27"
        fill="#F59E0B"
      />
      <circle cx="18" cy="18" r="4" fill="#059669" />
      <circle cx="64" cy="20" r="3.5" fill="#10B981" />
      <circle cx="22" cy="60" r="3.5" fill="#D97706" />
      <circle cx="62" cy="58" r="4" fill="#059669" />
    </svg>
  );
};

// App-wide subtle non-blocking festive corner accents
export const FestiveOverlay: React.FC<{
  config: ClinicPromotionsConfig['festiveDecoration'];
}> = ({ config }) => {
  if (!config.enabled || config.festival === 'none') return null;

  const meta = FESTIVALS_META.find((f) => f.id === config.festival);
  const particleColors: Record<FestiveThemeId, string[]> = {
    none: [],
    diwali: ['#F59E0B', '#D97706', '#059669', '#FBBF24'],
    holi: ['#EC4899', '#10B981', '#F59E0B', '#059669'],
    dussehra: ['#E11D48', '#F97316', '#FBBF24'],
    eid: ['#059669', '#FBBF24', '#10B981'],
    christmas: ['#DC2626', '#059669', '#F59E0B'],
    newyear: ['#059669', '#10B981', '#F59E0B'],
    independence: ['#F97316', '#FFFFFF', '#059669'],
    healthday: ['#059669', '#10B981', '#F59E0B'],
  };

  const dots = particleColors[config.festival] || particleColors.newyear;
  const count = config.intensity === 'festive' ? 8 : 4;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-14 z-30 max-w-xl mx-auto overflow-hidden h-14"
    >
      <div
        className={`h-0.5 w-full bg-gradient-to-r ${meta?.gradient || 'from-emerald-500 to-amber-500'} opacity-80`}
      />
      <div className="flex items-start justify-between px-3 pt-1">
        <div className="opacity-80 scale-75 origin-top-left festive-float">
          <FestiveArtwork assetId={config.presetAssetId} festival={config.festival} size="sm" />
        </div>
        <div className="flex items-center gap-3 pt-1">
          {Array.from({ length: count }).map((_, idx) => (
            <span
              key={idx}
              className="w-2 h-2 rounded-full festive-float"
              style={{
                backgroundColor: dots[idx % dots.length],
                animationDelay: `${idx * 0.45}s`,
              }}
            />
          ))}
        </div>
        <div className="opacity-80 scale-75 origin-top-right festive-float">
          <FestiveArtwork assetId={config.presetAssetId} festival={config.festival} size="sm" />
        </div>
      </div>
    </div>
  );
};

// Customizable Running Marquee Banner
export const RunningBanner: React.FC<{
  config: ClinicPromotionsConfig['runningBanner'];
  onNavigate?: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers') => void;
}> = ({ config, onNavigate }) => {
  if (!config.enabled || !config.text.trim()) return null;

  const presetStyles: Record<BannerColorPreset, string> = {
    violet: 'bg-gradient-to-r from-[#065F46] via-[#059669] to-[#D97706] text-white',
    amber: 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white',
    teal: 'bg-gradient-to-r from-[#065F46] via-[#059669] to-[#10B981] text-white',
    rose: 'bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 text-white',
    festive: 'bg-gradient-to-r from-[#059669] via-[#D97706] to-[#065F46] text-white',
  };

  const clickable = config.linkTab && config.linkTab !== 'none' && Boolean(onNavigate);
  const content = (
    <div className="animate-marquee items-center gap-8 py-1.5 text-[11px] font-extrabold tracking-wide whitespace-nowrap">
      <span className="inline-flex items-center gap-2 px-4">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-200" />
        <span>{config.text.trim()}</span>
      </span>
      <span className="inline-flex items-center gap-2 px-4" aria-hidden="true">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-200" />
        <span>{config.text.trim()}</span>
      </span>
    </div>
  );

  return (
    <div className={`w-full overflow-hidden shadow-xs ${presetStyles[config.bgPreset] || presetStyles.teal}`}>
      {clickable ? (
        <button
          type="button"
          onClick={() => onNavigate?.(config.linkTab as Exclude<PromoLinkTab, 'none'>)}
          className="w-full text-left cursor-pointer block"
        >
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
};

// Top Home Section Ad / Festive Pics & GIFs Strip (Zero blank space when disabled/empty)
export const TopAdShowcase: React.FC<{
  config?: ClinicPromotionsConfig['topShowcase'];
  onNavigate?: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers') => void;
}> = ({ config, onNavigate }) => {
  if (!config?.enabled) return null;

  const validMedia = (config.mediaUrls || []).map((m) => m.trim()).filter(Boolean);
  const hasText = Boolean(config.title.trim() || config.subtitle.trim());
  if (validMedia.length === 0 && !hasText) return null;

  const targetTab = config.ctaTab;
  const canNavigate = targetTab && targetTab !== 'none' && Boolean(onNavigate);

  return (
    <div className="rounded-3xl border border-[#EAE4D3] bg-gradient-to-br from-white via-[#FCFBF7] to-[#ECFDF5] p-3.5 shadow-sm space-y-2.5">
      {validMedia.length > 0 && (
        <div
          className={
            validMedia.length === 1
              ? 'w-full'
              : 'flex items-stretch gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-0.5'
          }
        >
          {validMedia.map((media, idx) => {
            const isPreset = media.startsWith('preset:');
            const presetObj = isPreset
              ? FESTIVE_ASSETS.find((a) => `preset:${a.id}` === media)
              : undefined;

            if (presetObj) {
              const isDarkBg =
                presetObj.cardBg.includes('900') ||
                presetObj.cardBg.includes('950') ||
                presetObj.cardBg.includes('064E3B') ||
                presetObj.cardBg.includes('122B22');
              return (
                <div
                  key={`${media}-${idx}`}
                  className={`${
                    validMedia.length === 1 ? 'w-full' : 'min-w-[230px] snap-start'
                  } rounded-2xl p-3 bg-gradient-to-br ${presetObj.cardBg} border border-[#EAE4D3] flex items-center gap-3`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/90 flex items-center justify-center shrink-0 shadow-2xs">
                    <FestiveArtwork assetId={presetObj.id} festival={presetObj.festival} size="md" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isDarkBg ? 'text-amber-300' : 'text-[#D97706]'
                      }`}
                    >
                      {presetObj.badgeText}
                    </span>
                    <p
                      className={`text-xs font-extrabold leading-snug ${
                        isDarkBg ? 'text-white' : 'text-[#122B22]'
                      }`}
                    >
                      {presetObj.label}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${media.slice(0, 28)}-${idx}`}
                className={`${
                  validMedia.length === 1 ? 'w-full' : 'min-w-[240px] max-w-[280px] snap-start shrink-0'
                } rounded-2xl overflow-hidden border border-[#EAE4D3] bg-white max-h-44 flex items-center justify-center`}
              >
                <img
                  src={media}
                  alt={config.title || 'Clinic Highlight'}
                  className="w-full h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            );
          })}
        </div>
      )}

      {(hasText || (canNavigate && config.ctaLabel.trim())) && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {config.title.trim() && (
              <h4 className="font-black text-xs sm:text-sm text-[#122B22] leading-snug">
                {config.title.trim()}
              </h4>
            )}
            {config.subtitle.trim() && (
              <p className="text-[11px] text-[#4B6358] leading-snug mt-0.5">
                {config.subtitle.trim()}
              </p>
            )}
          </div>
          {canNavigate && config.ctaLabel.trim() && (
            <button
              type="button"
              onClick={() => onNavigate?.(targetTab as Exclude<PromoLinkTab, 'none'>)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-xs font-extrabold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <span>{config.ctaLabel.trim()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Footer Media / Offer Showcase (strictly returns null when inactive or empty so zero blank box ever appears)
export const FooterShowcase: React.FC<{
  config: ClinicPromotionsConfig['footerShowcase'];
  festiveConfig: ClinicPromotionsConfig['festiveDecoration'];
  activeOffers: SpecialOffer[];
  onNavigate?: (tab: 'home' | 'doctors' | 'store' | 'appointments' | 'offers') => void;
}> = ({ config, festiveConfig, activeOffers, onNavigate }) => {
  if (!config.enabled) return null;

  const trimmedMedia = config.mediaUrl.trim();
  const isPresetMedia = trimmedMedia.startsWith('preset:');
  const presetObj = isPresetMedia
    ? FESTIVE_ASSETS.find((a) => `preset:${a.id}` === trimmedMedia)
    : undefined;

  const hasCustomImage = Boolean(trimmedMedia && !isPresetMedia);
  const hasTitleOrSub = Boolean(config.title.trim() || config.subtitle.trim());
  const topOffer = activeOffers[0];

  const hasFestiveContent =
    (config.mode === 'festive' || config.mode === 'both') &&
    (Boolean(presetObj) || hasCustomImage || (festiveConfig.enabled && festiveConfig.festival !== 'none') || hasTitleOrSub);

  const hasOfferContent =
    (config.mode === 'offer' || config.mode === 'both') &&
    (Boolean(topOffer) || hasCustomImage || hasTitleOrSub);

  if (!hasFestiveContent && !hasOfferContent) return null;

  const resolvedTitle =
    config.title.trim() ||
    (config.mode === 'offer' && topOffer ? topOffer.title : '') ||
    presetObj?.badgeText ||
    '';
  const resolvedSubtitle =
    config.subtitle.trim() ||
    (config.mode === 'offer' && topOffer ? `${topOffer.discountText} · ${topOffer.subtitle}` : '') ||
    '';

  if (!hasCustomImage && !presetObj && !resolvedTitle && !resolvedSubtitle) {
    return null;
  }

  const targetTab = config.ctaTab;
  const canNavigate = targetTab && targetTab !== 'none' && Boolean(onNavigate);
  const isDarkCard =
    Boolean(presetObj?.cardBg.includes('900')) ||
    Boolean(presetObj?.cardBg.includes('950')) ||
    Boolean(presetObj?.cardBg.includes('064E3B')) ||
    Boolean(presetObj?.cardBg.includes('122B22'));

  return (
    <footer className="px-4 pb-24 pt-2">
      <div
        className={`rounded-3xl p-4 border border-[#EAE4D3] shadow-md overflow-hidden backdrop-blur-md bg-gradient-to-br ${
          presetObj?.cardBg || 'from-white via-[#FCFBF7] to-[#ECFDF5]'
        }`}
      >
        {hasCustomImage && (
          <div className="mb-3 rounded-2xl overflow-hidden bg-white border border-[#EAE4D3] max-h-52 flex items-center justify-center">
            <img
              src={trimmedMedia}
              alt={resolvedTitle || 'Clinic highlight'}
              className="w-full max-h-52 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex items-center gap-3.5">
          {!hasCustomImage && (presetObj || (festiveConfig.enabled && festiveConfig.festival !== 'none')) && (
            <div className="w-16 h-16 rounded-2xl bg-white/90 border border-[#EAE4D3] flex items-center justify-center shrink-0 shadow-xs">
              <FestiveArtwork
                assetId={presetObj?.id || festiveConfig.presetAssetId}
                festival={presetObj?.festival || festiveConfig.festival}
                size="md"
              />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            {resolvedTitle && (
              <h4
                className={`font-black text-sm leading-snug ${
                  isDarkCard ? 'text-white' : 'text-[#122B22]'
                }`}
              >
                {resolvedTitle}
              </h4>
            )}
            {resolvedSubtitle && (
              <p
                className={`text-xs leading-relaxed ${
                  isDarkCard ? 'text-white/85' : 'text-[#4B6358]'
                }`}
              >
                {resolvedSubtitle}
              </p>
            )}
          </div>

          {canNavigate && config.ctaLabel.trim() && (
            <button
              type="button"
              onClick={() => onNavigate?.(targetTab as Exclude<PromoLinkTab, 'none'>)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#D97706] text-white text-xs font-extrabold shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <span>{config.ctaLabel.trim()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
