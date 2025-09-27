import React from 'react';
import { useGameUI, useGameNotifications } from '../../store/gameStore';
import { usePlayerStats, usePlayerSkills } from '../../store/playerStore';

export const GameHUD: React.FC = () => {
  const { showHUD, showInventoryModal, showSkillTreeModal, showMenuModal } = useGameUI();
  const { notifications, removeNotification } = useGameNotifications();
  const { stats } = usePlayerStats();
  const { skills } = usePlayerSkills();

  if (!showHUD) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top HUD - Player Stats */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-300">Level</div>
              <div className="text-xl font-bold text-yellow-400">{stats.level}</div>
            </div>

            <div className="flex-1 min-w-48">
              <div className="text-sm text-gray-300 mb-1">Experience</div>
              <div className="bg-gray-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${(stats.experience / stats.experienceToNext) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                  {stats.experience} / {stats.experienceToNext}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-48">
              <div className="text-sm text-gray-300 mb-1">Energy</div>
              <div className="bg-gray-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(stats.energy / stats.maxEnergy) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                  {stats.energy} / {stats.maxEnergy}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-300">Reputation</div>
              <div className="text-xl font-bold text-orange-400">{stats.reputation.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right - Quick Actions */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="flex space-x-2">
          <button
            onClick={showInventoryModal}
            className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/80 transition-colors"
            title="Inventory (I)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </button>

          <button
            onClick={showSkillTreeModal}
            className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/80 transition-colors"
            title="Skills (K)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <button
            onClick={showMenuModal}
            className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/80 transition-colors"
            title="Menu (ESC)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Left - Skills Overview */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-sm text-gray-300 mb-2">Skills</div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(skills).map(([skillKey, level]) => (
              <div key={skillKey} className="text-center">
                <div className="text-xs text-gray-400 mb-1 capitalize">
                  {skillKey.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-bold text-blue-400">{level}</div>
                <div className="w-8 h-1 bg-gray-700 rounded-full mx-auto">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${(level / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="absolute top-20 right-4 pointer-events-auto space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 transform translate-x-0
              ${notification.type === 'achievement' ? 'bg-yellow-900/90 border border-yellow-500' : ''}
              ${notification.type === 'success' ? 'bg-green-900/90 border border-green-500' : ''}
              ${notification.type === 'error' ? 'bg-red-900/90 border border-red-500' : ''}
              ${notification.type === 'warning' ? 'bg-orange-900/90 border border-orange-500' : ''}
              ${notification.type === 'info' ? 'bg-blue-900/90 border border-blue-500' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  {notification.type === 'achievement' && (
                    <span className="mr-2 text-yellow-400">🏆</span>
                  )}
                  {notification.type === 'success' && (
                    <span className="mr-2 text-green-400">✓</span>
                  )}
                  {notification.type === 'error' && (
                    <span className="mr-2 text-red-400">⚠</span>
                  )}
                  {notification.type === 'warning' && (
                    <span className="mr-2 text-orange-400">⚠</span>
                  )}
                  {notification.type === 'info' && (
                    <span className="mr-2 text-blue-400">ⓘ</span>
                  )}
                  <h4 className="text-sm font-semibold text-white">
                    {notification.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Right - Quick Stats */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-xs text-gray-300 mb-1">Quick Actions</div>
          <div className="flex space-x-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">I</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">K</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;