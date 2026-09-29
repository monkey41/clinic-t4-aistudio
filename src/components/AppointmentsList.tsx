import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  FlaskConical,
  Search,
  Calendar as CalendarIcon,
  ExternalLink,
  History,
  Trash2,
  Clock,
} from 'lucide-react';
import { MonthCalendar } from './MonthCalendar';
import { DarkColorOption, BookingHistoryItem } from '../types';
import {
  PATHOLOGY_TESTS,
  DOCTOR_BOOKING_URL,
  PATHOLOGY_BOOKING_URL,
  getThemePalette,
  getBookingHistory,
  addBookingHistoryItem,
  clearBookingHistory,
} from '../data/clinicData';

interface AppointmentsListProps {
  t: Record<string, string>;
  isDark?: boolean;
  darkColor?: DarkColorOption;
  initialSubTab?: 'calendar' | 'pathology';
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  isDark = false,
  darkColor = 'ocean',
  initialSubTab = 'calendar',
}) => {
  const [subTab, setSubTab] = useState<'calendar' | 'pathology'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() =>
    getBookingHistory()
  );

  const p = getThemePalette(isDark, darkColor);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    const syncHistory = () => setBookingHistory(getBookingHistory());
    window.addEventListener('booking-history-updated', syncHistory);
    return () => window.removeEventListener('booking-history-updated', syncHistory);
  }, []);

  const categories = ['ALL', ...Array.from(new Set(PATHOLOGY_TESTS.map((t) => t.category)))];

  const filteredTests = PATHOLOGY_TESTS.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.parameters && test.parameters.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || test.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="py-4 px-4 max-w-xl mx-auto pb-24 space-y-3.5">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${p.heading}`}>
          <span>📋</span> Online Bookings, Calendar & Pathology
        </h2>
        <p className={`text-xs mt-0.5 font-medium ${p.subtext}`}>
          Life Care Medicine Store and Poly Clinic • Direct Official Booking Links
        </p>
      </div>

      {/* Direct Booking Portal Buttons (Only buttons leading to the official links — NO in-app forms) */}
      <div className={`rounded-3xl p-4 border shadow-sm space-y-3 ${p.card}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider ${p.accentText}`}>
            🔗 Direct Official Booking Links
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge}`}>
            Instant Portal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Doctor OPD Booking Button */}
          <a
            href={DOCTOR_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              addBookingHistoryItem({
                type: 'doctor',
                title: 'Doctor OPD Registration',
                subtitle: 'Official Doctor OPD Booking Portal',
                url: DOCTOR_BOOKING_URL,
              })
            }
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${p.primaryBtn}`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>🩺 Doctor OPD Booking</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          {/* 2. Pathology Lab Booking Button */}
          <a
            href={PATHOLOGY_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              addBookingHistoryItem({
                type: 'pathology',
                title: 'Pathology Lab Online Booking',
                subtitle: 'Official Pathology Test Portal',
                url: PATHOLOGY_BOOKING_URL,
              })
            }
            className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${p.secondaryBtn}`}
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            <span>🧪 Pathology Test Booking</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>

      {/* SMALL / COMPACT BOOKING HISTORY SECTION */}
      <div className={`rounded-2xl px-3.5 py-2.5 border shadow-2xs ${p.card}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <History className={`w-3.5 h-3.5 ${p.accentText}`} />
            <h3 className={`text-xs font-extrabold ${p.heading}`}>
              Booking History
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${p.badge}`}>
              {bookingHistory.length}
            </span>
          </div>

          {bookingHistory.length > 0 && (
            <button
              type="button"
              onClick={() => clearBookingHistory()}
              className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${p.cardAlt} hover:opacity-80`}
              title="Clear history"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {bookingHistory.length === 0 ? (
          <p className={`text-[11px] mt-1 font-medium ${p.mutedText}`}>
            Empty / No New Bookings yet. Tap any Doctor OPD or Pathology booking button to record your visit.
          </p>
        ) : (
          <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {bookingHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${p.cardAlt}`}
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <span className="text-xs shrink-0">
                    {item.type === 'doctor' ? '🩺' : '🧪'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-extrabold truncate leading-tight ${p.heading}`}>
                      {item.title}
                    </p>
                    <p className={`text-[10px] truncate ${p.subtext}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${p.mutedText}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-0.5 ${p.primaryBtn}`}
                  >
                    <span>Open</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sub-navigation Switcher: Visit Calendar | Pathology Costs */}
      <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border ${p.card}`}>
        <button
          type="button"
          onClick={() => setSubTab('calendar')}
          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'calendar' ? p.primaryBtn : `${p.subtext} hover:opacity-80`
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Doctor Visit Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pathology')}
          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'pathology' ? p.secondaryBtn : `${p.subtext} hover:opacity-80`
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          <span>Pathology Test Costs</span>
        </button>
      </div>

      {/* TAB 1: DOCTOR VISIT CALENDAR (Tap once on date to see doctors coming on that day) */}
      {subTab === 'calendar' && (
        <div className="animate-in fade-in">
          <MonthCalendar isDark={isDark} darkColor={darkColor} />
        </div>
      )}

      {/* TAB 2: PATHOLOGY TESTS & OFFICIAL COSTS */}
      {subTab === 'pathology' && (
        <div className="space-y-3 animate-in fade-in">
          <div className={`rounded-2xl p-3.5 border ${p.card}`}>
            <h3 className={`font-extrabold text-sm flex items-center gap-1.5 ${p.heading}`}>
              <span>🧪</span> Pathology Blood Test Rate Card
            </h3>
            <p className={`text-[11px] ${p.subtext}`}>
              Tap "Book Test" on any test to open the official Pathology Booking link
            </p>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${p.mutedText}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CBC, Thyroid, LFT, Sugar, Vitamin D..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-hidden ${p.input}`}
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? p.secondaryBtn
                      : `${p.cardAlt} border`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pathology Test Cards with Price & Direct Link Button */}
          <div className="space-y-2.5">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`rounded-2xl p-3.5 border shadow-2xs flex items-center justify-between gap-3 transition-all ${p.card}`}
              >
                <div className="min-w-0 flex-1">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${p.badge}`}>
                    🧪 {test.category}
                  </span>
                  <h4 className={`font-extrabold text-xs sm:text-sm mt-1 ${p.heading}`}>
                    {test.name}
                  </h4>
                  {test.parameters && (
                    <p className={`text-[11px] mt-0.5 line-clamp-1 ${p.subtext}`}>
                      Includes: {test.parameters}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-sm sm:text-base font-black ${p.accentText}`}>
                    ₹{test.price}
                  </span>
                  <a
                    href={PATHOLOGY_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      addBookingHistoryItem({
                        type: 'pathology',
                        title: test.name,
                        subtitle: `${test.category} • ₹${test.price}`,
                        url: PATHOLOGY_BOOKING_URL,
                      })
                    }
                    className={`active:scale-95 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer ${p.secondaryBtn}`}
                  >
                    <span>Book Test</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
