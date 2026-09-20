import React, { useState } from 'react';
import { CorrectionItem } from '../../types';

interface CorrectionTrackerTabProps {
  corrections: CorrectionItem[];
  documentTitle: string;
  onClearMistakes?: () => void;
  onGoToMCQ?: () => void;
}

export const CorrectionTrackerTab: React.FC<CorrectionTrackerTabProps> = ({
  corrections,
  documentTitle,
  onClearMistakes,
  onGoToMCQ,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>('all');

  const safeCorrections = corrections || [];

  // Get unique topics for filtering
  const topics = Array.from(
    new Set(safeCorrections.map((c) => c.topicRef).filter(Boolean) as string[])
  );

  const filteredCorrections = filterTopic === 'all'
    ? safeCorrections
    : safeCorrections.filter((c) => c.topicRef === filterTopic);

  const handleCopy = async () => {
    if (safeCorrections.length === 0) return;
    let text = `${documentTitle} — Correction Tracker & Mistake Log\n\n`;
    safeCorrections.forEach((c, idx) => {
      text += `${idx + 1}. Question: ${c.question}\n`;
      text += `   ❌ Your Answer: ${c.userAnswer}\n`;
      text += `   ✅ Correct Answer: ${c.correctAnswer}\n`;
      if (c.explanation) {
        text += `   💡 Explanation: ${c.explanation}\n`;
      }
      if (c.topicRef) {
        text += `   🏷️ Topic: ${c.topicRef}\n`;
      }
      text += '\n';
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="w-full flex flex-col gap-space-md animate-in fade-in duration-200 text-[#1C1917]">
      {/* Header bar */}
      <section className="bg-white rounded-2xl p-space-md shadow-xs border border-[#E5E0D8] border-l-4 border-l-[#9E2A2B] flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9E2A2B]/10 border border-[#9E2A2B]/25 text-[#9E2A2B] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">assignment_late</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base text-[#1C1917] font-bold">
                Correction Tracker ({safeCorrections.length} Logged Mistakes)
              </h2>
              <p className="font-mono text-xs text-[#78716C]">
                Targeted Remediation & Concept Gap Log • Scoped to {documentTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {safeCorrections.length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  className={`h-8 px-3.5 rounded-full font-label-sm text-xs flex items-center gap-space-xs transition-all active:scale-95 cursor-pointer font-bold ${
                    copied
                      ? 'bg-[#14382A] text-white shadow-xs'
                      : 'bg-[#1B4332] hover:bg-[#14382A] text-white shadow-xs'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copied ? 'done' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied Log' : 'Copy Corrections'}</span>
                </button>
                {onClearMistakes && (
                  <button
                    onClick={onClearMistakes}
                    className="h-8 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE5DC] border border-[#E5E0D8] text-[#78716C] hover:text-[#9E2A2B] font-mono text-xs transition-colors cursor-pointer flex items-center gap-1"
                    type="button"
                    title="Clear correction log"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Clear</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter bar if multiple topics */}
        {topics.length > 1 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#E5E0D8] overflow-x-auto py-1">
            <span className="text-xs font-mono text-[#78716C] shrink-0">Filter by topic:</span>
            <button
              onClick={() => setFilterTopic('all')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                filterTopic === 'all'
                  ? 'bg-[#1B4332] text-white font-bold'
                  : 'bg-[#FAF8F5] text-[#57534E] border border-[#E5E0D8] hover:border-[#1B4332]'
              }`}
              type="button"
            >
              All Topics ({safeCorrections.length})
            </button>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                  filterTopic === t
                    ? 'bg-[#1B4332] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#57534E] border border-[#E5E0D8] hover:border-[#1B4332]'
                }`}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Corrections List or Empty State */}
      {safeCorrections.length === 0 ? (
        <section className="w-full flex flex-col items-center justify-center p-10 sm:p-14 bg-white rounded-2xl border border-[#E5E0D8] text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">fact_check</span>
          </div>
          <h3 className="font-headline-sm text-lg text-[#1C1917] font-bold mb-1.5">
            No mistakes yet
          </h3>
          <p className="font-body-md text-sm text-[#78716C] max-w-md leading-relaxed mb-5">
            Attempt the MCQ Generator questions to build your correction list. Any wrong answers will be automatically logged here for focused review and retention.
          </p>
          {onGoToMCQ && (
            <button
              onClick={onGoToMCQ}
              className="h-10 px-5 rounded-full bg-[#1B4332] hover:bg-[#14382A] text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">quiz</span>
              <span>Open MCQ Generator</span>
            </button>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-space-sm">
          {filteredCorrections.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl p-space-md shadow-xs border border-[#E5E0D8] border-l-4 border-l-[#9E2A2B] flex flex-col gap-space-xs"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#9E2A2B]/10 text-[#9E2A2B] border border-[#9E2A2B]/25 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    {item.topicRef && (
                      <span className="font-mono text-[11px] text-[#78716C] uppercase tracking-wider block">
                        {item.topicRef}
                      </span>
                    )}
                    <h3 className="font-headline-sm text-base text-[#1C1917] font-semibold leading-snug">
                      {item.question}
                    </h3>
                  </div>
                </div>
                {item.timestamp && (
                  <span className="font-mono text-[10px] text-[#78716C] shrink-0 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E0D8]">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {/* Answer comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-8">
                {/* Your wrong answer */}
                <div className="p-3 rounded-xl bg-[#9E2A2B]/5 border border-[#9E2A2B]/20 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#9E2A2B] font-mono text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>YOUR ANSWER</span>
                  </div>
                  <p className="font-body-md text-sm text-[#1C1917] font-medium leading-snug">
                    {item.userAnswer}
                  </p>
                </div>

                {/* Correct answer */}
                <div className="p-3 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/20 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#1B4332] font-mono text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>CORRECT ANSWER</span>
                  </div>
                  <p className="font-body-md text-sm text-[#1C1917] font-medium leading-snug">
                    {item.correctAnswer}
                  </p>
                </div>
              </div>

              {/* Explanation block */}
              {item.explanation && (
                <div className="ml-8 mt-1 p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#57534E] leading-relaxed">
                  <strong className="text-[#1C1917] font-semibold">Remediation & Logic: </strong>
                  {item.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
