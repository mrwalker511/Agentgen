/**
 * Node.js pack verifier
 * This script verifies Node.js dependencies using npm/pnpm/yarn
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute a command and return result
 */
function executeCommand(command, cwd) {
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000, // 5 minutes
    });
    return {
      success: true,
      output: result.toString(),
      exitCode: 0,
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout?.toString() || '',
      error: error.stderr?.toString() || error.message,
      exitCode: error.status || 1,
    };
  }
}

/**
 * Detect package manager
 */
function detectPackageManager(projectPath) {
  const pnpmLockPath = path.join(projectPath, 'pnpm-lock.yaml');
  const yarnLockPath = path.join(projectPath, 'yarn.lock');
  
  if (fs.existsSync(pnpmLockPath)) {
    return 'pnpm';
  }
  if (fs.existsSync(yarnLockPath)) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * Verify Node.js dependencies
 */
async function verifyDependencies(projectPath, options = {}) {
  const { skipTests = false, verbose = false } = options;
  
  console.log(`Verifying Node.js project at: ${projectPath}`);
  
  const packageManager = detectPackageManager(projectPath);
  console.log(`Detected package manager: ${packageManager}`);
  
  const steps = [
    {
      name: 'Install Dependencies',
      command: `${packageManager} install`,
    },
    {
      name: 'Verify Dependencies',
      command: `${packageManager} ls`,
    },
  ];
  
  if (!skipTests) {
    steps.push({
      name: 'Run Tests',
      command: `${packageManager} test`,
    });
  }
  
  const results = [];
  let overallSuccess = true;
  
  for (const step of steps) {
    console.log(`\nRunning: ${step.name}`);
    if (verbose) {
      console.log(`Command: ${step.command}`);
    }
    
    const startTime = Date.now();
    const result = executeCommand(step.command, projectPath);
    const duration = Date.now() - startTime;
    
    const stepResult = {
      name: step.name,
      command: step.command,
      success: result.success,
      exitCode: result.exitCode,
      output: result.output,
      error: result.error,
      duration,
    };
    
    results.push(stepResult);
    
    if (result.success) {
      console.log(`✓ ${step.name} passed (${duration}ms)`);
    } else {
      console.log(`✗ ${step.name} failed (${duration}ms)`);
      if (result.error && !verbose) {
        const errorLines = result.error.split('\n').slice(0, 3);
        errorLines.forEach(line => console.log(`  Error: ${line}`));
        if (result.error.split('\n').length > 3) {
          console.log(`  ... (${result.error.split('\n').length - 3} more lines)`);
        }
      }
      overallSuccess = false;
      if (!options.continueOnError) {
        break;
      }
    }
  }
  
  const totalDuration = results.reduce((sum, step) => sum + step.duration, 0);
  
  return {
    success: overallSuccess,
    ecosystem: 'node',
    packageManager,
    steps: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: totalDuration,
    },
  };
}

/**
 * Main verification function
 */
async function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || process.cwd();
  
  const options = {
    skipTests: args.includes('--skip-tests'),
    verbose: args.includes('--verbose'),
    continueOnError: args.includes('--continue-on-error'),
  };
  
  try {
    const result = await verifyDependencies(projectPath, options);
    
    console.log('\n' + '='.repeat(50));
    console.log('Verification Summary');
    console.log('='.repeat(50));
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Total: ${result.summary.total}, Passed: ${result.summary.passed}, Failed: ${result.summary.failed}`);
    console.log(`Duration: ${(result.summary.duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
}

// Export for use by agentgen
module.exports = {
  verifyDependencies,
  detectPackageManager,
};

// Run main if executed directly
if (require.main === module) {
  main();
}