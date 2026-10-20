import React, { useState, useEffect, useRef } from 'react';
import { Doctor } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Clock,
  Award,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  DOCTOR_BOOKING_URL,
  getThemePalette,
  addBookingHistoryItem,
} from '../data/clinicData';

interface DoctorSwipeProps {
  doctors: Doctor[];
  t: Record<string, string>;
}

export const DoctorSwipe: React.FC<DoctorSwipeProps> = ({
  doctors,
  t,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSwipeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = getThemePalette();
  const total = doctors.length || 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const triggerTouchFreeze = () => {
    setIsFrozen(true);
    if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
    freezeTimerRef.current = setTimeout(() => {
      setIsFrozen(false);
    }, 6000);
  };

  useEffect(() => {
    if (isFrozen) {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
      return;
    }

    autoSwipeTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
    };
  }, [total, isFrozen]);

  if (doctors.length === 0) return null;

  return (
    <section className="relative px-2 py-4 select-none">
      <div className="flex items-center justify-between px-3 mb-2">
        <h2 className={`font-extrabold text-sm tracking-wide ${theme.headingText}`}>
          👨‍⚕️ {t.doctors || 'Meet Our Doctors'} ({doctors.length})
        </h2>
        <span className={`text-[11px] font-bold ${theme.accentText}`}>
          Swipe cards →
        </span>
      </div>

      {/* Swipe Stack Container */}
      <div
        className="relative w-full h-[330px] flex items-center justify-center overflow-hidden"
        onTouchStart={triggerTouchFreeze}
        onMouseDown={triggerTouchFreeze}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {doctors.map((doctor, idx) => {
            let offset = (idx - currentIndex + total) % total;
            if (offset > total / 2) offset -= total;

            const isTop = offset === 0;
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const translateY = offset * 14;
            const scale = 1 - Math.abs(offset) * 0.06;
            const opacity = 1 - Math.abs(offset) * 0.22;
            const zIndex = 20 - Math.abs(offset);

            return (
              <motion.article
                key={doctor.id}
                drag={isTop ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={(_e, info) => {
                  triggerTouchFreeze();
                  if (info.offset.x < -60) {
                    handleNext();
                  } else if (info.offset.x > 60) {
                    handlePrev();
                  }
                }}
                onClick={() => {
                  triggerTouchFreeze();
                  if (!isTop) {
                    setCurrentIndex(idx);
                  }
                }}
                animate={{
                  y: translateY,
                  scale,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                className={`absolute top-0 w-[90%] max-w-[340px] h-[310px] rounded-3xl overflow-hidden border shadow-lg flex flex-col justify-between cursor-grab active:cursor-grabbing ${theme.cardBg} ${
                  !isTop ? 'cursor-pointer hover:opacity-95' : ''
                }`}
                style={{
                  boxShadow: isTop ? '0 14px 30px -6px rgba(0,0,0,0.12)' : 'none',
                  touchAction: 'none',
                }}
              >
                {/* Doctor Photo - Compact Height (135px) */}
                <div className="relative h-[135px] w-full bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="w-full h-full object-cover object-top pointer-events-none"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Department badge on photo */}
                  <div className="absolute top-2.5 left-2.5 backdrop-blur-md text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-xs border flex items-center gap-1 bg-white/95 text-teal-950 border-white/80">
                    <span>🩺</span> {doctor.department}
                  </div>
                </div>

                {/* Information-Rich Card Body */}
                <div
                  className={`p-3 flex-1 flex flex-col justify-between border-t ${theme.cardBg}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h3
                        className={`font-black text-sm leading-snug truncate ${theme.headingText}`}
                      >
                        {doctor.name}
                      </h3>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded shrink-0">
                        OPD Active
                      </span>
                    </div>

                    <p className={`text-[11px] font-bold leading-tight ${theme.accentText}`}>
                      {doctor.specialty}
                    </p>

                    <div className={`pt-0.5 space-y-0.5 text-[11px] ${theme.subText}`}>
                      <div className="flex items-center gap-1.5">
                        <Award className={`w-3 h-3 shrink-0 ${theme.accentText}`} />
                        <span className="truncate font-semibold">
                          {doctor.qualification} • {doctor.experience}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3 h-3 shrink-0 text-emerald-600`} />
                        <span className="truncate font-medium text-slate-700">
                          {doctor.timing}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Link Button to Booking Portal */}
                  <div
                    className={`pt-2 flex items-center justify-between border-t mt-1 ${theme.border}`}
                  >
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${theme.badge}`}
                    >
                      Official OPD
                    </span>
                    <a
                      href={DOCTOR_BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerTouchFreeze();
                        addBookingHistoryItem('doctor', doctor.name, doctor.timing);
                      }}
                      className={`active:scale-95 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer ${theme.primaryBtn}`}
                    >
                      <CalendarCheck className="w-3 h-3" />
                      <span>Book OPD</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Swipe Controls and Dots */}
      <div className="flex items-center justify-center gap-3 mt-2 px-4">
        <button
          type="button"
          onClick={() => {
            handlePrev();
            triggerTouchFreeze();
          }}
          aria-label="Previous Doctor"
          className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 ${theme.cardBg}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {doctors.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIndex(i);
                triggerTouchFreeze();
              }}
              aria-label={`Go to doctor ${i + 1}`}
              className={`h-2 transition-all rounded-full cursor-pointer ${
                i === currentIndex
                  ? `w-5 ${theme.primaryBtn}`
                  : 'w-2 bg-slate-400/50 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            handleNext();
            triggerTouchFreeze();
          }}
          aria-label="Next Doctor"
          className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 ${theme.cardBg}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
