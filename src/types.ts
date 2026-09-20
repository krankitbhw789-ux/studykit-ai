export interface StudyKitDocument {
  fileName: string;
  fileSize: string;
  pageCount: string | number;
  category: string;
  uploadedAt: string;
}

export interface NoteBullet {
  label: string;
  text: string;
}

export interface StudyNoteSection {
  id: string;
  romanNumeral: string;
  title: string;
  subtitle: string;
  bullets: NoteBullet[];
  examKeyConcept?: string;
  highYieldBadge?: string;
  figureCaption?: string;
  figureDescription?: string;
  figureImageUrl?: string;
  isRead?: boolean;
  isBookmarked?: boolean;
}

export interface StudySummary {
  overview: string;
  keyTakeaways: string[];
  readingTimeMinutes: number;
  estimatedPages: number;
  coreTheses?: Array<{ topic: string; summary: string }>;
}

export interface ImportantTopic {
  rank: number;
  title: string;
  reason: string;
  yieldLevel: 'High Yield' | 'Critical' | 'Medium';
  examFrequency?: string;
  keyTerms: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
  sourceCitation?: string;
  excerptText?: string;
  pageRef?: string;
}

export interface MindMapBranch {
  id: string;
  romanNumeral: string;
  title: string;
  subtitle: string;
  tag?: string;
  examBadge?: string;
  keyPoints: MindMapNode[];
}

export interface MindMapData {
  root: {
    title: string;
    subtitle: string;
    sectionRef: string;
    description: string;
  };
  branches: MindMapBranch[];
}

export interface TestQuestion {
  id: string;
  questionNumber: number;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topicRef?: string;
}

export interface CorrectionItem {
  id: string;
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  topicRef?: string;
  timestamp: string;
}

export interface StudyKitResult {
  id?: string;
  document: StudyKitDocument;
  notes: StudyNoteSection[];
  summary: StudySummary;
  topics: ImportantTopic[];
  mindMap: MindMapData;
  testSeries: TestQuestion[];
  corrections?: CorrectionItem[];
  userAnswers?: Record<string, string>;
  timeSpent?: number;
  viewedSections?: Record<string, boolean>;
  scrollProgress?: Record<string, number>;
}

export type ActiveTab = 'notes' | 'summary' | 'topics' | 'mindmap' | 'test' | 'corrections' | 'flashcards';

export type ToolId = 'notes' | 'summary' | 'topics' | 'mindmap' | 'test' | 'corrections' | 'progress';

