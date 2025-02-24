import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
  overlay = false,
  text,
  className
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${overlay ? 'z-50' : ''}`}>
      <div
        className={`loader inline-block rounded-full border-solid border-gray-200 border-t-indigo-600 animate-spin ${sizeClasses[size]} ${className || ''}`}
      />
      {text && <div className="text-sm text-gray-500">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner; 