import React from 'react';

export const SimpleGameHUD: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 z-10 pointer-events-auto">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-300">Level</div>
            <div className="text-xl font-bold text-yellow-400">1</div>
          </div>

          <div className="flex-1 min-w-48">
            <div className="text-sm text-gray-300 mb-1">Experience</div>
            <div className="bg-gray-700 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `25%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                25 / 100
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-300">Money</div>
            <div className="text-lg font-bold text-green-400">$0</div>
          </div>
        </div>
      </div>
    </div>
  );
};