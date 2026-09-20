import React from 'react';
import { StudyKitResult, ToolId } from '../types';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: StudyKitResult | null;
  onSelectTool: (toolId: ToolId) => void;
  onUploadNew: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  result,
  onSelectTool,
  onUploadNew,
}) => {
  if (!isOpen) return null;

  const formatStudyTime = (totalSeconds: number = 0) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const toolsList: Array<{ id: ToolId; label: string; emoji: string }> = [
    { id: 'notes', label: 'Notes Generator', emoji: '📘' },
    { id: 'summary', label: 'PDF Summary', emoji: '📄' },
    { id: 'topics', label: 'Important Topics', emoji: '🏷️' },
    { id: 'mindmap', label: 'Mind Map', emoji: '🧠' },
    { id: 'test', label: 'MCQ Generator', emoji: '📝' },
  ];

  const viewedSections = result?.viewedSections || { notes: true };
  const scrollProgress = result?.scrollProgress || {};
  const timeSpent = result?.timeSpent || 0;

  // Calculate sections viewed count
  const viewedCount = toolsList.filter((t) => viewedSections[t.id]).length;
  const totalSections = toolsList.length;
  const overallPercent = Math.round((viewedCount / totalSections) * 100);

  // MCQ stats
  const testSeries = result?.testSeries || [];
  const userAnswers = result?.userAnswers || {};
  const totalQuestions = testSeries.length;
  const attemptedQuestions = Object.keys(userAnswers).filter((qId) =>
    testSeries.some((q) => q.id === qId && userAnswers[qId])
  ).length;
  const correctAnswers = testSeries.filter(
    (q) => userAnswers[q.id] && userAnswers[q.id] === q.correctAnswer
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-[#E5E0D8] shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-[#1C1917] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 flex items-center justify-center text-[#1B4332]">
              <span className="material-symbols-outlined text-[24px]">monitoring</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-[#1C1917]">
                Study Progress Dashboard
              </h2>
              <p className="text-xs text-[#78716C] font-sans truncate max-w-[240px] sm:max-w-xs">
                {result ? result.document.fileName : 'No Active PDF'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EAE5DC] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {!result ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#78716C]">
              description
            </span>
            <p className="text-sm font-medium text-[#1C1917]">
              No active PDF study kit found.
            </p>
            <p className="text-xs text-[#78716C] max-w-xs">
              Upload or select a PDF study kit to track your reading progress, time spent, and quiz scores.
            </p>
            <button
              onClick={() => {
                onClose();
                onUploadNew();
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#1B4332] text-white font-bold text-xs hover:bg-[#14382A] transition-colors cursor-pointer"
              type="button"
            >
              Upload New PDF
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Time Spent Banner & Overall Progress */}
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E5E0D8] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#78716C] font-mono uppercase tracking-wider">
                    Time Spent Studying
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm mt-0.5">
                    {formatStudyTime(timeSpent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#78716C] font-mono uppercase tracking-wider">
                    Overall Completion
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1B4332] font-headline-sm mt-0.5">
                    {overallPercent}%
                  </p>
                </div>
              </div>
              {/* Overall Progress Bar */}
              <div className="w-full bg-[#E5E0D8] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1B4332] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>

            {/* Sections Checklist */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider font-mono">
                Study Sections & Tools ({viewedCount}/{totalSections} Viewed)
              </p>
              <div className="flex flex-col gap-2">
                {toolsList.map((tool) => {
                  const isViewed = viewedSections[tool.id];
                  const scrollPct = scrollProgress[tool.id] || 0;
                  const hasScroll = tool.id === 'notes' || tool.id === 'summary';

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onClose();
                        onSelectTool(tool.id);
                      }}
                      className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E0D8] hover:border-[#1B4332]/40 flex items-center justify-between transition-all cursor-pointer group text-left"
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tool.emoji}</span>
                        <div>
                          <p className="font-bold text-sm text-[#1C1917] group-hover:text-[#1B4332] transition-colors">
                            {tool.label}
                          </p>
                          <p className="text-xs text-[#78716C]">
                            {isViewed ? (
                              hasScroll && scrollPct > 0 ? (
                                <span className="text-[#1B4332] font-medium">
                                  ✅ Viewed • {scrollPct}% read
                                </span>
                              ) : (
                                <span className="text-[#1B4332] font-medium">✅ Viewed</span>
                              )
                            ) : (
                              <span className="text-[#9CA3AF]">Not opened yet</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isViewed ? (
                          <span className="w-6 h-6 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border border-[#D1D5DB] flex items-center justify-center text-xs text-transparent">
                            ○
                          </span>
                        )}
                        <span className="material-symbols-outlined text-[#9CA3AF] text-[18px] group-hover:translate-x-0.5 transition-transform">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Progress Card */}
            <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#E5E0D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📝</span>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase font-mono">
                    MCQ Practice Progress
                  </p>
                  <p className="text-sm font-semibold text-[#1C1917] mt-0.5">
                    {attemptedQuestions}/{totalQuestions} questions attempted, {correctAnswers} correct
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSelectTool('test');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E0D8] hover:border-[#1B4332] text-xs font-bold text-[#1B4332] transition-colors cursor-pointer"
                type="button"
              >
                Practice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
