import React from 'react';
import { ToolId } from '../types';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: ToolId) => void;
}

interface ToolOption {
  id: ToolId;
  label: string;
  emoji: string;
  description: string;
  badge: string;
  colorClass: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    id: 'notes',
    label: 'Notes Generator',
    emoji: '📘',
    description: 'Structured study notes, high-yield axioms, and comprehensive breakdowns.',
    badge: 'Popular',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
  {
    id: 'summary',
    label: 'PDF Summary',
    emoji: '📄',
    description: 'Executive summary, core concepts, and key takeaways in seconds.',
    badge: 'Fast',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
  {
    id: 'corrections',
    label: 'Correction Analyser',
    emoji: '🎯',
    description: 'Track mistakes, analyze weak spots, and practice targeted remediation.',
    badge: 'Smart',
    colorClass: 'bg-[#9E2A2B]/15 text-[#9E2A2B] border-[#9E2A2B]/30',
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    emoji: '🧠',
    description: 'Interactive concept hierarchy, semantic trees, and visual knowledge graphs.',
    badge: 'Visual',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
  {
    id: 'topics',
    label: 'Important Question Analyser',
    emoji: '🏷️',
    description: 'Ranked high-yield exam topics and key question frequency breakdown.',
    badge: 'Exam',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
  {
    id: 'test',
    label: 'MCQ Generator',
    emoji: '📝',
    description: 'Interactive practice test questions with instant feedback and explanations.',
    badge: 'Interactive',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
  {
    id: 'progress',
    label: 'Study Progress',
    emoji: '📈',
    description: 'Track time spent, reading progress, and test scores for your active PDF.',
    badge: 'Dashboard',
    colorClass: 'bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30',
  },
];

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-[#E5E0D8] shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-[#1C1917] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/25 flex items-center justify-center text-[#1B4332]">
              <span className="material-symbols-outlined text-[24px]">handyman</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-[#1C1917]">
                StudyKit AI Tools
              </h2>
              <p className="text-xs text-[#78716C] font-sans">
                Select a tool to analyze your PDF & generate study material
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
          {TOOL_OPTIONS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                onClose();
                onSelectTool(tool.id);
              }}
              className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E0D8] hover:border-[#1B4332]/40 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group shadow-xs hover:shadow-md"
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{tool.emoji}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${tool.colorClass}`}
                >
                  {tool.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C1917] group-hover:text-[#1B4332] transition-colors">
                  {tool.label}
                </h3>
                <p className="text-xs text-[#78716C] mt-1 line-clamp-2">
                  {tool.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
