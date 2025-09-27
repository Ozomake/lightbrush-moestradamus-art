import type { Plugin } from 'vite';
import { bundleAnalyzer, type PerformanceBudget } from '../src/monitoring/BundleAnalyzer';
import fs from 'fs';
import path from 'path';

interface BundleMonitorOptions {
  performanceBudget?: Partial<PerformanceBudget>;
  outputPath?: string;
  enableReport?: boolean;
  failOnError?: boolean;
}

export function bundleMonitor(_options: BundleMonitorOptions = {}): Plugin {
  const {
    performanceBudget,
    outputPath = 'dist/bundle-analysis.json',
    enableReport = true,
    failOnError = false
  } = _options;

  return {
    name: 'bundle-monitor',
    apply: 'build',
    writeBundle(_bundleOptions, bundle) {
      // Convert bundle to analysis format
      const chunks = Object.values(bundle)
        .filter(chunk => chunk.type === 'chunk')
        .map(chunk => ({
          name: chunk.name,
          size: chunk.code ? Buffer.byteLength(chunk.code, 'utf8') : 0,
          modules: Object.keys(chunk.modules || {}),
          isEntry: chunk.isEntry,
          isDynamicEntry: chunk.isDynamicEntry
        }));

      const assets = Object.values(bundle)
        .filter(chunk => chunk.type === 'asset')
        .map(asset => ({
          name: asset.fileName,
          size: asset.source ? Buffer.byteLength(asset.source) : 0
        }));

      // Create build stats object
      const buildStats = {
        chunks,
        assets: [
          ...assets,
          ...chunks.map(chunk => ({
            name: `${chunk.name}.js`,
            size: chunk.size
          }))
        ]
      };

      // Analyze bundle
      const analysis = bundleAnalyzer.analyzeBuild(buildStats, performanceBudget);

      // Save analysis to file
      if (outputPath) {
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
      }

      // Log analysis
      if (enableReport) {
        bundleAnalyzer.logAnalysis(analysis);
      }

      // Fail build if there are critical violations
      if (failOnError && analysis.violations.some(v => v.severity === 'error')) {
        throw new Error(`Bundle size budget exceeded! Check ${outputPath} for details.`);
      }

      // Log bundle composition
      console.log('\n📦 Bundle Composition:');

      const jsAssets = analysis.assets.filter(a => a.type === 'js');
      if (jsAssets.length > 0) {
        console.log('JavaScript files:');
        jsAssets
          .sort((a, b) => b.size - a.size)
          .slice(0, 10) // Top 10 largest JS files
          .forEach(asset => {
            const sizeKB = (asset.size / 1024).toFixed(2);
            console.log(`  ${asset.name}: ${sizeKB} KB`);
          });
      }

      const cssAssets = analysis.assets.filter(a => a.type === 'css');
      if (cssAssets.length > 0) {
        console.log('CSS files:');
        cssAssets.forEach(asset => {
          const sizeKB = (asset.size / 1024).toFixed(2);
          console.log(`  ${asset.name}: ${sizeKB} KB`);
        });
      }

      const imageAssets = analysis.assets.filter(a => a.type === 'image');
      if (imageAssets.length > 5) {
        console.log(`Images: ${imageAssets.length} files (${((imageAssets.reduce((sum, a) => sum + a.size, 0)) / 1024).toFixed(2)} KB total)`);
      } else if (imageAssets.length > 0) {
        console.log('Images:');
        imageAssets.forEach(asset => {
          const sizeKB = (asset.size / 1024).toFixed(2);
          console.log(`  ${asset.name}: ${sizeKB} KB`);
        });
      }

      // Log treeshaking effectiveness
      const totalBundleSize = analysis.totalSize;
      const estimatedSourceSize = totalBundleSize * 2.5; // Rough estimate
      const treeshakingEffectiveness = ((estimatedSourceSize - totalBundleSize) / estimatedSourceSize * 100);

      console.log(`\n🌳 Estimated tree-shaking effectiveness: ${treeshakingEffectiveness.toFixed(1)}%`);

      // Performance insights
      console.log('\n⚡ Performance Insights:');
      console.log(`- Total bundle size: ${(totalBundleSize / 1024).toFixed(2)} KB`);
      console.log(`- Estimated gzipped: ${(totalBundleSize * 0.3 / 1024).toFixed(2)} KB`);
      console.log(`- Load time (3G): ~${((totalBundleSize * 0.3) / (50 * 1024)).toFixed(1)}s`);
      console.log(`- Load time (4G): ~${((totalBundleSize * 0.3) / (150 * 1024)).toFixed(1)}s`);
    }
  };
}