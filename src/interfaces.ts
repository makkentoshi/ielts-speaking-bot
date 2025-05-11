export interface User {
  userId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: "english" | "spanish";
  ieltsLevel?: number;
  spanishLevel?: "beginner" | "intermediate" | "advanced";
  dailyPhraseEnabled: boolean;
  lastPhraseDate?: Date;
}

export interface SpeakingAssessment {
  fluency: number;
  coherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overallBand: number;
  feedback: string;
}

export interface SpanishPhrase {
  phrase: string;
  translation: string;
  category: string;
  example?: string;
}

export interface SpanishTense {
  name: string;
  description: string;
  conjugation: string;
  example: string;
}

export interface DeepSeekTranscription {
  text: string;
  language: string;
  duration: number;
}

export interface DeepSeekAssessment {
  message: {
    content: string;
  };
}

import { Context } from "grammy";
import { ConversationFlavor } from "@grammyjs/conversations";

export interface ExamSession {
  topic: string;
  part: number;
  answers: string[];
  questionIndex: number;
  page: number;
}

export type BotContext = Context & {
  session: { exam?: ExamSession };
} & ConversationFlavor<Context>;

export interface SessionData {
  key?: string;
  value?: any;
  exam?: ExamSession;
}
