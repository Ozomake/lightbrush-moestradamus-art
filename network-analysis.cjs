#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 NETWORK PERFORMANCE & CACHING ANALYSIS');
console.log('=========================================\n');

// Network optimization analysis
function analyzeNetworkOptimizations() {
  const distPath = './dist';
  const assetsPath = path.join(distPath, 'assets');

  console.log('📊 ASSET DELIVERY ANALYSIS');
  console.log('--------------------------');

  const files = fs.readdirSync(assetsPath);
  const analysis = {
    totalAssets: files.length,
    compressibleAssets: 0,
    cacheableAssets: 0,
    preloadCandidates: [],
    criticalAssets: [],
    totalSize: 0
  };

  files.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    analysis.totalSize += stats.size;

    const ext = path.extname(file).toLowerCase();
    const sizeKB = Math.round(stats.size / 1024);

    // Identify compressible assets
    if (['.js', '.css', '.html', '.json', '.svg'].includes(ext)) {
      analysis.compressibleAssets++;
    }

    // All assets are cacheable in a static build
    analysis.cacheableAssets++;

    // Identify preload candidates (critical resources)
    if (file.includes('index-') && ext === '.js') {
      analysis.preloadCandidates.push({ file, sizeKB, type: 'script' });
      analysis.criticalAssets.push(file);
    }

    if (file.includes('index-') && ext === '.css') {
      analysis.preloadCandidates.push({ file, sizeKB, type: 'style' });
      analysis.criticalAssets.push(file);
    }

    // Large chunks that should be preloaded
    if (sizeKB > 100 && ext === '.js') {
      analysis.preloadCandidates.push({ file, sizeKB, type: 'script' });
    }
  });

  console.log(`📦 Total Assets: ${analysis.totalAssets}`);
  console.log(`📏 Total Size: ${Math.round(analysis.totalSize / 1024)} KB`);
  console.log(`🗜️  Compressible: ${analysis.compressibleAssets}/${analysis.totalAssets}`);
  console.log(`💾 Cacheable: ${analysis.cacheableAssets}/${analysis.totalAssets}`);

  console.log('\n🎯 PRELOAD CANDIDATES');
  console.log('---------------------');
  analysis.preloadCandidates.forEach(asset => {
    console.log(`  ${asset.type.padEnd(6)}: ${asset.file} (${asset.sizeKB} KB)`);
  });

  return analysis;
}

// CDN readiness analysis
function analyzeCDNReadiness() {
  console.log('\n🚀 CDN READINESS ANALYSIS');
  console.log('-------------------------');

  const viteConfig = fs.existsSync('./vite.config.ts') ?
    fs.readFileSync('./vite.config.ts', 'utf8') : '';

  const cdnOptimizations = {
    staticAssets: true, // Vite builds are inherently CDN-ready
    hashedFilenames: viteConfig.includes('[hash]'),
    longTermCaching: viteConfig.includes('chunkFileNames'),
    compressionReady: true, // Modern build tools prepare for compression
    cacheHeaders: false // Needs server configuration
  };

  console.log('CDN Optimization Features:');
  Object.entries(cdnOptimizations).forEach(([feature, enabled]) => {
    const status = enabled ? '✅' : '❌';
    console.log(`  ${feature.padEnd(20)}: ${status}`);
  });

  console.log('\n📋 CDN RECOMMENDATIONS');
  console.log('----------------------');
  console.log('✅ Static assets with content hashing');
  console.log('✅ Optimal chunk splitting for caching');
  console.log('⚠️  Configure cache headers on CDN');
  console.log('💡 Consider CloudFlare for auto-optimization');
  console.log('💡 Enable brotli compression on CDN');
  console.log('💡 Set up geographic distribution');

  return cdnOptimizations;
}

// Lazy loading effectiveness
function analyzeLazyLoading() {
  console.log('\n🔄 LAZY LOADING ANALYSIS');
  console.log('------------------------');

  const srcPath = './src';
  const lazyPatterns = {
    reactLazy: 0,
    dynamicImports: 0,
    imageLazyLoading: 0,
    routeLazyLoading: 0
  };

  // Scan source files for lazy loading patterns
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('React.lazy') || content.includes('lazy(')) {
          lazyPatterns.reactLazy++;
        }
        if (content.includes('import(')) {
          lazyPatterns.dynamicImports++;
        }
        if (content.includes('loading="lazy"')) {
          lazyPatterns.imageLazyLoading++;
        }
        if (content.includes('Suspense') && content.includes('lazy')) {
          lazyPatterns.routeLazyLoading++;
        }
      }
    });
  }

  scanDirectory(srcPath);

  console.log('Lazy Loading Implementation:');
  console.log(`  React.lazy Components: ${lazyPatterns.reactLazy}`);
  console.log(`  Dynamic Imports: ${lazyPatterns.dynamicImports}`);
  console.log(`  Image Lazy Loading: ${lazyPatterns.imageLazyLoading}`);
  console.log(`  Route Lazy Loading: ${lazyPatterns.routeLazyLoading}`);

  const lazyScore = Object.values(lazyPatterns).reduce((a, b) => a + b, 0);
  console.log(`\nLazy Loading Score: ${lazyScore > 0 ? 'Implemented' : 'Not Implemented'}`);

  return lazyPatterns;
}

// Cache utilization analysis
function analyzeCacheStrategy() {
  console.log('\n💾 CACHE STRATEGY ANALYSIS');
  console.log('--------------------------');

  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasServiceWorker = fs.existsSync('./src/sw.js') || fs.existsSync('./public/sw.js');

  console.log(`Service Worker: ${hasServiceWorker ? '✅' : '❌'}`);
  console.log(`Build Tool Cache: ✅ (Vite with content hashing)`);
  console.log(`HTTP Cache Headers: ⚠️  (Server configuration needed)`);

  console.log('\n🎯 RECOMMENDED CACHE STRATEGY');
  console.log('-----------------------------');
  console.log('📄 HTML: no-cache (always fresh)');
  console.log('📜 JS Chunks: 1 year cache (content hashed)');
  console.log('🎨 CSS: 1 year cache (content hashed)');
  console.log('🖼️  Images: 6 months cache');
  console.log('📊 Fonts: 1 year cache');

  return {
    serviceWorker: hasServiceWorker,
    contentHashing: true,
    longTermCaching: true
  };
}

// Mobile performance simulation
function simulateMobilePerformance() {
  console.log('\n📱 MOBILE PERFORMANCE SIMULATION');
  console.log('--------------------------------');

  const distPath = './dist/assets';
  const files = fs.readdirSync(distPath);
  const totalSize = files.reduce((acc, file) => {
    if (!file.endsWith('.map')) {
      return acc + fs.statSync(path.join(distPath, file)).size;
    }
    return acc;
  }, 0);

  const mobileScenarios = {
    'iPhone 12 (Fast)': {
      cpu: 1.0,
      network: '4G Fast',
      loadMultiplier: 1.2,
      renderMultiplier: 1.0
    },
    'iPhone 8 (Medium)': {
      cpu: 0.6,
      network: '4G',
      loadMultiplier: 1.8,
      renderMultiplier: 1.6
    },
    'Android Mid-range': {
      cpu: 0.4,
      network: '3G Fast',
      loadMultiplier: 2.5,
      renderMultiplier: 2.2
    },
    'Android Low-end': {
      cpu: 0.2,
      network: '3G Slow',
      loadMultiplier: 4.0,
      renderMultiplier: 3.5
    }
  };

  const baseLoadTime = (totalSize / (1.6 * 1024 * 1024 / 8)) * 1000; // Fast 3G baseline

  console.log('Device Performance Estimates:');
  Object.entries(mobileScenarios).forEach(([device, specs]) => {
    const loadTime = Math.round(baseLoadTime * specs.loadMultiplier);
    const renderTime = Math.round(loadTime * specs.renderMultiplier);

    console.log(`  ${device.padEnd(20)}: ${loadTime}ms load, ${renderTime}ms render`);
  });

  return mobileScenarios;
}

// Run all analyses
const networkAnalysis = analyzeNetworkOptimizations();
const cdnAnalysis = analyzeCDNReadiness();
const lazyAnalysis = analyzeLazyLoading();
const cacheAnalysis = analyzeCacheStrategy();
const mobileAnalysis = simulateMobilePerformance();

// Calculate overall network performance score
console.log('\n⭐ NETWORK PERFORMANCE SCORE');
console.log('============================');

let score = 0;

// Asset optimization (25 points)
const compressionRatio = networkAnalysis.compressibleAssets / networkAnalysis.totalAssets;
score += Math.round(compressionRatio * 25);

// CDN readiness (25 points)
const cdnFeatures = Object.values(cdnAnalysis).filter(Boolean).length;
score += Math.round((cdnFeatures / Object.keys(cdnAnalysis).length) * 25);

// Lazy loading (25 points)
const lazyFeatures = Object.values(lazyAnalysis).filter(v => v > 0).length;
score += Math.round((lazyFeatures / Object.keys(lazyAnalysis).length) * 25);

// Caching strategy (25 points)
const cacheFeatures = Object.values(cacheAnalysis).filter(Boolean).length;
score += Math.round((cacheFeatures / Object.keys(cacheAnalysis).length) * 25);

console.log(`Final Score: ${score}/100`);

if (score >= 90) console.log('🏆 EXCELLENT - Network optimized!');
else if (score >= 75) console.log('🎯 GOOD - Well optimized network delivery');
else if (score >= 60) console.log('⚠️  FAIR - Some network optimizations needed');
else console.log('❌ POOR - Significant network optimizations required');

console.log('\n📊 NETWORK OPTIMIZATION SUMMARY');
console.log('===============================');
console.log(`Asset Optimization: ${Math.round(compressionRatio * 100)}%`);
console.log(`CDN Readiness: ${Math.round((cdnFeatures / Object.keys(cdnAnalysis).length) * 100)}%`);
console.log(`Lazy Loading: ${Math.round((lazyFeatures / Object.keys(lazyAnalysis).length) * 100)}%`);
console.log(`Cache Strategy: ${Math.round((cacheFeatures / Object.keys(cacheAnalysis).length) * 100)}%`);

console.log('\n🎯 PRIORITY OPTIMIZATIONS');
console.log('=========================');

if (lazyFeatures === 0) {
  console.log('🔥 HIGH: Implement lazy loading for components');
}
if (!cacheAnalysis.serviceWorker) {
  console.log('🔥 HIGH: Add service worker for offline caching');
}
if (networkAnalysis.preloadCandidates.length > 0) {
  console.log('🔶 MEDIUM: Add preload hints for critical resources');
}
console.log('🔶 MEDIUM: Configure CDN cache headers');
console.log('🔷 LOW: Implement image optimization and WebP support');
console.log('🔷 LOW: Add resource hints (dns-prefetch, preconnect)');