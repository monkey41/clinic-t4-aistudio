import React, { useState } from 'react';
import { DarkColorOption } from '../types';
import {
  getDoctorsForDate,
  DOCTOR_BOOKING_URL,
  getThemePalette,
  addBookingHistoryItem,
} from '../data/clinicData';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Stethoscope,
} from 'lucide-react';

interface MonthCalendarProps {
  t?: Record<string, string>;
  isDark?: boolean;
  darkColor?: DarkColorOption;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  isDark = false,
  darkColor = 'ocean',
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const theme = getThemePalette(isDark, darkColor);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // Calendar calculations
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startingDayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Doctors coming on the tapped date
  const doctorsForSelectedDay = getDoctorsForDate(currentYear, currentMonth, selectedDay);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-5 border shadow-sm space-y-4 transition-colors ${theme.cardBg}`}>
      {/* Calendar Header with Navigation (No stars) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border ${theme.badge}`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-extrabold text-sm sm:text-base leading-tight ${theme.headingText}`}>
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <p className={`text-[11px] font-medium ${theme.subText}`}>
              Tap once on any date to view doctors coming on that day
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGoToToday}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${theme.badge}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${theme.subtleBg}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${theme.subtleBg}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDayNames.map((d) => (
          <div key={d} className={`text-[11px] font-bold py-1 ${theme.subText}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Month Days Grid — Clean dates with NO stars, single tap selects date */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: startingDayOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10 sm:h-11" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isSelected = selectedDay === day;
          const todayCell = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer border ${
                isSelected
                  ? `${theme.primaryBtn} shadow-md font-extrabold`
                  : todayCell
                  ? `${theme.softCardBg} font-bold`
                  : `${theme.subtleBg} hover:opacity-90 font-semibold`
              }`}
            >
              <span className="text-xs leading-none">{day}</span>
              {todayCell && !isSelected && (
                <span className="w-1 h-1 rounded-full mt-1 bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {/* Doctors Coming on the Tapped Date (Visible immediately on 1 tap!) */}
      <div className={`pt-3 border-t space-y-2.5 ${theme.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Stethoscope className={`w-4 h-4 ${theme.accentText}`} />
            <h4 className={`font-extrabold text-xs sm:text-sm ${theme.headingText}`}>
              Doctors Visiting on {monthNames[currentMonth]} {selectedDay}, {currentYear}
            </h4>
          </div>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badge}`}>
            {doctorsForSelectedDay.length} Doctors
          </span>
        </div>

        <div className="space-y-2">
          {doctorsForSelectedDay.map((arrival) => (
            <div
              key={arrival.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${theme.subtleBg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={arrival.photo}
                  alt={arrival.doctorName}
                  className="w-11 h-11 rounded-xl object-cover object-top border border-white/20 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  {arrival.isUnannounced && (
                    <span
                      className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded mb-0.5 ${theme.primaryBtn}`}
                    >
                      Unannounced Visit
                    </span>
                  )}
                  <h5 className={`font-extrabold text-xs sm:text-sm truncate ${theme.headingText}`}>
                    {arrival.doctorName}
                  </h5>
                  <p className={`text-[11px] font-bold truncate ${theme.accentText}`}>
                    {arrival.specialty}
                  </p>
                  <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${theme.subText}`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{arrival.timing}</span>
                  </p>
                </div>
              </div>

              <a
                href={DOCTOR_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  addBookingHistoryItem('doctor', arrival.doctorName, arrival.timing)
                }
                className={`shrink-0 font-extrabold text-[11px] px-3 py-2 rounded-xl shadow-2xs flex items-center gap-1 transition-all active:scale-95 ${theme.primaryBtn}`}
              >
                <span>Book OPD</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
