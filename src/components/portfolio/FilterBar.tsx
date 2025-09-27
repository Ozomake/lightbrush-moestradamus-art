import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FunnelIcon,
  MapPinIcon,
  TagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface FilterBarProps {
  categories: Array<{ id: string; name: string; color: string }>;
  venues: string[];
  selectedCategory: string;
  selectedVenue: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onVenueChange: (venue: string) => void;
  onSearchChange: (query: string) => void;
  projectCount: number;
  totalCount: number;
}

const FilterBar = ({
  categories,
  venues,
  selectedCategory,
  selectedVenue,
  searchQuery,
  onCategoryChange,
  onVenueChange,
  onSearchChange,
  projectCount,
  totalCount
}: FilterBarProps) => {
  // const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const clearFilters = () => {
    onCategoryChange('all');
    onVenueChange('all');
    onSearchChange('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedVenue !== 'all' || searchQuery;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filter Projects</h3>
          </div>
          <div className="text-sm text-gray-400">
            Showing {projectCount} of {totalCount} projects
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearFilters}
              className="text-sm text-red-400 hover:text-red-300 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Clear All</span>
            </motion.button>
          )}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showAdvanced
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by name, client, or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <TagIcon className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-semibold text-gray-300">Category</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white border border-white/10'
              }`}
            >
              {category.name}
              {selectedCategory === category.id && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg -z-10"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: showAdvanced ? 'auto' : 0,
          opacity: showAdvanced ? 1 : 0
        }}
        className="overflow-hidden"
      >
        {/* Venue Filter */}
        <div className="mb-6 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-gray-300">Venue</h4>
          </div>
          <select
            value={selectedVenue}
            onChange={(e) => onVenueChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all"
          >
            <option value="all">All Venues</option>
            {venues.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Chips */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Featured Projects', filter: 'featured' },
              { label: 'Award Winners', filter: 'awards' },
              { label: 'Large Scale', filter: 'large-scale' },
              { label: 'Interactive', filter: 'interactive' },
              { label: 'Recent (2024)', filter: '2024' }
            ].map((chip) => (
              <motion.button
                key={chip.filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Sort By</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'Newest First',
              'Oldest First',
              'Most Impactful',
              'Venue A-Z'
            ].map((option) => (
              <button
                key={option}
                className="px-3 py-2 text-sm bg-gray-700/50 text-gray-300 rounded-lg border border-white/10 hover:bg-gray-700 hover:text-white transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t border-white/10 mt-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-400">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400"
              >
                <TagIcon className="w-3 h-3" />
                <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                <button
                  onClick={() => onCategoryChange('all')}
                  className="ml-1 hover:text-blue-200"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {selectedVenue !== 'all' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400"
              >
                <MapPinIcon className="w-3 h-3" />
                <span>{selectedVenue}</span>
                <button
                  onClick={() => onVenueChange('all')}
                  className="ml-1 hover:text-green-200"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {searchQuery && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400"
              >
                <MagnifyingGlassIcon className="w-3 h-3" />
                <span>"{searchQuery}"</span>
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-purple-200"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4 border-t border-white/10 mt-4"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            {projectCount === totalCount ? (
              <span>Showing all {totalCount} projects</span>
            ) : (
              <span>
                Showing {projectCount} of {totalCount} projects
                {hasActiveFilters && (
                  <span className="text-blue-400 ml-1">(filtered)</span>
                )}
              </span>
            )}
          </div>

          {projectCount > 0 && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{Math.round((projectCount / totalCount) * 100)}% match</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterBar;