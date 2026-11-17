import React, { useRef, useState } from 'react';
import { Doctor } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import {
  DOCTOR_BOOKING_URL,
  addBookingHistoryItem,
} from '../data/clinicData';

interface DoctorSwipeProps {
  doctors: Doctor[];
  t: Record<string, string>;
  onViewAll?: () => void;
  pauseAutoSwipe?: boolean;
}

export const DoctorSwipe: React.FC<DoctorSwipeProps> = ({
  doctors,
  t,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (doctors.length === 0) return null;

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 228;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / 228);
    setActiveSlide(Math.min(Math.max(idx, 0), doctors.length - 1));
  };

  return (
    <section className="relative px-4 py-1 select-none">
      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-sm tracking-tight text-[#122B22]">
            {t.doctors || 'Specialist Doctors'}
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            {doctors.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            aria-label="Previous doctor"
            className="w-8 h-8 rounded-full bg-white border border-[#EAE4D3] hover:bg-[#ECFDF5] text-[#122B22] flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            aria-label="Next doctor"
            className="w-8 h-8 rounded-full bg-white border border-[#EAE4D3] hover:bg-[#ECFDF5] text-[#122B22] flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-extrabold text-[#059669] hover:text-[#065F46] flex items-center gap-0.5 cursor-pointer whitespace-nowrap ml-1"
            >
              <span>All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Smooth Horizontal Doctor Carousel (Doctor Name, Field & Book Option ONLY) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-stretch gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1.5"
      >
        {doctors.map((doc) => (
          <article
            key={doc.id}
            className="w-[216px] shrink-0 snap-start rounded-3xl overflow-hidden bg-white border border-[#EAE4D3] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Photo with Emerald-Gold Top Accent Strip */}
            <div className="relative h-[142px] w-full bg-[#ECFDF5] overflow-hidden shrink-0">
              <div className="absolute top-0 inset-x-0 h-1 z-10 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#F59E0B]" />
              <img
                src={doc.photo}
                alt={doc.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Strictly Doctor Name, Field & Book OPD Option */}
            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 bg-white">
              <div className="space-y-1">
                <h3 className="font-black text-xs sm:text-[13px] text-[#122B22] leading-snug line-clamp-1">
                  {doc.name}
                </h3>
                <p className="text-[11px] font-bold text-[#059669] leading-snug line-clamp-2">
                  {doc.department || doc.specialty}
                </p>
              </div>

              <a
                href={DOCTOR_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => addBookingHistoryItem('doctor', doc.name, doc.department)}
                className="w-full min-h-[38px] active:scale-96 font-black text-xs px-3 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gradient-to-r from-[#059669] to-[#10B981] hover:brightness-105 text-white whitespace-nowrap"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book OPD</span>
                <ExternalLink className="w-3 h-3 opacity-85" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Compact Carousel Dots */}
      <div className="flex items-center justify-center gap-1 mt-1">
        {doctors.slice(0, 8).map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === activeSlide
                ? 'w-4 bg-[#059669]'
                : 'w-1.5 bg-[#D1FAE5]'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
