import React, { Suspense, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';

// Minimal loading screen while 3D components load
const LoadingScreen = React.memo(() => (
  <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        LIGHTBRUSH
      </motion.div>
      <motion.div
        className="text-xl text-purple-300 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Immersive 3D Experiences
      </motion.div>
      <motion.div
        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
      <motion.p
        className="text-sm text-gray-400 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Loading 3D environment...
      </motion.p>
    </div>
  </div>
));

// Dynamic imports with proper error handling
const lazy3DApp = React.lazy(() =>
  import('./OptimizedApp')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load 3D components:', error);
      // Return a fallback component
      return { default: () => <div>Failed to load 3D content</div> };
    })
);

// Lightweight 2D fallback
const Fallback2D = React.memo(() => (
  <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
    <div className="text-center max-w-4xl mx-auto px-6">
      <motion.h1
        className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        LIGHTBRUSH
      </motion.h1>
      <motion.p
        className="text-xl text-purple-300 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Creating immersive projection mapping experiences that transform spaces into dynamic, interactive environments.
      </motion.p>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="p-6 bg-purple-800/20 rounded-lg border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">Urban Projections</h3>
          <p className="text-gray-300 text-sm">Transform building facades into dynamic canvases</p>
        </div>
        <div className="p-6 bg-blue-800/20 rounded-lg border border-blue-500/30">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Festival Mapping</h3>
          <p className="text-gray-300 text-sm">Immersive experiences for concerts and events</p>
        </div>
        <div className="p-6 bg-green-800/20 rounded-lg border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-300 mb-2">Interactive Installations</h3>
          <p className="text-gray-300 text-sm">Responsive environments that react to audiences</p>
        </div>
      </motion.div>
      <motion.button
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Portfolio
      </motion.button>
    </div>
  </div>
));

// Progressive enhancement component
const OptimizedEntry: React.FC = () => {
  const [load3D, setLoad3D] = useState(false);
  const [use3D, setUse3D] = useState(false);

  // Check if device can handle 3D
  const check3DCapability = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!gl) return false;

      // Check memory and CPU
      const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if unknown
      const cores = navigator.hardwareConcurrency || 4;

      // Conservative requirements for 3D
      return memory >= 2 && cores >= 2;
    } catch {
      return false;
    }
  }, []);

  // Auto-detect and offer 3D
  React.useEffect(() => {
    const can3D = check3DCapability();

    if (can3D) {
      // Preload 3D after initial render
      const timer = setTimeout(() => {
        setLoad3D(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [check3DCapability]);

  const handle3DToggle = useCallback(() => {
    if (!load3D) {
      setLoad3D(true);
    }
    setUse3D(true);
  }, [load3D]);

  if (use3D && load3D) {
    return (
      <ErrorBoundary
        name="3DAppBoundary"
        level="component"
        fallback={<Fallback2D />}
      >
        <Suspense fallback={<LoadingScreen />}>
          {lazy3DApp && React.createElement(lazy3DApp)}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <Fallback2D />
      {check3DCapability() && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <button
            onClick={handle3DToggle}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
            disabled={load3D && !use3D}
          >
            {load3D && !use3D ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading 3D...
              </>
            ) : (
              <>
                🎮 Launch 3D Experience
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Preload indicator */}
      {load3D && !use3D && (
        <div className="fixed top-4 right-4 bg-purple-900/80 text-white text-xs px-3 py-1 rounded-full">
          3D Ready
        </div>
      )}
    </>
  );
};

export default OptimizedEntry;