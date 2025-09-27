#!/usr/bin/env node

const fs = require('fs');
const http = require('http');

console.log('🎮 RUNTIME PERFORMANCE ANALYSIS');
console.log('===============================\n');

// Analyze the served application
async function analyzeRuntime() {
  const results = {
    loadTime: {},
    resourceAnalysis: {},
    performanceMetrics: {},
    optimizations: {}
  };

  // 1. Analyze HTML and initial load
  console.log('📄 INITIAL LOAD ANALYSIS');
  console.log('------------------------');

  const htmlContent = fs.readFileSync('./dist/index.html', 'utf8');

  // Count script tags
  const scriptTags = htmlContent.match(/<script[^>]*>/g) || [];
  const linkTags = htmlContent.match(/<link[^>]*>/g) || [];

  console.log(`📄 HTML Size: ${Buffer.byteLength(htmlContent, 'utf8')} bytes`);
  console.log(`📜 Script Tags: ${scriptTags.length}`);
  console.log(`🔗 Link Tags: ${linkTags.length}`);

  // Check for preload/prefetch
  const hasPreload = htmlContent.includes('rel="preload"');
  const hasPrefetch = htmlContent.includes('rel="prefetch"');
  console.log(`⚡ Preload Resources: ${hasPreload ? '✅' : '❌'}`);
  console.log(`🔮 Prefetch Resources: ${hasPrefetch ? '✅' : '❌'}`);

  // 2. Analyze JavaScript chunks for runtime efficiency
  console.log('\n🚀 JAVASCRIPT RUNTIME ANALYSIS');
  console.log('------------------------------');

  const distPath = './dist/assets';
  const files = fs.readdirSync(distPath);

  let asyncChunks = 0;
  let lazyLoadingImplemented = false;

  files.forEach(file => {
    if (file.endsWith('.js') && !file.endsWith('.map')) {
      const content = fs.readFileSync(`${distPath}/${file}`, 'utf8');

      // Check for lazy loading patterns
      if (content.includes('import(') || content.includes('lazy(')) {
        lazyLoadingImplemented = true;
      }

      // Check for async chunks
      if (content.includes('webpackChunkName') || content.includes('chunk-')) {
        asyncChunks++;
      }

      // Analyze Three.js specific optimizations
      if (file.includes('three')) {
        const hasInstancedMesh = content.includes('InstancedMesh');
        const hasLOD = content.includes('LOD');
        const hasBufferGeometry = content.includes('BufferGeometry');

        console.log(`🎲 Three.js Optimizations in ${file}:`);
        console.log(`  Instanced Meshes: ${hasInstancedMesh ? '✅' : '❌'}`);
        console.log(`  Level of Detail: ${hasLOD ? '✅' : '❌'}`);
        console.log(`  Buffer Geometry: ${hasBufferGeometry ? '✅' : '❌'}`);
      }
    }
  });

  console.log(`🔄 Lazy Loading: ${lazyLoadingImplemented ? '✅' : '❌'}`);
  console.log(`📦 Async Chunks: ${asyncChunks}`);

  // 3. Memory efficiency analysis
  console.log('\n🧠 MEMORY EFFICIENCY ANALYSIS');
  console.log('-----------------------------');

  // Analyze for memory leaks prevention
  const mainJS = files.find(f => f.includes('index-') && f.endsWith('.js'));
  if (mainJS) {
    const content = fs.readFileSync(`${distPath}/${mainJS}`, 'utf8');

    const hasCleanup = content.includes('cleanup') || content.includes('dispose');
    const hasEventListenerRemoval = content.includes('removeEventListener');
    const hasRequestAnimationFrame = content.includes('requestAnimationFrame');
    const hasCancelAnimationFrame = content.includes('cancelAnimationFrame');

    console.log(`🧹 Cleanup Patterns: ${hasCleanup ? '✅' : '❌'}`);
    console.log(`👂 Event Cleanup: ${hasEventListenerRemoval ? '✅' : '❌'}`);
    console.log(`🎬 RAF Usage: ${hasRequestAnimationFrame ? '✅' : '❌'}`);
    console.log(`⏹️  RAF Cleanup: ${hasCancelAnimationFrame ? '✅' : '❌'}`);
  }

  // 4. Network performance simulation
  console.log('\n🌐 NETWORK PERFORMANCE SIMULATION');
  console.log('---------------------------------');

  const totalSize = files.reduce((acc, file) => {
    if (!file.endsWith('.map')) {
      const stats = fs.statSync(`${distPath}/${file}`);
      return acc + stats.size;
    }
    return acc;
  }, 0);

  const htmlSize = Buffer.byteLength(htmlContent, 'utf8');
  const totalWithHTML = totalSize + htmlSize;

  // Simulate different network conditions
  const networkSims = {
    'Fast 3G': { speed: 1.6 * 1024 * 1024 / 8, latency: 150 }, // 1.6 Mbps
    'Slow 3G': { speed: 400 * 1024 / 8, latency: 400 },        // 400 kbps
    'WiFi': { speed: 30 * 1024 * 1024 / 8, latency: 30 },      // 30 Mbps
    'Cable': { speed: 100 * 1024 * 1024 / 8, latency: 10 }     // 100 Mbps
  };

  console.log('Estimated Load Times:');
  Object.entries(networkSims).forEach(([name, { speed, latency }]) => {
    const downloadTime = (totalWithHTML / speed) * 1000; // ms
    const totalTime = downloadTime + latency;
    console.log(`  ${name.padEnd(8)}: ${Math.round(totalTime)}ms (download) + ${latency}ms (latency) = ${Math.round(totalTime + latency)}ms`);
  });

  // 5. FPS and animation performance analysis
  console.log('\n🎯 ANIMATION PERFORMANCE ANALYSIS');
  console.log('---------------------------------');

  const animationFiles = files.filter(f =>
    f.includes('ui-') || f.includes('three-') || f.includes('index-')
  );

  let performanceOptimizations = {
    useCallback: false,
    useMemo: false,
    requestAnimationFrame: false,
    performanceNow: false,
    fpsLimiting: false
  };

  animationFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const content = fs.readFileSync(`${distPath}/${file}`, 'utf8');

      if (content.includes('useCallback')) performanceOptimizations.useCallback = true;
      if (content.includes('useMemo')) performanceOptimizations.useMemo = true;
      if (content.includes('requestAnimationFrame')) performanceOptimizations.requestAnimationFrame = true;
      if (content.includes('performance.now')) performanceOptimizations.performanceNow = true;
      if (content.includes('fps') || content.includes('frameRate')) performanceOptimizations.fpsLimiting = true;
    }
  });

  console.log('React Performance Optimizations:');
  Object.entries(performanceOptimizations).forEach(([opt, enabled]) => {
    console.log(`  ${opt.padEnd(20)}: ${enabled ? '✅' : '❌'}`);
  });

  // 6. Performance score calculation
  console.log('\n⭐ RUNTIME PERFORMANCE SCORE');
  console.log('============================');

  let score = 0;
  let maxScore = 100;

  // Load time score (25 points)
  const avgLoadTime = Object.values(networkSims).reduce((acc, { speed, latency }) => {
    return acc + ((totalWithHTML / speed) * 1000 + latency);
  }, 0) / Object.keys(networkSims).length;

  if (avgLoadTime < 1000) score += 25;
  else if (avgLoadTime < 2000) score += 20;
  else if (avgLoadTime < 3000) score += 15;
  else if (avgLoadTime < 5000) score += 10;
  else score += 5;

  // Optimization score (25 points)
  const optimizationCount = Object.values(performanceOptimizations).filter(Boolean).length;
  score += Math.round((optimizationCount / Object.keys(performanceOptimizations).length) * 25);

  // Lazy loading score (25 points)
  if (lazyLoadingImplemented) score += 25;
  else score += 5;

  // Code splitting score (25 points)
  if (asyncChunks >= 3) score += 25;
  else if (asyncChunks >= 2) score += 20;
  else if (asyncChunks >= 1) score += 15;
  else score += 5;

  console.log(`Final Score: ${score}/${maxScore}`);

  if (score >= 90) console.log('🏆 EXCELLENT - Optimal runtime performance!');
  else if (score >= 75) console.log('🎯 GOOD - Well optimized with minor room for improvement');
  else if (score >= 60) console.log('⚠️  FAIR - Some optimizations implemented, more needed');
  else console.log('❌ POOR - Significant runtime optimizations required');

  return {
    score,
    avgLoadTime: Math.round(avgLoadTime),
    optimizations: performanceOptimizations,
    lazyLoading: lazyLoadingImplemented,
    asyncChunks
  };
}

// Run the analysis
analyzeRuntime().then(results => {
  console.log('\n📋 RUNTIME PERFORMANCE SUMMARY');
  console.log('==============================');
  console.log(`Overall Score: ${results.score}/100`);
  console.log(`Average Load Time: ${results.avgLoadTime}ms`);
  console.log(`Lazy Loading: ${results.lazyLoading ? 'Implemented' : 'Not Implemented'}`);
  console.log(`Async Chunks: ${results.asyncChunks}`);

  console.log('\n🎯 KEY OPTIMIZATIONS DETECTED');
  console.log('=============================');
  Object.entries(results.optimizations).forEach(([opt, enabled]) => {
    console.log(`${enabled ? '✅' : '❌'} ${opt}`);
  });

  console.log('\n📈 RECOMMENDATIONS FOR FURTHER OPTIMIZATION');
  console.log('==========================================');
  if (results.avgLoadTime > 2000) {
    console.log('🔧 Implement service worker for caching');
    console.log('🔧 Add resource hints (preload, prefetch)');
  }
  if (!results.lazyLoading) {
    console.log('🔧 Implement lazy loading for components');
  }
  if (results.asyncChunks < 3) {
    console.log('🔧 Increase code splitting granularity');
  }
  console.log('🔧 Consider implementing virtual scrolling for large lists');
  console.log('🔧 Add performance monitoring in production');
  console.log('🔧 Implement critical CSS inlining');
  console.log('🔧 Consider adding Web Workers for heavy computations');
});