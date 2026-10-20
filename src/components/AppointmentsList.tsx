import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  FlaskConical,
  Search,
  Calendar as CalendarIcon,
  ExternalLink,
  History,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';
import { MonthCalendar } from './MonthCalendar';
import { BookingHistoryItem, PathologyTest, DoctorArrival } from '../types';
import {
  getPathologyTests,
  getClinicConfig,
  getThemePalette,
  getBookingHistory,
  addBookingHistoryItem,
  clearBookingHistory,
  getDoctorsForDate,
  DOCTOR_BOOKING_URL,
} from '../data/clinicData';

interface AppointmentsListProps {
  t?: Record<string, string>;
  initialSubTab?: 'calendar' | 'pathology';
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  initialSubTab = 'calendar',
}) => {
  const [subTab, setSubTab] = useState<'calendar' | 'pathology'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Selected date state (default today)
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>(() =>
    getBookingHistory()
  );
  const [tests, setTests] = useState<PathologyTest[]>(() => getPathologyTests());
  const [clinicConfig, setClinicConfig] = useState(() => getClinicConfig());

  const p = getThemePalette();

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    const syncHistory = () => setBookingHistory(getBookingHistory());
    const syncClinicData = () => {
      setTests(getPathologyTests());
      setClinicConfig(getClinicConfig());
    };
    window.addEventListener('booking-history-updated', syncHistory);
    window.addEventListener('clinic-data-updated', syncClinicData);
    return () => {
      window.removeEventListener('booking-history-updated', syncHistory);
      window.removeEventListener('clinic-data-updated', syncClinicData);
    };
  }, []);

  // Compute next 7 days for the compact date selector
  const nextSevenDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const doctorsForDay = getDoctorsForDate(d.getFullYear(), d.getMonth(), d.getDate());
      days.push({
        date: d,
        dayNum: d.getDate(),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        doctorsCount: doctorsForDay.length,
        hasDoctors: doctorsForDay.length > 0,
      });
    }
    return days;
  }, [today]);

  // Selected date doctors
  const doctorsForSelectedDate = useMemo(() => {
    return getDoctorsForDate(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
  }, [selectedDate]);

  const categories = ['ALL', ...Array.from(new Set(tests.map((t) => t.category)))];

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.parameters && test.parameters.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || test.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const doctorBookingUrl = clinicConfig.doctorBookingUrl || DOCTOR_BOOKING_URL;
  const pathologyBookingUrl = clinicConfig.pathologyBookingUrl;

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <section className="py-3 px-4 max-w-xl mx-auto pb-24 space-y-3.5">
      {/* 1. Sub Tabs at the Very Top (Doctor Calendar vs Pathology Tests) */}
      <div className="flex rounded-2xl p-1 shadow-inner border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setSubTab('calendar')}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'calendar'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Doctor OPD & Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pathology')}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'pathology'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Pathology Tests ({tests.length})</span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* SUB-TAB 1: DOCTOR APPOINTMENTS & CALENDAR FIRST                     */}
      {/* ================================================================== */}
      {subTab === 'calendar' && (
        <div className="animate-in fade-in space-y-3.5">
          {/* Header & Quick Direct OPD Action */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>📅</span> Doctor OPD Schedule & Dates
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Select a date below to view visiting specialists & availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFullMonth((prev) => !prev)}
              className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{showFullMonth ? 'Hide Month' : 'Full Month'}</span>
            </button>
          </div>

          {/* Optional Expanded Full Month View (Collapsible) */}
          {showFullMonth && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <MonthCalendar />
            </div>
          )}

          {/* 2. Compact Next 7 Days Date Selector */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
              <span>Next 7 Days OPD Dates</span>
              <span className="text-[10px] text-teal-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Green = Specialist Visiting</span>
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {nextSevenDays.map((item, idx) => {
                const isSelected = isSameDay(selectedDate, item.date);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-300'
                        : item.hasDoctors
                        ? 'bg-teal-50/70 border-teal-200 text-slate-800 hover:bg-teal-100'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase leading-none">
                      {item.dayName}
                    </span>
                    <span className="text-sm font-black mt-1 leading-none">
                      {item.dayNum}
                    </span>

                    {/* Status badge: clearly distinguish availability */}
                    <span className="mt-1 text-[8px] font-bold leading-none">
                      {item.hasDoctors ? (
                        <span className={`px-1 py-0.2 rounded-full ${isSelected ? 'bg-teal-800 text-teal-100' : 'text-emerald-700'}`}>
                          {item.doctorsCount} Docs
                        </span>
                      ) : (
                        <span className="text-slate-400">No OPD</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Immediate Doctors List for Selected Date */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {selectedDate.getDate()}
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {doctorsForSelectedDate.length > 0
                      ? `${doctorsForSelectedDate.length} Specialist Consultant(s) available`
                      : 'No specialist OPD visits scheduled on this date'}
                  </p>
                </div>
              </div>

              {doctorsForSelectedDate.length > 0 ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>OPD Available</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>No OPD Today</span>
                </span>
              )}
            </div>

            {doctorsForSelectedDate.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-2xl">📅</p>
                <p className="text-xs font-bold text-slate-700">
                  No specialists are scheduled for this specific date.
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Tap other dates in the selector above, or consult our pharmacy help desk.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDate(today)}
                  className="mt-1 text-xs font-extrabold text-teal-700 underline cursor-pointer"
                >
                  Jump to Today
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {doctorsForSelectedDate.map((arrival) => (
                  <div
                    key={arrival.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={arrival.photo}
                        alt={arrival.doctorName}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-teal-200 bg-white shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        {/* Clear Status Wording (Replaced confusing 'Unannounced Visit') */}
                        {arrival.isUnannounced ? (
                          <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded mb-0.5 bg-amber-100 text-amber-900 border border-amber-200">
                            Availability to be confirmed
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded mb-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Scheduled OPD • Booking Open
                          </span>
                        )}

                        <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                          {arrival.doctorName}
                        </h4>
                        <p className="text-[11px] font-bold text-teal-700 truncate">
                          {arrival.specialty}
                        </p>
                        <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{arrival.timing}</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={doctorBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'doctor',
                          title: arrival.doctorName,
                          subtitle: `${arrival.specialty} • ${arrival.timing}`,
                          url: doctorBookingUrl,
                        })
                      }
                      className="shrink-0 font-extrabold text-[11px] px-3 py-2 rounded-xl shadow-2xs flex items-center gap-1 transition-all active:scale-95 bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Book OPD</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Official Direct Booking Quick Bar */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={doctorBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                addBookingHistoryItem({
                  type: 'doctor',
                  title: 'Doctor OPD Registration',
                  subtitle: 'Official HealthMeU Portal',
                  url: doctorBookingUrl,
                })
              }
              className="py-2.5 px-3 rounded-xl border border-teal-200 bg-teal-50 text-teal-900 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              <span>Doctor Portal</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={pathologyBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                addBookingHistoryItem({
                  type: 'pathology',
                  title: 'Pathology Lab Online Booking',
                  subtitle: 'Official Lab Portal',
                  url: pathologyBookingUrl,
                })
              }
              className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-rose-700" />
              <span>Lab Portal</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>

          {/* 5. Collapsible Booking History Section (Moved down & collapsed by default) */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setHistoryExpanded((prev) => !prev)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-black text-slate-800">
                  Recent Booking History
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {bookingHistory.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <span>{historyExpanded ? 'Hide' : 'View'}</span>
                {historyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {historyExpanded && (
              <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50 animate-in slide-in-from-top-1">
                {bookingHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-2">
                    No recent booking slips recorded. Your booked visits will appear here.
                  </p>
                ) : (
                  <>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => clearBookingHistory()}
                        className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Clear History</span>
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {bookingHistory.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <span className="text-xs shrink-0">
                              {item.type === 'doctor' ? '🩺' : '🧪'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold truncate text-slate-900 leading-tight">
                                {item.title}
                              </p>
                              <p className="text-[10px] truncate text-slate-500">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-TAB 2: PATHOLOGY TESTS CATALOG & COSTS                         */}
      {/* ================================================================== */}
      {subTab === 'pathology' && (
        <div className="animate-in fade-in space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests (e.g. CBC, Thyroid, LFT, Sugar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold focus:outline-teal-600"
            />
          </div>

          {/* Category Chips Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tests List */}
          <div className="space-y-2.5">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl p-3.5 border border-slate-200 bg-white shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {test.category}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm mt-1 leading-snug text-slate-900">
                      {test.name}
                    </h4>
                    {test.parameters && (
                      <p className="text-[11px] mt-1 leading-relaxed text-slate-500">
                        {test.parameters}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black block text-teal-700">
                      ₹{test.price}
                    </span>
                    <a
                      href={pathologyBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        addBookingHistoryItem({
                          type: 'pathology',
                          title: test.name,
                          subtitle: `₹${test.price} • ${test.category}`,
                          url: pathologyBookingUrl,
                        })
                      }
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-teal-700 text-white shadow-2xs hover:bg-teal-800 cursor-pointer"
                    >
                      <span>Book</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
