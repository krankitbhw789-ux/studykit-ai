import React, { useRef } from 'react';
import { StudyKitResult, ToolId } from '../types';

interface PdfSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTool: ToolId;
  targetToolLabel: string;
  processedPdfs: StudyKitResult[];
  onSelectPdf: (pdf: StudyKitResult) => void;
  onUploadNew: () => void;
  onFileSelected?: (file: File) => void;
}

export const PdfSelectModal: React.FC<PdfSelectModalProps> = ({
  isOpen,
  onClose,
  targetToolLabel,
  processedPdfs,
  onSelectPdf,
  onUploadNew,
  onFileSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onClose();
      if (onFileSelected) {
        onFileSelected(file);
      } else {
        onUploadNew();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.epub,.pptx,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-[#E5E0D8] shadow-xl p-5 sm:p-6 flex flex-col gap-4 text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">build</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-[#1C1917]">
                Open {targetToolLabel}
              </h3>
              <p className="font-mono text-xs text-[#78716C]">
                Select a document to view this tool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            type="button"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Option A: Upload a new PDF */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                onClose();
                onUploadNew();
              }
            }}
            className="w-full p-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border-2 border-dashed border-[#1B4332]/40 hover:border-[#1B4332] flex items-center gap-3.5 transition-all text-left group cursor-pointer"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline-sm text-sm font-bold text-[#1C1917]">
                Upload a new PDF
              </h4>
              <p className="font-mono text-xs text-[#78716C] mt-0.5">
                AI will generate structured notes, summary, topics, mind map & tests
              </p>
            </div>
            <span className="material-symbols-outlined text-[#1B4332] text-[20px] shrink-0">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Option B: Select from already processed PDFs (only if list not empty) */}
        {processedPdfs.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E0D8]">
            <span className="font-mono text-xs font-semibold text-[#78716C] uppercase tracking-wider">
              Or select from processed PDFs in this session ({processedPdfs.length})
            </span>
            <div className="max-h-56 overflow-y-auto flex flex-col gap-2 pr-1">
              {processedPdfs.map((pdf, idx) => (
                <button
                  key={pdf.id || `${pdf.document.fileName}-${idx}`}
                  onClick={() => {
                    onClose();
                    onSelectPdf(pdf);
                  }}
                  className="w-full p-3 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#1B4332]/50 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-xs"
                  type="button"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[#1B4332] text-[20px] shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="font-headline-sm text-xs sm:text-sm font-bold text-[#1C1917] truncate">
                        {pdf.document.fileName}
                      </p>
                      <p className="font-mono text-[11px] text-[#78716C]">
                        {pdf.document.fileSize || 'PDF'} • {pdf.notes?.length || 0} sections • {pdf.topics?.length || 0} topics
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#78716C] text-[18px] shrink-0">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

