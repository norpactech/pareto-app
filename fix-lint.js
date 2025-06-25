#!/usr/bin/env node

// Batch fix script for Angular ESLint issues
// This script addresses the most common linting issues

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/auth/components/sign-in/sign-in.component.ts',
  'src/app/auth/components/sign-up/sign-up.component.ts',
  'src/app/auth/components/forgot-password/forgot-password.component.ts',
  'src/app/auth/guards/auth.guard.ts',
  'src/app/auth/guards/profile-complete.guard.ts',
  'src/app/user/services/user.service.ts'
];

// Common replacements for inject() pattern
const injectReplacements = [
  {
    pattern: /constructor\(\s*private\s+(\w+):\s*(\w+)\s*\)\s*\{\}/g,
    replacement: 'private $1 = inject($2);'
  },
  {
    pattern: /import\s*\{\s*Component\s*\}/g,
    replacement: 'import { Component, inject }'
  },
  {
    pattern: /import\s*\{\s*Injectable\s*\}/g,
    replacement: 'import { Injectable, inject }'
  }
];

// Type replacements
const typeReplacements = [
  {
    pattern: /:\s*any\b/g,
    replacement: ': unknown'
  },
  {
    pattern: /Record<string,\s*any>/g,
    replacement: 'Record<string, unknown>'
  }
];

console.log('🚀 Starting batch lint fixes...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply inject replacements
    injectReplacements.forEach(({pattern, replacement}) => {
      content = content.replace(pattern, replacement);
    });
    
    // Apply type replacements
    typeReplacements.forEach(({pattern, replacement}) => {
      content = content.replace(pattern, replacement);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  }
});

console.log('🎉 Batch fixes complete!');
