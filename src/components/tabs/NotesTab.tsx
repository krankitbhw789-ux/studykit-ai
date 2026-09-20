import React, { useState } from 'react';
import { StudyNoteSection } from '../../types';

interface NotesTabProps {
  notes: StudyNoteSection[];
  readingTimeMinutes?: number;
  onStartQuiz: () => void;
  documentTitle: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  readingTimeMinutes = 8,
  onStartQuiz,
  documentTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<Record<string, boolean>>({});
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});

  const safeNotes = notes || [];

  const handleCopy = async () => {
    let formattedText = `${documentTitle} — StudyKit Notes\n\n`;
    safeNotes.forEach((sec) => {
      formattedText += `${sec.romanNumeral}. ${sec.title}\n`;
      if (sec.subtitle) formattedText += `${sec.subtitle}\n`;
      (sec.bullets || []).forEach((b) => {
        formattedText += `• ${b.label}: ${b.text}\n`;
      });
      if (sec.examKeyConcept) {
        formattedText += `Exam Key Concept: ${sec.examKeyConcept}\n`;
      }
      formattedText += '\n';
    });

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComplete = (id: string) => {
    setCompletedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <article className="w-full flex flex-col gap-space-lg animate-in fade-in duration-200">
      {/* Meta and Utility Row */}
      <div className="flex items-center justify-between gap-space-sm bg-white px-space-md py-space-sm rounded-xl border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-space-xs text-[#78716C]">
          <span className="material-symbols-outlined text-[18px] text-[#1B4332]">menu_book</span>
          <span className="font-mono text-xs text-[#57534E]">
            {safeNotes.length} Core Section{safeNotes.length !== 1 ? 's' : ''} • ~{readingTimeMinutes} min read
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
          <span>{copied ? 'Copied Notes' : 'Copy Notes'}</span>
        </button>
      </div>

      {/* Note Sections */}
      {safeNotes.map((sec) => {
        const isBookmarked = bookmarkedSections[sec.id];
        const isCompleted = completedSections[sec.id];

        return (
          <section
            key={sec.id}
            className="bg-white rounded-2xl p-space-md shadow-xs flex flex-col gap-space-sm border border-[#E5E0D8] border-l-4 border-l-[#1B4332]"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-[#1C1917]">
                {sec.romanNumeral}. {sec.title}
              </h2>
              <button
                onClick={() => toggleBookmark(sec.id)}
                className={`bookmark-btn p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isBookmarked ? 'text-[#1B4332] bg-[#1B4332]/10' : 'text-[#78716C] hover:text-[#1B4332] hover:bg-[#FAF8F5]'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark Section'}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isBookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            {sec.subtitle && (
              <p className="font-body-sm text-sm text-[#78716C]">{sec.subtitle}</p>
            )}

            {/* Bullets */}
            <ul className="flex flex-col gap-space-sm mt-space-xs">
              {sec.bullets.map((bullet, bIdx) => (
                <li
                  key={bIdx}
                  className="flex items-start gap-space-xs font-body-md text-sm sm:text-base text-[#33302E] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] mt-2 shrink-0"></span>
                  <span>
                    <strong className="font-semibold text-[#1B4332]">{bullet.label}: </strong>
                    {bullet.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Visual Diagram Mock / Figure if present */}
            {sec.figureImageUrl && (
              <div className="bg-[#FAF8F5] rounded-xl p-space-md flex flex-col gap-space-xs shadow-xs mt-space-xs border border-[#E5E0D8]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#78716C] uppercase tracking-wider">
                    {sec.figureCaption || 'Architectural Detail'}
                  </span>
                  <span className="text-xs text-[#1B4332] bg-[#1B4332]/10 border border-[#1B4332]/25 px-2 py-0.5 rounded font-mono font-bold">
                    High Yield
                  </span>
                </div>
                <div className="relative w-full h-44 rounded-lg overflow-hidden my-space-xs bg-[#EAE5DC] border border-[#E5E0D8]">
                  <img
                    src={sec.figureImageUrl}
                    alt={sec.figureCaption || 'Scientific illustration'}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>
                {sec.figureDescription && (
                  <p className="font-body-sm text-xs text-[#78716C]">
                    {sec.figureDescription}
                  </p>
                )}
              </div>
            )}

            {/* High-Yield Exam Callout Block */}
            {sec.examKeyConcept && (
              <aside className="mt-space-xs p-3 rounded-xl bg-[#1B4332]/5 flex items-start gap-space-xs border border-[#1B4332]/20">
                <span className="material-symbols-outlined text-[#1B4332] text-[20px] shrink-0 mt-0.5">
                  verified
                </span>
                <p className="font-body-sm text-xs sm:text-sm text-[#1C1917]">
                  <strong className="font-bold text-[#1B4332]">Exam Key Concept: </strong>
                  {sec.examKeyConcept}
                </p>
              </aside>
            )}

            {/* Complete action */}
            <div className="pt-space-xs flex justify-end">
              <button
                onClick={() => toggleComplete(sec.id)}
                className={`complete-btn inline-flex items-center gap-space-xs text-xs cursor-pointer transition-colors ${
                  isCompleted ? 'text-[#1B4332] font-bold' : 'text-[#78716C] hover:text-[#1B4332]'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isCompleted ? 'task_alt' : 'check_circle'}
                </span>
                <span>{isCompleted ? 'Section Completed' : 'Mark Section Read'}</span>
              </button>
            </div>
          </section>
        );
      })}

      {/* Reading Progress & Retention CTA Card */}
      <div className="p-space-md rounded-2xl bg-white flex items-center justify-between border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-space-sm min-w-0 pr-2">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_stories</span>
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-[#1C1917] font-semibold truncate text-sm sm:text-base">
              Ready to test retention?
            </p>
            <p className="font-body-sm text-xs text-[#78716C] truncate">
              Reinforce high-yield exam concepts with active recall practice.
            </p>
          </div>
        </div>
        <button
          onClick={onStartQuiz}
          className="h-9 px-4 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold text-xs sm:text-sm transition-all shrink-0 shadow-xs cursor-pointer"
          type="button"
        >
          Start Quiz
        </button>
      </div>
    </article>
  );
};
