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
import { BookingHistoryItem, PathologyTest } from '../types';
import {
  getPathologyTests,
  getClinicConfig,
  getThemePalette,
  getBookingHistory,
  addBookingHistoryItem,
  clearBookingHistory,
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

  const categories = ['ALL', ...Array.from(new Set(tests.map((t) => t.category)))];

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.parameters && test.parameters.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || test.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const doctorBookingUrl = clinicConfig.doctorBookingUrl;
  const pathologyBookingUrl = clinicConfig.pathologyBookingUrl;

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

      {/* Direct Booking Portal Buttons */}
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
            href={doctorBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              addBookingHistoryItem({
                type: 'doctor',
                title: 'Doctor OPD Registration',
                subtitle: 'Official Doctor OPD Booking Portal',
                url: doctorBookingUrl,
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
            href={pathologyBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              addBookingHistoryItem({
                type: 'pathology',
                title: 'Pathology Lab Online Booking',
                subtitle: 'Official Pathology Test Portal',
                url: pathologyBookingUrl,
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

      {/* COMPACT BOOKING HISTORY SECTION */}
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

      {/* Sub Tabs: Doctor Calendar vs Pathology Tests */}
      <div className="flex rounded-2xl p-1 shadow-inner border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setSubTab('calendar')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'calendar'
              ? `${p.primaryBtn} shadow-xs`
              : `${p.mutedText} hover:${p.heading}`
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Doctor Visit Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pathology')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'pathology'
              ? `${p.secondaryBtn} shadow-xs`
              : `${p.mutedText} hover:${p.heading}`
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Pathology Tests ({tests.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Doctor Calendar */}
      {subTab === 'calendar' && (
        <div className="animate-in fade-in space-y-4">
          <MonthCalendar />
        </div>
      )}

      {/* SUB-TAB 2: Pathology Tests Catalog & Costs */}
      {subTab === 'pathology' && (
        <div className="animate-in fade-in space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-3.5 ${p.mutedText}`} />
            <input
              type="text"
              placeholder="Search tests (e.g. CBC, Thyroid, LFT, Sugar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-teal-600 transition-colors ${p.input}`}
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
                    ? p.primaryBtn
                    : `${p.card} opacity-80 hover:opacity-100`
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
                className={`rounded-2xl p-3.5 border shadow-xs transition-all ${p.card}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${p.badge}`}>
                      {test.category}
                    </span>
                    <h4 className={`font-extrabold text-xs sm:text-sm mt-1 leading-snug ${p.heading}`}>
                      {test.name}
                    </h4>
                    {test.parameters && (
                      <p className={`text-[11px] mt-1 leading-relaxed ${p.subtext}`}>
                        {test.parameters}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-base font-black block ${p.accentText}`}>
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
                      className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-2xs ${p.primaryBtn}`}
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
