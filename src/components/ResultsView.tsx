import React, { useState, useEffect } from 'react';
import { StudyKitResult, ActiveTab, TestQuestion, CorrectionItem } from '../types';
import { NotesTab } from './tabs/NotesTab';
import { SummaryTab } from './tabs/SummaryTab';
import { TopicsTab } from './tabs/TopicsTab';
import { FlashcardsTab } from './tabs/FlashcardsTab';
import { MindMapTab } from './tabs/MindMapTab';
import { TestTab } from './tabs/TestTab';
import { CorrectionTrackerTab } from './tabs/CorrectionTrackerTab';
import { exportStudyKitPdf } from '../utils/exportPdf';

interface ResultsViewProps {
  result: StudyKitResult;
  onUploadNew: () => void;
  onRetrySection?: (section: string) => void;
  initialTab?: ActiveTab;
  onRecordAnswer?: (question: TestQuestion, selectedAnswer: string, isCorrect: boolean) => void;
  onClearMistakes?: () => void;
  onResetQuiz?: () => void;
  processedPdfs?: StudyKitResult[];
  onSelectPdf?: (pdf: StudyKitResult) => void;
  onUpdateProgress?: (updates: { viewedSections?: Record<string, boolean>; scrollProgress?: Record<string, number> }) => void;
}

interface SectionConfig {
  id: 'notes' | 'summary' | 'topics' | 'mindmap' | 'test' | 'corrections';
  label: string;
  emoji: string;
  subtitle: string;
  badge: string;
  activePillClass: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'notes',
    label: 'Notes Generator',
    emoji: '📘',
    subtitle: 'Structured Study Notes & High-Yield Axioms',
    badge: 'Section 1',
    activePillClass: 'bg-[#1B4332] text-white font-bold shadow-xs',
  },
  {
    id: 'summary',
    label: 'Summary',
    emoji: '📄',
    subtitle: 'Executive Summary & Key Takeaways',
    badge: 'Section 2',
    activePillClass: 'bg-[#1B4332] text-white font-bold shadow-xs',
  },
  {
    id: 'topics',
    label: 'Important Topics',
    emoji: '🏷️',
    subtitle: 'Ranked High-Yield Exam Topics',
    badge: 'Section 3',
    activePillClass: 'bg-[#1B4332] text-white font-bold shadow-xs',
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    emoji: '🧠',
    subtitle: 'Interactive Concept Hierarchy & Ontology',
    badge: 'Section 4',
    activePillClass: 'bg-[#1B4332] text-white font-bold shadow-xs',
  },
  {
    id: 'test',
    label: 'MCQ Generator',
    emoji: '📝',
    subtitle: 'Practice Exam & Active Recall Questions',
    badge: 'Section 5',
    activePillClass: 'bg-[#1B4332] text-white font-bold shadow-xs',
  },
  {
    id: 'corrections',
    label: 'Correction Tracker',
    emoji: '🎯',
    subtitle: 'Mistake Remediation & Weak Spots',
    badge: 'Section 6',
    activePillClass: 'bg-[#9E2A2B] text-white font-bold shadow-xs',
  },
];

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onUploadNew,
  initialTab,
  onRecordAnswer,
  onClearMistakes,
  onResetQuiz,
  processedPdfs = [],
  onSelectPdf,
  onUpdateProgress,
}) => {
  const [activeSection, setActiveSection] = useState<string>('notes');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportingSectionId, setExportingSectionId] = useState<string | null>(null);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [showPdfSwitcher, setShowPdfSwitcher] = useState(false);

  // Update viewed sections when activeSection changes
  useEffect(() => {
    if (onUpdateProgress) {
      onUpdateProgress({
        viewedSections: {
          ...(result.viewedSections || { notes: true }),
          [activeSection]: true,
        },
      });
    }
  }, [activeSection]);

  // Track scroll reading progress for Notes and Summary
  useEffect(() => {
    const handleScrollProgress = () => {
      const notesEl = document.getElementById('section-notes');
      const summaryEl = document.getElementById('section-summary');

      const calcPct = (el: HTMLElement | null) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = el.offsetHeight;
        const scrolled = windowHeight - rect.top;
        if (scrolled <= 0) return 0;
        const pct = Math.min(100, Math.round((scrolled / (elementHeight + windowHeight * 0.3)) * 100));
        return Math.round(pct / 10) * 10;
      };

      const notesPct = calcPct(notesEl);
      const summaryPct = calcPct(summaryEl);

      if (onUpdateProgress) {
        onUpdateProgress({
          scrollProgress: {
            notes: Math.max(result.scrollProgress?.notes || 0, notesPct),
            summary: Math.max(result.scrollProgress?.summary || 0, summaryPct),
          },
        });
      }
    };

    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, [result.scrollProgress]);

  // Jump to section handler
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // If an initial tab was requested, scroll to it once mounted
  useEffect(() => {
    if (initialTab) {
      const targetId = initialTab === 'flashcards' ? 'topics' : initialTab;
      scrollToSection(targetId);
    }
  }, [initialTab]);

  // Scroll listener to update active pill in navigation
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['notes', 'summary', 'topics', 'mindmap', 'test', 'corrections'];
      const scrollPosition = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sectionIds[i]}`);
        if (el && el.offsetTop <= scrollPosition) {
          const targetId = sectionIds[i];
          setActiveSection((prev) => (prev === targetId ? prev : targetId));
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Download PDF handler
  const handleDownloadPdf = async (tabToExport: ActiveTab | 'all' = 'all') => {
    setIsExportingPdf(true);
    if (tabToExport !== 'all') {
      setExportingSectionId(tabToExport);
    }
    try {
      exportStudyKitPdf(result, tabToExport);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
      setExportingSectionId(null);
    }
  };

  const mistakesCount = result.corrections?.length || 0;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-16 text-[#1C1917]">
      {/* Pinned Top Action Banner */}
      <section className="w-full bg-white rounded-2xl p-space-md shadow-xs mb-space-md flex flex-col gap-space-sm border border-[#E5E0D8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 flex items-center justify-center text-[#1B4332] shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                article
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-md text-label-md text-[#1C1917] truncate font-semibold text-base">
                {result.document.fileName}
              </p>
              <p className="font-label-sm text-label-sm text-[#78716C] truncate mt-0.5 font-mono text-xs">
                {result.document.pageCount} • {result.document.uploadedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {processedPdfs.length > 1 && onSelectPdf && (
              <div className="relative">
                <button
                  onClick={() => setShowPdfSwitcher((p) => !p)}
                  className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] text-[#1C1917] hover:bg-[#EAE5DC] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                  <span>Switch PDF ({processedPdfs.length})</span>
                </button>
                {showPdfSwitcher && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E5E0D8] shadow-xl p-2 z-50 animate-in fade-in">
                    <p className="font-mono text-[10px] text-[#78716C] uppercase px-2 py-1">
                      Processed PDFs ({processedPdfs.length})
                    </p>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {processedPdfs.map((pdf) => (
                        <button
                          key={pdf.id || pdf.document.fileName}
                          onClick={() => {
                            setShowPdfSwitcher(false);
                            onSelectPdf(pdf);
                          }}
                          className={`p-2 rounded-xl text-left text-xs font-medium flex items-center gap-2 cursor-pointer ${
                            pdf.document.fileName === result.document.fileName
                              ? 'bg-[#1B4332]/10 text-[#1B4332] font-bold'
                              : 'hover:bg-[#FAF8F5] text-[#1C1917]'
                          }`}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">description</span>
                          <span className="truncate flex-1">{pdf.document.fileName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-label-sm text-label-sm font-semibold shadow-xs font-mono text-[11px]">
              KIT_GENERATED
            </span>
            <button
              onClick={onUploadNew}
              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="Upload another document"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </button>
          </div>
        </div>

        {/* Top Action Buttons: Download Full Kit (PDF) & Upload New PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            id="btn-download-full-kit-pdf"
            onClick={() => handleDownloadPdf('all')}
            disabled={isExportingPdf}
            className="w-full min-h-[44px] px-4 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-xs cursor-pointer disabled:opacity-60"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExportingPdf && !exportingSectionId ? 'hourglass_top' : 'download'}
            </span>
            <span className="font-bold whitespace-nowrap">
              {isExportingPdf && !exportingSectionId
                ? 'Generating Full Kit...'
                : 'Download Full Kit (PDF)'}
            </span>
          </button>

          <button
            id="btn-upload-new-pdf"
            onClick={onUploadNew}
            className="w-full min-h-[44px] px-4 rounded-xl bg-white text-[#1C1917] border border-[#E5E0D8] hover:border-[#1B4332]/50 hover:bg-[#FAF8F5] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-[#1B4332]">
              upload_file
            </span>
            <span className="whitespace-nowrap font-semibold">
              Upload New PDF
            </span>
          </button>
        </div>
      </section>

      {/* Jump-To-Section Navigator (Smooth-Scroll Anchors) */}
      <div
        role="navigation"
        aria-label="Jump to section"
        className="sticky top-2 z-20 w-full overflow-x-auto py-2 px-1 mb-6 flex items-center gap-2 sm:gap-2.5 bg-[#FAF8F5]/95 backdrop-blur-xl rounded-2xl no-scrollbar border border-[#E5E0D8] shadow-xs"
      >
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              id={`nav-pill-${sec.id}`}
              onClick={() => scrollToSection(sec.id)}
              className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2 select-none ${
                isActive
                  ? sec.activePillClass
                  : 'bg-white text-[#57534E] border border-[#E5E0D8] hover:border-[#1B4332]/40 hover:text-[#1C1917]'
              }`}
              type="button"
            >
              <span className="text-base leading-none">{sec.emoji}</span>
              <span className="whitespace-nowrap">{sec.label}</span>
              {sec.id === 'test' && result.testSeries && result.testSeries.length > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-black/20 text-white' : 'bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25'
                  }`}
                >
                  {result.testSeries.length}
                </span>
              )}
              {sec.id === 'corrections' && mistakesCount > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-black/20 text-white' : 'bg-[#9E2A2B]/15 text-[#9E2A2B] border border-[#9E2A2B]/25'
                  }`}
                >
                  {mistakesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stacked Sections (All visible vertically in sequence) */}
      <main className="w-full flex flex-col gap-10">
        {/* ========================================================================= */}
        {/* Section 1: Notes Generator */}
        {/* ========================================================================= */}
        <section id="section-notes" className="scroll-mt-24 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">📘</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">Notes Generator</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Structured Study Notes & High-Yield Axioms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <button
                onClick={() => handleDownloadPdf('notes')}
                disabled={isExportingPdf}
                title="Download Notes as PDF"
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Notes PDF</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono">
                Section 1
              </span>
            </div>
          </div>
          <NotesTab
            notes={result.notes || []}
            readingTimeMinutes={result.summary?.readingTimeMinutes || 8}
            onStartQuiz={() => scrollToSection('test')}
            documentTitle={result.document?.fileName || 'Document'}
          />
        </section>

        {/* ========================================================================= */}
        {/* Section 2: Summary */}
        {/* ========================================================================= */}
        <section id="section-summary" className="scroll-mt-24 flex flex-col gap-4 pt-6 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">📄</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">Summary</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Executive Summary & Key Takeaways
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <button
                onClick={() => handleDownloadPdf('summary')}
                disabled={isExportingPdf}
                title="Download Summary as PDF"
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Summary PDF</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono">
                Section 2
              </span>
            </div>
          </div>
          <SummaryTab
            summary={result.summary}
            documentTitle={result.document?.fileName || 'Document'}
          />
        </section>

        {/* ========================================================================= */}
        {/* Section 3: Important Topics */}
        {/* ========================================================================= */}
        <section id="section-topics" className="scroll-mt-24 flex flex-col gap-4 pt-6 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">🏷️</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">Important Question Analyser</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Ranked High-Yield Exam Topics & Core Concept Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <button
                onClick={() => setShowFlashcardsModal(true)}
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Practice as interactive flashcards"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#1B4332]">style</span>
                <span>Flashcards Mode</span>
              </button>
              <button
                onClick={() => handleDownloadPdf('topics')}
                disabled={isExportingPdf}
                title="Download Topics as PDF"
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Topics PDF</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono">
                Section 3
              </span>
            </div>
          </div>
          <TopicsTab
            topics={result.topics || []}
            documentTitle={result.document?.fileName || 'Document'}
          />
        </section>

        {/* ========================================================================= */}
        {/* Section 4: Mind Map */}
        {/* ========================================================================= */}
        <section id="section-mindmap" className="scroll-mt-24 flex flex-col gap-4 pt-6 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">🧠</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">Mind Map</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Interactive Concept Hierarchy & Ontology
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <button
                onClick={() => handleDownloadPdf('mindmap')}
                disabled={isExportingPdf}
                title="Download Mind Map as PDF"
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Mind Map PDF</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono">
                Section 4
              </span>
            </div>
          </div>
          <MindMapTab
            mindMap={result.mindMap}
            documentTitle={result.document?.fileName || 'Document'}
          />
        </section>

        {/* ========================================================================= */}
        {/* Section 5: MCQ Generator */}
        {/* ========================================================================= */}
        <section id="section-test" className="scroll-mt-24 flex flex-col gap-4 pt-6 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">📝</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">MCQ Generator</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Practice Exam & Active Recall Questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <button
                onClick={() => handleDownloadPdf('test')}
                disabled={isExportingPdf}
                title="Download Test as PDF"
                className="h-8 px-2.5 rounded-lg border border-[#E5E0D8] bg-white text-[#1C1917] hover:bg-[#FAF8F5] hover:border-[#1B4332]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Test PDF</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono">
                Section 5
              </span>
            </div>
          </div>
          <TestTab
            questions={result.testSeries || []}
            documentTitle={result.document?.fileName || 'Document'}
            initialSelectedAnswers={result.userAnswers}
            onRecordAnswer={onRecordAnswer}
            onResetAnswers={onResetQuiz}
          />
        </section>

        {/* ========================================================================= */}
        {/* Section 6: Correction Tracker */}
        {/* ========================================================================= */}
        <section id="section-corrections" className="scroll-mt-24 flex flex-col gap-4 pt-6 border-t border-[#E5E0D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#9E2A2B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">🎯</span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-headline-sm flex items-center gap-2">
                  <span className="whitespace-nowrap">Correction Tracker</span>
                </h2>
                <p className="text-xs text-[#78716C] font-label-sm">
                  Targeted Mistake Log & Concept Remediation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#9E2A2B]/10 text-[#9E2A2B] border border-[#9E2A2B]/25 font-mono">
                Section 6
              </span>
            </div>
          </div>
          <CorrectionTrackerTab
            corrections={result.corrections || []}
            documentTitle={result.document?.fileName || 'Document'}
            onClearMistakes={onClearMistakes}
            onGoToMCQ={() => scrollToSection('test')}
          />
        </section>
      </main>

      {/* Optional Interactive Flashcards Modal */}
      {showFlashcardsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 shadow-xl border border-[#E5E0D8] flex flex-col gap-4 text-[#1C1917]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎴</span>
                <h3 className="font-headline-sm text-lg font-bold text-[#1C1917]">
                  Important Topics Flashcards
                </h3>
              </div>
              <button
                onClick={() => setShowFlashcardsModal(false)}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <FlashcardsTab
              topics={result.topics || []}
              documentTitle={result.document?.fileName || 'Document'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
