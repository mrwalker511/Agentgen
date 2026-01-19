/**
 * Verification report utilities
 */

import { VerificationReport, VerificationStep } from './types.js';
import { writeFileSafe } from '../core/fs.js';
import { logger } from '../core/logger.js';

/**
 * Generate a human-readable summary from verification report
 */
export function generateVerificationSummary(report: VerificationReport): string {
  const lines: string[] = [];

  lines.push('Verification Report Summary');
  lines.push('='.repeat(40));
  lines.push(`Project: ${report.projectPath}`);
  lines.push(`Ecosystem: ${report.ecosystem}`);
  lines.push(`Status: ${report.status}`);
  lines.push(`Duration: ${(report.summary.duration / 1000).toFixed(2)}s`);
  lines.push('');
  lines.push(`Steps: ${report.summary.total} total`);
  lines.push(`  Passed: ${report.summary.passed}`);
  lines.push(`  Failed: ${report.summary.failed}`);
  lines.push(`  Skipped: ${report.summary.skipped}`);
  lines.push('');

  lines.push('Step Details:');
  lines.push('-'.repeat(40));

  for (const step of report.steps) {
    const statusIcon = getStatusIcon(step.status);
    const duration = step.duration ? `${step.duration}ms` : 'N/A';
    lines.push(`${statusIcon} ${step.name} (${duration})`);
    
    if (step.status === 'failed' && step.error) {
      const errorLines = step.error.split('\n').slice(0, 3); // Show first 3 lines
      errorLines.forEach(line => lines.push(`  Error: ${line}`));
      if (step.error.split('\n').length > 3) {
        lines.push(`  ... (${step.error.split('\n').length - 3} more lines)`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate a markdown report from verification results
 */
export function generateMarkdownReport(report: VerificationReport): string {
  const lines: string[] = [];

  lines.push('# Verification Report');
  lines.push('');
  lines.push(`**Project:** ${report.projectPath}`);
  lines.push(`**Ecosystem:** ${report.ecosystem}`);
  lines.push(`**Status:** ${report.status}`);
  lines.push(`**Timestamp:** ${report.timestamp}`);
  lines.push(`**Duration:** ${(report.summary.duration / 1000).toFixed(2)} seconds`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Steps | ${report.summary.total} |`);
  lines.push(`| Passed | ${report.summary.passed} |`);
  lines.push(`| Failed | ${report.summary.failed} |`);
  lines.push(`| Skipped | ${report.summary.skipped} |`);
  lines.push('');

  lines.push('## Step Details');
  lines.push('');

  for (const step of report.steps) {
    lines.push(`### ${step.name}`);
    lines.push('');
    lines.push(`**Status:** ${step.status}`);
    lines.push(`**Duration:** ${step.duration || 'N/A'}ms`);
    
    if (step.status === 'failed' && step.error) {
      lines.push('**Error:**');
      lines.push('```');
      lines.push(step.error);
      lines.push('```');
    }
    
    if (step.output) {
      lines.push('**Output:**');
      lines.push('```');
      lines.push(step.output);
      lines.push('```');
    }
    
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Save verification report to file
 */
export function saveVerificationReport(report: VerificationReport, filePath: string): void {
  const jsonContent = JSON.stringify(report, null, 2);
  writeFileSafe(filePath, jsonContent);
  logger.info(`Verification report saved to ${filePath}`);
}

/**
 * Get status icon for display
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✓';
    case 'failed': return '✗';
    case 'skipped': return '○';
    case 'running': return '→';
    default: return '?';
  }
}

/**
 * Format verification step for console output
 */
export function formatVerificationStep(step: VerificationStep): string {
  const statusIcon = getStatusIcon(step.status);
  const duration = step.duration ? `${step.duration}ms` : 'N/A';
  
  if (step.status === 'success') {
    return `${statusIcon} ${step.name} (${duration})`;
  } else if (step.status === 'failed') {
    return `${statusIcon} ${step.name} (${duration}) - Failed with exit code ${step.exitCode}`;
  } else if (step.status === 'skipped') {
    return `${statusIcon} ${step.name} - Skipped`;
  } else {
    return `${statusIcon} ${step.name} - ${step.status}`;
  }
}

/**
 * Generate a compact status report
 */
export function generateCompactReport(report: VerificationReport): string {
  const lines: string[] = [];

  lines.push(`Verification ${report.status}`);
  lines.push(`Total: ${report.summary.total}, Passed: ${report.summary.passed}, Failed: ${report.summary.failed}, Skipped: ${report.summary.skipped}`);
  lines.push(`Duration: ${(report.summary.duration / 1000).toFixed(2)}s`);

  return lines.join(' | ');
}