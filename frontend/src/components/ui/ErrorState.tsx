import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

// Full-panel error state, mirroring the Posts empty-state pattern.
// Use wherever a whole section fails to load.
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`bg-white rounded-xl border border-[#EAE7E4] p-12 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-[#181817] font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#4D4946]/70 text-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
