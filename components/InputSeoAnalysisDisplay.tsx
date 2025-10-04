import React from 'react';
import { type InputSeoAnalysis } from '../types';
import { WrenchIcon } from './icons/WrenchIcon';

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const getScoreRingColor = (score: number): string => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
}

export const InputSeoAnalysisDisplay: React.FC<{ analysis: InputSeoAnalysis, onFixSeo: () => void, isLoading: boolean }> = ({ analysis, onFixSeo, isLoading }) => {
  const { score, keywords, suggestions } = analysis;
  const scoreColor = getScoreColor(score);
  const scoreRingColor = getScoreRingColor(score);
  const circumference = 2 * Math.PI * 30; // 2 * pi * r
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 70 70">
                <circle className="text-gray-200 dark:text-slate-700" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="35" cy="35" />
                <circle
                    className={`${scoreRingColor} transition-all duration-1000 ease-out`}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="30"
                    cx="35"
                    cy="35"
                    transform="rotate(-90 35 35)"
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${scoreColor}`}>{score}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Input SEO Score</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analysis of your original post idea.</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Keywords Found</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="px-2 py-1 text-xs font-medium text-sky-800 dark:text-sky-200 bg-sky-100 dark:bg-sky-900/50 rounded-full">{kw}</span>
            ))}
             {keywords.length === 0 && <p className="text-xs text-gray-500">No strong keywords identified.</p>}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">💡 Improvement Tips</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        
        {score < 75 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <button 
                    onClick={onFixSeo} 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Fixing...
                        </>
                    ) : (
                        <>
                        <WrenchIcon className="w-5 h-5 mr-2" />
                        Fix SEO Automatically
                        </>
                    )}
                </button>
                 <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">This will rewrite your post idea for a score over 85.</p>
            </div>
        )}

         <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">📈 SEO Analysis powered by Gemini AI</p>

    </div>
  );
};
