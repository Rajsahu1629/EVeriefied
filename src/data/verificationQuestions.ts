// Verification Questions - Central export file
// Imports questions from separate role-specific files

export interface QuestionData {
  role: string;
  step: number;
  question_text_hi: string;
  question_text_en: string;
  options: { hi: string; en: string; isCorrect: boolean }[];
  points: number;
  difficulty: string;
}

// Import technician questions from separate files
import { technicianStep1Questions } from './technicianQuestions1';
import { technicianStep2Questions } from './technicianQuestions2';

// Import sales questions from separate file
import { salesQuestions } from './salesQuestions';

// Re-export all questions for use in the app
export { technicianStep1Questions, technicianStep2Questions, salesQuestions };

// Combined exports for convenience
export const allTechnicianQuestions: QuestionData[] = [
  ...technicianStep1Questions,
  ...technicianStep2Questions,
];

export const allQuestions: QuestionData[] = [
  ...technicianStep1Questions,
  ...technicianStep2Questions,
  ...salesQuestions,
];
