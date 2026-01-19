/**
 * Safe command execution utilities
 */

import { spawnSync } from 'child_process';
import { AgentgenError } from './errors.js';

export interface CommandResult {
  exitCode: number;
  output: string;
  error?: string;
}

const UNSAFE_SHELL_CHARS = /[;&|`$<>]/;
const UNSAFE_SHELL_SEQUENCES = /\|\||&&/;

function parseCommand(command: string): { file: string; args: string[] } {
  const trimmed = command.trim();

  if (trimmed.length === 0) {
    throw new AgentgenError('Command cannot be empty');
  }

  if (/[\r\n]/.test(trimmed)) {
    throw new AgentgenError('Command cannot contain newlines');
  }

  if (UNSAFE_SHELL_CHARS.test(trimmed) || UNSAFE_SHELL_SEQUENCES.test(trimmed)) {
    throw new AgentgenError(
      `Refusing to execute potentially unsafe command string: ${JSON.stringify(command)}`
    );
  }

  const parts = trimmed.split(/\s+/);
  const [file, ...args] = parts;

  if (!file) {
    throw new AgentgenError('Command could not be parsed');
  }

  return { file, args };
}

/**
 * Execute a command without invoking a shell.
 *
 * Notes:
 * - Accepts a simple whitespace-delimited command string.
 * - Rejects common shell metacharacters to avoid injection.
 */
export function executeCommand(command: string, cwd: string, verbose: boolean): CommandResult {
  const { file, args } = parseCommand(command);

  const result = spawnSync(file, args, {
    cwd,
    encoding: 'utf-8',
    shell: false,
    timeout: 300000,
    stdio: 'pipe',
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';

  if (verbose) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  }

  if (result.error) {
    return {
      exitCode: 1,
      output: stdout,
      error: result.error.message,
    };
  }

  return {
    exitCode: result.status ?? 0,
    output: stdout,
    error: stderr || undefined,
  };
}
