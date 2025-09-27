#!/usr/bin/env node

// Quick fix script to address build issues for performance benchmarking
const fs = require('fs');
const path = require('path');

console.log('Applying build fixes for performance benchmarking...');

// Fix 1: Comment out unused imports in OptimizedApp.tsx
const appPath = './src/OptimizedApp.tsx';
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');

  // Comment out unused lazy imports
  content = content.replace(
    /^\s*LazyInteractiveHero3D,$/m,
    '  // LazyInteractiveHero3D,'
  );
  content = content.replace(
    /^\s*LazySacredGeometry,$/m,
    '  // LazySacredGeometry,'
  );
  content = content.replace(
    /^\s*LazyVJCareerGame3D,$/m,
    '  // LazyVJCareerGame3D,'
  );

  // Fix critical priority type
  content = content.replace(
    /priority: 'critical'/g,
    'priority: "high"'
  );

  // Comment out PerformanceMonitor usage
  content = content.replace(
    /^\s*<PerformanceMonitor.*$/m,
    '        {/* <PerformanceMonitor'
  );
  content = content.replace(
    /^\s*\/>$/m,
    '        /> */}'
  );

  fs.writeFileSync(appPath, content);
  console.log('✓ Fixed OptimizedApp.tsx');
}

// Fix 2: Fix bundle monitor plugin
const bundleMonitorPath = './vite-plugins/bundle-monitor.ts';
if (fs.existsSync(bundleMonitorPath)) {
  let content = fs.readFileSync(bundleMonitorPath, 'utf8');
  content = content.replace(
    /options\./g,
    '_options.'
  );
  fs.writeFileSync(bundleMonitorPath, content);
  console.log('✓ Fixed bundle-monitor.ts');
}

console.log('Build fixes applied. Ready for performance benchmarking.');