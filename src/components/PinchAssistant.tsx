import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PinchCategory, PinchUpdate } from '../types';
import { isPinchUpdateActive } from '../data/clinicData';
import {
  X,
  Send,
  Calendar,
  Clock,
  Stethoscope,
  CalendarClock,
  Pill,
  HeartPulse,
  Megaphone,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface PinchAssistantProps {
  updates: PinchUpdate[];
  onOpenChange?: (isOpen: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'pinch';
  text: string;
  matchedUpdates?: PinchUpdate[];
}

const PINCH_QUICK_CARDS: {
  category: PinchCategory;
  label: string;
  icon: React.ReactNode;
  tint: string;
}[] = [
  {
    category: 'Doctor visits',
    label: 'Doctor visits',
    icon: <Stethoscope className="w-4 h-4 text-[#6366F1]" />,
    tint: 'bg-[#EEF0FF]',
  },
  {
    category: 'Schedule changes',
    label: 'Schedule changes',
    icon: <CalendarClock className="w-4 h-4 text-[#A855F7]" />,
    tint: 'bg-[#F5EEFF]',
  },
  {
    category: 'Pharmacy timings',
    label: 'Pharmacy timings',
    icon: <Pill className="w-4 h-4 text-[#0EA5E9]" />,
    tint: 'bg-[#ECFAFF]',
  },
  {
    category: 'Health camps',
    label: 'Health camps',
    icon: <HeartPulse className="w-4 h-4 text-[#EC4899]" />,
    tint: 'bg-[#FFF0F6]',
  },
];

const MEDICAL_ADVICE_PATTERNS = [
  /\b(dose|dosage|mg|ml|tablet|capsule|syrup|antibiotic|painkiller|ointment|injection)\b/i,
  /\b(medicine for|meds for|tablet for|treat|cure|remedy|prescribe|prescription|diagnos|side effect|overdose)\b/i,
  /\b(fever|headache|stomach ache|chest pain|cough|cold|vomit|diarrhea|infection|allergy|rash|bp|sugar)\b.*\b(take|eat|use|give|medicine|tablet|which)\b/i,
  /\b(which|what)\b.*\b(medicine|tablet|drug|pill)\b/i,
];

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PinchOrb: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const size = compact ? 'w-12 h-12' : 'w-32 h-32';
  const eyeClass = compact
    ? 'w-1.5 h-3 rounded-full bg-white'
    : 'w-3.5 h-7 rounded-full bg-white shadow-xs';

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Outer luminous pastel halo */}
      <div
        className={`pinch-orb-halo absolute rounded-full blur-xl ${
          compact ? 'w-14 h-14' : 'w-40 h-40'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(168,85,247,0.42) 0%, rgba(99,102,241,0.35) 55%, rgba(236,72,153,0.18) 100%)',
        }}
      />

      {/* Iridescent glowing orb sphere */}
      <div
        className={`pinch-orb-float relative ${size} rounded-full flex items-center justify-center shadow-xl`}
        style={{
          background:
            'radial-gradient(circle at 30% 25%, #F5D0FE 0%, #C084FC 28%, #8B5CF6 62%, #60A5FA 100%)',
          boxShadow: compact
            ? '0 6px 18px rgba(109, 74, 255, 0.35), inset 0 2px 6px rgba(255,255,255,0.7)'
            : '0 22px 44px -10px rgba(99, 102, 241, 0.45), inset 0 6px 18px rgba(255,255,255,0.75)',
        }}
      >
        {/* Inner translucent rim ring */}
        <div
          className="absolute inset-1 rounded-full border border-white/55 pointer-events-none"
          aria-hidden="true"
        />
        {/* Cute vertical pill eyes */}
        <div className={`relative z-10 flex items-center ${compact ? 'gap-1.5' : 'gap-4'}`}>
          <span className={eyeClass} />
          <span className={eyeClass} />
        </div>
      </div>

      {!compact && (
        <div
          className="mt-4 w-24 h-2.5 rounded-full blur-sm opacity-45"
          style={{
            background: 'radial-gradient(ellipse, #6366F1 0%, transparent 72%)',
          }}
        />
      )}
    </div>
  );
};

export const PinchAssistant: React.FC<PinchAssistantProps> = ({ updates, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showTopicsDrawer, setShowTopicsDrawer] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const setOpenState = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  // Only published & non-expired updates from Firestore
  const activeUpdates = useMemo(() => {
    return updates
      .filter(isPinchUpdateActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [updates]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const appendTurn = (userText: string, pinchText: string, matchedUpdates?: PinchUpdate[]) => {
    const uid = `u-${Date.now()}`;
    const pid = `p-${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      { id: uid, sender: 'user', text: userText },
      { id: pid, sender: 'pinch', text: pinchText, matchedUpdates },
    ]);
  };

  const handleCategorySelect = (category: PinchCategory | 'All') => {
    setShowTopicsDrawer(false);
    if (category === 'All') {
      if (activeUpdates.length === 0) {
        appendTurn('All updates', "Sorry, I don't have that information right now.");
      } else {
        appendTurn(
          'All updates',
          `Here ${activeUpdates.length === 1 ? 'is 1 published update' : `are ${activeUpdates.length} published updates`}:`,
          activeUpdates
        );
      }
      return;
    }

    const matches = activeUpdates.filter((u) => u.category === category);
    if (matches.length === 0) {
      appendTurn(category, "Sorry, I don't have that information right now.");
    } else {
      appendTurn(category, `Updates for ${category}:`, matches);
    }
  };

  const handleAsk = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;
    setInput('');
    setShowTopicsDrawer(false);

    // 1. Refuse medical/medicine advice strictly
    if (MEDICAL_ADVICE_PATTERNS.some((rx) => rx.test(query))) {
      appendTurn(
        query,
        'I cannot provide medicine or medical advice. I only share official updates published by the Life Care team.'
      );
      return;
    }

    if (activeUpdates.length === 0) {
      appendTurn(query, "Sorry, I don't have that information right now.");
      return;
    }

    const qLower = query.toLowerCase();

    // 2. General "latest / today / updates / all" intent
    if (/\b(all updates|latest|news|anything new|what.?s new|clinic updates)\b/i.test(qLower)) {
      appendTurn(query, 'Here are the current clinic updates:', activeUpdates);
      return;
    }

    // 3. Intent + keyword scoring strictly over admin-published activeUpdates
    const categoryHints: { cat: PinchCategory; terms: string[] }[] = [
      {
        cat: 'Doctor visits',
        terms: ['doctor', 'dr', 'specialist', 'opd', 'visit', 'visiting', 'consultation'],
      },
      {
        cat: 'Schedule changes',
        terms: ['schedule', 'reschedule', 'change', 'changed', 'cancelled', 'canceled', 'postpone', 'holiday', 'closed'],
      },
      {
        cat: 'Pharmacy timings',
        terms: ['pharmacy', 'store', 'open', 'close', 'closing', 'opening', 'timing', 'timings', 'hours', 'time'],
      },
      {
        cat: 'Health camps',
        terms: ['camp', 'camps', 'checkup', 'free', 'screening', 'drive'],
      },
      {
        cat: 'General announcements',
        terms: ['announcement', 'notice', 'general', 'update', 'delivery'],
      },
    ];

    const tokens = qLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(
        (t) =>
          t.length >= 2 &&
          ![
            'is',
            'the',
            'for',
            'and',
            'are',
            'any',
            'what',
            'when',
            'today',
            'tomorrow',
            'about',
            'can',
            'you',
            'tell',
            'me',
          ].includes(t)
      );

    const scored = activeUpdates
      .map((u) => {
        const haystack = `${u.title} ${u.category} ${u.date} ${u.timing} ${u.description}`.toLowerCase();
        let score = 0;

        for (const token of tokens) {
          if (haystack.includes(token)) {
            score += 3;
          }
        }

        for (const hint of categoryHints) {
          if (u.category === hint.cat && hint.terms.some((term) => qLower.includes(term))) {
            score += 2;
          }
        }

        return { update: u, score };
      })
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.update);

    if (scored.length === 0) {
      appendTurn(query, "Sorry, I don't have that information right now.");
      return;
    }

    appendTurn(
      query,
      `Found ${scored.length} ${scored.length === 1 ? 'update' : 'updates'} from the clinic:`,
      scored.slice(0, 5)
    );
  };

  const hasChatStarted = messages.length > 0;

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 isolate"
      role="dialog"
      aria-modal="true"
      aria-label="PINCH Assistant"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E1B4B]/40 backdrop-blur-xs"
        onClick={() => setOpenState(false)}
      />

      {/* PINCH Screen Container matching Reference Design */}
      <div
        className="relative z-10 w-full max-w-md h-[90vh] sm:h-[660px] max-h-[92vh] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-white/80 flex flex-col overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 85% 12%, rgba(167,184,255,0.5) 0%, transparent 45%), radial-gradient(circle at 12% 38%, rgba(221,196,255,0.5) 0%, transparent 50%), linear-gradient(180deg, #ECEBFF 0%, #EFE9FF 55%, #FCF1F7 100%)',
        }}
      >
        {/* Minimal Floating Header (NO Call button) */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
          {hasChatStarted ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              aria-label="Back to PINCH home"
              className="w-10 h-10 rounded-full bg-white/85 hover:bg-white shadow-sm border border-white flex items-center justify-center text-[#3B3F7D] cursor-pointer transition-transform active:scale-95"
              title="New Topic"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-white/75 border border-white text-[11px] font-extrabold text-[#5B5FC7] shadow-2xs">
              PINCH
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpenState(false)}
            aria-label="Close PINCH"
            className="w-10 h-10 rounded-full bg-white/85 hover:bg-white shadow-sm border border-white flex items-center justify-center text-[#3B3F7D] cursor-pointer transition-transform active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Stage */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3 flex flex-col">
          {!hasChatStarted ? (
            /* Initial Greeting Screen matching Reference Screenshot */
            <div className="flex-1 flex flex-col items-center justify-between py-2">
              {/* Greeting Text */}
              <div className="text-center space-y-1 mt-1">
                <p className="text-sm font-bold text-[#6366F1]">Hello there!</p>
                <h3 className="text-[22px] font-black tracking-tight text-[#1E2252] leading-tight">
                  How can I help you today?
                </h3>
              </div>

              {/* Centerpiece Glowing Iridescent Orb */}
              <div className="my-4">
                <PinchOrb />
              </div>

              {/* 2x2 Quick Option Cards + General / All */}
              <div className="w-full space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {PINCH_QUICK_CARDS.map((card) => (
                    <button
                      key={card.category}
                      type="button"
                      onClick={() => handleCategorySelect(card.category)}
                      className="min-h-[52px] px-3 py-2.5 rounded-2xl bg-white/88 hover:bg-white border border-white shadow-xs flex items-center gap-2.5 text-left transition-transform active:scale-97 cursor-pointer"
                    >
                      <span
                        className={`w-8 h-8 rounded-xl ${card.tint} flex items-center justify-center shrink-0`}
                      >
                        {card.icon}
                      </span>
                      <span className="text-xs font-extrabold text-[#1E2252] leading-tight">
                        {card.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('General announcements')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-white/82 hover:bg-white border border-white text-[11px] font-extrabold text-[#3B3F7D] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>General announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('All')}
                    className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-[11px] font-extrabold shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    All ({activeUpdates.length})
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation Thread */
            <div className="space-y-3 pt-1 pb-2">
              <div className="flex items-center justify-center gap-2.5 pb-1">
                <PinchOrb compact />
                <div className="text-left">
                  <p className="text-xs font-black text-[#1E2252]">PINCH Clinic Updates</p>
                  <p className="text-[10px] font-semibold text-[#6366F1]">
                    Official Life Care Announcements
                  </p>
                </div>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-semibold rounded-br-sm'
                        : 'bg-white/90 border border-white text-[#1E2252] font-medium rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.matchedUpdates && m.matchedUpdates.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {m.matchedUpdates.map((upd) => (
                        <div
                          key={upd.id}
                          className="bg-white/92 rounded-2xl p-3.5 border border-white shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#6D4AFF] font-bold">
                            <span>{upd.category}</span>
                            {upd.expiryDate && (
                              <span className="text-slate-400 font-medium">
                                Valid till {formatShortDate(upd.expiryDate)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-xs text-[#1E2252] leading-snug">
                            {upd.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {upd.description}
                          </p>
                          {(upd.date || upd.timing) && (
                            <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#1E2252]">
                              {upd.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#8B5CF6]" />
                                  {formatShortDate(upd.date)}
                                </span>
                              )}
                              {upd.timing && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#6366F1]" />
                                  {upd.timing}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Quick Topics Pop-bar (Triggered by + button) */}
        {showTopicsDrawer && (
          <div className="mx-4 mb-2 p-2.5 rounded-2xl bg-white/95 border border-white shadow-md flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#6366F1] text-white text-[11px] font-bold cursor-pointer"
            >
              All updates
            </button>
            {PINCH_QUICK_CARDS.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => handleCategorySelect(c.category)}
                className="px-2.5 py-1 rounded-xl bg-[#F4F1FF] text-[#3B3F7D] text-[11px] font-bold cursor-pointer hover:bg-[#EAE3FF]"
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleCategorySelect('General announcements')}
              className="px-2.5 py-1 rounded-xl bg-[#F4F1FF] text-[#3B3F7D] text-[11px] font-bold cursor-pointer hover:bg-[#EAE3FF]"
            >
              General announcements
            </button>
          </div>
        )}

        {/* Bottom Capsule Input Bar matching Reference Screenshot */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="px-4 pb-4 pt-1 flex items-center gap-2.5 shrink-0"
        >
          <div className="flex-1 flex items-center gap-2 bg-white/95 border border-white rounded-full pl-2 pr-4 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setShowTopicsDrawer((prev) => !prev)}
              aria-label="Quick clinic topics"
              className="w-8 h-8 rounded-full bg-[#ECEBFF] hover:bg-[#E0DEFF] text-[#5B5FC7] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask PINCH about clinic updates..."
              className="flex-1 bg-transparent text-xs font-semibold text-[#1E2252] placeholder:text-slate-400 focus:outline-none min-w-0"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6366F1] disabled:opacity-45 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Floating Luminous PINCH Trigger Button (Bottom Left) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setOpenState(true)}
          aria-label="Open PINCH clinic updates assistant"
          className="fixed bottom-20 left-4 z-40 min-h-[46px] pl-2 pr-3.5 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-[#1E2252] shadow-lg shadow-indigo-500/20 border border-white flex items-center gap-2 font-black text-xs tracking-wide transition-transform active:scale-95 hover:scale-103 cursor-pointer"
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, #F5D0FE 0%, #A855F7 45%, #6366F1 100%)',
            }}
          >
            <span className="flex items-center gap-1">
              <span className="w-1 h-2.5 rounded-full bg-white" />
              <span className="w-1 h-2.5 rounded-full bg-white" />
            </span>
          </span>
          <span>PINCH</span>
          {activeUpdates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#EDE8FC] text-[#6D4AFF] text-[10px] font-black tabular-nums">
              {activeUpdates.length}
            </span>
          )}
        </button>
      )}

      {typeof document !== 'undefined' && modalContent
        ? createPortal(modalContent, document.body)
        : modalContent}
    </>
  );
};
