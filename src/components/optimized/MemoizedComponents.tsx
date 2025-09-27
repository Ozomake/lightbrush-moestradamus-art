import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Memoized button component - prevents unnecessary re-renders
 */
export const MemoizedButton = memo<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}>(({ onClick, children, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.children === nextProps.children &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick
  );
});

MemoizedButton.displayName = 'MemoizedButton';

/**
 * Memoized card component for portfolio/game items
 */
export const MemoizedCard = memo<{
  title: string;
  description: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}>(({ title, description, image, onClick, className = '' }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {image && (
        <div className="h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.image === nextProps.image &&
    prevProps.className === nextProps.className
  );
});

MemoizedCard.displayName = 'MemoizedCard';

/**
 * Memoized loading spinner component
 */
export const MemoizedLoader = memo<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>(({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-${color}-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
});

MemoizedLoader.displayName = 'MemoizedLoader';

/**
 * Memoized list component with virtualization support
 */
export const MemoizedList = memo<{
  items: Array<{ id: string; content: React.ReactNode }>;
  onItemClick?: (id: string) => void;
  className?: string;
}>(({ items, onItemClick, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for items array
  if (prevProps.items.length !== nextProps.items.length) return false;

  for (let i = 0; i < prevProps.items.length; i++) {
    if (prevProps.items[i].id !== nextProps.items[i].id) return false;
  }

  return prevProps.className === nextProps.className;
});

MemoizedList.displayName = 'MemoizedList';

/**
 * Export all memoized components
 */
export const OptimizedComponents = {
  Button: MemoizedButton,
  Card: MemoizedCard,
  Loader: MemoizedLoader,
  List: MemoizedList,
};