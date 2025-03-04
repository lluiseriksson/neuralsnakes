
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
      Loading snakes...
    </div>
  );
};

export default LoadingOverlay;
