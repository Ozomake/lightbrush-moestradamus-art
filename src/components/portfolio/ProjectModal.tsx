import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { PortfolioProject } from '../../data/portfolioProjects';
import Button from '../ui/Button';
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrophyIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  CogIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface ProjectModalProps {
  project: PortfolioProject | null;
  isOpen: boolean;
  onClose: () => void;
  onTryDemo?: (project: PortfolioProject) => void;
}

const ProjectModal = ({ project, isOpen, onClose, onTryDemo }: ProjectModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'behind-scenes' | 'impact'>('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setActiveTab('overview');
      setActiveImageIndex(0);
      setShowBeforeAfter(false);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, project]);

  if (!project) return null;

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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LightBulbIcon },
    { id: 'technical', name: 'Technical', icon: CogIcon },
    { id: 'behind-scenes', name: 'Behind Scenes', icon: SpeakerWaveIcon },
    { id: 'impact', name: 'Impact', icon: StarIcon }
  ];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl overflow-hidden max-w-6xl max-h-[90vh] w-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryGradient(project.category)} text-white`}>
                  {project.category.toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                {project.featured && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 rounded-full text-xs font-bold text-white">
                    ✨ FEATURED
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {project.gameConnection && onTryDemo && (
                  <Button
                    onClick={() => onTryDemo(project)}
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Try Demo
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Hero Image Section */}
                <div className="relative h-64 md:h-80">
                  <img
                    src={project.images[activeImageIndex]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {project.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {activeImageIndex + 1} / {project.images.length}
                      </div>
                    </>
                  )}

                  {/* Before/After Toggle */}
                  {project.beforeAfter && (
                    <div className="absolute bottom-4 left-4">
                      <Button
                        onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                        size="sm"
                        variant={showBeforeAfter ? 'primary' : 'ghost'}
                        className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                      >
                        {showBeforeAfter ? 'Hide' : 'Show'} Before/After
                      </Button>
                    </div>
                  )}
                </div>

                {/* Before/After Comparison */}
                <AnimatePresence>
                  {showBeforeAfter && project.beforeAfter && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-4 p-6 border-b border-white/10"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">BEFORE</h4>
                        <img
                          src={project.beforeAfter.before}
                          alt="Before"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">AFTER</h4>
                        <img
                          src={project.beforeAfter.after}
                          alt="After"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Project Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Project Overview</h3>
                        <p className="text-gray-300 leading-relaxed">{project.description}</p>
                      </div>

                      {/* Key Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                          <CalendarIcon className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-sm text-gray-400">Year</p>
                          <p className="text-lg font-semibold text-white">{project.year}</p>
                        </div>
                        {project.attendees && (
                          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                            <UsersIcon className="w-8 h-8 text-green-400 mb-2" />
                            <p className="text-sm text-gray-400">Attendees</p>
                            <p className="text-lg font-semibold text-white">{project.attendees}</p>
                          </div>
                        )}
                        {project.budget && (
                          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
                            <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mb-2" />
                            <p className="text-sm text-gray-400">Budget</p>
                            <p className="text-lg font-semibold text-white">{project.budget}</p>
                          </div>
                        )}
                        {project.duration && (
                          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                            <ClockIcon className="w-8 h-8 text-purple-400 mb-2" />
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="text-lg font-semibold text-white">{project.duration}</p>
                          </div>
                        )}
                      </div>

                      {/* Client & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">CLIENT</h4>
                          <p className="text-lg text-white font-medium">{project.client}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            LOCATION
                          </h4>
                          <p className="text-lg text-white font-medium">{project.location}</p>
                        </div>
                      </div>

                      {/* Testimonial */}
                      {project.testimonial && (
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 border border-white/10">
                          <blockquote className="text-gray-300 italic text-lg leading-relaxed mb-4">
                            "{project.testimonial.quote}"
                          </blockquote>
                          <cite className="text-sm text-gray-400">
                            <strong className="text-white">{project.testimonial.author}</strong>
                            <br />
                            {project.testimonial.title}
                          </cite>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'technical' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Technical Specifications */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Projectors</p>
                            <p className="text-lg font-semibold text-white">{project.technical.projectors}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Total Lumens</p>
                            <p className="text-lg font-semibold text-white">{project.technical.lumens}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Resolution</p>
                            <p className="text-lg font-semibold text-white">{project.technical.resolution}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Setup Time</p>
                            <p className="text-lg font-semibold text-white">{project.technical.setup_time}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Content Duration</p>
                            <p className="text-lg font-semibold text-white">{project.technical.content_duration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Equipment List */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Equipment Used</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {project.equipment.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded border border-white/5">
                              <CogIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Software */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Software & Techniques</h4>
                        <div className="flex flex-wrap gap-2">
                          {[...project.technical.software, ...project.techniques].map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-gray-300 text-sm rounded-full border border-purple-500/20"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'behind-scenes' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Challenges */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
                          Challenges Overcome
                        </h3>
                        <div className="space-y-2">
                          {project.challenges.map((challenge, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{challenge}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Behind the Scenes Content */}
                      {project.behindScenes && (
                        <>
                          {project.behindScenes.setupPhotos && (
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-3">Setup Process</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {project.behindScenes.setupPhotos.map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`Setup ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-white/10"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {project.behindScenes.teamNotes && (
                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                              <h4 className="text-sm font-semibold text-blue-400 mb-2">TEAM NOTES</h4>
                              <p className="text-gray-300 text-sm italic">{project.behindScenes.teamNotes}</p>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'impact' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Outcomes */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                          Project Outcomes
                        </h3>
                        <div className="space-y-2">
                          {project.outcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-green-500/10 rounded border border-green-500/20">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Awards */}
                      {project.awards && project.awards.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <TrophyIcon className="w-5 h-5 text-yellow-400 mr-2" />
                            Awards & Recognition
                          </h4>
                          <div className="space-y-2">
                            {project.awards.map((award, index) => (
                              <div key={index} className="flex items-center space-x-2 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded border border-yellow-500/20">
                                <TrophyIcon className="w-4 h-4 text-yellow-400" />
                                <span className="text-gray-300 text-sm font-medium">{award}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Game Connection */}
                      {project.gameConnection && (
                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                          <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                            <PlayIcon className="w-4 h-4 mr-1" />
                            GAME CONNECTION
                          </h4>
                          <p className="text-gray-300 text-sm mb-3">{project.gameConnection.tryDemo}</p>
                          <Button
                            onClick={() => onTryDemo && onTryDemo(project)}
                            size="sm"
                            className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                          >
                            <PlayIcon className="w-4 h-4 mr-1" />
                            Try Interactive Demo
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;