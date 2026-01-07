/**
 * Interview engine - conducts interactive interviews
 */

import inquirer from 'inquirer';
import * as path from 'path';
import { Pack } from '../packs/types.js';
import {
  InterviewDefinition,
  Question,
  AnswerSet,
  WhenCondition,
  QuestionChoice,
} from './types.js';
import { readFileString, pathExists } from '../core/fs.js';
import { PackLoadError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Load interview definition from pack
 */
export function loadInterviewDefinition(pack: Pack): InterviewDefinition {
  const interviewPath = path.join(pack.rootPath, 'interview.json');

  if (!pathExists(interviewPath)) {
    throw new PackLoadError(pack.metadata.id, 'interview.json not found');
  }

  try {
    const content = readFileString(interviewPath);
    return JSON.parse(content) as InterviewDefinition;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PackLoadError(pack.metadata.id, `Failed to parse interview.json: ${message}`);
  }
}

/**
 * Evaluate when condition
 */
function evaluateWhenCondition(condition: WhenCondition, answers: AnswerSet): boolean {
  const fieldValue = answers[condition.field];

  if (condition.equals !== undefined) {
    return fieldValue === condition.equals;
  }

  if (condition.notEquals !== undefined) {
    return fieldValue !== condition.notEquals;
  }

  if (condition.includes !== undefined && typeof fieldValue === 'string') {
    return fieldValue.includes(condition.includes);
  }

  return true;
}

/**
 * Check if question should be asked based on when condition
 */
function shouldAskQuestion(question: Question, answers: AnswerSet): boolean {
  if (!question.when) {
    return true;
  }

  return evaluateWhenCondition(question.when, answers);
}

/**
 * Validate answer based on validation rule
 */
function validateAnswer(value: unknown, validation: string | undefined): boolean | string {
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

  return true;
}

/**
 * Convert Question to Inquirer prompt
 */
function questionToInquirerPrompt(question: Question): any {
  const prompt: any = {
    type: question.type,
    name: question.id,
    message: question.message,
    default: question.default,
  };

  // Add choices for select/multiselect
  if (question.choices) {
    prompt.choices = question.choices.map((choice: QuestionChoice) => ({
      name: choice.name,
      value: choice.value,
    }));
  }

  // Add validation
  if (question.validate) {
    prompt.validate = (value: unknown) => validateAnswer(value, question.validate);
  }

  return prompt;
}

/**
 * Run interview and collect answers
 */
export async function runInterview(pack: Pack): Promise<AnswerSet> {
  logger.info(`Running interview for pack '${pack.metadata.id}'`);

  const definition = loadInterviewDefinition(pack);
  const answers: AnswerSet = {};

  for (const question of definition.questions) {
    // Check if question should be asked
    if (!shouldAskQuestion(question, answers)) {
      logger.debug(`Skipping question '${question.id}' (condition not met)`);
      continue;
    }

    // Convert to Inquirer prompt
    const prompt = questionToInquirerPrompt(question);

    // Ask question
    const response = await inquirer.prompt([prompt]);
    answers[question.id] = response[question.id];

    logger.debug(`Answer: ${question.id} = ${JSON.stringify(response[question.id])}`);
  }

  logger.info(`Interview complete: ${Object.keys(answers).length} answers collected`);
  return answers;
}
