/**
 * Unit tests for interview module
 */

import { describe, it, expect } from 'vitest';
import {
  createTextPrompt,
  createSelectPrompt,
  createMultiSelectPrompt,
  createConfirmPrompt,
  createNumberPrompt
} from '../../src/interview/prompts.js';
import { validateAnswer } from '../../src/interview/validator.js';
import type { QuestionChoice } from '../../src/interview/types.js';

describe('Interview Module', () => {
  describe('Prompt Creation', () => {
    it('should create text prompt', () => {
      const prompt = createTextPrompt('project_name', 'Enter project name', 'my-project');

      expect(prompt.type).toBe('input');
      expect(prompt.name).toBe('project_name');
      expect(prompt.message).toBe('Enter project name');
      expect(prompt.default).toBe('my-project');
    });

    it('should create text prompt with validation', () => {
      const prompt = createTextPrompt('name', 'Enter name', undefined, 'required');

      expect(prompt.validate).toBeDefined();
      expect(prompt.validate('')).toBe('This field is required');
      expect(prompt.validate('test')).toBe(true);
    });

    it('should create text prompt with min length validation', () => {
      const prompt = createTextPrompt('name', 'Enter name', undefined, 'min:3');

      expect(prompt.validate).toBeDefined();
      expect(prompt.validate('ab')).toContain('at least 3');
      expect(prompt.validate('abc')).toBe(true);
    });

    it('should create text prompt with email validation', () => {
      const prompt = createTextPrompt('email', 'Enter email', undefined, 'email');

      expect(prompt.validate).toBeDefined();
      expect(prompt.validate('invalid')).toContain('valid email');
      expect(prompt.validate('test@example.com')).toBe(true);
    });

    it('should create select prompt', () => {
      const choices: QuestionChoice[] = [
        { name: 'Option 1', value: 'opt1', description: 'First option' },
        { name: 'Option 2', value: 'opt2', description: 'Second option' },
      ];

      const prompt = createSelectPrompt('choice', 'Select option', choices, 'opt1');

      expect(prompt.type).toBe('list');
      expect(prompt.name).toBe('choice');
      expect(prompt.choices).toHaveLength(2);
      expect(prompt.default).toBe('opt1');
    });

    it('should create multi-select prompt', () => {
      const choices: QuestionChoice[] = [
        { name: 'Feature 1', value: 'feat1' },
        { name: 'Feature 2', value: 'feat2' },
      ];

      const prompt = createMultiSelectPrompt('features', 'Select features', choices, ['feat1']);

      expect(prompt.type).toBe('checkbox');
      expect(prompt.name).toBe('features');
      expect(prompt.choices).toHaveLength(2);
      expect(prompt.choices[0].checked).toBe(true);
      expect(prompt.choices[1].checked).toBe(false);
    });

    it('should create confirm prompt', () => {
      const prompt = createConfirmPrompt('confirm', 'Proceed?', true);

      expect(prompt.type).toBe('confirm');
      expect(prompt.name).toBe('confirm');
      expect(prompt.message).toBe('Proceed?');
      expect(prompt.default).toBe(true);
    });

    it('should create number prompt', () => {
      const prompt = createNumberPrompt('port', 'Enter port', 3000);

      expect(prompt.type).toBe('number');
      expect(prompt.name).toBe('port');
      expect(prompt.default).toBe(3000);
    });

    it('should create number prompt with min validation', () => {
      const prompt = createNumberPrompt('age', 'Enter age', undefined, 'min:18');

      expect(prompt.validate).toBeDefined();
      expect(prompt.validate(17)).toContain('at least 18');
      expect(prompt.validate(18)).toBe(true);
    });

    it('should create number prompt with max validation', () => {
      const prompt = createNumberPrompt('percent', 'Enter percent', undefined, 'max:100');

      expect(prompt.validate).toBeDefined();
      expect(prompt.validate(101)).toContain('at most 100');
      expect(prompt.validate(100)).toBe(true);
    });
  });

  describe('Answer Validation', () => {
    it('should validate required text answer', () => {
      const result = validateAnswer('', 'required');
      expect(result).toBe('This field is required');
    });

    it('should validate valid text answer', () => {
      const result = validateAnswer('test', 'required');
      expect(result).toBe(true);
    });

    it('should validate email format', () => {
      const invalidResult = validateAnswer('not-an-email', 'email');
      expect(typeof invalidResult).toBe('string');
      expect(invalidResult).toContain('email');

      const validResult = validateAnswer('test@example.com', 'email');
      expect(validResult).toBe(true);
    });

    it('should validate minimum length', () => {
      const result = validateAnswer('ab', 'min:3');
      expect(typeof result).toBe('string');
      expect(result).toContain('3');
    });

    it('should validate number format', () => {
      const result = validateAnswer('not-a-number', 'number');
      expect(typeof result).toBe('string');
      expect(result).toContain('number');

      const validResult = validateAnswer('42', 'number');
      expect(validResult).toBe(true);
    });

    it('should allow valid values without validation', () => {
      const result = validateAnswer('any value', undefined);
      expect(result).toBe(true);
    });
  });
});
