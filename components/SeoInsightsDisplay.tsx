import React from 'react';
import { type SeoInsights } from '../types';
import { InfoIcon } from './icons/InfoIcon';

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/30';
  if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
  return 'text-red-500 bg-red-500/10 border-red-500/30';
};

const getScoreRingColor = (score: number): string => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
}

export const SeoInsightsDisplay: React.FC<{ insights: SeoInsights }> = ({ insights }) => {
  const { score, keywords, suggestions, optimizedTitles, optimizedDescriptions } = insights;
  const scoreColor = getScoreColor(score);
  const scoreRingColor = getScoreRingColor(score);
  const circumference = 2 * Math.PI * 30; // 2 * pi * r
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="animate-fade-in pt-6 border-t border-gray-200 dark:border-slate-700">
      <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center">
        SEO Insights 🔍
        <div className="group relative flex items-center ml-2">
            <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 dark:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                SEO powered by Gemini AI
            </span>
        </div>
      </h3>

      <div className="p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg space-y-4">
        
        <div className="flex items-center gap-4">
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
            <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${scoreColor.split(' ')[0]}`}>{score}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">SEO Score</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">An estimate of this content's performance potential.</p>
             {score < 70 && <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Hint: Try adding more specific keywords or emotional triggers.</p>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="px-2 py-1 text-xs font-medium text-sky-800 dark:text-sky-200 bg-sky-100 dark:bg-sky-900/50 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">💡 Suggestions</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        
        {optimizedTitles && optimizedTitles.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Optimized Titles (for YouTube/Blog)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {optimizedTitles.map((title, i) => <li key={i}>{title}</li>)}
            </ul>
          </div>
        )}

        {optimizedDescriptions && optimizedDescriptions.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Optimized Descriptions (for YouTube/Blog)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {optimizedDescriptions.map((desc, i) => <li key={i}>{desc}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
