// Bundle Size Analysis and Performance Budgets
interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  performanceBudget: PerformanceBudget;
  violations: BudgetViolation[];
  recommendations: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: ModuleInfo[];
  isEntry: boolean;
  isDynamic: boolean;
}

interface ModuleInfo {
  name: string;
  size: number;
  renderedLength: number;
  originalLength: number;
}

interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

interface PerformanceBudget {
  maxBundleSize: number; // KB
  maxChunkSize: number; // KB
  maxAssetSize: number; // KB
  maxJSSize: number; // KB
  maxCSSSize: number; // KB
  maxImageSize: number; // KB
}

interface BudgetViolation {
  type: 'bundle' | 'chunk' | 'asset' | 'js' | 'css' | 'image';
  name: string;
  actualSize: number;
  budgetSize: number;
  severity: 'warning' | 'error';
}

class BundleAnalyzer {
  private defaultBudget: PerformanceBudget = {
    maxBundleSize: 2000, // 2MB
    maxChunkSize: 500,   // 500KB
    maxAssetSize: 250,   // 250KB
    maxJSSize: 1500,     // 1.5MB
    maxCSSSize: 100,     // 100KB
    maxImageSize: 500    // 500KB per image
  };

  public analyzeBuild(buildStats: any, customBudget?: Partial<PerformanceBudget>): BundleAnalysis {
    const budget = { ...this.defaultBudget, ...customBudget };

    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      assets: [],
      performanceBudget: budget,
      violations: [],
      recommendations: []
    };

    if (buildStats.assets) {
      analysis.assets = this.analyzeAssets(buildStats.assets);
      analysis.totalSize = analysis.assets.reduce((sum, asset) => sum + asset.size, 0);
    }

    if (buildStats.chunks) {
      analysis.chunks = this.analyzeChunks(buildStats.chunks);
    }

    analysis.violations = this.checkBudgetViolations(analysis, budget);
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  private analyzeAssets(assets: any[]): AssetInfo[] {
    return assets.map(asset => ({
      name: asset.name,
      size: asset.size,
      type: this.getAssetType(asset.name)
    }));
  }

  private analyzeChunks(chunks: any[]): ChunkInfo[] {
    return chunks.map(chunk => ({
      name: chunk.name || chunk.id,
      size: chunk.size,
      gzippedSize: chunk.size * 0.3, // Estimated gzip ratio
      modules: chunk.modules ? chunk.modules.map((mod: any) => ({
        name: mod.name,
        size: mod.size,
        renderedLength: mod.renderedLength || mod.size,
        originalLength: mod.originalLength || mod.size
      })) : [],
      isEntry: chunk.entry,
      isDynamic: chunk.initial === false
    }));
  }

  private getAssetType(filename: string): AssetInfo['type'] {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'js';
      case 'css': return 'css';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp': return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot': return 'font';
      default: return 'other';
    }
  }

  private checkBudgetViolations(analysis: BundleAnalysis, budget: PerformanceBudget): BudgetViolation[] {
    const violations: BudgetViolation[] = [];

    // Check total bundle size
    if (analysis.totalSize > budget.maxBundleSize * 1024) {
      violations.push({
        type: 'bundle',
        name: 'Total Bundle',
        actualSize: analysis.totalSize,
        budgetSize: budget.maxBundleSize * 1024,
        severity: 'error'
      });
    }

    // Check individual chunks
    analysis.chunks.forEach(chunk => {
      if (chunk.size > budget.maxChunkSize * 1024) {
        violations.push({
          type: 'chunk',
          name: chunk.name,
          actualSize: chunk.size,
          budgetSize: budget.maxChunkSize * 1024,
          severity: chunk.isEntry ? 'error' : 'warning'
        });
      }
    });

    // Check assets by type
    const assetsByType = analysis.assets.reduce((acc, asset) => {
      if (!acc[asset.type]) acc[asset.type] = [];
      acc[asset.type].push(asset);
      return acc;
    }, {} as Record<AssetInfo['type'], AssetInfo[]>);

    // Check JS total size
    const totalJSSize = assetsByType.js?.reduce((sum, asset) => sum + asset.size, 0) || 0;
    if (totalJSSize > budget.maxJSSize * 1024) {
      violations.push({
        type: 'js',
        name: 'Total JavaScript',
        actualSize: totalJSSize,
        budgetSize: budget.maxJSSize * 1024,
        severity: 'error'
      });
    }

    // Check CSS total size
    const totalCSSSize = assetsByType.css?.reduce((sum, asset) => sum + asset.size, 0) || 0;
    if (totalCSSSize > budget.maxCSSSize * 1024) {
      violations.push({
        type: 'css',
        name: 'Total CSS',
        actualSize: totalCSSSize,
        budgetSize: budget.maxCSSSize * 1024,
        severity: 'warning'
      });
    }

    // Check individual large assets
    analysis.assets.forEach(asset => {
      if (asset.size > budget.maxAssetSize * 1024) {
        violations.push({
          type: 'asset',
          name: asset.name,
          actualSize: asset.size,
          budgetSize: budget.maxAssetSize * 1024,
          severity: asset.type === 'js' ? 'error' : 'warning'
        });
      }

      // Special check for images
      if (asset.type === 'image' && asset.size > budget.maxImageSize * 1024) {
        violations.push({
          type: 'image',
          name: asset.name,
          actualSize: asset.size,
          budgetSize: budget.maxImageSize * 1024,
          severity: 'warning'
        });
      }
    });

    return violations;
  }

  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (analysis.totalSize > 1500 * 1024) {
      recommendations.push('Consider implementing code splitting to reduce initial bundle size');
    }

    // Large chunk recommendations
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > 400 * 1024);
    if (largeChunks.length > 0) {
      recommendations.push(`Split large chunks: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    // Vendor chunk recommendations
    const vendorChunk = analysis.chunks.find(chunk => chunk.name.includes('vendor'));
    if (vendorChunk && vendorChunk.size > 600 * 1024) {
      recommendations.push('Consider splitting vendor libraries into smaller chunks');
    }

    // Asset optimization recommendations
    const largeImages = analysis.assets.filter(asset =>
      asset.type === 'image' && asset.size > 200 * 1024
    );
    if (largeImages.length > 0) {
      recommendations.push('Optimize large images using WebP format or compression');
    }

    // Unused code recommendations
    const totalJSSize = analysis.assets.filter(a => a.type === 'js').reduce((sum, a) => sum + a.size, 0);
    if (totalJSSize > 1000 * 1024) {
      recommendations.push('Analyze bundle for unused code using tools like webpack-bundle-analyzer');
    }

    return recommendations;
  }

  public generateReport(analysis: BundleAnalysis): string {
    const formatSize = (bytes: number) => {
      return bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(bytes / 1024).toFixed(2)} KB`;
    };

    let report = `
📦 Bundle Analysis Report
========================

📊 Summary:
- Total Bundle Size: ${formatSize(analysis.totalSize)}
- Number of Chunks: ${analysis.chunks.length}
- Number of Assets: ${analysis.assets.length}

🔍 Asset Breakdown:
`;

    const assetsByType = analysis.assets.reduce((acc, asset) => {
      if (!acc[asset.type]) acc[asset.type] = { count: 0, size: 0 };
      acc[asset.type].count++;
      acc[asset.type].size += asset.size;
      return acc;
    }, {} as Record<string, { count: number; size: number }>);

    Object.entries(assetsByType).forEach(([type, info]) => {
      report += `- ${type.toUpperCase()}: ${info.count} files, ${formatSize(info.size)}\n`;
    });

    if (analysis.violations.length > 0) {
      report += `\n⚠️ Budget Violations:\n`;
      analysis.violations.forEach(violation => {
        const severity = violation.severity === 'error' ? '🚨' : '⚠️';
        report += `${severity} ${violation.type}: ${violation.name} (${formatSize(violation.actualSize)} > ${formatSize(violation.budgetSize)})\n`;
      });
    }

    if (analysis.recommendations.length > 0) {
      report += `\n💡 Recommendations:\n`;
      analysis.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }

  public logAnalysis(analysis: BundleAnalysis): void {
    const report = this.generateReport(analysis);
    console.log(report);

    if (analysis.violations.some(v => v.severity === 'error')) {
      console.error('❌ Bundle size budget exceeded!');
    } else if (analysis.violations.length > 0) {
      console.warn('⚠️ Bundle size warnings detected');
    } else {
      console.log('✅ Bundle size within budget');
    }
  }
}

export const bundleAnalyzer = new BundleAnalyzer();
export type { BundleAnalysis, ChunkInfo, AssetInfo, PerformanceBudget, BudgetViolation };