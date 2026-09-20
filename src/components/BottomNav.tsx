import React from 'react';

export interface BottomNavProps {
  currentTab: 'home' | 'desk' | 'library' | 'tools' | 'summaries' | 'summary' | 'progress';
  onChangeTab: (tab: 'home' | 'library' | 'tools' | 'progress') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const isHomeActive = currentTab === 'home' || currentTab === 'desk';
  const isLibraryActive = currentTab === 'library';
  const isToolsActive = currentTab === 'tools' || currentTab === 'summary' || currentTab === 'summaries';
  const isProgressActive = currentTab === 'progress';

  return (
    <nav
      aria-label="Application Bottom Bar"
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#FAF8F5]/95 backdrop-blur-xl shadow-xs border-t border-[#E5E0D8]"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
            isHomeActive
              ? 'text-[#1B4332] font-semibold'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: isHomeActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Home</span>
        </button>

        {/* Library */}
        <button
          onClick={() => onChangeTab('library')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
            isLibraryActive
              ? 'text-[#1B4332] font-semibold'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: isLibraryActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            auto_stories
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Library</span>
        </button>

        {/* Tools */}
        <button
          onClick={() => onChangeTab('tools')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
            isToolsActive
              ? 'text-[#1B4332] font-semibold'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: isToolsActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            handyman
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Tools</span>
        </button>

        {/* Progress */}
        <button
          onClick={() => onChangeTab('progress')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
            isProgressActive
              ? 'text-[#1B4332] font-semibold'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: isProgressActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            monitoring
          </span>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">Progress</span>
        </button>
      </div>
    </nav>
  );
};

