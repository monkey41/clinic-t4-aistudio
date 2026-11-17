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
  { id: 'none', label: 'None (Off)', gradient: 'from-slate-200 to-slate-300' },
  { id: 'diwali', label: 'Diwali / Deepavali', gradient: 'from-amber-400 via-orange-500 to-rose-500' },
  { id: 'holi', label: 'Holi', gradient: 'from-pink-500 via-purple-500 to-cyan-400' },
  { id: 'dussehra', label: 'Durga Puja / Dussehra', gradient: 'from-rose-500 via-amber-500 to-orange-500' },
  { id: 'eid', label: 'Eid Mubarak', gradient: 'from-emerald-500 via-teal-600 to-indigo-600' },
  { id: 'christmas', label: 'Christmas', gradient: 'from-emerald-600 via-red-500 to-amber-400' },
  { id: 'newyear', label: 'New Year', gradient: 'from-indigo-600 via-purple-500 to-pink-500' },
  { id: 'independence', label: 'Independence / Republic Day', gradient: 'from-orange-500 via-slate-100 to-emerald-600' },
  { id: 'healthday', label: 'Health Camp / Wellness Day', gradient: 'from-violet-500 via-indigo-500 to-sky-400' },
];

export const FESTIVE_ASSETS: FestivePresetAsset[] = [
  // Diwali
  {
    id: 'diwali_diya',
    festival: 'diwali',
    label: 'Glowing Diya Lamp',
    badgeText: 'Shubh Deepavali',
    cardBg: 'from-amber-50 via-orange-50 to-rose-50',
    accentColor: '#d97706',
  },
  {
    id: 'diwali_lanterns',
    festival: 'diwali',
    label: 'Floating Sky Lanterns',
    badgeText: 'Festival of Lights',
    cardBg: 'from-indigo-950 via-purple-900 to-amber-900',
    accentColor: '#fbbf24',
  },
  {
    id: 'diwali_rangoli',
    festival: 'diwali',
    label: 'Sparkle Rangoli Floral',
    badgeText: 'Festive Greetings',
    cardBg: 'from-rose-50 via-amber-50 to-purple-50',
    accentColor: '#e11d48',
  },
  // Holi
  {
    id: 'holi_splash',
    festival: 'holi',
    label: 'Gulal Color Splash',
    badgeText: 'Happy Holi',
    cardBg: 'from-pink-50 via-purple-50 to-cyan-50',
    accentColor: '#db2777',
  },
  {
    id: 'holi_confetti',
    festival: 'holi',
    label: 'Floating Color Dots',
    badgeText: 'Festival of Colors',
    cardBg: 'from-fuchsia-50 via-amber-50 to-sky-50',
    accentColor: '#9333ea',
  },
  // Dussehra / Durga Puja
  {
    id: 'dussehra_lotus',
    festival: 'dussehra',
    label: 'Sacred Golden Lotus',
    badgeText: 'Shubho Sharodiya',
    cardBg: 'from-rose-50 via-amber-50 to-orange-50',
    accentColor: '#e11d48',
  },
  {
    id: 'dussehra_toran',
    festival: 'dussehra',
    label: 'Marigold Toran Garland',
    badgeText: 'Happy Dussehra',
    cardBg: 'from-amber-50 via-yellow-50 to-orange-50',
    accentColor: '#ea580c',
  },
  // Eid
  {
    id: 'eid_crescent',
    festival: 'eid',
    label: 'Crescent Moon & Stars',
    badgeText: 'Eid Mubarak',
    cardBg: 'from-emerald-900 via-teal-900 to-indigo-950',
    accentColor: '#34d399',
  },
  {
    id: 'eid_lantern',
    festival: 'eid',
    label: 'Hanging Fanous Lanterns',
    badgeText: 'Warm Wishes',
    cardBg: 'from-teal-50 via-emerald-50 to-indigo-50',
    accentColor: '#059669',
  },
  // Christmas
  {
    id: 'christmas_tree',
    festival: 'christmas',
    label: 'Twinkling Pine & Star',
    badgeText: 'Merry Christmas',
    cardBg: 'from-emerald-50 via-red-50 to-amber-50',
    accentColor: '#dc2626',
  },
  {
    id: 'christmas_snow',
    festival: 'christmas',
    label: 'Winter Snowfall Glow',
    badgeText: 'Season Greetings',
    cardBg: 'from-sky-50 via-indigo-50 to-white',
    accentColor: '#2563eb',
  },
  // New Year
  {
    id: 'newyear_confetti',
    festival: 'newyear',
    label: 'Celebration Ribbons',
    badgeText: 'Happy New Year',
    cardBg: 'from-indigo-50 via-purple-50 to-pink-50',
    accentColor: '#7c3aed',
  },
  {
    id: 'newyear_stars',
    festival: 'newyear',
    label: 'Golden Starlight',
    badgeText: 'Healthy Year Ahead',
    cardBg: 'from-slate-900 via-indigo-950 to-purple-950',
    accentColor: '#fbbf24',
  },
  // Independence / Republic Day
  {
    id: 'independence_ribbon',
    festival: 'independence',
    label: 'Tricolor Celebration Crest',
    badgeText: 'Jai Hind',
    cardBg: 'from-orange-50 via-white to-emerald-50',
    accentColor: '#ea580c',
  },
  // Health Day
  {
    id: 'healthday_heart',
    festival: 'healthday',
    label: 'Care & Pulse Emblem',
    badgeText: 'Community Health',
    cardBg: 'from-violet-50 via-sky-50 to-rose-50',
    accentColor: '#6d4aff',
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
        <path
          d="M40 12C45 20 48 27 40 34C32 27 35 20 40 12Z"
          fill="#FBBF24"
        />
        <path
          d="M40 18C43 23 44 27 40 32C36 27 37 23 40 18Z"
          fill="#FEF9C3"
        />
        <path d="M16 44C18 58 28 65 40 65C52 65 62 58 64 44H16Z" fill="#D97706" />
        <ellipse cx="40" cy="44" rx="24" ry="6" fill="#F59E0B" />
        <circle cx="24" cy="22" r="2" fill="#FCD34D" className="animate-ping" />
        <circle cx="57" cy="20" r="2" fill="#FDE68A" className="animate-ping" />
      </svg>
    );
  }

  if (resolved === 'diwali_lanterns' || resolved === 'eid_lantern') {
    const isEid = resolved === 'eid_lantern';
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <line x1="28" y1="4" x2="28" y2="20" stroke={isEid ? '#10B981' : '#F59E0B'} strokeWidth="2" />
        <line x1="54" y1="4" x2="54" y2="14" stroke={isEid ? '#0D9488' : '#F97316'} strokeWidth="2" />
        <rect x="18" y="20" width="20" height="28" rx="8" fill={isEid ? '#10B981' : '#F59E0B'} />
        <rect x="23" y="25" width="10" height="18" rx="4" fill="#FEF3C7" className="animate-pulse" />
        <rect x="44" y="14" width="20" height="30" rx="8" fill={isEid ? '#0D9488' : '#EC4899'} />
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
          <circle cx="40" cy="40" r="28" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2" strokeDasharray="5 4" />
          <path d="M40 12L47 32L68 40L47 48L40 68L33 48L12 40L33 32Z" fill="#F59E0B" opacity="0.85" />
        </g>
        <circle cx="40" cy="40" r="10" fill="#E11D48" />
        <circle cx="40" cy="40" r="4.5" fill="#FEF08A" />
      </svg>
    );
  }

  if (resolved === 'holi_splash' || resolved === 'holi_confetti') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <circle cx="28" cy="34" r="16" fill="#EC4899" opacity="0.8" />
        <circle cx="50" cy="30" r="15" fill="#8B5CF6" opacity="0.8" />
        <circle cx="42" cy="50" r="16" fill="#06B6D4" opacity="0.8" />
        <circle cx="24" cy="54" r="9" fill="#F59E0B" opacity="0.85" />
        <circle cx="58" cy="52" r="7" fill="#10B981" opacity="0.85" />
        <circle cx="40" cy="38" r="7" fill="#FDE047" />
      </svg>
    );
  }

  if (resolved === 'dussehra_toran') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <path d="M8 22Q40 46 72 22" fill="none" stroke="#15803D" strokeWidth="4" />
        <circle cx="16" cy="28" r="7" fill="#F97316" />
        <circle cx="28" cy="34" r="7" fill="#FACC15" />
        <circle cx="40" cy="37" r="8" fill="#EA580C" className="animate-pulse" />
        <circle cx="52" cy="34" r="7" fill="#FACC15" />
        <circle cx="64" cy="28" r="7" fill="#F97316" />
        <path d="M40 45L45 60H35Z" fill="#DC2626" />
      </svg>
    );
  }

  if (resolved === 'eid_crescent') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <path
          d="M46 16A22 22 0 1 0 64 52A17 17 0 1 1 46 16Z"
          fill="#FBBF24"
        />
        <polygon points="56,22 58,27 63,27 59,30 60,35 56,32 52,35 53,30 49,27 54,27" fill="#FEF08A" className="animate-pulse" />
        <circle cx="24" cy="24" r="2.5" fill="#A7F3D0" />
        <circle cx="64" cy="40" r="2" fill="#A7F3D0" />
      </svg>
    );
  }

  if (resolved === 'christmas_tree') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <polygon points="40,10 43,17 50,17 44,21 46,28 40,24 34,28 36,21 30,17 37,17" fill="#FBBF24" className="animate-pulse" />
        <polygon points="40,22 22,44 58,44" fill="#16A34A" />
        <polygon points="40,34 16,60 64,60" fill="#15803D" />
        <rect x="35" y="60" width="10" height="10" rx="2" fill="#92400E" />
        <circle cx="34" cy="40" r="3" fill="#EF4444" />
        <circle cx="46" cy="50" r="3" fill="#FDE047" />
        <circle cx="29" cy="54" r="3" fill="#60A5FA" />
      </svg>
    );
  }

  if (resolved === 'christmas_snow') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
        <g stroke="#3B82F6" strokeWidth="3" strokeLinecap="round">
          <line x1="40" y1="14" x2="40" y2="66" />
          <line x1="17" y1="27" x2="63" y2="53" />
          <line x1="63" y1="27" x2="17" y2="53" />
        </g>
        <circle cx="40" cy="40" r="7" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.5" />
        <circle cx="20" cy="18" r="2.5" fill="#93C5FD" className="animate-ping" />
        <circle cx="62" cy="60" r="2.5" fill="#93C5FD" className="animate-ping" />
      </svg>
    );
  }

  if (resolved === 'independence_ribbon') {
    return (
      <svg viewBox="0 0 80 80" className={`${dims} shrink-0`} aria-hidden="true">
        <rect x="12" y="18" width="56" height="14" rx="4" fill="#F97316" />
        <rect x="12" y="32" width="56" height="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="12" y="46" width="56" height="14" rx="4" fill="#16A34A" />
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
          fill="#8B5CF6"
        />
        <polyline
          points="22,38 32,38 36,28 42,46 47,35 58,38"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Default: New Year confetti & stars
  return (
    <svg viewBox="0 0 80 80" className={`${dims} shrink-0 festive-float`} aria-hidden="true">
      <polygon
        points="40,10 45,27 63,27 49,38 54,55 40,45 26,55 31,38 17,27 35,27"
        fill="#A855F7"
      />
      <circle cx="18" cy="18" r="4" fill="#F59E0B" />
      <circle cx="64" cy="20" r="3.5" fill="#EC4899" />
      <circle cx="22" cy="60" r="3.5" fill="#38BDF8" />
      <circle cx="62" cy="58" r="4" fill="#34D399" />
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
    diwali: ['#F59E0B', '#F97316', '#F43F5E', '#FBBF24'],
    holi: ['#EC4899', '#8B5CF6', '#06B6D4', '#FACC15'],
    dussehra: ['#E11D48', '#F97316', '#FBBF24'],
    eid: ['#10B981', '#FBBF24', '#6366F1'],
    christmas: ['#DC2626', '#16A34A', '#60A5FA', '#FBBF24'],
    newyear: ['#A855F7', '#6366F1', '#EC4899', '#FBBF24'],
    independence: ['#F97316', '#FFFFFF', '#16A34A'],
    healthday: ['#8B5CF6', '#38BDF8', '#EC4899'],
  };

  const dots = particleColors[config.festival] || particleColors.newyear;
  const count = config.intensity === 'festive' ? 8 : 4;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-14 z-30 max-w-xl mx-auto overflow-hidden h-14"
    >
      {/* Subtle festive top border glow */}
      <div
        className={`h-0.5 w-full bg-gradient-to-r ${meta?.gradient || 'from-violet-400 to-indigo-400'} opacity-75`}
      />

      {/* Lightweight corner artwork + floating sparkles */}
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
    violet: 'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] text-white',
    amber: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white',
    teal: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white',
    rose: 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white',
    festive: 'bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600 text-white',
  };

  const clickable = config.linkTab && config.linkTab !== 'none' && Boolean(onNavigate);
  const content = (
    <div className="animate-marquee items-center gap-8 py-1.5 text-[11px] font-extrabold tracking-wide whitespace-nowrap">
      <span className="inline-flex items-center gap-2 px-4">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{config.text.trim()}</span>
      </span>
      <span className="inline-flex items-center gap-2 px-4" aria-hidden="true">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{config.text.trim()}</span>
      </span>
    </div>
  );

  return (
    <div className={`w-full overflow-hidden shadow-xs ${presetStyles[config.bgPreset] || presetStyles.violet}`}>
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

  // Guard: If neither active offer nor festive/media content exists, render NOTHING (zero blank box)
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

  return (
    <footer className="px-4 pb-24 pt-2">
      <div
        className={`rounded-3xl p-4 border border-white/90 shadow-md overflow-hidden backdrop-blur-md bg-gradient-to-br ${
          presetObj?.cardBg || 'from-white/90 via-[#F5F0FF]/90 to-[#FDEEE8]/90'
        }`}
      >
        {/* Optional Custom Uploaded / URL Picture or GIF */}
        {hasCustomImage && (
          <div className="mb-3 rounded-2xl overflow-hidden bg-white/60 border border-white/80 max-h-52 flex items-center justify-center">
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
            <div className="w-16 h-16 rounded-2xl bg-white/80 border border-white flex items-center justify-center shrink-0 shadow-xs">
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
                  presetObj?.cardBg.includes('900') || presetObj?.cardBg.includes('950')
                    ? 'text-white'
                    : 'text-[#1E2252]'
                }`}
              >
                {resolvedTitle}
              </h4>
            )}
            {resolvedSubtitle && (
              <p
                className={`text-xs leading-relaxed ${
                  presetObj?.cardBg.includes('900') || presetObj?.cardBg.includes('950')
                    ? 'text-white/85'
                    : 'text-slate-600'
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
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-xs font-extrabold shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
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
