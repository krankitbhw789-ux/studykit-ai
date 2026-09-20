/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudyKitResult, ActiveTab, ToolId, TestQuestion, CorrectionItem } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { UploadView } from './components/UploadView';
import { LoadingView } from './components/LoadingView';
import { ResultsView } from './components/ResultsView';
import { LibraryModal } from './components/LibraryModal';
import { SettingsModal } from './components/SettingsModal';
import { PdfSelectModal } from './components/PdfSelectModal';
import { ToolsModal } from './components/ToolsModal';
import { ProgressModal } from './components/ProgressModal';

type AppScreen = 'upload' | 'loading' | 'results';

const TOOL_NAMES: Record<ToolId, string> = {
  notes: 'Notes Generator',
  summary: 'Summary',
  topics: 'Important Question Analyser',
  mindmap: 'Mind Map',
  test: 'MCQ Generator',
  corrections: 'Correction Tracker',
  progress: 'Study Progress',
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('upload');
  const [navTab, setNavTab] = useState<'home' | 'desk' | 'library' | 'tools' | 'progress'>('home');
  const [resultsTab, setResultsTab] = useState<ActiveTab>('notes');
  const [pendingTool, setPendingTool] = useState<ToolId>('notes');
  const [isPdfSelectModalOpen, setIsPdfSelectModalOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<StudyKitResult | null>(null);
  const [loadingFileInfo, setLoadingFileInfo] = useState<{ name: string; size: string }>({
    name: 'document.pdf',
    size: '12 MB',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

  // Real user library of synthesized study decks (persisted to session & localStorage)
  const [savedLibrary, setSavedLibrary] = useState<StudyKitResult[]>(() => {
    try {
      const stored = localStorage.getItem('studykit_user_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Sync library changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studykit_user_library', JSON.stringify(savedLibrary));
    } catch {
      // ignore
    }
  }, [savedLibrary]);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  // Time Spent timer with Page Visibility API check
  useEffect(() => {
    if (!currentResult || screen !== 'results') return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setCurrentResult((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          timeSpent: (prev.timeSpent || 0) + 1,
        };
        setSavedLibrary((lib) =>
          lib.map((item) => (item.document.fileName === updated.document.fileName ? updated : item))
        );
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentResult?.document?.fileName, screen]);

  const handleUpdateProgress = (updates: {
    viewedSections?: Record<string, boolean>;
    scrollProgress?: Record<string, number>;
  }) => {
    if (!currentResult) return;
    const updatedResult: StudyKitResult = {
      ...currentResult,
      viewedSections: {
        ...(currentResult.viewedSections || { notes: true }),
        ...(updates.viewedSections || {}),
      },
      scrollProgress: {
        ...(currentResult.scrollProgress || {}),
        ...(updates.scrollProgress || {}),
      },
    };
    setCurrentResult(updatedResult);
    setSavedLibrary((prev) =>
      prev.map((item) =>
        item.document.fileName === updatedResult.document.fileName ? updatedResult : item
      )
    );
  };

  // Helper to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDeleteLibraryItem = (indexToDelete: number) => {
    setSavedLibrary((prev) => {
      const itemToDelete = prev[indexToDelete];
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      if (currentResult && currentResult.document.fileName === itemToDelete?.document.fileName) {
        if (updated.length > 0) {
          setCurrentResult(updated[0]);
        } else {
          setCurrentResult(null);
          setScreen('upload');
        }
      }
      return updated;
    });
  };

  // Unified Tool Selection Flow (FIX #1 & FIX #2)
  const handleSelectTool = (toolId: ToolId) => {
    if (toolId === 'progress') {
      setIsProgressOpen(true);
      return;
    }
    if (currentResult) {
      // PDF is active: immediately activate that tool
      setResultsTab(toolId as ActiveTab);
      setScreen('results');
      setNavTab('desk');
      // Scroll to the tool's section
      const el = document.getElementById(`section-${toolId}`);
      if (el) {
        const yOffset = -75;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      // No active PDF: open selection modal with upload new or select processed
      setPendingTool(toolId);
      setIsPdfSelectModalOpen(true);
    }
  };

  // Real PDF File Upload to Gemini API
  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setLastUploadedFile(file);
    const readableSize = formatFileSize(file.size);
    setLoadingFileInfo({
      name: file.name,
      size: readableSize,
    });
    setScreen('loading');

    try {
      // Read file to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Call Gemini API Netlify function endpoint
      const response = await fetch('/.netlify/functions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64String,
          filename: file.name,
          fileSize: readableSize,
          mimeType: file.type || 'application/pdf',
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to synthesize document study material.');
      }

      const generatedResult: StudyKitResult = {
        ...json.data,
        id: `pdf-${Date.now()}`,
        corrections: [],
        userAnswers: {},
      };

      setCurrentResult(generatedResult);
      setSavedLibrary((prev) => [generatedResult, ...prev]);

      // Open the target tool user clicked earlier, or default to notes
      if (pendingTool === 'progress') {
        setIsProgressOpen(true);
        setResultsTab('notes');
      } else {
        setResultsTab(pendingTool || 'notes');
      }
      setScreen('results');
    } catch (err: any) {
      console.error('Document processing error:', err);
      let friendlyMessage = 'Document analysis encountered an error. Please try again.';
      const rawMsg = err?.message || err?.toString() || '';
      if (
        rawMsg.includes('503') ||
        rawMsg.includes('high demand') ||
        rawMsg.includes('UNAVAILABLE')
      ) {
        friendlyMessage =
          'The AI model is currently experiencing high demand. Please click "Retry Synthesis" below.';
      } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        friendlyMessage = 'Rate limit reached. Please wait a few moments before retrying.';
      } else if (rawMsg) {
        try {
          const parsed = JSON.parse(rawMsg);
          if (parsed.error) {
            friendlyMessage = parsed.error;
          }
        } catch {
          friendlyMessage = rawMsg;
        }
      }
      setErrorMessage(friendlyMessage);
      setScreen('upload');
    }
  };

  const handleCancelLoading = () => {
    setScreen('upload');
  };

  // Correction Tracking per PDF
  const handleRecordAnswer = (question: TestQuestion, selectedAnswer: string, isCorrect: boolean) => {
    if (!currentResult) return;

    const currentCorrections = currentResult.corrections || [];
    const currentUserAnswers = { ...(currentResult.userAnswers || {}), [question.id]: selectedAnswer };

    let updatedCorrections: CorrectionItem[];

    if (!isCorrect) {
      // Add or update wrong answer
      const existingIdx = currentCorrections.findIndex((c) => c.questionId === question.id);
      const newCorrectionItem: CorrectionItem = {
        id: `corr-${question.id}-${Date.now()}`,
        questionId: question.id,
        question: question.question,
        userAnswer: selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topicRef: question.topicRef,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (existingIdx >= 0) {
        updatedCorrections = [...currentCorrections];
        updatedCorrections[existingIdx] = newCorrectionItem;
      } else {
        updatedCorrections = [newCorrectionItem, ...currentCorrections];
      }
    } else {
      // If user fixed their answer, remove from mistakes
      updatedCorrections = currentCorrections.filter((c) => c.questionId !== question.id);
    }

    const updatedResult: StudyKitResult = {
      ...currentResult,
      corrections: updatedCorrections,
      userAnswers: currentUserAnswers,
    };

    setCurrentResult(updatedResult);

    // Sync in savedLibrary
    setSavedLibrary((prev) =>
      prev.map((item) =>
        item.document.fileName === updatedResult.document.fileName ? updatedResult : item
      )
    );
  };

  const handleClearMistakes = () => {
    if (!currentResult) return;
    const updatedResult: StudyKitResult = {
      ...currentResult,
      corrections: [],
    };
    setCurrentResult(updatedResult);
    setSavedLibrary((prev) =>
      prev.map((item) =>
        item.document.fileName === updatedResult.document.fileName ? updatedResult : item
      )
    );
  };

  const handleResetQuiz = () => {
    if (!currentResult) return;
    const updatedResult: StudyKitResult = {
      ...currentResult,
      corrections: [],
      userAnswers: {},
    };
    setCurrentResult(updatedResult);
    setSavedLibrary((prev) =>
      prev.map((item) =>
        item.document.fileName === updatedResult.document.fileName ? updatedResult : item
      )
    );
  };

  const handleNavChange = (tab: 'home' | 'library' | 'tools' | 'progress') => {
    setNavTab(tab);
    if (tab === 'home') {
      if (currentResult) {
        setScreen('results');
      } else {
        setScreen('upload');
      }
    } else if (tab === 'library') {
      setIsLibraryOpen(true);
    } else if (tab === 'tools') {
      setIsToolsModalOpen(true);
    } else if (tab === 'progress') {
      setIsProgressOpen(true);
    }
  };

  return (
    <div className="font-body-md text-body-md flex flex-col min-h-screen bg-[#FAF8F5] text-[#1C1917] selection:bg-[#1B4332]/20 selection:text-[#1B4332]">
      {/* Top Header */}
      <Header
        isDark={false}
        onGoHome={() => {
          if (currentResult) {
            setScreen('results');
          } else {
            setScreen('upload');
          }
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onSelectTool={handleSelectTool}
        activeTool={screen === 'results' ? (resultsTab as ToolId) : undefined}
      />

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 px-margin bg-[#FAF8F5]">
        {screen === 'upload' && (
          <UploadView
            onFileSelected={handleFileSelected}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            onRetry={lastUploadedFile ? () => handleFileSelected(lastUploadedFile) : undefined}
          />
        )}

        {screen === 'loading' && (
          <LoadingView
            fileName={loadingFileInfo.name}
            fileSize={loadingFileInfo.size}
            onCancel={handleCancelLoading}
          />
        )}

        {screen === 'results' && currentResult && (
          <ResultsView
            result={currentResult}
            initialTab={resultsTab}
            onUploadNew={() => {
              setPendingTool('notes');
              setScreen('upload');
            }}
            onRecordAnswer={handleRecordAnswer}
            onClearMistakes={handleClearMistakes}
            onResetQuiz={handleResetQuiz}
            processedPdfs={savedLibrary}
            onSelectPdf={(pdf) => {
              setCurrentResult(pdf);
              setResultsTab(resultsTab);
            }}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={navTab} onChangeTab={handleNavChange} />

      {/* Tools Modal (When clicking Tools in bottom nav) */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        onSelectTool={(toolId) => {
          handleSelectTool(toolId);
        }}
      />

      {/* Progress Modal (When clicking Progress in bottom nav) */}
      <ProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        result={currentResult}
        onSelectTool={(toolId) => {
          handleSelectTool(toolId);
        }}
        onUploadNew={() => {
          setPendingTool('notes');
          setScreen('upload');
          setNavTab('home');
        }}
      />

      {/* PDF Select Modal (When clicking a tool without active PDF) */}
      <PdfSelectModal
        isOpen={isPdfSelectModalOpen}
        onClose={() => setIsPdfSelectModalOpen(false)}
        targetTool={pendingTool}
        targetToolLabel={TOOL_NAMES[pendingTool] || 'Tool'}
        processedPdfs={savedLibrary}
        onSelectPdf={(pdf) => {
          setCurrentResult(pdf);
          if (pendingTool === 'progress') {
            setIsProgressOpen(true);
            setResultsTab('notes');
          } else {
            setResultsTab(pendingTool);
          }
          setScreen('results');
          setNavTab('desk');
        }}
        onUploadNew={() => {
          setScreen('upload');
          setNavTab('home');
        }}
        onFileSelected={handleFileSelected}
      />

      {/* Library Drawer/Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedResults={savedLibrary}
        onDeleteItem={handleDeleteLibraryItem}
        onSelectResult={(selected) => {
          setCurrentResult(selected);
          setResultsTab('notes');
          setScreen('results');
          setNavTab('desk');
        }}
        onUploadNew={() => {
          setIsLibraryOpen(false);
          setPendingTool('notes');
          setScreen('upload');
          setNavTab('home');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
