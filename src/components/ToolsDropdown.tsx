import React, { useState, useRef, useEffect } from 'react';
import { ToolId } from '../types';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  badge?: string;
}

export const TOOLS_LIST: ToolDefinition[] = [
  {
    id: 'notes',
    name: 'Notes Generator',
    description: 'Structured study notes & high-yield axioms',
    icon: 'menu_book',
    badge: 'AI Core',
  },
  {
    id: 'summary',
    name: 'Summary',
    description: 'Executive overview & key takeaways',
    icon: 'summarize',
    badge: 'Fast Read',
  },
  {
    id: 'topics',
    name: 'Important Question Analyser',
    description: 'Ranked high-yield topics & exam frequency',
    icon: 'analytics',
    badge: 'Exam Prep',
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Hierarchical concept hierarchy & ontology',
    icon: 'account_tree',
    badge: 'Visual Tree',
  },
  {
    id: 'test',
    name: 'MCQ Generator',
    description: 'Interactive multiple choice & recall test',
    icon: 'quiz',
    badge: 'Practice',
  },
  {
    id: 'corrections',
    name: 'Correction Tracker',
    description: 'Logs wrong answers & provides remediation',
    icon: 'assignment_late',
    badge: 'Mistake Log',
  },
];

interface ToolsDropdownProps {
  onSelectTool: (toolId: ToolId) => void;
  activeTool?: ToolId;
}

export const ToolsDropdown: React.FC<ToolsDropdownProps> = ({
  onSelectTool,
  activeTool,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        id="btn-tools-dropdown"
        className={`h-9 px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2 font-sans text-xs font-semibold transition-all cursor-pointer shadow-xs border ${
          isOpen
            ? 'bg-[#1B4332] text-white border-[#1B4332]'
            : 'bg-white text-[#1C1917] border-[#E5E0D8] hover:bg-[#F3EFEA] hover:border-[#D6D0C7]'
        }`}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Study Tools & Generators"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          handyman
        </span>
        <span>Tools</span>
        <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#E5E0D8] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#1C1917]"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-2 border-b border-[#E5E0D8] mb-1">
            <p className="font-headline-sm text-xs font-bold text-[#1C1917]">
              Study Tools Menu
            </p>
            <p className="font-mono text-[11px] text-[#78716C]">
              Select any tool to load current or new PDF
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {TOOLS_LIST.map((tool) => {
              const isSelected = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  id={`tool-menu-item-${tool.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    onSelectTool(tool.id);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-start gap-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332]/10 border border-[#1B4332]/30 text-[#1B4332]'
                      : 'hover:bg-[#FAF8F5] text-[#1C1917]'
                  }`}
                  role="menuitem"
                  type="button"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-[#FAF8F5] border border-[#E5E0D8] text-[#1B4332]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {tool.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-headline-sm text-xs sm:text-sm font-bold truncate">
                        {tool.name}
                      </span>
                      {tool.badge && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#78716C] border border-[#E5E0D8] shrink-0">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-[#78716C] leading-snug line-clamp-1 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
