/**
 * Dependency verification types
 */

/**
 * Verification step result
 */
export interface VerificationStep {
  name: string;
  command: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: string;
  error?: string;
  exitCode?: number;
}

/**
 * Complete verification report
 */
export interface VerificationReport {
  version: string;
  timestamp: string;
  projectPath: string;
  ecosystem: string;
  status: 'success' | 'failed';
  steps: VerificationStep[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

/**
 * Verification options
 */
export interface VerificationOptions {
  projectPath: string;
  skipTests?: boolean;
  verbose?: boolean;
}
