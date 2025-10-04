import React from 'react';
import { type InputSeoAnalysis } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

const SeoScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (s: number) => {
    if (s < 60) return 'text-red-500';
    if (s < 80) return 'text-yellow-500';
    return 'text-green-500';
  };
  const getScoreBackgroundColor = (s: number) => {
    if (s < 60) return 'text-red-200 dark:text-red-500/20';
    if (s < 80) return 'text-yellow-200 dark:text-yellow-500/20';
    return 'text-green-200 dark:text-green-500/20';
  };
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 44 44">
        <circle
          className={getScoreBackgroundColor(score)}
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="22"
          cy="22"
        />
        <circle
          className={`${getScoreColor(score)} transition-all duration-1000 ease-in-out`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="22"
          cy="22"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  );
};

const getEmotionalPowerColor = (level?: 'Low' | 'Medium' | 'High') => {
    switch (level) {
        case 'High': return 'text-green-500';
        case 'Medium': return 'text-yellow-500';
        case 'Low': return 'text-gray-500 dark:text-gray-400';
        default: return 'text-gray-500 dark:text-gray-400';
    }
};

export const InputSeoAnalysisDisplay: React.FC<{ analysis: InputSeoAnalysis; onFixSeo: () => void; isLoading: boolean; }> = ({ analysis, onFixSeo, isLoading }) => {
  const isScoreLow = analysis.score < 80;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Input Text SEO Analysis</h3>
            <SeoScoreRing score={analysis.score} />
            <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-400">SEO Score</p>
        </div>
        
        {analysis.emotionalPower && (
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Emotional Power</p>
                <p className={`text-lg font-bold ${getEmotionalPowerColor(analysis.emotionalPower)}`}>{analysis.emotionalPower}</p>
            </div>
        )}

        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Keywords Identified</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300 rounded-full animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{kw}</span>
                    ))}
                    {analysis.keywords.length === 0 && <p className="text-sm text-gray-500 animate-fade-in">No strong keywords found.</p>}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Improvement Suggestions</h4>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {analysis.suggestions.map((s, i) => <li key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{s}</li>)}
                </ul>
            </div>
        </div>

       {isScoreLow && (
        <div className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">This content could be improved!</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Let Gemini try to rewrite it for better SEO.</p>
        </div>
       )}

      <button
        onClick={onFixSeo}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Optimizing...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Automatically Fix SEO
          </>
        )}
      </button>
    </div>
  );
};