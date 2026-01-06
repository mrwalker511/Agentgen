/**
 * CLI output formatting utilities
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green(''), message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.error(chalk.red(''), message);
}

/**
 * Print warning message
 */
export function warn(message: string): void {
  console.warn(chalk.yellow(' '), message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('9'), message);
}

/**
 * Print heading
 */
export function heading(message: string): void {
  console.log();
  console.log(chalk.bold.cyan(message));
  console.log();
}

/**
 * Print subheading
 */
export function subheading(message: string): void {
  console.log(chalk.bold(message));
}

/**
 * Create a spinner
 */
export function spinner(text: string): Ora {
  return ora(text).start();
}

/**
 * Print blank line
 */
export function blank(): void {
  console.log();
}

/**
 * Print next steps
 */
export function nextSteps(steps: string[]): void {
  blank();
  heading('Next steps:');
  steps.forEach((step, index) => {
    console.log(chalk.gray(`  ${index + 1}.`), step);
  });
  blank();
}
