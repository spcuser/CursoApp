import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 size={48} className="text-indigo-600 animate-spin relative z-10" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <p className="text-xl font-medium text-slate-800 animate-pulse">
          {message.split('\n')[0]}
        </p>
        {message.includes('\n') && (
           <p className="text-sm text-slate-500">
             {message.split('\n')[1]}
           </p>
        )}
      </div>
    </div>
  );
};