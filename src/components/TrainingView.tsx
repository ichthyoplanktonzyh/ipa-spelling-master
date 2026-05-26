/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Volume2, ArrowRight, RefreshCw } from 'lucide-react';
import { WordData } from '../types';

interface TrainingViewProps {
  words: WordData[];
  currentIndex: number;
  onNext: () => void;
  onPlayAudio: () => void;
  isPlaying: boolean;
  onNewWordSet: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  words,
  currentIndex,
  onNext,
  onPlayAudio,
  isPlaying,
  onNewWordSet,
}) => {
  const currentWord = words[currentIndex];

  if (!currentWord) return null;

  return (
    <div className="w-full max-w-3xl space-y-10">
      {/* Training Card */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-12 flex flex-col items-center gap-10">

          {/* Word & IPA Display */}
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              key={currentWord.word}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-5xl font-bold text-slate-800 tracking-wider">
                {currentWord.word}
              </h2>
            </motion.div>
            <motion.div
              key={currentWord.ipa_us}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="ipa-text text-3xl text-slate-500 font-light">
                /{currentWord.ipa_us}/
              </p>
            </motion.div>
          </div>

          {/* Play Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAudio}
            disabled={isPlaying}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPlaying
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-indigo-50 text-indigo-600 hover:bg-white shadow-sm border border-indigo-100'
            }`}
          >
            {isPlaying ? (
              <div className="flex gap-1.5 items-end h-8">
                {[1, 2, 3, 2, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-indigo-600 rounded-full"
                    animate={{ height: ['20%', '100%', '20%'] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  />
                ))}
              </div>
            ) : (
              <Volume2 className="w-12 h-12" />
            )}
          </motion.button>

          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Press <kbd className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Space</kbd> to replay
          </p>
        </div>

        {/* Bottom Footer */}
        <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {currentIndex + 1} / {words.length}
          </span>
          <button
            onClick={onNext}
            className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest cursor-pointer"
          >
            {currentIndex < words.length - 1 ? 'Next Word' : 'Complete Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      </div>

      {/* New Word Set */}
      <div className="flex justify-center">
        <button
          onClick={onNewWordSet}
          className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          New Word Set
        </button>
      </div>
    </div>
  );
};
