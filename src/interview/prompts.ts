/**
 * Interview prompt utilities
 */

import inquirer from 'inquirer';
import { QuestionType, QuestionChoice } from './types.js';

/**
 * Create a text input prompt
 */
export function createTextPrompt(id: string, message: string, defaultValue?: string, validate?: string): any {
  const prompt: any = {
    type: 'input' as QuestionType,
    name: id,
    message: message,
  };
  
  if (defaultValue !== undefined) {
    prompt.default = defaultValue;
  }
  
  if (validate) {
    prompt.validate = (value: string) => {
      if (validate === 'required' && !value.trim()) {
        return 'This field is required';
      }
      if (validate.startsWith('min:') && value.length < parseInt(validate.split(':')[1])) {
        return `Must be at least ${validate.split(':')[1]} characters`;
      }
      if (validate === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Must be a valid email address';
        }
      }
      return true;
    };
  }
  
  return prompt;
}

/**
 * Create a select prompt
 */
export function createSelectPrompt(id: string, message: string, choices: QuestionChoice[], defaultValue?: string): any {
  return {
    type: 'list' as QuestionType,
    name: id,
    message: message,
    choices: choices.map(c => ({
      name: c.name,
      value: c.value,
      short: c.description,
    })),
    default: defaultValue,
  };
}

/**
 * Create a multi-select prompt
 */
export function createMultiSelectPrompt(id: string, message: string, choices: QuestionChoice[], defaultValues?: string[]): any {
  return {
    type: 'checkbox' as QuestionType,
    name: id,
    message: message,
    choices: choices.map(c => ({
      name: c.name,
      value: c.value,
      checked: defaultValues?.includes(c.value),
    })),
  };
}

/**
 * Create a confirm prompt
 */
export function createConfirmPrompt(id: string, message: string, defaultValue: boolean = false): any {
  return {
    type: 'confirm' as QuestionType,
    name: id,
    message: message,
    default: defaultValue,
  };
}

/**
 * Create a number prompt
 */
export function createNumberPrompt(id: string, message: string, defaultValue?: number, validate?: string): any {
  const prompt: any = {
    type: 'number' as QuestionType,
    name: id,
    message: message,
  };
  
  if (defaultValue !== undefined) {
    prompt.default = defaultValue;
  }
  
  if (validate) {
    prompt.validate = (value: number) => {
      if (validate === 'required' && value === null) {
        return 'This field is required';
      }
      if (validate.startsWith('min:') && value < parseInt(validate.split(':')[1])) {
        return `Must be at least ${validate.split(':')[1]}`;
      }
      if (validate.startsWith('max:') && value > parseInt(validate.split(':')[1])) {
        return `Must be at most ${validate.split(':')[1]}`;
      }
      return true;
    };
  }
  
  return prompt;
}

/**
 * Convert question definition to inquirer prompt
 */
export function questionToPrompt(question: any): any {
  const prompt: any = {
    type: question.type,
    name: question.id,
    message: question.message,
  };
  
  if (question.default !== undefined) {
    prompt.default = question.default;
  }
  
  if (question.choices) {
    prompt.choices = question.choices.map((choice: QuestionChoice) => ({
      name: choice.name,
      value: choice.value,
      short: choice.description,
    }));
  }
  
  if (question.validate) {
    prompt.validate = (value: any) => {
      if (question.validate === 'required' && !value) {
        return 'This field is required';
      }
      if (question.validate.startsWith('min:') && typeof value === 'string' && value.length < parseInt(question.validate.split(':')[1])) {
        return `Must be at least ${question.validate.split(':')[1]} characters`;
      }
      if (question.validate === 'email' && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Must be a valid email address';
        }
      }
      return true;
    };
  }
  
  return prompt;
}