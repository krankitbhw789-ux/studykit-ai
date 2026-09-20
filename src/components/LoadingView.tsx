import React, { useState, useEffect } from 'react';

interface LoadingViewProps {
  fileName: string;
  fileSize?: string;
  onCancel?: () => void;
}

const ROTATING_STATUSES = [
  'Reading your PDF...',
  'Extracting key topics & definitions...',
  'Synthesizing chapter summaries...',
  'Building your study mind map...',
  'Drafting practice test series & quizzes...',
];

export const LoadingView: React.FC<LoadingViewProps> = ({
  fileName,
  fileSize = 'Calculated during sync',
  onCancel,
}) => {
  const [progress, setProgress] = useState(25);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isBackgroundNotified, setIsBackgroundNotified] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Progress increment timer
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev; // Hold at 92% until API resolves
        const jump = Math.random() * 6 + 2;
        return Math.min(92, Math.round(prev + jump));
      });
    }, 1200);

    // Rotating status text timer
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % ROTATING_STATUSES.length);
    }, 2800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(statusTimer);
    };
  }, [isPaused]);

  // SVG circle calculation: r = 42, circumference = 2 * PI * 42 ≈ 263.89
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto py-space-sm animate-in fade-in duration-300 text-[#1C1917]">
      {/* Document Preview & Header Section */}
      <div className="bg-white rounded-2xl p-space-md shadow-xs mb-space-md border border-[#E5E0D8]">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 flex items-center justify-center text-[#1B4332] shrink-0">
            <span className="material-symbols-outlined text-[26px]">article</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-label-sm text-label-sm text-[#1B4332] bg-[#1B4332]/10 border border-[#1B4332]/25 px-2 py-0.5 rounded-full font-semibold font-mono text-[11px]">
                PDF // INGEST
              </span>
              <span className="font-label-sm text-label-sm text-[#78716C] truncate">Uploaded just now</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-[#1C1917] truncate font-semibold">
              {fileName}
            </h2>
            <p className="font-body-sm text-body-sm text-[#78716C] truncate mt-0.5 font-mono text-xs">
              {fileSize} • Academic Document Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Primary Processing Focus Card */}
      <div className="bg-white rounded-2xl p-space-lg shadow-xs flex flex-col items-center text-center relative overflow-hidden border border-[#E5E0D8]">
        {/* Dual-Ring Academic Progress Graphic */}
        <div className="relative w-28 h-28 my-space-sm flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              className="text-[#E5E0D8]"
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="currentColor"
              strokeWidth="5"
            />
            {/* Progress track */}
            <circle
              className="text-[#1B4332] transition-all duration-700 ease-out"
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="5"
            />
          </svg>

          {/* Concentric inner soft ring */}
          <div className="absolute inset-3 rounded-full bg-[#FAF8F5] border border-[#1B4332]/20 flex flex-col items-center justify-center">
            <span className="font-headline-sm text-headline-sm text-[#1B4332] tracking-tight font-bold font-mono">
              {progress}%
            </span>
            <span className="font-label-sm text-label-sm text-[#1B4332]/80 -mt-1 tracking-wider uppercase text-[9px] font-bold font-mono">
              {isPaused ? 'Paused' : 'Synthesizing'}
            </span>
          </div>
        </div>

        {/* Status Headline (rotating dynamic status) */}
        <h1 className="font-headline-md text-headline-md text-[#1C1917] mt-space-xs mb-1 min-h-[30px] transition-all font-semibold">
          {ROTATING_STATUSES[statusIndex]}
        </h1>
        <p className="font-body-sm text-body-sm text-[#57534E] max-w-xs mb-space-md text-xs">
          Parsing academic syntax, citations, and structural outlines into structured study modules.
        </p>

        {/* Linear Progress Micro-bar */}
        <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden mb-space-lg">
          <div
            className="bg-[#1B4332] h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Stepper Stages Timeline */}
        <div className="w-full flex flex-col gap-space-sm text-left">
          {/* Stage 1: Done */}
          <div className="flex items-start gap-space-sm">
            <div className="w-5 h-5 rounded-full bg-[#1B4332]/15 border border-[#1B4332]/30 text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-md text-body-md text-[#1C1917] font-medium">
                Reading and parsing PDF pages
              </span>
              <span className="font-label-sm text-label-sm text-[#78716C] text-xs">
                Extracted pages & high-res document structure
              </span>
            </div>
          </div>

          {/* Stage 2: Done or Active */}
          <div className="flex items-start gap-space-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                progress >= 50
                  ? 'bg-[#1B4332]/15 border border-[#1B4332]/30 text-[#1B4332]'
                  : 'bg-[#1B4332] text-white font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {progress >= 50 ? 'check' : 'sync'}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-md text-body-md text-[#1C1917] font-medium">
                Extracting key concepts & definitions
              </span>
              <span className="font-label-sm text-label-sm text-[#78716C] text-xs">
                Indexing core academic terminology
              </span>
            </div>
          </div>

          {/* Stage 3: Active Stage */}
          <div className="flex items-start gap-space-sm p-space-xs -mx-space-xs rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/20">
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#1B4332] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-md text-body-md text-[#1B4332] font-semibold">
                Synthesizing notes & summaries…
              </span>
              <span className="font-label-sm text-label-sm text-[#1B4332]/80 text-xs">
                Drafting abstract & thematic breakdown
              </span>
            </div>
          </div>

          {/* Stage 4: Upcoming */}
          <div className={`flex items-start gap-space-sm ${progress >= 75 ? 'opacity-90' : 'opacity-40'}`}>
            <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#78716C] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">
                {progress >= 75 ? 'sync' : 'hourglass_empty'}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-md text-body-md text-[#1C1917]">Building your study mind map</span>
              <span className="font-label-sm text-label-sm text-[#78716C] text-xs">Hierarchical ontology & relations</span>
            </div>
          </div>

          {/* Stage 5: Upcoming */}
          <div className={`flex items-start gap-space-sm ${progress >= 85 ? 'opacity-90' : 'opacity-40'}`}>
            <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#78716C] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">style</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-md text-body-md text-[#1C1917]">Drafting practice test series</span>
              <span className="font-label-sm text-label-sm text-[#78716C] text-xs">8-10 questions with solutions</span>
            </div>
          </div>
        </div>

        {/* Time notice banner */}
        <div className="mt-space-lg w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-space-sm flex items-center justify-center gap-space-xs text-[#78716C]">
          <span className="material-symbols-outlined text-[16px] text-[#1B4332]">schedule</span>
          <span className="font-label-sm text-label-sm font-medium font-mono text-xs">
            Usually takes ~15–25 seconds with document intelligence
          </span>
        </div>
      </div>

      {/* Reassurance & Action Options */}
      <div className="mt-space-md flex flex-col gap-space-sm">
        {/* Primary action */}
        <button
          onClick={() => setIsBackgroundNotified(true)}
          className={`w-full h-11 font-label-md text-label-md font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-xs ${
            isBackgroundNotified
              ? 'bg-[#1B4332] text-white font-extrabold'
              : 'bg-[#1B4332] hover:bg-[#14382A] text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">
            {isBackgroundNotified ? 'check_circle' : 'notifications'}
          </span>
          <span>{isBackgroundNotified ? 'Notifying you when finished' : 'Work in background (notify when ready)'}</span>
        </button>

        {/* Secondary abort / pause action */}
        <div className="flex items-center justify-between px-space-xs pt-space-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="h-9 px-space-sm text-[#78716C] hover:text-[#1C1917] font-label-md text-label-md flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isPaused ? 'Resume sync' : 'Pause sync'}</span>
          </button>
          <button
            onClick={onCancel}
            className="h-9 px-space-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-label-md text-label-md flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Cancel processing</span>
          </button>
        </div>
      </div>

      {/* Academic excerpt micro-card for reassurance */}
      <div className="mt-space-md p-space-md bg-white rounded-2xl text-left border border-[#E5E0D8] shadow-xs">
        <div className="flex items-center gap-1.5 text-[#1B4332] font-semibold mb-1">
          <span className="material-symbols-outlined text-[16px]">auto_stories</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-mono text-[11px]">Academic Synthesis Engine</span>
        </div>
        <p className="font-body-sm text-body-sm text-[#57534E] italic line-clamp-2 text-xs">
          “Analyzing text structure, identifying section headings, extracting core concepts, and synthesizing high-yield study assets...”
        </p>
        <div className="flex items-center justify-between mt-2 pt-2 text-[#78716C] border-t border-[#E5E0D8] text-xs font-mono">
          <span className="font-label-sm text-label-sm">Document Understanding</span>
          <span className="font-label-sm text-label-sm text-[#1B4332] font-semibold">SYNTHESIS_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
