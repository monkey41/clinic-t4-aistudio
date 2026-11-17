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
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from 'motion/react';
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

const ACCENT_GRADIENTS = [
  'from-[#A855F7] to-[#6366F1]',
  'from-[#8B5CF6] to-[#EC4899]',
  'from-[#6366F1] to-[#38BDF8]',
  'from-[#EC4899] to-[#F97316]',
  'from-[#7C3AED] to-[#4F46E5]',
];

export const DoctorSwipe: React.FC<DoctorSwipeProps> = ({
  doctors,
  t,
  onViewAll,
  pauseAutoSwipe = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isFrozen, setIsFrozen] = useState(false);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSwipeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-180, 0, 180], [-7, 0, 7]);

  const total = doctors.length || 1;

  // Reset motion x cleanly on every card change to avoid visual offset glitch
  useEffect(() => {
    dragX.set(0);
  }, [currentIndex, dragX]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
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
    if (isFrozen || pauseAutoSwipe || total <= 1) {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
      return;
    }

    autoSwipeTimerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);

    return () => {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
    };
  }, [total, isFrozen, pauseAutoSwipe]);

  if (doctors.length === 0) return null;

  const activeDoc = doctors[currentIndex % total];
  const activeGradient = ACCENT_GRADIENTS[currentIndex % ACCENT_GRADIENTS.length];

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    triggerTouchFreeze();
    if (info.offset.x < -50 || info.velocity.x < -300) {
      handleNext();
    } else if (info.offset.x > 50 || info.velocity.x > 300) {
      handlePrev();
    }
  };

  return (
    <section className="relative px-4 py-2 select-none">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-black text-sm tracking-tight text-[#1E2252]">
          {t.doctors || 'Specialist Doctors'}
        </h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-extrabold text-[#6D4AFF] hover:text-[#4F46E5] flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
          >
            <span>View All ({doctors.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fixed-Height Overflow-Clipped Deck Stage (Zero Layout Reflow / Zero Shake) */}
      <div
        className="relative w-full h-[352px] overflow-hidden"
        onTouchStart={triggerTouchFreeze}
        onMouseDown={triggerTouchFreeze}
      >
        {/* Background depth cards */}
        {total > 2 && (
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 top-4 w-[84%] max-w-[318px] h-[326px] rounded-3xl bg-white/75 border border-white/90 shadow-sm scale-[0.92] opacity-70 pointer-events-none"
          />
        )}
        {total > 1 && (
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 top-2 w-[90%] max-w-[336px] h-[332px] rounded-3xl bg-white/85 border border-white shadow-md scale-[0.96] opacity-90 pointer-events-none"
          />
        )}

        {/* Active Draggable Top Card pinned with absolute inset to isolate GPU compositing */}
        <AnimatePresence initial={false} mode="sync" custom={direction}>
          <motion.article
            key={activeDoc.id}
            custom={direction}
            style={{ x: dragX, rotate: dragRotate, touchAction: 'pan-y' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.45}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.96, opacity: 0, x: direction > 0 ? 44 : -44 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{
              x: direction > 0 ? -190 : 190,
              opacity: 0,
              rotate: direction > 0 ? -7 : 7,
              transition: { duration: 0.18, ease: 'easeOut' },
            }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 30,
              mass: 0.9,
            }}
            className="absolute inset-x-0 top-0 mx-auto z-20 w-full max-w-[356px] h-[338px] rounded-3xl overflow-hidden bg-white/95 border border-white shadow-xl shadow-indigo-900/10 flex flex-col justify-between cursor-grab active:cursor-grabbing will-change-transform"
          >
            {/* Photo Banner with Colorful Top Strip & Contrast Scrim */}
            <div className="relative h-[165px] w-full bg-[#1E1B4B] overflow-hidden shrink-0">
              <div className={`absolute top-0 inset-x-0 h-1.5 z-20 bg-gradient-to-r ${activeGradient}`} />
              <img
                src={activeDoc.photo}
                alt={activeDoc.name}
                className="w-full h-full object-cover object-top pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/85 via-[#1E1B4B]/20 to-transparent pointer-events-none" />

              {/* Bottom Overlay Title over Scrim */}
              <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 text-white">
                <p className="text-[11px] font-bold text-[#E9D5FF] tracking-wide truncate">
                  {activeDoc.department}
                </p>
                <h3 className="font-black text-base leading-tight truncate mt-0.5">
                  {activeDoc.name}
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between bg-white">
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold text-[#6D4AFF] leading-snug line-clamp-1">
                  {activeDoc.specialty}
                </p>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span className="truncate font-semibold text-slate-700">
                      {activeDoc.qualification} · {activeDoc.experience}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-[#6366F1]" />
                    <span className="truncate font-bold text-[#1E2252]">
                      {activeDoc.timing}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                  {currentIndex + 1} / {doctors.length}
                </span>

                <a
                  href={DOCTOR_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerTouchFreeze();
                    addBookingHistoryItem('doctor', activeDoc.name, activeDoc.timing);
                  }}
                  className={`active:scale-95 font-black text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-transform cursor-pointer bg-gradient-to-r ${activeGradient} text-white whitespace-nowrap`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book OPD</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Smooth Touch-Friendly Controls */}
      <div className="flex items-center justify-center gap-3 mt-1">
        <button
          type="button"
          onClick={() => {
            handlePrev();
            triggerTouchFreeze();
          }}
          aria-label="Previous Doctor"
          className="min-w-[44px] min-h-[44px] rounded-full bg-white/90 border border-white hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 text-[#3B3F7D]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px]">
          {doctors.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i >= currentIndex ? 1 : -1);
                setCurrentIndex(i);
                triggerTouchFreeze();
              }}
              aria-label={`Go to doctor ${i + 1}`}
              className={`h-2 transition-all duration-200 rounded-full cursor-pointer ${
                i === currentIndex
                  ? 'w-6 bg-[#6D4AFF]'
                  : 'w-2 bg-[#C4B5FD] hover:bg-[#A78BFA]'
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
          className="min-w-[44px] min-h-[44px] rounded-full bg-white/90 border border-white hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 text-[#3B3F7D]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
