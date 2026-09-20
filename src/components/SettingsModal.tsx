import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-[#E5E0D8] text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between p-space-md border-b border-[#E5E0D8] bg-[#F5F2EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1B4332] text-[22px]">tune</span>
            <h2 className="font-headline-sm text-headline-sm text-[#1C1917] font-semibold">Study Desk Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE5DC] cursor-pointer transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-md overflow-y-auto flex flex-col gap-space-md bg-[#FAF8F5]">
          <div className="flex items-center justify-between p-space-sm rounded-xl bg-white border border-[#E5E0D8]">
            <div>
              <p className="font-label-md text-[#1C1917] font-semibold">Academic Engine</p>
              <p className="font-body-sm text-[#78716C] text-xs mt-0.5">Gemini Document Synthesis & Understanding</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25 font-mono font-bold text-[11px]">
              Active
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-white border border-[#E5E0D8]">
            <p className="font-label-md text-[#1C1917] font-semibold">Frictionless Session State</p>
            <p className="font-body-sm text-[#78716C] text-xs leading-relaxed">
              No login required. Your documents, notes, mind maps, and quiz scores are stored in your active browser session securely.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-white border border-[#E5E0D8]">
            <p className="font-label-md text-[#1C1917] font-semibold">PDF Export & High Yield Focus</p>
            <p className="font-body-sm text-[#78716C] text-xs leading-relaxed">
              Downloads clean, printable PDFs client-side with notes, summaries, and exam-ranked concepts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-space-md border-t border-[#E5E0D8] bg-[#F5F2EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold font-label-md text-label-md transition-all shadow-xs cursor-pointer"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
