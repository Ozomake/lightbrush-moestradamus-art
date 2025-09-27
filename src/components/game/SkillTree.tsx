import React, { useState } from 'react';
import { useGameUI } from '../../store/gameStore';
import { usePlayerSkills, usePlayerStats } from '../../store/playerStore';
import { SkillSystem } from '../../game/systems/SkillSystem';
import type { PlayerSkills } from '../../game/entities/Player';

const skillSystem = SkillSystem.getInstance();

export const SkillTree: React.FC = () => {
  const { showSkillTree, hideSkillTreeModal } = useGameUI();
  const { skills, upgradeSkill, canUpgradeSkill, getSkillProgress } = usePlayerSkills();
  const { stats } = usePlayerStats();
  const [selectedSkill, setSelectedSkill] = useState<keyof PlayerSkills | null>(null);

  if (!showSkillTree) return null;

  const skillDefinitions = skillSystem.getAllSkillDefinitions();
  const skillTree = skillSystem.getSkillTree();
  const skillProgress = getSkillProgress();

  const handleUpgradeSkill = (skill: keyof PlayerSkills) => {
    const result = upgradeSkill(skill);
    if (!result) {
      // Could show error notification here
      console.log('Failed to upgrade skill');
    }
  };

  const getSkillIcon = (skillId: keyof PlayerSkills) => {
    const definition = skillDefinitions.find(d => d.id === skillId);
    return definition?.icon || '🎯';
  };

  // const getUpgradeCost = (skill: keyof PlayerSkills) => {
  //   const currentLevel = skills[skill];
  //   return skillSystem.getUpgradeCost(skill, currentLevel);
  // };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Skill Tree</h2>
            <p className="text-gray-400">Develop your VJ abilities</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Available Reputation</div>
              <div className="text-xl font-bold text-orange-400">{stats.reputation.toLocaleString()}</div>
            </div>
            <button
              onClick={hideSkillTreeModal}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Skill Tree Visualization */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="relative min-h-[500px]">
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {/* Draw connections between skills */}
                {skillTree.map((node) => {
                  return node.connections.map((connectedSkill) => {
                    const connectedNode = skillTree.find(n => n.skill === connectedSkill);
                    if (!connectedNode) return null;

                    const x1 = node.position.x + 300; // Center offset
                    const y1 = node.position.y + 100;
                    const x2 = connectedNode.position.x + 300;
                    const y2 = connectedNode.position.y + 100;

                    return (
                      <line
                        key={`${node.skill}-${connectedSkill}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#374151"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    );
                  });
                })}
              </svg>

              {/* Skill Nodes */}
              {skillTree.map((node) => {
                const skillDef = skillDefinitions.find(d => d.id === node.skill);
                if (!skillDef) return null;

                const currentLevel = skills[node.skill];
                const progress = skillProgress[node.skill];
                const canUpgrade = canUpgradeSkill(node.skill);
                // const upgradeCost = getUpgradeCost(node.skill);

                return (
                  <div
                    key={node.skill}
                    className="absolute"
                    style={{
                      left: node.position.x + 250,
                      top: node.position.y + 50,
                      zIndex: 10
                    }}
                  >
                    <div
                      className={`
                        w-24 h-24 rounded-full border-4 cursor-pointer transition-all duration-300
                        ${selectedSkill === node.skill ? 'border-blue-400 scale-110' : 'border-gray-600'}
                        ${canUpgrade.canUpgrade ? 'hover:border-green-400' : 'hover:border-gray-400'}
                        ${currentLevel === skillDef.maxLevel ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-gray-700 to-gray-800'}
                        flex items-center justify-center relative overflow-hidden
                      `}
                      onClick={() => setSelectedSkill(node.skill)}
                    >
                      {/* Progress ring */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          fill="none"
                          stroke="rgba(59, 130, 246, 0.3)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 38}`}
                          strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress.percentage / 100)}`}
                          className="transition-all duration-500"
                        />
                      </svg>

                      <div className="text-center z-10">
                        <div className="text-2xl mb-1">{getSkillIcon(node.skill)}</div>
                        <div className="text-xs font-bold text-white">
                          {currentLevel}/{skillDef.maxLevel}
                        </div>
                      </div>

                      {/* Can upgrade indicator */}
                      {canUpgrade.canUpgrade && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>

                    <div className="text-center mt-2">
                      <div className="text-sm font-medium text-white">{skillDef.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-auto">
            {selectedSkill ? (
              <SkillDetailsPanel
                skill={selectedSkill}
                onUpgrade={() => handleUpgradeSkill(selectedSkill)}
              />
            ) : (
              <div className="p-6 text-center text-gray-400">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">Select a Skill</h3>
                <p>Click on a skill node to see details and upgrade options.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillDetailsPanel: React.FC<{
  skill: keyof PlayerSkills;
  onUpgrade: () => void;
}> = ({ skill, onUpgrade }) => {
  const { skills, canUpgradeSkill } = usePlayerSkills();
  // const { stats } = usePlayerStats();

  const skillDefinition = skillSystem.getSkillDefinition(skill);
  if (!skillDefinition) return null;

  const currentLevel = skills[skill];
  const canUpgrade = canUpgradeSkill(skill);
  const upgradeCost = skillSystem.getUpgradeCost(skill, currentLevel);

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{skillDefinition.icon}</div>
        <h3 className="text-xl font-bold text-white">{skillDefinition.name}</h3>
        <p className="text-gray-400 text-sm mt-2">{skillDefinition.description}</p>
      </div>

      {/* Current Level */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Current Level</span>
          <span className="text-lg font-bold text-blue-400">
            {currentLevel} / {skillDefinition.maxLevel}
          </span>
        </div>

        <div className="bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentLevel / skillDefinition.maxLevel) * 100}%` }}
          />
        </div>
      </div>

      {/* Unlocks */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Level Unlocks</h4>
        <div className="space-y-2 max-h-48 overflow-auto">
          {skillDefinition.unlocks.map((unlock, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                currentLevel >= unlock.level
                  ? 'bg-green-900/30 border-green-500 text-green-300'
                  : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Level {unlock.level}</span>
                {currentLevel >= unlock.level && (
                  <span className="text-xs text-green-400">✓</span>
                )}
              </div>
              <div className="text-xs">{unlock.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prerequisites */}
      {skillDefinition.prerequisites && skillDefinition.prerequisites.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Prerequisites</h4>
          {skillDefinition.prerequisites.map((prereq, index) => (
            <div key={index} className="text-sm text-gray-400">
              {prereq.skill} Level {prereq.level}
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Button */}
      {currentLevel < skillDefinition.maxLevel && (
        <div className="mt-6">
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade.canUpgrade}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              canUpgrade.canUpgrade
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canUpgrade.canUpgrade ? (
              <div className="flex items-center justify-center space-x-2">
                <span>Upgrade to Level {currentLevel + 1}</span>
                <div className="flex items-center text-orange-400">
                  <span className="text-sm">({upgradeCost})</span>
                </div>
              </div>
            ) : (
              <span>{canUpgrade.reason}</span>
            )}
          </button>

          {canUpgrade.canUpgrade && (
            <div className="text-center text-xs text-gray-400 mt-2">
              Cost: {upgradeCost} reputation
            </div>
          )}
        </div>
      )}

      {currentLevel === skillDefinition.maxLevel && (
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold">
            🏆 MASTERED 🏆
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTree;