import { jsPDF } from 'jspdf';
import { StudyKitResult, ActiveTab } from '../types';

export function exportStudyKitPdf(data: StudyKitResult, activeTab: ActiveTab | 'all' = 'notes') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(spaceNeeded: number) {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  }

  function drawHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(81, 95, 116); // #515f74 secondary
    doc.text('STUDYKIT AI • ACADEMIC STUDY DESK', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(229, 226, 222); // #e5e2de outline
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  function drawSectionBanner(title: string) {
    checkPageBreak(25);
    doc.setFillColor(240, 237, 234); // #f0edea
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 35, 111); // #00236f
    doc.text(title, margin + 4, y + 5.5);
    y += 13;
  }

  // Draw Cover / Document Header
  drawHeader();

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 35, 111);
  const titleLines = doc.splitTextToSize(data.document.fileName || 'Academic Document', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 2;

  // Metadata Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(81, 95, 116);
  const tabSubtitle =
    activeTab === 'all'
      ? 'Complete Academic Study Kit (All Modules)'
      : activeTab === 'notes'
      ? 'Structured Study Notes & High-Yield Axioms'
      : activeTab === 'summary'
      ? 'Executive Summary & Key Takeaways'
      : activeTab === 'topics'
      ? 'Ranked High-Yield Exam Topics'
      : activeTab === 'flashcards'
      ? 'Active Recall Flashcard Deck'
      : activeTab === 'mindmap'
      ? 'Concept Ontology & Mind Map Breakdown'
      : 'Exam Practice Test & Diagnostic Key';

  doc.text(
    `${data.document.pageCount || 'Document'} • ${tabSubtitle} • Generated via StudyKit AI`,
    margin,
    y
  );
  y += 11;

  // Renderers for individual sections
  function renderSummary() {
    drawSectionBanner('EXECUTIVE SUMMARY & KEY TAKEAWAYS');

    if (data.summary?.readingTimeMinutes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(81, 95, 116);
      doc.text(`Estimated Reading Time: ~${data.summary.readingTimeMinutes} mins`, margin, y);
      y += 6;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(28, 28, 26);
    const summaryLines = doc.splitTextToSize(data.summary?.overview || 'No summary available.', contentWidth);
    checkPageBreak(summaryLines.length * 6);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 6 + 6;

    // Key Takeaways
    if (data.summary?.keyTakeaways && data.summary.keyTakeaways.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(81, 95, 116);
      doc.text('Key Takeaways & Core Findings:', margin, y);
      y += 6;

      data.summary.keyTakeaways.forEach((point) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(28, 28, 26);
        const bulletLines = doc.splitTextToSize(`•  ${point}`, contentWidth - 4);
        checkPageBreak(bulletLines.length * 5 + 2);
        doc.text(bulletLines, margin + 2, y);
        y += bulletLines.length * 5 + 2;
      });
      y += 6;
    }

    // Core Theses
    if (data.summary?.coreTheses && data.summary.coreTheses.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(81, 95, 116);
      doc.text('Core Theses & Thematic Pillars:', margin, y);
      y += 6;

      data.summary.coreTheses.forEach((thesis) => {
        checkPageBreak(18);
        doc.setFont('times', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 35, 111);
        doc.text(`• ${thesis.topic}`, margin + 2, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(28, 28, 26);
        const thesisLines = doc.splitTextToSize(thesis.summary, contentWidth - 8);
        doc.text(thesisLines, margin + 6, y);
        y += thesisLines.length * 5 + 3;
      });
      y += 4;
    }
  }

  function renderNotes() {
    drawSectionBanner('STRUCTURED NOTES & HIGH-YIELD AXIOMS');

    (data.notes || []).forEach((sec) => {
      checkPageBreak(28);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 35, 111);
      doc.text(`${sec.romanNumeral}. ${sec.title}`, margin, y);
      y += 6;

      if (sec.subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(81, 95, 116);
        const subLines = doc.splitTextToSize(sec.subtitle, contentWidth);
        doc.text(subLines, margin, y);
        y += subLines.length * 5 + 3;
      }

      (sec.bullets || []).forEach((bullet) => {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 35, 111);
        const prefix = `• ${bullet.label}: `;
        const prefixWidth = doc.getTextWidth(prefix);
        doc.text(prefix, margin + 2, y);

        doc.setFont('times', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(28, 28, 26);
        const bodyLines = doc.splitTextToSize(bullet.text, contentWidth - prefixWidth - 4);
        doc.text(bodyLines[0] || '', margin + 2 + prefixWidth, y);
        y += 5;

        if (bodyLines.length > 1) {
          const remaining = bodyLines.slice(1);
          doc.text(remaining, margin + 6, y);
          y += remaining.length * 5;
        }
        y += 2;
      });

      if (sec.examKeyConcept) {
        checkPageBreak(22);
        doc.setFillColor(235, 232, 228);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(0, 35, 111);
        const calloutText = `Exam Key Concept: ${sec.examKeyConcept}`;
        const calloutLines = doc.splitTextToSize(calloutText, contentWidth - 8);
        const calloutHeight = calloutLines.length * 5 + 6;
        doc.roundedRect(margin, y, contentWidth, calloutHeight, 2, 2, 'F');
        doc.text(calloutLines, margin + 4, y + 5);
        y += calloutHeight + 4;
      }

      y += 4;
    });
  }

  function renderTopics() {
    drawSectionBanner('RANKED IMPORTANT TOPICS & EXAM RELEVANCE');

    (data.topics || []).forEach((topic) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 35, 111);
      doc.text(`#${topic.rank}. ${topic.title}  [${topic.yieldLevel}]`, margin, y);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(28, 28, 26);
      const reasonLines = doc.splitTextToSize(`Why it matters: ${topic.reason}`, contentWidth - 4);
      doc.text(reasonLines, margin + 4, y);
      y += reasonLines.length * 5 + 2;

      if (topic.examFrequency) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 35, 111);
        doc.text(`Exam Frequency: ${topic.examFrequency}`, margin + 4, y);
        y += 4.5;
      }

      if (topic.keyTerms && topic.keyTerms.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(81, 95, 116);
        doc.text(`Key terms: ${topic.keyTerms.join(', ')}`, margin + 4, y);
        y += 5;
      }
      y += 4;
    });
  }

  function renderFlashcards() {
    drawSectionBanner('HIGH-YIELD ACTIVE RECALL FLASHCARDS');

    (data.topics || []).forEach((topic, idx) => {
      checkPageBreak(40);
      doc.setDrawColor(213, 210, 205); // #d5d2cd
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

      // Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 35, 111);
      doc.text(`FLASHCARD ${idx + 1} OF ${(data.topics || []).length} • #${topic.rank} [${topic.yieldLevel}]`, margin + 4, y + 6);

      // Card Question / Term
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 35, 111);
      doc.text(`Concept: ${topic.title}`, margin + 4, y + 13);

      // Card Answer / Explanation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(28, 28, 26);
      const answerLines = doc.splitTextToSize(`Explanation: ${topic.reason}`, contentWidth - 8);
      doc.text(answerLines.slice(0, 3), margin + 4, y + 20);

      if (topic.keyTerms && topic.keyTerms.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(81, 95, 116);
        doc.text(`Key terms: ${topic.keyTerms.join(', ')}`, margin + 4, y + 30);
      }

      y += 38;
    });
  }

  function renderMindMap() {
    drawSectionBanner('CONCEPT ONTOLOGY & MIND MAP BREAKDOWN');

    if (data.mindMap?.root) {
      checkPageBreak(25);
      doc.setFillColor(235, 232, 228);
      doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 35, 111);
      doc.text(`ROOT CONCEPT: ${data.mindMap.root.title}`, margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(28, 28, 26);
      doc.text(data.mindMap.root.description || data.mindMap.root.subtitle, margin + 4, y + 12);
      y += 22;
    }

    (data.mindMap?.branches || []).forEach((branch) => {
      checkPageBreak(30);
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 35, 111);
      doc.text(`Branch ${branch.romanNumeral}: ${branch.title}`, margin, y);
      y += 5.5;

      if (branch.subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(81, 95, 116);
        doc.text(branch.subtitle, margin, y);
        y += 5.5;
      }

      (branch.keyPoints || []).forEach((pt) => {
        checkPageBreak(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 35, 111);
        doc.text(`• [${pt.label}] ${pt.title}`, margin + 3, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(28, 28, 26);
        const descLines = doc.splitTextToSize(pt.description, contentWidth - 8);
        doc.text(descLines, margin + 6, y);
        y += descLines.length * 4.5 + 2;

        if (pt.excerptText) {
          doc.setFont('times', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(81, 95, 116);
          const excerptLines = doc.splitTextToSize(`"${pt.excerptText}"`, contentWidth - 8);
          doc.text(excerptLines, margin + 6, y);
          y += excerptLines.length * 4.5 + 2;
        }
      });

      y += 4;
    });
  }

  function renderTest() {
    drawSectionBanner('EXAM PRACTICE TEST & DIAGNOSTIC ASSESSMENT');

    const questions = data.testSeries || [];

    // Questions section
    questions.forEach((q, idx) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 35, 111);
      doc.text(`Question ${idx + 1} (${q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'})`, margin, y);
      y += 6;

      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(28, 28, 26);
      const qLines = doc.splitTextToSize(q.question, contentWidth - 4);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 5 + 2;

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, optIdx) => {
          checkPageBreak(12);
          const optLetter = String.fromCharCode(65 + optIdx);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(28, 28, 26);
          const optLines = doc.splitTextToSize(`${optLetter})  ${opt}`, contentWidth - 8);
          doc.text(optLines, margin + 6, y);
          y += optLines.length * 4.5 + 1;
        });
        y += 2;
      }
      y += 4;
    });

    // Answer Key section on new page
    doc.addPage();
    y = margin;
    drawHeader();
    drawSectionBanner('ANSWER KEY & DETAILED EXPLANATIONS');

    questions.forEach((q, idx) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 35, 111);
      doc.text(`Q${idx + 1} Correct Answer: ${q.correctAnswer}`, margin, y);
      y += 5.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(28, 28, 26);
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 4);
      doc.text(expLines, margin + 2, y);
      y += expLines.length * 4.5 + 4;
    });
  }

  // Execute based on activeTab
  if (activeTab === 'all') {
    renderSummary();
    doc.addPage();
    y = margin;
    drawHeader();
    renderNotes();
    doc.addPage();
    y = margin;
    drawHeader();
    renderTopics();
    doc.addPage();
    y = margin;
    drawHeader();
    renderMindMap();
    doc.addPage();
    y = margin;
    drawHeader();
    renderTest();
  } else if (activeTab === 'notes') {
    renderNotes();
  } else if (activeTab === 'summary') {
    renderSummary();
  } else if (activeTab === 'topics') {
    renderTopics();
  } else if (activeTab === 'flashcards') {
    renderFlashcards();
  } else if (activeTab === 'mindmap') {
    renderMindMap();
  } else if (activeTab === 'test') {
    renderTest();
  }

  // Page Numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(117, 118, 130);
    doc.text(`StudyKit AI • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, {
      align: 'center',
    });
  }

  // Save the PDF with appropriate filename
  const cleanName = (data.document.fileName || 'study_kit')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const fileSuffix =
    activeTab === 'all'
      ? 'Complete_StudyKit'
      : activeTab === 'notes'
      ? 'Notes'
      : activeTab === 'summary'
      ? 'Summary'
      : activeTab === 'topics'
      ? 'Topics'
      : activeTab === 'flashcards'
      ? 'Flashcards'
      : activeTab === 'mindmap'
      ? 'Mind_Map'
      : 'Practice_Test';

  doc.save(`${cleanName}_${fileSuffix}.pdf`);
}

/**
 * Returns plain-text markdown content for sharing specifically for the active tab
 */
export function getTabShareContent(data: StudyKitResult, activeTab: ActiveTab | 'all'): { title: string; text: string } {
  const docName = data.document.fileName || 'Academic Material';

  if (activeTab === 'summary') {
    return {
      title: `${docName} — Executive Summary`,
      text: `${docName} — Executive Summary\n\nOverview:\n${data.summary?.overview || ''}\n\nKey Takeaways:\n${(
        data.summary?.keyTakeaways || []
      )
        .map((t) => `• ${t}`)
        .join('\n')}\n\nSynthesized via StudyKit AI`,
    };
  }

  if (activeTab === 'notes') {
    let notesText = `${docName} — Study Notes\n\n`;
    (data.notes || []).forEach((sec) => {
      notesText += `${sec.romanNumeral}. ${sec.title}\n`;
      if (sec.subtitle) notesText += `   ${sec.subtitle}\n`;
      (sec.bullets || []).forEach((b) => {
        notesText += `   • ${b.label}: ${b.text}\n`;
      });
      if (sec.examKeyConcept) {
        notesText += `   [Exam Key Concept]: ${sec.examKeyConcept}\n`;
      }
      notesText += '\n';
    });
    notesText += 'Synthesized via StudyKit AI';
    return {
      title: `${docName} — Study Notes`,
      text: notesText,
    };
  }

  if (activeTab === 'topics') {
    let topicsText = `${docName} — Ranked Important Topics\n\n`;
    (data.topics || []).forEach((t) => {
      topicsText += `#${t.rank}. ${t.title} [${t.yieldLevel}]\n`;
      topicsText += `   Why it matters: ${t.reason}\n`;
      if (t.examFrequency) topicsText += `   Exam Frequency: ${t.examFrequency}\n`;
      if (t.keyTerms?.length) topicsText += `   Key terms: ${t.keyTerms.join(', ')}\n`;
      topicsText += '\n';
    });
    topicsText += 'Synthesized via StudyKit AI';
    return {
      title: `${docName} — Important Topics`,
      text: topicsText,
    };
  }

  if (activeTab === 'flashcards') {
    let fcText = `${docName} — Active Recall Flashcards\n\n`;
    (data.topics || []).forEach((t, i) => {
      fcText += `[Card ${i + 1}] ${t.title} (${t.yieldLevel})\n`;
      fcText += `Answer / Explanation: ${t.reason}\n\n`;
    });
    fcText += 'Synthesized via StudyKit AI';
    return {
      title: `${docName} — Flashcards`,
      text: fcText,
    };
  }

  if (activeTab === 'mindmap') {
    let mmText = `${docName} — Mind Map Breakdown\n\n`;
    if (data.mindMap?.root) {
      mmText += `ROOT: ${data.mindMap.root.title}\n${data.mindMap.root.description || ''}\n\n`;
    }
    (data.mindMap?.branches || []).forEach((b) => {
      mmText += `[Branch ${b.romanNumeral}] ${b.title}\n`;
      (b.keyPoints || []).forEach((pt) => {
        mmText += `   • ${pt.label}: ${pt.title} — ${pt.description}\n`;
      });
      mmText += '\n';
    });
    mmText += 'Synthesized via StudyKit AI';
    return {
      title: `${docName} — Mind Map`,
      text: mmText,
    };
  }

  if (activeTab === 'test') {
    let testText = `${docName} — Practice Test Series\n\n`;
    (data.testSeries || []).forEach((q, i) => {
      testText += `Q${i + 1}. ${q.question}\n`;
      if (q.options?.length) {
        q.options.forEach((opt, idx) => {
          testText += `   ${String.fromCharCode(65 + idx)}) ${opt}\n`;
        });
      }
      testText += `Correct Answer: ${q.correctAnswer}\nExplanation: ${q.explanation}\n\n`;
    });
    testText += 'Synthesized via StudyKit AI';
    return {
      title: `${docName} — Practice Test`,
      text: testText,
    };
  }

  // Complete study kit
  return {
    title: `${docName} — Complete Study Kit`,
    text: `${docName} — StudyKit AI\n\nSummary:\n${data.summary?.overview || ''}\n\nSynthesized via StudyKit AI`,
  };
}
