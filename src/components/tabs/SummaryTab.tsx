import React, { useState } from 'react';
import { StudySummary } from '../../types';

interface SummaryTabProps {
  summary: StudySummary;
  documentTitle: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ summary, documentTitle }) => {
  const [copied, setCopied] = useState(false);
  const safeOverview = summary?.overview || 'No executive summary available for this document.';
  const safeTakeaways = summary?.keyTakeaways || [];
  const safeTheses = summary?.coreTheses || [];
  const readingTime = summary?.readingTimeMinutes || 6;

  const handleCopy = async () => {
    let text = `${documentTitle} — Executive Summary\n\n${safeOverview}\n\nKey Takeaways:\n`;
    safeTakeaways.forEach((k) => {
      text += `• ${k}\n`;
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <article className="w-full flex flex-col gap-space-md animate-in fade-in duration-200 text-[#1C1917]">
      {/* Meta Bar */}
      <div className="flex items-center justify-between gap-space-sm bg-white px-space-md py-space-sm rounded-xl border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-space-xs text-[#78716C]">
          <span className="material-symbols-outlined text-[18px] text-[#1B4332]">summarize</span>
          <span className="font-mono text-xs text-[#57534E]">
            Concise Synthesis • ~{readingTime} min read
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`h-8 px-3.5 rounded-full font-label-sm text-xs flex items-center gap-space-xs transition-all active:scale-95 cursor-pointer font-bold ${
            copied
              ? 'bg-[#14382A] text-white shadow-xs'
              : 'bg-[#1B4332] hover:bg-[#14382A] text-white shadow-xs'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Main Abstract Card */}
      <section className="bg-white rounded-2xl p-space-lg shadow-xs flex flex-col gap-space-md border border-[#E5E0D8] border-l-4 border-l-[#1B4332]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono text-[11px] font-bold uppercase tracking-wider">
            Executive Abstract
          </div>
          <span className="font-mono text-xs text-[#78716C]">
            Synthesized Overview
          </span>
        </div>

        <p className="font-body-lg text-sm sm:text-base text-[#33302E] leading-relaxed font-normal">
          {safeOverview}
        </p>

        {/* Key Takeaways */}
        {safeTakeaways.length > 0 && (
          <div className="mt-space-sm pt-space-md border-t border-[#E5E0D8] flex flex-col gap-space-sm">
            <h3 className="font-headline-sm text-base text-[#1C1917] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1B4332] text-[20px]">fact_check</span>
              <span>Essential Takeaways</span>
            </h3>
            <ul className="flex flex-col gap-2.5">
              {safeTakeaways.map((takeaway, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-space-sm font-body-md text-sm sm:text-base text-[#33302E]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                    ✓
                  </span>
                  <span className="leading-normal">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Core Theses if present */}
        {safeTheses.length > 0 && (
          <div className="mt-space-xs grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-space-sm">
            {safeTheses.map((thesis, tIdx) => (
              <div
                key={tIdx}
                className="p-space-sm rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] border-l-2 border-l-[#1B4332] shadow-xs"
              >
                <span className="font-mono text-xs text-[#1B4332] font-semibold uppercase tracking-wider">
                  {thesis.topic}
                </span>
                <p className="font-body-sm text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                  {thesis.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
};
