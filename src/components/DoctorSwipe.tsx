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
}

const ACCENT_GRADIENTS = [
  'from-teal-600 to-emerald-600',
  'from-indigo-600 to-blue-600',
  'from-purple-600 to-fuchsia-600',
  'from-rose-600 to-orange-500',
  'from-cyan-600 to-teal-600',
];

export const DoctorSwipe: React.FC<DoctorSwipeProps> = ({
  doctors,
  t,
  onViewAll,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isFrozen, setIsFrozen] = useState(false);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSwipeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-180, 0, 180], [-9, 0, 9]);

  const total = doctors.length || 1;

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
    if (isFrozen || total <= 1) {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
      return;
    }

    autoSwipeTimerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (autoSwipeTimerRef.current) clearInterval(autoSwipeTimerRef.current);
    };
  }, [total, isFrozen]);

  if (doctors.length === 0) return null;

  const activeDoc = doctors[currentIndex % total];
  const nextDoc = doctors[(currentIndex + 1) % total];
  const thirdDoc = doctors[(currentIndex + 2) % total];
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
        <h2 className="font-black text-sm tracking-tight text-slate-900">
          {t.doctors || 'Specialist Doctors'}
        </h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
          >
            <span>View All ({doctors.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Smooth Layered Deck Stack */}
      <div
        className="relative w-full h-[355px] flex items-center justify-center"
        onTouchStart={triggerTouchFreeze}
        onMouseDown={triggerTouchFreeze}
      >
        {/* Background depth cards */}
        {total > 2 && (
          <div
            aria-hidden="true"
            className="absolute top-4 w-[86%] max-w-[320px] h-[328px] rounded-3xl bg-white border border-slate-200/80 shadow-sm scale-[0.92] opacity-60 pointer-events-none transition-transform duration-300"
          />
        )}
        {total > 1 && thirdDoc && nextDoc && (
          <div
            aria-hidden="true"
            className="absolute top-2 w-[92%] max-w-[338px] h-[332px] rounded-3xl bg-white border border-slate-200 shadow-md scale-[0.96] opacity-85 pointer-events-none transition-transform duration-300"
          />
        )}

        {/* Active Draggable Top Card */}
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.article
            key={activeDoc.id}
            custom={direction}
            style={{ x: dragX, rotate: dragRotate, touchAction: 'pan-y' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.85}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0, x: direction > 0 ? 48 : -48 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{
              x: direction > 0 ? -240 : 240,
              opacity: 0,
              rotate: direction > 0 ? -10 : 10,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 28,
              mass: 0.85,
            }}
            className="relative z-20 w-full max-w-[356px] h-[336px] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 flex flex-col justify-between cursor-grab active:cursor-grabbing will-change-transform"
          >
            {/* Photo Banner with Colorful Top Strip & Contrast Scrim */}
            <div className="relative h-[165px] w-full bg-slate-900 overflow-hidden shrink-0">
              <div className={`absolute top-0 inset-x-0 h-1.5 z-20 bg-gradient-to-r ${activeGradient}`} />
              <img
                src={activeDoc.photo}
                alt={activeDoc.name}
                className="w-full h-full object-cover object-top pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Bottom Overlay Title over Scrim */}
              <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 text-white">
                <p className="text-[11px] font-bold text-teal-200 tracking-wide truncate">
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
                <p className="text-xs font-extrabold text-teal-700 leading-snug line-clamp-1">
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
                    <Clock className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                    <span className="truncate font-bold text-slate-800">
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
          className="min-w-[44px] min-h-[44px] rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 text-slate-700"
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
                  ? 'w-6 bg-teal-700'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
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
          className="min-w-[44px] min-h-[44px] rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0 text-slate-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
