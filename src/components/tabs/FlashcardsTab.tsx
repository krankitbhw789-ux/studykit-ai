import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImportantTopic } from '../../types';

interface FlashcardsTabProps {
  topics: ImportantTopic[];
  documentTitle: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({ topics, documentTitle }) => {
  const safeTopics = topics || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const totalCards = safeTopics.length;
  const currentCard = safeTopics[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < totalCards - 1) {
        setIsFlipped(false);
        return prev + 1;
      }
      return prev;
    });
  }, [totalCards]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setIsFlipped(false);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleReset = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is focusing an input or button elsewhere
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleFlip]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only register as horizontal swipe if movement was primarily horizontal and > 50px
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
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

  if (totalCards === 0) {
    return (
      <article className="w-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E0D8] text-center shadow-xs text-[#1C1917]">
        <span className="material-symbols-outlined text-[48px] text-[#1B4332] mb-3">
          style
        </span>
        <h3 className="font-headline-sm text-lg text-[#1C1917] font-bold mb-1">
          No Flashcards Available
        </h3>
        <p className="font-body-md text-sm text-[#78716C] max-w-sm">
          No key topics were identified for {documentTitle} to generate flashcard review decks.
        </p>
      </article>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <article className="w-full flex flex-col items-center gap-space-md animate-in fade-in duration-200 text-[#1C1917]">
      {/* Header bar with progress counter */}
      <div className="w-full flex items-center justify-between gap-space-sm bg-white px-4 sm:px-5 py-3 rounded-xl border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-2 text-[#1C1917] font-semibold text-sm sm:text-base">
          <span className="material-symbols-outlined text-[#1B4332] text-[20px]">
            style
          </span>
          <span className="font-mono text-sm">Card {currentIndex + 1} of {totalCards}</span>
        </div>

        {/* Progress pill & reset button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B4332] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-[#78716C] font-mono font-medium">
              {progressPercent}%
            </span>
          </div>

          <button
            onClick={handleReset}
            disabled={currentIndex === 0 && !isFlipped}
            className="text-xs text-[#78716C] hover:text-[#1B4332] disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer font-mono px-2 py-1 rounded"
            title="Restart deck"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Flip Flashcard */}
      <div
        className="w-full max-w-xl perspective-1000 select-none py-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          id="active-flashcard"
          onClick={handleFlip}
          tabIndex={0}
          role="button"
          aria-label={`Flashcard: ${isFlipped ? 'Back side showing explanation' : 'Front side showing topic'}. Click or press space to flip.`}
          className={`w-full min-h-[320px] sm:min-h-[360px] relative transform-style-3d transition-transform duration-500 cursor-pointer rounded-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF THE CARD */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-white border-2 border-[#E5E0D8] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#1B4332]/40 transition-colors"
          >
            {/* Top row: Rank & Yield Badge */}
            <div className="flex items-center justify-between w-full">
              <span className="w-7 h-7 rounded-full bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] font-mono font-bold text-xs flex items-center justify-center">
                #{currentCard.rank}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-label-sm uppercase tracking-wider ${getYieldBadgeClass(
                    currentCard.yieldLevel
                  )}`}
                >
                  {currentCard.yieldLevel}
                </span>
                <span className="text-xs text-[#78716C] font-mono bg-[#FAF8F5] border border-[#E5E0D8] px-2 py-0.5 rounded">
                  Topic Term
                </span>
              </div>
            </div>

            {/* Center Content: Topic Name */}
            <div className="flex flex-col items-center text-center my-auto py-4 px-2">
              <span className="text-xs text-[#1B4332] uppercase tracking-widest font-mono font-semibold mb-2">
                Concept / Topic
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1917] font-headline-sm leading-snug">
                {currentCard.title}
              </h2>

              {currentCard.keyTerms && currentCard.keyTerms.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {currentCard.keyTerms.slice(0, 3).map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#78716C] font-mono text-xs"
                    >
                      #{term}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom row: Prompt to flip */}
            <div className="flex items-center justify-center gap-1.5 text-[#78716C] text-xs font-mono pt-2 border-t border-[#E5E0D8]">
              <span className="material-symbols-outlined text-[16px] text-[#1B4332]">
                touch_app
              </span>
              <span>Tap or click to reveal explanation</span>
            </div>
          </div>

          {/* BACK OF THE CARD */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-[#FAF8F5] border-2 border-[#1B4332]/30 p-6 sm:p-8 flex flex-col justify-between shadow-xs"
          >
            {/* Top row: Header */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#1B4332] text-white font-mono font-bold text-xs flex items-center justify-center">
                  #{currentCard.rank}
                </span>
                <span className="text-xs font-semibold text-[#1B4332] font-mono uppercase tracking-wide">
                  Explanation & Exam Relevance
                </span>
              </div>
              <span className="text-xs text-[#78716C] font-mono bg-white border border-[#E5E0D8] px-2 py-0.5 rounded">
                Answer
              </span>
            </div>

            {/* Center Content: Why it matters / reason */}
            <div className="my-auto py-3 px-1 flex flex-col gap-2.5">
              <p className="text-base sm:text-lg text-[#1C1917] leading-relaxed font-normal">
                {currentCard.reason}
              </p>

              {currentCard.examFrequency && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] font-mono text-xs w-fit mt-1">
                  <span className="material-symbols-outlined text-[14px]">grade</span>
                  <span>Exam Weight: {currentCard.examFrequency}</span>
                </div>
              )}

              {currentCard.keyTerms && currentCard.keyTerms.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-[#78716C] font-mono block mb-1">Key terms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.keyTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white text-[#57534E] border border-[#E5E0D8] font-mono text-xs"
                      >
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row: Prompt to flip back */}
            <div className="flex items-center justify-center gap-1.5 text-[#78716C] text-xs font-mono pt-2 border-t border-[#E5E0D8]">
              <span className="material-symbols-outlined text-[16px] text-[#1B4332]">
                flip
              </span>
              <span>Tap or click to view topic term</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Previous / Flip / Next */}
      <div className="flex items-center justify-between w-full max-w-xl px-1 pt-1">
        <button
          id="btn-prev-flashcard"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full font-mono text-xs sm:text-sm flex items-center gap-2 bg-white text-[#1C1917] border border-[#E5E0D8] hover:border-[#1B4332] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
          type="button"
          aria-label="Previous card"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Previous</span>
        </button>

        {/* Center Flip button */}
        <button
          onClick={handleFlip}
          className="min-h-[44px] px-5 py-2.5 rounded-full font-mono text-xs sm:text-sm flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#14382A] text-white font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          type="button"
          title="Flip card (Spacebar)"
        >
          <span className="material-symbols-outlined text-[18px]">
            sync
          </span>
          <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
        </button>

        <button
          id="btn-next-flashcard"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full font-mono text-xs sm:text-sm flex items-center gap-2 bg-white text-[#1C1917] border border-[#E5E0D8] hover:border-[#1B4332] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
          type="button"
          aria-label="Next card"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      {/* Keyboard navigation hint */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-[#78716C] pt-1 font-mono">
        <span>Tip: Use <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E5E0D8] text-[11px] text-[#57534E]">←</kbd> and <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E5E0D8] text-[11px] text-[#57534E]">→</kbd> to navigate, and <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E5E0D8] text-[11px] text-[#57534E]">Space</kbd> to flip</span>
      </div>
    </article>
  );
};
