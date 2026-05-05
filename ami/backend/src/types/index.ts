export interface Persona {
  grade: string;
  interest: string;
  adaptiveContext?: string | null; // injected from learning stats before generation
}

export interface SourceContent {
  topic: string;
  sourceTitle: string;
  sourceExcerpt: string;
  sourceUrl: string | null;
}

export interface TocItem {
  id: string;
  title: string;
  done: boolean;
  current: boolean;
}

export interface QuizChoice {
  id: string;
  text: string;
  correct: boolean;
}

export type SectionKind = 'objectives' | 'prose' | 'inline-quiz';

export interface Section {
  id: string;
  kind: SectionKind;
  heading?: string;
  body?: string;
  items?: string[];
  figure?: string;
  question?: string;
  hint?: string;
  choices?: QuizChoice[];
}

export interface TextContent {
  title: string;
  subtitle: string;
  toc: TocItem[];
  sections: Section[];
}

export type SlideKind = 'cover' | 'equation' | 'split' | 'stat' | 'bullet';

export interface Slide {
  id: string;
  kind: SlideKind;
  title: string;
  subtitle?: string;
  points?: string[];
  stat?: string;
  caption?: string;
  cards?: { label: string; title: string; body: string }[];
  imageUrl?: string | null;
  narration: string;
}

export interface AudioChapter {
  title: string;
  timestamp: number;
}

export interface AudioContent {
  title: string;
  script: string;
  chapters: AudioChapter[];
}

export interface MindmapNode {
  id: string;
  label: string;
  parent: string | null;
  x: number;
  y: number;
}

export interface Module {
  id: string;
  userId: string;
  topic: string;
  persona: Persona;
  source: SourceContent;
  textContent: TextContent;
  slides: Slide[];
  mindmap: MindmapNode[];
  audio: AudioContent;
  progress: number;
  fromUpload: boolean;
  deadline: string | null;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  age: number | null;
  qualification: string | null;
  grade: string;
  interest: string;
}
