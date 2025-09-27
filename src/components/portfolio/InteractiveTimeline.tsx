import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import type { CompanyMilestone } from '../../data/portfolioProjects';
import {
  CalendarIcon,
  TrophyIcon,
  RocketLaunchIcon,
  BuildingOffice2Icon,
  MusicalNoteIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface InteractiveTimelineProps {
  milestones: CompanyMilestone[];
  onMilestoneClick?: (milestone: CompanyMilestone) => void;
  className?: string;
}

const InteractiveTimeline = ({ milestones, onMilestoneClick, className = '' }: InteractiveTimelineProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const getIcon = (milestone: CompanyMilestone) => {
    if (milestone.achievement) {
      if (milestone.achievement.includes('award') || milestone.achievement.includes('recognition')) {
        return TrophyIcon;
      }
      if (milestone.achievement.includes('guerrilla') || milestone.achievement.includes('Union Station')) {
        return SparklesIcon;
      }
    }

    if (milestone.title.toLowerCase().includes('founded')) return RocketLaunchIcon;
    if (milestone.title.toLowerCase().includes('venue') || milestone.title.toLowerCase().includes('partnership')) return BuildingOffice2Icon;
    if (milestone.title.toLowerCase().includes('festival') || milestone.title.toLowerCase().includes('dome')) return MusicalNoteIcon;

    return CalendarIcon;
  };

  const handleMilestoneClick = (milestone: CompanyMilestone) => {
    setSelectedMilestone(selectedMilestone === milestone.year ? null : milestone.year);
    onMilestoneClick?.(milestone);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
    >
      {/* Timeline Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          The Lightbrush Journey
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          From garage startup to transforming iconic venues - explore the key moments that defined our path
        </motion.p>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Main Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full overflow-hidden">
          <motion.div
            className="w-full bg-white/20"
            style={{
              height: `${milestones.length * 200}px`,
              scaleY: useTransform(scrollYProgress, [0, 1], [0, 1]),
              transformOrigin: "top"
            }}
          />
        </div>

        {/* Milestones */}
        <div className="space-y-24">
          {milestones.map((milestone, index) => {
            const IconComponent = getIcon(milestone);
            const isLeft = index % 2 === 0;
            const isSelected = selectedMilestone === milestone.year;

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex items-center ${
                  isLeft ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Timeline Node */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleMilestoneClick(milestone)}
                  className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full cursor-pointer z-10 flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-blue-500/50 hover:to-purple-600/50 border-2 border-white/20'
                  }`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content Card */}
                <motion.div
                  layout
                  onClick={() => handleMilestoneClick(milestone)}
                  className={`w-5/12 cursor-pointer ${
                    isLeft ? 'text-right pr-8' : 'text-left pl-8'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 ${
                      isSelected
                        ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Year Badge */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      {milestone.year}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {milestone.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {milestone.description}
                    </p>

                    {/* Achievement Badge */}
                    {milestone.achievement && (
                      <div className="flex items-center space-x-2 text-xs">
                        <TrophyIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                          {milestone.achievement}
                        </span>
                      </div>
                    )}

                    {/* Projects Links */}
                    {milestone.projects && milestone.projects.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Related Projects:</p>
                        <div className="flex flex-wrap gap-1">
                          {milestone.projects.map((projectId, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30"
                            >
                              {projectId.split('-').map(word =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                {/* Expanded Content */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isSelected ? 'auto' : 0,
                    opacity: isSelected ? 1 : 0
                  }}
                  className={`absolute top-full mt-4 left-1/2 transform -translate-x-1/2 w-10/12 overflow-hidden ${
                    isSelected ? 'block' : 'hidden'
                  }`}
                >
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Detailed Info */}
                      <div>
                        <h4 className="text-white font-semibold mb-3">What Happened</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {milestone.description} This pivotal moment shaped our approach and opened new
                          opportunities for creative expression and technical innovation.
                        </p>
                      </div>

                      {/* Impact */}
                      <div>
                        <h4 className="text-white font-semibold mb-3">Impact & Legacy</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Expanded our technical capabilities</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Strengthened client relationships</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Set new industry standards</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Present Day Marker */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: milestones.length * 0.2 }}
          className="relative mt-24 flex justify-center"
        >
          <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Present Day</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Continue following our journey as we push the boundaries of immersive experiences
              and light art installations.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center mt-12 text-sm text-gray-500"
      >
        <p>Click on timeline nodes to explore each milestone in detail</p>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveTimeline;