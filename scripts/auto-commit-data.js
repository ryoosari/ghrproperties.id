#!/usr/bin/env node

/**
 * Auto Commit Data Changes
 * 
 * This script automatically commits and pushes any changes in the data directory.
 * It is designed to be called after the data export script runs.
 */

const { execSync } = require('child_process');

// Function to run shell commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return "";
  }
}

// Check if there are any changes in the data directory
function hasChanges() {
  const output = runCommand('git status --porcelain data/');
  return output.trim().length > 0;
}

// Main function
function autoCommitData() {
  console.log('🔍 Checking for changes in data directory...');
  
  if (!hasChanges()) {
    console.log('ℹ️ No changes detected in data files');
    return;
  }
  
  console.log('✅ Changes detected in data files');
  
  // Stage changes
  console.log('📋 Staging changes...');
  runCommand('git add data/');
  
  // Show what's being committed
  const diff = runCommand('git diff --staged --stat');
  console.log('\n📊 Changes to be committed:');
  console.log(diff);
  
  // Commit with timestamp
  const date = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const commitMessage = `Update Strapi data export - ${date} [Auto]`;
  
  console.log(`\n💾 Committing changes with message: "${commitMessage}"`);
  runCommand(`git commit -m "${commitMessage}"`);
  
  console.log('✅ Data committed successfully!');
  console.log('\nℹ️ You can push these changes to GitHub with:');
  console.log('  git push origin main');
}

// Run the main function
autoCommitData();