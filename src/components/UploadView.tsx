import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface UploadViewProps {
  onFileSelected: (file: File) => void;
  errorMessage?: string | null;
  onClearError?: () => void;
  onRetry?: () => void;
}

const SPRING = { type: 'spring', damping: 25, stiffness: 240 } as const;
const EASING = [0.16, 1, 0.3, 1] as const;

export const UploadView: React.FC<UploadViewProps> = ({
  onFileSelected,
  errorMessage,
  onClearError,
  onRetry,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      alert('File is larger than 100MB. Please choose a smaller document or chapter.');
      return;
    }
    onFileSelected(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCardClick = () => {
    handleTriggerUpload();
  };

  const importCards = [
    {
      id: 'textbook',
      title: 'Textbook\nChapter',
      label: 'Textbook Chapter',
      icon: 'auto_stories',
    },
    {
      id: 'slides',
      title: 'Lecture\nSlides',
      label: 'Lecture Slides',
      icon: 'slideshow',
    },
    {
      id: 'paper',
      title: 'Research\nPaper',
      label: 'Research Paper',
      icon: 'description',
    },
    {
      id: 'syllabus',
      title: 'Syllabus &\nNotes',
      label: 'Syllabus & Notes',
      icon: 'assignment',
    },
  ];

  return (
    <div className="relative flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-8 text-[#1C1917]">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept=".pdf,.docx,.epub,.pptx,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Error Notice if any */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASING }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-2xl shrink-0 mt-0.5">warning</span>
            <div>
              <p className="font-semibold text-sm text-amber-900">Synthesis Notice</p>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#14382A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Retry Synthesis</span>
              </button>
            )}
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-amber-700 hover:text-amber-900 p-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                type="button"
                aria-label="Dismiss notice"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 1. Main Hero Card: Upload Your Study Material (Warm Academic Card with Subtle Solid Corner Accents) */}
      <section className="relative w-full">
        <motion.div
          id="hero-upload-card"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={
            isDragging
              ? {
                  scale: 1.01,
                }
              : {}
          }
          className={`relative w-full rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
            isDragging
              ? 'border-[#1B4332] shadow-md ring-2 ring-[#1B4332]/20'
              : 'border-[#E5E0D8] shadow-xs'
          }`}
        >
          {/* Subtle Solid-Color Corner Accents (No glow) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Left Corner Accent */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#1B4332]/30 rounded-tl-sm" />

            {/* Top Right Corner Accent */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#1B4332]/30 rounded-tr-sm" />

            {/* Bottom Left Corner Accent */}
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#1B4332]/30 rounded-bl-sm" />

            {/* Bottom Right Corner Accent */}
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#1B4332]/30 rounded-br-sm" />
          </div>

          {/* Hero Card Inner Content */}
          <div className="relative z-10 px-6 py-10 sm:py-12 md:py-14 flex flex-col items-center text-center">
            {/* Deep Forest Green Cloud Upload Icon (Solid color, no glow) */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
              transition={SPRING}
              onClick={handleTriggerUpload}
              className="cursor-pointer mb-4 flex items-center justify-center relative group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[#1B4332] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-12 h-12 stroke-[#1B4332] group-hover:stroke-[#14382A] transition-colors stroke-[1.75]"
                >
                  <path
                    d="M7 16C4.79086 16 3 14.2091 3 12C3 9.94436 4.5492 8.2514 6.55169 8.0267C7.15174 5.14389 9.69769 3 12.75 3C16.1963 3 19.0113 5.67389 19.237 9.06674C20.841 9.42629 22 10.8447 22 12.5C22 14.433 20.433 16 18.5 16H16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11V21M12 11L8.5 14.5M12 11L15.5 14.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Title: Upload Your Study Material */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-headline-sm">
              Upload Your Study Material
            </h1>

            {/* Subtitle: Turn PDFs, slides, notes & more into active learning resources */}
            <p className="text-[#57534E] font-sans text-xs sm:text-sm mt-2 max-w-md font-medium leading-relaxed">
              Turn PDFs, slides, notes & more into active learning resources.
            </p>

            {/* Primary Action Button: Upload PDF (Solid deep forest green, white text, subtle hover shadow, no glow) */}
            <motion.button
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.02,
                    }
              }
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={SPRING}
              onClick={handleTriggerUpload}
              type="button"
              className="mt-6 px-8 py-3 rounded-xl bg-[#1B4332] hover:bg-[#14382A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer select-none group"
            >
              <span className="material-symbols-outlined text-[20px] font-bold text-white group-hover:-translate-y-0.5 transition-transform">
                upload
              </span>
              <span className="font-bold tracking-tight">Upload PDF</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 2. Section: Import from */}
      <section className="w-full space-y-3.5 pt-1">
        <h2 className="text-[#1C1917] font-bold text-base sm:text-lg tracking-tight font-headline-sm">
          Import from
        </h2>

        {/* 8-Card Grid (2 rows x 4 columns) matching layout and sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {importCards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      y: -2,
                    }
              }
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={SPRING}
              onClick={handleCardClick}
              className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E5E0D8] hover:border-[#1B4332]/50 hover:shadow-xs flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative select-none min-h-[110px] sm:min-h-[125px] shadow-xs"
            >
              {/* Deep Forest Green Icon (No glow) */}
              <span className="material-symbols-outlined text-[30px] sm:text-[34px] text-[#1B4332] group-hover:scale-105 transition-transform">
                {card.icon}
              </span>

              {/* Dark Charcoal Title text */}
              <span className="mt-2.5 text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#1B4332] transition-colors leading-tight whitespace-pre-line">
                {card.title}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
