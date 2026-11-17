import React, { useState } from 'react';
import { SpecialOffer } from '../types';
import {
  CLINIC_CONFIG,
  DOCTOR_BOOKING_URL,
  PATHOLOGY_BOOKING_URL,
  getThemePalette,
  addBookingHistoryItem,
} from '../data/clinicData';
import {
  Sparkles,
  Tag,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Stethoscope,
  FlaskConical,
  Pill,
  ExternalLink,
} from 'lucide-react';

interface SpecialOfferPageProps {
  offers: SpecialOffer[];
  onBack: () => void;
}

export const SpecialOfferPage: React.FC<SpecialOfferPageProps> = ({
  offers,
  onBack,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const p = getThemePalette();

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="py-4 px-4 max-w-xl mx-auto pb-28 space-y-4 animate-in fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${p.card}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Colorful Hero Offer Header */}
      <div className="rounded-3xl p-5 shadow-md relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-white/20 text-white">
            <Sparkles className="w-3 h-3" />
            <span>Special Offers</span>
          </div>
          <h1 className="text-xl font-black tracking-tight leading-tight">
            Health & Lab Packages
          </h1>
        </div>
      </div>

      {/* Active Special Offers List */}
      <div className="space-y-3.5">
        {offers.length === 0 ? (
          <div className={`rounded-3xl p-8 border text-center space-y-2 ${p.card}`}>
            <Sparkles className={`w-7 h-7 mx-auto ${p.mutedText}`} />
            <p className={`text-sm font-extrabold ${p.heading}`}>No special offers right now</p>
            <p className={`text-xs ${p.subtext}`}>Check back soon for new health and lab packages.</p>
          </div>
        ) : (
          offers.map((offer) => {
          const isPatho = offer.category === 'pathology';
          const isDoctor = offer.category === 'doctor' || offer.category === 'physio';

          return (
            <div
              key={offer.id}
              className={`rounded-3xl p-4 border shadow-sm transition-all relative overflow-hidden ${p.card}`}
            >
              {/* Top Row: Badge + Discount Tag */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${p.badge}`}>
                  {offer.badge}
                </span>

                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-2xs ${p.secondaryBtn}`}
                >
                  {offer.discountText}
                </span>
              </div>

              <h3 className={`font-extrabold text-base leading-snug ${p.heading}`}>
                {offer.title}
              </h3>
              <p className={`text-xs font-bold mt-0.5 ${p.accentText}`}>
                {offer.subtitle}
              </p>

              <p className={`text-xs mt-2 leading-relaxed ${p.subtext}`}>
                {offer.description}
              </p>

              {/* Price comparison if available */}
              {offer.offerPrice && (
                <div
                  className={`mt-3 inline-flex items-baseline gap-2 px-3 py-1.5 rounded-xl border ${p.cardAlt}`}
                >
                  <span className={`text-[11px] font-semibold ${p.subtext}`}>
                    Offer Price:
                  </span>
                  <span className={`text-base font-black ${p.accentText}`}>
                    ₹{offer.offerPrice}
                  </span>
                  {offer.originalPrice && (
                    <span className={`text-xs line-through font-medium ${p.mutedText}`}>
                      ₹{offer.originalPrice}
                    </span>
                  )}
                </div>
              )}

              {/* Promo Code & Direct Booking Link Button (No forms!) */}
              <div
                className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${p.divider}`}
              >
                <div className="flex items-center gap-2">
                  {offer.promoCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.id, offer.promoCode!)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border border-dashed cursor-pointer ${p.cardAlt}`}
                    >
                      <Tag className={`w-3 h-3 ${p.accentText}`} />
                      <span>{offer.promoCode}</span>
                      {copiedId === offer.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className={`w-3 h-3 ${p.mutedText}`} />
                      )}
                    </button>
                  )}
                  <span className={`text-[10px] flex items-center gap-1 ${p.subtext}`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    {offer.validUntil}
                  </span>
                </div>

                {/* Direct External Link Button (No in-app form!) */}
                {isPatho ? (
                  <a
                    href={PATHOLOGY_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      addBookingHistoryItem({
                        type: 'pathology',
                        title: offer.title,
                        subtitle: `${offer.discountText} • Special Offer`,
                        url: PATHOLOGY_BOOKING_URL,
                      })
                    }
                    className={`active:scale-95 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer ${p.secondaryBtn}`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Book Pathology Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : isDoctor ? (
                  <a
                    href={DOCTOR_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      addBookingHistoryItem({
                        type: 'doctor',
                        title: offer.title,
                        subtitle: `${offer.discountText} • Special Offer`,
                        url: DOCTOR_BOOKING_URL,
                      })
                    }
                    className={`active:scale-95 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer ${p.primaryBtn}`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Book Doctor OPD Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${CLINIC_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${CLINIC_CONFIG.name}, I want to claim the Special Offer: ${offer.title} (${offer.discountText})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 ${p.primaryBtn}`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Claim on WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })
        )}
      </div>
    </section>
  );
};
