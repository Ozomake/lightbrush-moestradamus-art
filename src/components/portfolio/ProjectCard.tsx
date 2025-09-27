import { motion } from 'framer-motion';
import { useState } from 'react';
import type { PortfolioProject } from '../../data/portfolioProjects';
import Button from '../ui/Button';
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  CogIcon,
  TrophyIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: PortfolioProject;
  onViewDetails: (project: PortfolioProject) => void;
  onTryDemo?: (project: PortfolioProject) => void;
}

const ProjectCard = ({ project, onViewDetails, onTryDemo }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const getCategoryGradient = (category: string) => {
    const gradients = {
      projection: 'from-blue-500 to-cyan-500',
      interactive: 'from-purple-500 to-pink-500',
      installation: 'from-green-500 to-blue-500',
      festival: 'from-yellow-500 to-orange-500',
      guerrilla: 'from-red-500 to-pink-500',
      corporate: 'from-gray-500 to-blue-500'
    };
    return gradients[category as keyof typeof gradients] || 'from-blue-500 to-purple-600';
  };

  const formatNumber = (num: string) => {
    if (num.includes('+')) return num;
    const number = parseInt(num.replace(/,/g, ''));
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(0)}K`;
    return num;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
          >
            ✨ FEATURED
          </motion.div>
        </div>
      )}

      {/* Awards Badge */}
      {project.awards && project.awards.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-lg"
          >
            <TrophyIcon className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      )}

      {/* Image Gallery with Navigation */}
      <div className="relative h-64 overflow-hidden">
        <motion.div
          className="relative w-full h-full"
          animate={{ x: `-${imageIndex * 100}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex w-full h-full" style={{ width: `${project.images.length * 100}%` }}>
            {project.images.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0">
                <img
                  src={image}
                  alt={`${project.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Navigation Dots */}
        {project.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {project.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === imageIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay with Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ delay: 0.1 }}
          className="absolute bottom-16 left-4 right-4 flex justify-between items-end"
        >
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{project.year}</span>
            </div>
            {project.venue && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm">{project.venue}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {project.gameConnection && onTryDemo && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onTryDemo(project);
                }}
                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
              >
                <PlayIcon className="w-4 h-4 mr-1" />
                Try Demo
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(project);
              }}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Details
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Project Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 mb-1">
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm">{project.location}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryGradient(project.category)} text-white`}>
            {project.category.toUpperCase()}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {project.attendees && (
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500">Attendees</p>
                <p className="text-sm font-medium text-gray-300">
                  {formatNumber(project.attendees)}
                </p>
              </div>
            </div>
          )}
          {project.technical.projectors && (
            <div className="flex items-center space-x-2">
              <CogIcon className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-500">Projectors</p>
                <p className="text-sm font-medium text-gray-300">
                  {project.technical.projectors}x 4K
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Client */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">CLIENT</p>
          <p className="text-sm font-medium text-gray-300">{project.client}</p>
        </div>

        {/* Top Technologies */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2">KEY TECH</p>
          <div className="flex flex-wrap gap-2">
            {project.equipment.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/10 truncate"
              >
                {tech.split(' ')[0]} {/* Show first word to save space */}
              </span>
            ))}
            {project.equipment.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{project.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(project)}
          className="cursor-pointer"
        >
          <Button
            variant="outline"
            className="w-full group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all duration-300"
          >
            View Full Case Study
            <motion.span
              animate={{ x: isHovered ? 5 : 0 }}
              className="ml-2"
            >
              →
            </motion.span>
          </Button>
        </motion.div>

        {/* Game Connection Hint */}
        {project.gameConnection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            className="mt-3 p-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-green-400">
                🎮 {project.gameConnection.tryDemo}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;