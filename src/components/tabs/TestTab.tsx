import React, { useState, useEffect } from 'react';
import { TestQuestion } from '../../types';

interface TestTabProps {
  questions: TestQuestion[];
  documentTitle: string;
  initialSelectedAnswers?: Record<string, string>;
  onRecordAnswer?: (question: TestQuestion, selectedAnswer: string, isCorrect: boolean) => void;
  onResetAnswers?: () => void;
}

const EMPTY_ANSWERS: Record<string, string> = {};

export const TestTab: React.FC<TestTabProps> = ({
  questions,
  documentTitle,
  initialSelectedAnswers = EMPTY_ANSWERS,
  onRecordAnswer,
  onResetAnswers,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    () => initialSelectedAnswers || EMPTY_ANSWERS
  );
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const safeQuestions = questions || [];

  // Sync state when switching document
  useEffect(() => {
    setSelectedAnswers(initialSelectedAnswers || EMPTY_ANSWERS);
    setRevealedAnswers({});
  }, [documentTitle]);

  const handleCopy = async () => {
    let text = `${documentTitle} — Practice Test Questions\n\n`;
    safeQuestions.forEach((q, idx) => {
      text += `Q${idx + 1} (${q.type === 'mcq' ? 'MCQ' : 'Short Answer'}): ${q.question}\n`;
      if (q.type === 'mcq' && q.options) {
        q.options.forEach((opt, optIdx) => {
          text += `   ${String.fromCharCode(65 + optIdx)}) ${opt}\n`;
        });
        text += `   Correct Answer: ${q.correctAnswer}\n`;
      }
      if (q.explanation) {
        text += `   Explanation: ${q.explanation}\n`;
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

  const isOptionCorrect = (question: TestQuestion, option: string, optIdx: number) => {
    if (!option || !question.correctAnswer) return false;
    const optTrim = option.trim().toLowerCase();
    const corrTrim = question.correctAnswer.trim().toLowerCase();
    const letter = String.fromCharCode(65 + optIdx).toLowerCase();

    if (optTrim === corrTrim) return true;
    if (corrTrim === letter) return true;
    if (corrTrim.startsWith(`${letter})`) || corrTrim.startsWith(`${letter}.`) || corrTrim.startsWith(`${letter}:`)) return true;
    
    // Strip leading "A) " or "A. " from both and compare
    const cleanOpt = optTrim.replace(/^[a-d]\s*[\)\.\:\-]\s*/i, '');
    const cleanCorr = corrTrim.replace(/^[a-d]\s*[\)\.\:\-]\s*/i, '');
    if (cleanOpt === cleanCorr && cleanOpt.length > 0) return true;

    return false;
  };

  const handleSelectOption = (question: TestQuestion, option: string, optIdx: number = 0) => {
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: option }));
    
    const isCorrect = question.type === 'mcq'
      ? isOptionCorrect(question, option, optIdx)
      : false;

    if (onRecordAnswer) {
      onRecordAnswer(question, option, isCorrect);
    }
  };

  const toggleReveal = (questionId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleRevealAll = () => {
    const all: Record<string, boolean> = {};
    safeQuestions.forEach((q) => {
      all[q.id] = true;
    });
    setRevealedAnswers(all);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setRevealedAnswers({});
    if (onResetAnswers) {
      onResetAnswers();
    }
  };

  // Calculate score for MCQs
  let totalMCQs = 0;
  let correctMCQs = 0;
  let answeredCount = 0;

  safeQuestions.forEach((q) => {
    const userAns = selectedAnswers[q.id];
    if (userAns !== undefined && userAns !== '') answeredCount++;
    if (q.type === 'mcq' && q.options) {
      totalMCQs++;
      const chosenIdx = q.options.findIndex((opt) => opt === userAns);
      if (userAns && isOptionCorrect(q, userAns, chosenIdx >= 0 ? chosenIdx : 0)) {
        correctMCQs++;
      }
    }
  });

  return (
    <article className="w-full flex flex-col gap-space-md animate-in fade-in duration-200 text-[#1C1917]">
      {/* Quiz Progress & Score Card */}
      <section className="bg-white rounded-2xl p-space-md shadow-xs border border-[#E5E0D8] border-l-4 border-l-[#1B4332] flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">quiz</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base text-[#1C1917] font-bold">
                MCQ Generator & Practice Exam ({safeQuestions.length} Questions)
              </h2>
              <p className="font-mono text-xs text-[#78716C]">
                Active Recall & Exam Simulation • {totalMCQs} MCQs + {safeQuestions.length - totalMCQs} Short Answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              <span>{copied ? 'Copied' : 'Copy Test'}</span>
            </button>
            <button
              onClick={handleRevealAll}
              className="h-8 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE5DC] border border-[#E5E0D8] text-[#1C1917] font-mono text-xs transition-colors cursor-pointer"
              type="button"
            >
              Reveal All
            </button>
            <button
              onClick={handleResetQuiz}
              className="h-8 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE5DC] border border-[#E5E0D8] text-[#78716C] hover:text-[#1C1917] font-mono text-xs transition-colors cursor-pointer"
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between text-[#78716C] font-mono text-xs">
            <span>
              Answered {answeredCount} of {safeQuestions.length}
            </span>
            {totalMCQs > 0 && (
              <span className="text-[#1B4332] font-semibold">
                Score: {correctMCQs} / {totalMCQs} correct (
                {Math.round((correctMCQs / totalMCQs) * 100)}%)
              </span>
            )}
          </div>
          <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#1B4332] h-full rounded-full transition-all duration-300"
              style={{ width: `${safeQuestions.length > 0 ? (answeredCount / safeQuestions.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Questions list */}
      <div className="flex flex-col gap-space-md">
        {safeQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8] text-[#78716C]">
            No test questions generated for this document.
          </div>
        ) : (
          safeQuestions.map((q, idx) => {
            const isRevealed = !!revealedAnswers[q.id];
            const userChoice = selectedAnswers[q.id];
            const chosenIdx = q.options?.findIndex((opt) => opt === userChoice) ?? -1;
            const isCorrect = q.type === 'mcq' && userChoice
              ? isOptionCorrect(q, userChoice, chosenIdx >= 0 ? chosenIdx : 0)
              : false;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-space-md shadow-xs border border-l-4 border-l-[#1B4332] transition-all ${
                  isRevealed
                    ? q.type === 'mcq'
                      ? isCorrect
                        ? 'border-[#1B4332]/50 bg-white'
                        : 'border-[#9E2A2B]/50'
                      : 'border-[#1B4332]/50'
                    : 'border-[#E5E0D8]'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-xs min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] text-[#78716C] uppercase tracking-wider">
                        {q.type === 'mcq' ? 'Multiple Choice' : 'Conceptual Free Response'}
                        {q.topicRef ? ` • ${q.topicRef}` : ''}
                      </span>
                      <h3 className="font-headline-sm text-sm sm:text-base text-[#1C1917] font-semibold leading-snug mt-0.5">
                        {q.question}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {q.type === 'mcq' && q.options && (
                  <div className="flex flex-col gap-2 my-space-sm pl-7">
                    {q.options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = userChoice === option;
                      const isTheCorrectOption = isOptionCorrect(q, option, optIdx);

                      let optionClasses =
                        'p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs sm:text-sm cursor-pointer ';

                      if (isRevealed) {
                        if (isTheCorrectOption) {
                          optionClasses +=
                            'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332] font-medium';
                        } else if (isSelected && !isTheCorrectOption) {
                          optionClasses += 'bg-[#9E2A2B]/10 border-[#9E2A2B] text-[#9E2A2B] line-through';
                        } else {
                          optionClasses +=
                            'bg-[#FAF8F5]/60 border-[#E5E0D8] text-[#78716C] opacity-60';
                        }
                      } else {
                        if (isSelected) {
                          optionClasses +=
                            'bg-[#1B4332]/10 border-[#1B4332] text-[#1C1917] font-medium';
                        } else {
                          optionClasses +=
                            'bg-[#FAF8F5] border-[#E5E0D8] hover:border-[#1B4332]/40 hover:bg-[#FAF8F5] text-[#33302E]';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q, option, optIdx)}
                          className={optionClasses}
                          type="button"
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-[#1B4332] text-white shadow-xs'
                                : 'bg-white text-[#57534E] border border-[#E5E0D8]'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{option}</span>
                          {isRevealed && isTheCorrectOption && (
                            <span className="material-symbols-outlined text-[#1B4332] text-[18px] shrink-0">
                              check_circle
                            </span>
                          )}
                          {isRevealed && isSelected && !isTheCorrectOption && (
                            <span className="material-symbols-outlined text-[#9E2A2B] text-[18px] shrink-0">
                              cancel
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {q.type === 'short-answer' && !isRevealed && (
                  <div className="my-space-sm pl-7">
                    <textarea
                      placeholder="Type your brief answer or mental outline here before checking the solution..."
                      rows={3}
                      className="w-full p-3 text-sm rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] focus:outline-hidden focus:border-[#1B4332] text-[#1C1917] resize-none font-sans"
                      defaultValue={selectedAnswers[q.id] || ''}
                      onChange={(e) => handleSelectOption(q, e.target.value)}
                    />
                  </div>
                )}

                {/* Reveal Toggle Action */}
                <div className="pl-7 flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleReveal(q.id)}
                    className={`h-8 px-3.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
                      isRevealed
                        ? 'bg-[#FAF8F5] text-[#57534E] hover:text-[#1C1917] border border-[#E5E0D8]'
                        : 'bg-[#1B4332] text-white hover:bg-[#14382A] shadow-xs'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isRevealed ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{isRevealed ? 'Hide Solution' : 'Reveal Answer'}</span>
                  </button>

                  {isRevealed && q.type === 'mcq' && (
                    <span
                      className={`font-mono text-xs font-semibold flex items-center gap-1 ${
                        isCorrect ? 'text-[#1B4332]' : 'text-[#9E2A2B]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Revealed Solution & Explanation */}
                {isRevealed && (
                  <div className="mt-space-sm ml-7 p-space-sm rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col gap-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 text-[#1B4332]">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        Correct Answer
                      </span>
                    </div>
                    <p className="font-body-sm text-sm font-semibold text-[#1C1917]">
                      {q.correctAnswer}
                    </p>
                    <p className="font-body-sm text-xs text-[#57534E] leading-relaxed pt-1.5 border-t border-[#E5E0D8]">
                      <strong className="text-[#1C1917] font-medium">Explanation: </strong>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </article>
  );
};
