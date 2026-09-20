import React, { useState } from 'react';
import { ImportantTopic } from '../../types';

interface TopicsTabProps {
  topics: ImportantTopic[];
  documentTitle: string;
}

export const TopicsTab: React.FC<TopicsTabProps> = ({ topics, documentTitle }) => {
  const [copied, setCopied] = useState(false);
  const safeTopics = topics || [];

  const handleCopy = async () => {
    let text = `${documentTitle} — Ranked Important Topics\n\n`;
    safeTopics.forEach((t) => {
      text += `#${t.rank}. ${t.title} [${t.yieldLevel}]\n`;
      text += `Why it matters: ${t.reason}\n`;
      if (t.keyTerms?.length) {
        text += `Key terms: ${t.keyTerms.join(', ')}\n`;
      }
      text += '\n';
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

  const getYieldBadgeClass = (yieldLevel: string) => {
    switch (yieldLevel) {
      case 'Critical':
        return 'bg-[#9E2A2B]/10 text-[#9E2A2B] border border-[#9E2A2B]/25 font-mono font-bold';
      case 'High Yield':
        return 'bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono font-bold';
      default:
        return 'bg-[#FAF8F5] text-[#57534E] border border-[#E5E0D8] font-mono font-medium';
    }
  };

  return (
    <article className="w-full flex flex-col gap-space-md animate-in fade-in duration-200 text-[#1C1917]">
      {/* Header utility row */}
      <div className="flex items-center justify-between gap-space-sm bg-white px-space-md py-space-sm rounded-xl border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-space-xs text-[#78716C]">
          <span className="material-symbols-outlined text-[18px] text-[#1B4332]">verified</span>
          <span className="font-mono text-xs text-[#57534E]">
            {safeTopics.length} High-Yield Exam Topics Ranked
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
          <span>{copied ? 'Copied Topics' : 'Copy Topics'}</span>
        </button>
      </div>

      {/* Topics list */}
      <div className="flex flex-col gap-space-sm">
        {safeTopics.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8] text-[#78716C]">
            No important topics identified for this document.
          </div>
        ) : (
          safeTopics.map((topic) => (
            <div
              key={topic.rank}
              className="bg-white rounded-2xl p-space-md shadow-xs border border-[#E5E0D8] border-l-4 border-l-[#1B4332] flex flex-col gap-space-xs hover:border-[#1B4332]/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white font-mono text-[12px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {topic.rank}
                  </span>
                  <h3 className="font-headline-sm text-base text-[#1C1917] font-semibold truncate">
                    {topic.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-label-sm shrink-0 uppercase tracking-wider ${getYieldBadgeClass(
                    topic.yieldLevel
                  )}`}
                >
                  {topic.yieldLevel}
                </span>
              </div>

              {/* Why it matters */}
              <p className="font-body-md text-sm text-[#33302E] pl-8 leading-relaxed">
                <strong className="text-[#1C1917] font-semibold">Why it matters: </strong>
                {topic.reason}
              </p>

              {/* Tags / Frequency */}
              <div className="pl-8 pt-1 flex flex-wrap items-center gap-1.5 mt-0.5">
                {topic.examFrequency && (
                  <span className="px-2 py-0.5 rounded bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono text-[11px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#1B4332]">grade</span>
                    {topic.examFrequency}
                  </span>
                )}
                {topic.keyTerms?.map((term, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#78716C] font-mono text-[11px]"
                  >
                    #{term}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
};
