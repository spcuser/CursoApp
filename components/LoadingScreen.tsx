
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 size={56} strokeWidth={3} className="text-orange-500 animate-spin relative z-10" />
      </div>
      <div className="text-center space-y-3 max-w-md px-4">
        <p className="text-2xl font-black text-orange-500 animate-pulse leading-tight uppercase tracking-[0.2em]">
          {message.split('\n')[0]}
        </p>
        {message.includes('\n') && (
           <p className="text-sm text-orange-400/60 font-bold uppercase tracking-widest">
             {message.split('\n')[1]}
           </p>
        )}
      </div>
    </div>
  );
};
