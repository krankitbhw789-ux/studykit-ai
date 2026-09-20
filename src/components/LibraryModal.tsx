import React from 'react';
import { StudyKitResult } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedResults: StudyKitResult[];
  onSelectResult: (res: StudyKitResult) => void;
  onDeleteItem?: (idx: number) => void;
  onUploadNew?: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  savedResults,
  onSelectResult,
  onDeleteItem,
  onUploadNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-[#E5E0D8] text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E0D8] bg-[#F5F2EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1B4332] text-[24px]">folder_open</span>
            <h2 className="font-headline-sm text-headline-sm text-[#1C1917] font-semibold">My Study Library</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1B4332]/10 border border-[#1B4332]/30 text-[#1B4332] font-mono">
              {savedResults.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex flex-col gap-2.5 max-h-[60vh] bg-[#FAF8F5]">
          {savedResults.length === 0 ? (
            <div className="py-12 text-center text-[#78716C] flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E0D8] flex items-center justify-center text-[#1B4332] shadow-xs">
                <span className="material-symbols-outlined text-[36px]">
                  draft
                </span>
              </div>
              <div>
                <p className="font-body-md text-[#1C1917] font-semibold text-base">No documents in library yet</p>
                <p className="font-body-sm text-[#78716C] mt-1 max-w-[32ch] text-xs">Upload any PDF document to generate your notes, summaries, and quizzes.</p>
              </div>
              <button
                onClick={() => {
                  onUploadNew?.();
                  onClose();
                }}
                className="mt-2 min-h-[42px] px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold text-sm flex items-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">upload_file</span>
                <span>Upload New PDF</span>
              </button>
            </div>
          ) : (
            savedResults.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white hover:bg-[#FAF9F6] transition-colors border border-[#E5E0D8] hover:border-[#1B4332]/50 flex items-center justify-between gap-3 shadow-xs group"
              >
                <div
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 text-[#1B4332] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">menu_book</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-label-md text-[#1C1917] font-semibold truncate group-hover:text-[#1B4332] transition-colors">
                      {item.document.fileName}
                    </p>
                    <p className="font-label-sm text-[#78716C] truncate mt-0.5 font-mono text-[11px]">
                      {item.document.pageCount} • {item.notes.length} sections • {item.testSeries.length} quiz Qs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onDeleteItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(idx);
                      }}
                      className="p-1.5 rounded-lg text-[#78716C] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete study kit"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSelectResult(item);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1B4332] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Upload New PDF button and Close */}
        <div className="p-4 border-t border-[#E5E0D8] bg-[#F5F2EB] flex items-center justify-between gap-3">
          <button
            id="btn-library-upload-new"
            onClick={() => {
              onUploadNew?.();
              onClose();
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold text-sm flex items-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload New PDF</span>
          </button>

          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-[#E5E0D8] text-[#1C1917] font-semibold text-sm hover:bg-[#F0EBE3] transition-colors cursor-pointer"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
