import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import {
  Search,
  Stethoscope,
  Clock,
  Award,
  ExternalLink,
  CalendarCheck,
  X,
  Phone,
  MessageCircle,
  Building,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getThemePalette,
  addBookingHistoryItem,
  CLINIC_CONFIG,
} from '../data/clinicData';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  t: Record<string, string>;
  doctorBookingUrl: string;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  t,
  doctorBookingUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [activeDoctorModal, setActiveDoctorModal] = useState<Doctor | null>(null);

  const p = getThemePalette();

  // Extract distinct departments/specialties for the filter tabs
  const filterOptions = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.department) set.add(d.department.trim());
    });
    return ['ALL', ...Array.from(set)];
  }, [doctors]);

  // Filter doctors based on search query and specialty filter
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return doctors.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        (doc.qualification && doc.qualification.toLowerCase().includes(q)) ||
        (doc.experience && doc.experience.toLowerCase().includes(q));

      const matchesSpecialty =
        selectedSpecialty === 'ALL' ||
        doc.department.toLowerCase().trim() === selectedSpecialty.toLowerCase().trim();

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const handleOpenBooking = (doc: Doctor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addBookingHistoryItem({
      type: 'doctor',
      title: doc.name,
      subtitle: `${doc.specialty} • ${doc.timing}`,
      url: doctorBookingUrl,
    });
    window.open(doctorBookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-3 px-4 pb-24 space-y-3.5">
      {/* Title & Quick OPD Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${p.heading}`}>
            <span>👨‍⚕️</span> {t.doctors || 'Specialist Doctors'}
          </h2>
          <p className={`text-xs mt-0.5 font-medium ${p.subtext}`}>
            {doctors.length} Specialist Consultants Available for OPD Registration
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.open(doctorBookingUrl, '_blank', 'noopener,noreferrer');
            addBookingHistoryItem({
              type: 'doctor',
              title: 'General Doctor OPD Registration',
              subtitle: 'Official Doctor Portal',
              url: doctorBookingUrl,
            });
          }}
          className={`text-xs font-extrabold px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${p.primaryBtn}`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Book OPD</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* 1. Search Bar at Top */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by doctor name, specialty, or department..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold placeholder:text-slate-400 focus:outline-teal-600 shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Specialty Filters (Scrollable Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => {
          const isSelected = selectedSpecialty === opt;
          const count =
            opt === 'ALL'
              ? doctors.length
              : doctors.filter((d) => d.department.toLowerCase() === opt.toLowerCase()).length;

          return (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedSpecialty(opt)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{opt === 'ALL' ? 'All Specialties' : opt}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Matching Count */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
        <span>Showing {filteredDoctors.length} Doctors</span>
        <span className="text-[10px] font-medium text-teal-700">Tap card to view full profile</span>
      </div>

      {/* 3. Compact Doctor Cards List */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-3xl">🔍</p>
          <p className="text-xs font-bold text-slate-800">No doctors match your search.</p>
          <p className="text-[11px] text-slate-400">Try searching for a different name or specialty.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('ALL');
            }}
            className="mt-2 text-xs font-extrabold text-teal-700 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDoctors.map((doctor) => (
            <article
              key={doctor.id}
              onClick={() => setActiveDoctorModal(doctor)}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-3">
                {/* Doctor Avatar - Compact */}
                <div className="relative shrink-0">
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="w-14 h-14 rounded-2xl object-cover object-top border border-teal-200/60 bg-teal-50"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                {/* Doctor Core Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                      {doctor.name}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 shrink-0">
                      {doctor.department}
                    </span>
                  </div>

                  {/* Specialty - No truncation */}
                  <p className="text-[11px] font-bold text-teal-700 leading-tight mt-0.5">
                    {doctor.specialty}
                  </p>

                  {/* Qualifications */}
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{doctor.qualification} • {doctor.experience}</span>
                  </p>
                </div>
              </div>

              {/* Bottom bar of card: Timing & Varied Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{doctor.timing}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDoctorModal(doctor);
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-teal-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Profile &rarr;
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenBooking(doctor, e)}
                    className="text-[11px] font-extrabold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                  >
                    <CalendarCheck className="w-3 h-3" />
                    <span>Book OPD</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 4. Doctor Detail Profile Modal */}
      {activeDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-teal-900 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                  Specialist Doctor Profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoctorModal(null)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Doctor Header Banner */}
              <div className="flex items-start gap-4">
                <img
                  src={activeDoctorModal.photo}
                  alt={activeDoctorModal.name}
                  className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-teal-500 shadow-md bg-teal-50 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 inline-block mb-1">
                    {activeDoctorModal.department}
                  </span>
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    {activeDoctorModal.name}
                  </h3>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">
                    {activeDoctorModal.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {activeDoctorModal.qualification}
                  </p>
                </div>
              </div>

              {/* Consultation Timings Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>OPD Visiting Timings:</span>
                </div>
                <p className="text-xs font-bold text-emerald-900 pl-5 leading-relaxed">
                  {activeDoctorModal.timing}
                </p>
                <p className="text-[10px] text-emerald-700 pl-5">
                  Registration & token slip issued online or at Life Care Hospital Square counter.
                </p>
              </div>

              {/* Clinical Focus & Experience */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Specialist Experience & Areas of Focus</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeDoctorModal.experience || 'Senior Consultant practicing at Baripada clinic.'}
                </p>
              </div>

              {/* Clinic Location */}
              <div className="text-[11px] text-slate-500 flex items-center gap-2 p-2 rounded-xl bg-slate-100">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Life Care Medicine Store & Poly Clinic, Hospital Square, Baripada</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <a
                href={`https://wa.me/${CLINIC_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Life%20Care%20Clinic%2C%20I%20would%20like%20to%20inquire%20about%20appointment%20with%20${encodeURIComponent(activeDoctorModal.name)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenBooking(activeDoctorModal)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book Doctor OPD Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
