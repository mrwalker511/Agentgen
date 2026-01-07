/**
 * Interview engine types
 */

/**
 * Question types supported by the interview engine
 */
export type QuestionType = 'text' | 'select' | 'multiselect' | 'confirm' | 'number';

/**
 * Conditional when clause for questions
 */
export interface WhenCondition {
  field: string;
  equals?: string | boolean | number;
  notEquals?: string | boolean | number;
  includes?: string;
}

/**
 * Choice for select/multiselect questions
 */
export interface QuestionChoice {
  name: string;
  value: string;
  description?: string;
}

/**
 * Question definition
 */
export interface Question {
  id: string;
  type: QuestionType;
  message: string;
  default?: string | boolean | number | string[];
  choices?: QuestionChoice[];
  validate?: string; // Validation rule (e.g., "required", "email", "min:3")
  when?: WhenCondition;
}

/**
 * Interview definition from interview.json
 */
export interface InterviewDefinition {
  version: string;
  questions: Question[];
}

/**
 * Answer set - collected answers from interview
 */
export interface AnswerSet {
  [key: string]: string | boolean | number | string[];
}
