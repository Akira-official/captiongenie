import React from 'react';
import { type SeoInsights } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { WrenchIcon } from './icons/WrenchIcon';

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
  const circumference = 2 * Math.PI * 20; // 2 * pi * radius
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

interface SeoInsightsDisplayProps {
  insights: SeoInsights;
  onFixSeo?: () => void;
  isLoading?: boolean;
}

export const SeoInsightsDisplay: React.FC<SeoInsightsDisplayProps> = ({ insights, onFixSeo, isLoading = false }) => {
  if (!insights) return null;

  return (
    <div className="p-4 mt-6 border-t border-gray-200 dark:border-slate-700">
      <h3 className="flex items-center text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        <InfoIcon className="w-5 h-5 mr-2 text-blue-500"/>
        SEO Insights (Generated Content)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
        <div className="flex flex-col items-center justify-center text-center">
            <SeoScoreRing score={insights.score} />
            <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-400">SEO Score</p>
            {insights.score < 70 && (
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">Try adding more specific keywords or emotional triggers.</p>
            )}
        </div>
        <div className="md:col-span-2 space-y-4">
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Keywords</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                    {insights.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300 rounded-full animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{kw}</span>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Suggestions</h4>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {insights.suggestions.map((s, i) => <li key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{s}</li>)}
                </ul>
            </div>
            {insights.optimizedTitles && insights.optimizedTitles.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Optimized Titles</h4>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {insights.optimizedTitles.map((title, i) => <li key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{title}</li>)}
                    </ul>
                </div>
            )}
             {insights.optimizedDescriptions && insights.optimizedDescriptions.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Optimized Descriptions</h4>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {insights.optimizedDescriptions.map((desc, i) => <li key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>{desc}</li>)}
                    </ul>
                </div>
            )}
        </div>
        {insights.score < 75 && onFixSeo && (
          <div className="md:col-span-3 mt-4">
            <div className="p-4 mb-4 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">This content's SEO could be better!</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Let Gemini automatically improve the original idea and regenerate the caption.</p>
            </div>
            <div className="text-center">
                <button
                    onClick={onFixSeo}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Optimizing...
                        </>
                    ) : (
                        <>
                            <WrenchIcon className="w-5 h-5 mr-2" />
                            Fix SEO Automatically
                        </>
                    )}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};