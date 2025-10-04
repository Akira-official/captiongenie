
import React, { useMemo } from 'react';

interface InputSeoAnalyzerProps {
  text: string;
}

const countWords = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getSentimentScore = (wordCount: number): { score: number; label: string; color: string } => {
  if (wordCount < 10) return { score: 25, label: "Too short", color: 'bg-red-500' };
  if (wordCount < 30) return { score: 60, label: "Good", color: 'bg-yellow-500' };
  return { score: 90, label: "Great!", color: 'bg-green-500' };
};

export const InputSeoAnalyzer: React.FC<InputSeoAnalyzerProps> = ({ text }) => {
  const wordCount = useMemo(() => countWords(text), [text]);
  const sentiment = useMemo(() => getSentimentScore(wordCount), [wordCount]);
  const charCount = text.length;

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg mt-2 border border-dashed border-gray-300 dark:border-slate-700">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">Quick Analysis</span>
        <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${sentiment.color}`}>{sentiment.label}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
        <div className={`${sentiment.color} h-1.5 rounded-full`} style={{ width: `${sentiment.score}%` }}></div>
      </div>
      <div className="flex justify-between mt-1 text-gray-400 dark:text-gray-500">
        <span>Word Count: {wordCount}</span>
        <span>Character Count: {charCount}</span>
      </div>
    </div>
  );
};
