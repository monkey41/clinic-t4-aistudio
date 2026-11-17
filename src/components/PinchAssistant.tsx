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
  elevateOnStore?: boolean;
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
    icon: <Stethoscope className="w-4 h-4 text-[#059669]" />,
    tint: 'bg-[#ECFDF5]',
  },
  {
    category: 'Schedule changes',
    label: 'Schedule changes',
    icon: <CalendarClock className="w-4 h-4 text-[#D97706]" />,
    tint: 'bg-[#FEF3C7]',
  },
  {
    category: 'Pharmacy timings',
    label: 'Pharmacy timings',
    icon: <Pill className="w-4 h-4 text-[#059669]" />,
    tint: 'bg-[#D1FAE5]',
  },
  {
    category: 'Health camps',
    label: 'Health camps',
    icon: <HeartPulse className="w-4 h-4 text-[#D97706]" />,
    tint: 'bg-[#FEF3C7]',
  },
];

const MEDICAL_ADVICE_PATTERNS = [
  /\b(dose|dosage|mg|ml|tablet|capsule|syrup|antibiotic|painkiller|ointment|injection)\b/i,
  /\b(medicine for|meds for|tablet for|treat|cure|remedy|prescribe|prescription|diagnos|side effect|overdose)\b/i,
  /\b(fever|headache|stomach ache|chest pain|cough|cold|vomit|diarrhea|infection|allergy|rash|bp|sugar)\b.*\b(take|eat|use|give|medicine|tablet|which)\b/i,
  /\b(which|what)\b.*\b(medicine|tablet|drug|pill)\b/i,
];

const GREETING_PATTERN =
  /^(hi+|hii+|hello+|helo+|hey+|namaste+|namaskar+|hola|good\s*(morning|afternoon|evening|night)|hru|how are you|what'?s up|sup|yo)[\s!.,?]*$/i;

const THANKS_BYE_PATTERN =
  /^(thanks|thank you|thx|ty|ok|okay|great|nice|bye|goodbye|see you)[\s!.,?]*$/i;

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PinchOrb: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const size = compact ? 'w-12 h-12' : 'w-32 h-32';
  const eyeClass = compact
    ? 'w-1.5 h-3 rounded-full bg-white pinch-eye-blink'
    : 'w-3.5 h-7 rounded-full bg-white shadow-xs pinch-eye-blink';

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Outer luminous emerald-gold halo */}
      <div
        className={`pinch-orb-halo absolute rounded-full blur-xl ${
          compact ? 'w-14 h-14' : 'w-40 h-40'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.42) 0%, rgba(5,150,105,0.28) 55%, rgba(245,158,11,0.22) 100%)',
        }}
      />

      {/* Alive breathing emerald & mint sphere */}
      <div
        className={`pinch-orb-float relative ${size} rounded-full flex items-center justify-center shadow-xl`}
        style={{
          background:
            'radial-gradient(circle at 28% 24%, #FEF3C7 0%, #6EE7B7 28%, #10B981 62%, #065F46 100%)',
          boxShadow: compact
            ? '0 6px 18px rgba(5, 150, 105, 0.35), inset 0 2px 6px rgba(255,255,255,0.7)'
            : '0 22px 44px -10px rgba(5, 150, 105, 0.45), inset 0 6px 18px rgba(255,255,255,0.75)',
        }}
      >
        <div
          className="absolute inset-1 rounded-full border border-white/60 pointer-events-none"
          aria-hidden="true"
        />
        <div className={`relative z-10 flex items-center ${compact ? 'gap-1.5' : 'gap-4'}`}>
          <span className={eyeClass} />
          <span className={eyeClass} />
        </div>
      </div>

      {!compact && (
        <div
          className="mt-4 w-24 h-2.5 rounded-full blur-sm opacity-45"
          style={{
            background: 'radial-gradient(ellipse, #059669 0%, transparent 72%)',
          }}
        />
      )}
    </div>
  );
};

export const PinchAssistant: React.FC<PinchAssistantProps> = ({
  updates,
  onOpenChange,
  elevateOnStore = false,
}) => {
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

    // 1. Basic Hi / Hello / Welcome greeting
    if (GREETING_PATTERN.test(query)) {
      const countText =
        activeUpdates.length > 0
          ? `There ${activeUpdates.length === 1 ? 'is 1 active clinic update' : `are ${activeUpdates.length} active clinic updates`} right now. Tap + or ask about Doctor visits, Schedule changes, Pharmacy timings, or Health camps!`
          : 'Tap + below or ask me about Doctor visits, Schedule changes, Pharmacy timings, or Health camps anytime.';
      appendTurn(
        query,
        `Hello! Welcome to Life Care Medicine Store & Poly Clinic. I'm PINCH, your clinic updates helper. ${countText}`
      );
      return;
    }

    // 2. Polite thanks / acknowledgement
    if (THANKS_BYE_PATTERN.test(query)) {
      appendTurn(
        query,
        "You're welcome! Wishing you good health. Ask anytime if you need clinic updates."
      );
      return;
    }

    // 3. Refuse medical/medicine advice strictly
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

    // 4. General "latest / updates / all" intent
    if (/\b(all updates|latest|news|anything new|what.?s new|clinic updates)\b/i.test(qLower)) {
      appendTurn(query, 'Here are the current clinic updates:', activeUpdates);
      return;
    }

    // 5. Intent + keyword scoring strictly over admin-published activeUpdates
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
        className="fixed inset-0 bg-[#122B22]/45 backdrop-blur-xs"
        onClick={() => setOpenState(false)}
      />

      {/* PINCH Screen Container in 65% Ivory/White, 25% Emerald/Mint, 10% Gold */}
      <div
        className="relative z-10 w-full max-w-md h-[90vh] sm:h-[660px] max-h-[92vh] rounded-t-[36px] sm:rounded-[36px] shadow-2xl border border-[#EAE4D3] flex flex-col overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 86% 12%, rgba(16,185,129,0.18) 0%, transparent 44%), radial-gradient(circle at 12% 38%, rgba(245,158,11,0.12) 0%, transparent 48%), linear-gradient(180deg, #FCFBF7 0%, #F7F4EC 58%, #ECFDF5 100%)',
        }}
      >
        {/* Minimal Header (NO Call button) */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
          {hasChatStarted ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              aria-label="Back to PINCH home"
              className="w-10 h-10 rounded-full bg-white hover:bg-[#ECFDF5] shadow-sm border border-[#EAE4D3] flex items-center justify-center text-[#122B22] cursor-pointer transition-transform active:scale-95"
              title="New Topic"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-extrabold text-[#065F46] shadow-2xs">
              PINCH
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpenState(false)}
            aria-label="Close PINCH"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#ECFDF5] shadow-sm border border-[#EAE4D3] flex items-center justify-center text-[#122B22] cursor-pointer transition-transform active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Stage */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3 flex flex-col">
          {!hasChatStarted ? (
            <div className="flex-1 flex flex-col items-center justify-between py-2">
              <div className="text-center space-y-1 mt-1">
                <p className="text-sm font-bold text-[#059669]">Hello there!</p>
                <h3 className="text-[22px] font-black tracking-tight text-[#122B22] leading-tight">
                  How can I help you today?
                </h3>
              </div>

              <div className="my-4">
                <PinchOrb />
              </div>

              <div className="w-full space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {PINCH_QUICK_CARDS.map((card) => (
                    <button
                      key={card.category}
                      type="button"
                      onClick={() => handleCategorySelect(card.category)}
                      className="min-h-[52px] px-3 py-2.5 rounded-2xl bg-white hover:bg-[#ECFDF5]/60 border border-[#EAE4D3] shadow-xs flex items-center gap-2.5 text-left transition-transform active:scale-97 cursor-pointer"
                    >
                      <span
                        className={`w-8 h-8 rounded-xl ${card.tint} flex items-center justify-center shrink-0`}
                      >
                        {card.icon}
                      </span>
                      <span className="text-xs font-extrabold text-[#122B22] leading-tight">
                        {card.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('General announcements')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-[#F7F4EC] border border-[#EAE4D3] text-[11px] font-extrabold text-[#122B22] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>General announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('All')}
                    className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-[11px] font-extrabold shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    All ({activeUpdates.length})
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1 pb-2">
              <div className="flex items-center justify-center gap-2.5 pb-1">
                <PinchOrb compact />
                <div className="text-left">
                  <p className="text-xs font-black text-[#122B22]">PINCH Clinic Updates</p>
                  <p className="text-[10px] font-semibold text-[#059669]">
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
                        ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold rounded-br-sm'
                        : 'bg-white border border-[#EAE4D3] text-[#122B22] font-medium rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.matchedUpdates && m.matchedUpdates.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {m.matchedUpdates.map((upd) => (
                        <div
                          key={upd.id}
                          className="bg-white rounded-2xl p-3.5 border border-[#EAE4D3] shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#059669] font-bold">
                            <span>{upd.category}</span>
                            {upd.expiryDate && (
                              <span className="text-[#7C8F86] font-medium">
                                Valid till {formatShortDate(upd.expiryDate)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-xs text-[#122B22] leading-snug">
                            {upd.title}
                          </h4>
                          <p className="text-[11px] text-[#4B6358] leading-relaxed">
                            {upd.description}
                          </p>
                          {(upd.date || upd.timing) && (
                            <div className="pt-1.5 border-t border-[#EAE4D3] flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#122B22]">
                              {upd.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#059669]" />
                                  {formatShortDate(upd.date)}
                                </span>
                              )}
                              {upd.timing && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#D97706]" />
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

        {/* Optional Quick Topics Pop-bar */}
        {showTopicsDrawer && (
          <div className="mx-4 mb-2 p-2.5 rounded-2xl bg-white border border-[#EAE4D3] shadow-md flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-[11px] font-bold cursor-pointer"
            >
              All updates
            </button>
            {PINCH_QUICK_CARDS.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => handleCategorySelect(c.category)}
                className="px-2.5 py-1 rounded-xl bg-[#ECFDF5] text-[#065F46] text-[11px] font-bold cursor-pointer hover:bg-[#D1FAE5]"
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleCategorySelect('General announcements')}
              className="px-2.5 py-1 rounded-xl bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold cursor-pointer hover:bg-[#FDE68A]"
            >
              General announcements
            </button>
          </div>
        )}

        {/* Bottom Capsule Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="px-4 pb-4 pt-1 flex items-center gap-2.5 shrink-0"
        >
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#EAE4D3] rounded-full pl-2 pr-4 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setShowTopicsDrawer((prev) => !prev)}
              aria-label="Quick clinic topics"
              className="w-8 h-8 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say hi or ask about clinic updates..."
              className="flex-1 bg-transparent text-xs font-semibold text-[#122B22] placeholder:text-[#8A9B93] focus:outline-none min-w-0"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#065F46] via-[#059669] to-[#D97706] disabled:opacity-45 text-white shadow-md shadow-emerald-900/25 flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Floating Alive PINCH Trigger Button (Right Side, Higher Up Above Bottom Bar) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setOpenState(true)}
          aria-label="Open PINCH clinic updates assistant"
          className={`fixed ${
            elevateOnStore ? 'bottom-36' : 'bottom-24'
          } right-4 z-40 min-h-[48px] pl-2 pr-3.5 py-1.5 rounded-full bg-[#FCFBF7]/95 backdrop-blur-md text-[#122B22] shadow-xl shadow-emerald-950/18 border border-[#A7F3D0] flex items-center gap-2 font-black text-xs tracking-wide transition-all active:scale-95 hover:scale-104 cursor-pointer pinch-orb-float`}
        >
          {/* Alive Emerald-Gold Glowing Orb with Blinking Eyes */}
          <span className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <span
              aria-hidden="true"
              className="pinch-orb-halo absolute inset-0 rounded-full blur-xs"
              style={{
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.55) 0%, rgba(245,158,11,0.35) 100%)',
              }}
            />
            <span
              className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white/70"
              style={{
                background:
                  'radial-gradient(circle at 28% 24%, #FEF3C7 0%, #34D399 42%, #059669 100%)',
              }}
            >
              <span className="flex items-center gap-1">
                <span className="w-1 h-2.5 rounded-full bg-white pinch-eye-blink" />
                <span className="w-1 h-2.5 rounded-full bg-white pinch-eye-blink" />
              </span>
            </span>
          </span>

          <span className="text-[#122B22]">PINCH</span>

          {activeUpdates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[10px] font-black tabular-nums">
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
