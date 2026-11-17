import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PinchCategory, PinchUpdate } from '../types';
import { isPinchUpdateActive, CLINIC_CONFIG } from '../data/clinicData';
import {
  MessageSquareHeart,
  X,
  Send,
  Calendar,
  Clock,
  Sparkles,
  Phone,
} from 'lucide-react';

interface PinchAssistantProps {
  updates: PinchUpdate[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'pinch';
  text: string;
  matchedUpdates?: PinchUpdate[];
}

const PINCH_CATEGORIES: PinchCategory[] = [
  'Doctor visits',
  'Schedule changes',
  'Pharmacy timings',
  'Health camps',
  'General announcements',
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

export const PinchAssistant: React.FC<PinchAssistantProps> = ({ updates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'pinch',
      text: 'Hi! I am PINCH. Tap a topic below or ask about clinic updates, doctor visits, pharmacy timings, or health camps.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (category === 'All') {
      if (activeUpdates.length === 0) {
        appendTurn('All clinic updates', "Sorry, I don't have that information right now.");
      } else {
        appendTurn(
          'All clinic updates',
          `Here ${activeUpdates.length === 1 ? 'is 1 active clinic update' : `are ${activeUpdates.length} active clinic updates`}:`,
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

    // 1. Refuse medical/medicine advice strictly
    if (MEDICAL_ADVICE_PATTERNS.some((rx) => rx.test(query))) {
      appendTurn(
        query,
        "I cannot provide medicine or medical advice. I only share official updates published by the Life Care team."
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
      { cat: 'Doctor visits', terms: ['doctor', 'dr', 'specialist', 'opd', 'visit', 'visiting', 'consultation'] },
      { cat: 'Schedule changes', terms: ['schedule', 'reschedule', 'change', 'changed', 'cancelled', 'canceled', 'postpone', 'holiday', 'closed'] },
      { cat: 'Pharmacy timings', terms: ['pharmacy', 'store', 'open', 'close', 'closing', 'opening', 'timing', 'timings', 'hours', 'time'] },
      { cat: 'Health camps', terms: ['camp', 'camps', 'checkup', 'free', 'screening', 'drive'] },
      { cat: 'General announcements', terms: ['announcement', 'notice', 'general', 'update', 'delivery'] },
    ];

    const tokens = qLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !['is', 'the', 'for', 'and', 'are', 'any', 'what', 'when', 'today', 'tomorrow', 'about', 'can', 'you', 'tell', 'me'].includes(t));

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

  return (
    <>
      {/* Floating PINCH Trigger Button (Bottom Left — clear of Store Bag button) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open PINCH clinic updates assistant"
          className="fixed bottom-20 left-4 z-40 min-h-[46px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-900/20 border border-white/25 flex items-center gap-2 font-black text-xs tracking-wide transition-transform active:scale-95 hover:brightness-110 cursor-pointer"
        >
          <MessageSquareHeart className="w-4 h-4 shrink-0" />
          <span>PINCH</span>
          {activeUpdates.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black tabular-nums">
              {activeUpdates.length}
            </span>
          )}
        </button>
      )}

      {/* PINCH Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[82vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-700 via-teal-700 to-emerald-700 text-white flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm tracking-tight leading-none">PINCH</h3>
                  <p className="text-[11px] text-teal-100 mt-1 truncate">
                    Official Life Care Updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${CLINIC_CONFIG.phone}`}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1"
                  title="Call Clinic Desk"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close PINCH"
                  className="min-h-[36px] min-w-[36px] rounded-xl hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Option Chips */}
            <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => handleCategorySelect('All')}
                className="px-3 py-1.5 rounded-xl bg-teal-700 text-white text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer hover:bg-teal-800"
              >
                All updates
              </button>
              {PINCH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Messages Thread */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-teal-700 text-white font-semibold rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.matchedUpdates && m.matchedUpdates.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {m.matchedUpdates.map((upd) => (
                        <div
                          key={upd.id}
                          className="bg-white rounded-2xl p-3 border border-teal-200/80 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-teal-700 font-bold">
                            <span>{upd.category}</span>
                            {upd.expiryDate && (
                              <span className="text-slate-400 font-medium">
                                Valid till {formatShortDate(upd.expiryDate)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-xs text-slate-900 leading-snug">
                            {upd.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {upd.description}
                          </p>
                          {(upd.date || upd.timing) && (
                            <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-700">
                              {upd.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-teal-600" />
                                  {formatShortDate(upd.date)}
                                </span>
                              )}
                              {upd.timing && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-indigo-600" />
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

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(input);
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about visits, timings, camps..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-teal-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
