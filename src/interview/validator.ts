/**
 * Interview answer validation utilities
 */

import { AnswerSet } from './types.js';
import { ValidationError } from '../core/errors.js';

/**
 * Validate a single answer based on validation rules
 */
export function validateAnswer(value: unknown, validation: string | undefined): boolean | string {
  if (!validation) {
    return true;
  }

  const valueStr = String(value);

  if (validation === 'required') {
    if (!valueStr || valueStr.trim() === '') {
      return 'This field is required';
    }
  }

  if (validation.startsWith('min:')) {
    const minLength = parseInt(validation.split(':')[1] || '0', 10);
    if (valueStr.length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
  }

  if (validation === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valueStr)) {
      return 'Must be a valid email address';
    }
  }

  if (validation === 'number') {
    if (isNaN(Number(valueStr))) {
      return 'Must be a valid number';
    }
  }

  return true;
}

/**
 * Validate an entire answer set against question definitions
 */
export function validateAnswerSet(answers: AnswerSet, questions: any[]): void {
  const errors: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    
    if (answer === undefined && question.validate === 'required') {
      errors.push(`Missing required answer for: ${question.message}`);
    } else if (answer !== undefined && question.validate) {
      const validationResult = validateAnswer(answer, question.validate);
      if (validationResult !== true) {
        errors.push(`${question.message}: ${validationResult}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Validate that conditional questions have consistent answers
 */
export function validateConditionalAnswers(answers: AnswerSet, questions: any[]): void {
  const errors: string[] = [];

  for (const question of questions) {
    if (question.when) {
      const conditionField = question.when.field;
      const conditionValue = question.when.equals;
      const actualValue = answers[conditionField];
      
      if (actualValue === conditionValue && answers[question.id] === undefined) {
        // This question should have been asked but wasn't answered
        errors.push(`Missing answer for conditional question: ${question.message}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Conditional validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Validate that required features are configured properly
 */
export function validateFeatureConfiguration(answers: AnswerSet): void {
  const errors: string[] = [];

  // If database is enabled, ensure database type is specified
  if (answers.enableDatabase && !answers.databaseType) {
    errors.push('Database type must be specified when database is enabled');
  }

  // If authentication is enabled, ensure auth method is specified
  if (answers.enableAuth && !answers.authMethod) {
    errors.push('Authentication method must be specified when authentication is enabled');
  }

  // If CI is enabled, ensure CI provider is specified
  if (answers.enableCI && !answers.ciProvider) {
    errors.push('CI/CD provider must be specified when CI/CD is enabled');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Feature configuration validation failed:\n${errors.join('\n')}`);
  }
}