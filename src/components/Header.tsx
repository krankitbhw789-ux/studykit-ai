import React from 'react';
import { ToolId } from '../types';

interface HeaderProps {
  onOpenLibrary?: () => void;
  onGoHome?: () => void;
  onSelectTool?: (toolId: ToolId) => void;
  activeTool?: ToolId;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLibrary,
  onGoHome,
  onSelectTool,
  activeTool,
}) => {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl pt-safe transition-colors duration-300 bg-[#FAF8F5]/90 border-b border-[#E5E0D8] shadow-xs"
    >
      <div className="h-[62px] px-4 sm:px-6 max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer group shrink-0"
          type="button"
          title="Return to StudyKit AI Home"
        >
          {/* Logo: rounded deep forest green box with clean white 3D layers icon */}
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-[#1B4332] relative flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              <path
                d="M12 3L3 7.5L12 12L21 7.5L12 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 12L12 16.5L21 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 16.5L12 21L21 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-sm sm:text-lg tracking-tight leading-tight text-[#1C1917] font-bold whitespace-nowrap">
              StudyKit AI
            </span>
            <span className="font-sans text-[10px] sm:text-xs font-semibold leading-tight text-[#1B4332] tracking-normal mt-0.5 whitespace-nowrap hidden sm:block">
              AI Study Assistant
            </span>
          </div>
        </button>

        {/* Right Nav */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenLibrary}
            className="h-9 px-3.5 sm:px-4 rounded-xl flex items-center font-sans text-xs font-semibold text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E5E0D8] transition-all cursor-pointer shadow-xs hover:border-[#D6D0C7]"
            type="button"
          >
            My Library
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1B4332] bg-white border-2 border-[#1B4332] cursor-pointer hover:scale-105 transition-transform shadow-xs hidden sm:flex"
            title="User Profile (Active Student Session)"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

