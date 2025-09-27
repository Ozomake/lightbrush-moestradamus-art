import { motion } from 'framer-motion';
import { useState } from 'react';
import type { TeamMember } from '../../data/portfolioProjects';
import {
  UserIcon,
  BoltIcon,
  AcademicCapIcon,
  LinkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface TeamProfilesProps {
  teamMembers: TeamMember[];
  onMemberSelect?: (member: TeamMember) => void;
  className?: string;
}

const TeamProfiles = ({ teamMembers, onMemberSelect, className = '' }: TeamProfilesProps) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(selectedMember === member.id ? null : member.id);
    onMemberSelect?.(member);
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'Projection Mapping': 'from-blue-500 to-cyan-500',
      'Creative Vision': 'from-purple-500 to-pink-500',
      'TouchDesigner': 'from-green-500 to-blue-500',
      'System Architecture': 'from-yellow-500 to-orange-500',
      'Motion Graphics': 'from-red-500 to-pink-500',
      'Interactive Design': 'from-indigo-500 to-purple-500',
      'Spatial Audio': 'from-teal-500 to-green-500',
      'Logistics': 'from-gray-500 to-blue-500',
      'Client Relations': 'from-emerald-500 to-blue-500',
      'Risk Management': 'from-orange-500 to-red-500'
    };
    return colors[specialty as keyof typeof colors] || 'from-gray-500 to-blue-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${className}`}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Meet the Team
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          The creative minds and technical experts behind Lightbrush's most ambitious projects
        </motion.p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {teamMembers.map((member, index) => {
          const isSelected = selectedMember === member.id;
          const isHovered = hoveredMember === member.id;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredMember(member.id)}
              onHoverEnd={() => setHoveredMember(null)}
              onClick={() => handleMemberClick(member)}
              className="cursor-pointer group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-500 ${
                  isSelected
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/20'
                    : 'border-white/10 group-hover:border-white/20'
                }`}
              >
                {/* Profile Image */}
                <div className="relative overflow-hidden">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay with Social Links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-4"
                  >
                    <div className="flex space-x-3">
                      {member.social?.linkedin && (
                        <motion.a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-600/80 rounded-full text-white hover:bg-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </motion.a>
                      )}
                      {member.social?.instagram && (
                        <motion.a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-pink-600/80 rounded-full text-white hover:bg-pink-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </motion.a>
                      )}
                      {member.social?.website && (
                        <motion.a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-gray-600/80 rounded-full text-white hover:bg-gray-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </motion.a>
                      )}
                    </div>
                  </motion.div>

                  {/* Role Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                      {member.role.split(' ')[0]}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                      <BoltIcon className="w-3 h-3 mr-1" />
                      SPECIALTIES
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {member.specialty.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getSpecialtyColor(spec)} text-white`}
                        >
                          {spec}
                        </span>
                      ))}
                      {member.specialty.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-full">
                          +{member.specialty.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Projects Count */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{member.projects.length} projects</span>
                      </div>
                      <motion.div
                        animate={{ x: isSelected ? 5 : 0 }}
                        className="text-blue-400 text-xs font-medium"
                      >
                        {isSelected ? 'Close' : 'Learn More'} →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Expanded Details */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: isSelected ? 'auto' : 0,
                  opacity: isSelected ? 1 : 0
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  {/* Full Bio */}
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      About {member.name.split(' ')[0]}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* All Specialties */}
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <BoltIcon className="w-4 h-4 mr-2" />
                      Full Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialty.map((spec, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r ${getSpecialtyColor(spec)} text-white`}
                        >
                          {spec}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Project Involvement */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <AcademicCapIcon className="w-4 h-4 mr-2" />
                      Key Projects
                    </h4>
                    <div className="space-y-2">
                      {member.projects.map((projectId, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-gray-300 capitalize">
                            {projectId.split('-').join(' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        {member.social?.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {member.social?.website && (
                          <a
                            href={member.social.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                      <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Contact</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Team Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">{teamMembers.length}</div>
          <div className="text-sm text-gray-400">Team Members</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {teamMembers.reduce((acc, member) => acc + member.projects.length, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Projects</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {Array.from(new Set(teamMembers.flatMap(member => member.specialty))).length}
          </div>
          <div className="text-sm text-gray-400">Specialties</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">5+</div>
          <div className="text-sm text-gray-400">Years Experience</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamProfiles;