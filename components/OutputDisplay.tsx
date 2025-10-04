import React, { useState } from 'react';
import { type GeneratedContent, type InputSeoAnalysis } from '../types';
import { Loader } from './Loader';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SeoInsightsDisplay } from './SeoInsightsDisplay';
import { InputSeoAnalysisDisplay } from './InputSeoAnalysisDisplay';

interface OutputDisplayProps {
  content: GeneratedContent | null;
  inputSeoAnalysis: InputSeoAnalysis | null;
  isCaptionLoading: boolean;
  isSeoLoading: boolean;
  isFixingSeo: boolean;
  error: string | null;
  activeTab: 'content' | 'seo';
  setActiveTab: (tab: 'content' | 'seo') => void;
  onFixSeo: () => void;
  onFixGeneratedSeo: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-200/50 dark:bg-slate-700/50 hover:bg-gray-300/70 dark:hover:bg-slate-600/70 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all" aria-label="Copy to clipboard">
      {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};

const HashtagGroup: React.FC<{ title: string; tags: string[]; className?: string }> = ({ title, tags, className }) => {
  if (!tags || tags.length === 0) return null;
  const formattedHashtags = tags.map(tag => `#${tag}`).join(' ');
  return (
    <div>
      <h4 className={`font-semibold text-sm mb-1 ${className}`}>{title}</h4>
      <p className="text-gray-600 dark:text-gray-400/90 break-words leading-relaxed">{formattedHashtags}</p>
    </div>
  );
};

const highlightKeywords = (text: string, keywords: string[]): React.ReactNode => {
  if (!keywords || keywords.length === 0 || !text) return text;
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
    return isKeyword ? <strong key={i} className="font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 rounded-sm px-0.5 py-0.5">{part}</strong> : part;
  });
};

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${ isActive ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50' }`}>
      {children}
    </button>
  );
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, inputSeoAnalysis, isCaptionLoading, isSeoLoading, isFixingSeo, error, activeTab, setActiveTab, onFixSeo, onFixGeneratedSeo }) => {
  const [copyAll, setCopyAll] = useState(false);

  const handleCopyAll = () => {
    if (!content) return;
    const { caption, hashtags, title, postingTimes } = content;
    const allHashtags = Object.values(hashtags).flat().map(h => `#${h}`).join(' ');
    const textToCopy = [ title ? `Title: ${title}\n` : '', `Caption:\n${caption}\n`, `Hashtags:\n${allHashtags}`, postingTimes && postingTimes.length > 0 ? `\n\nSuggested Post Times:\n- ${postingTimes.join('\n- ')}` : '' ].filter(Boolean).join('\n').trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyAll(true);
      setTimeout(() => setCopyAll(false), 2000);
    });
  }

  const renderContentTab = () => {
    if (isCaptionLoading) return <div className="flex flex-col items-center justify-center h-full min-h-[400px]"><Loader /><p className="mt-4 text-gray-500 dark:text-gray-400">CaptionGenie is thinking...</p></div>;
    if (error && activeTab === 'content') return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4"><p className="text-red-500 dark:text-red-400 font-semibold">An Error Occurred</p><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p></div>;
    if (!content) return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"><p className="text-2xl font-display text-gray-400 dark:text-gray-500">Your results will appear here</p><p className="text-gray-500 dark:text-gray-600 mt-2">Fill out the form and let the magic happen!</p></div>;
    const allHashtags = Object.values(content.hashtags).flat();
    return (
      <div className="space-y-6 animate-fade-in">
        {content.title && (<div><h3 className="font-bold text-lg mb-2 text-fuchsia-500 dark:text-fuchsia-400">Title</h3><div className="relative p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg"><CopyButton textToCopy={content.title} /><p className="text-gray-700 dark:text-gray-300 font-semibold pr-8">{content.title}</p></div></div>)}
        {content.caption && (<div><h3 className="font-bold text-lg mb-2 text-purple-500 dark:text-purple-400">Caption</h3><div className="relative p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg"><CopyButton textToCopy={content.caption} /><p className="text-gray-700 dark:text-gray-300 pr-8 whitespace-pre-wrap">{highlightKeywords(content.caption, content.seoInsights.keywords)}</p></div></div>)}
        {allHashtags.length > 0 && (<div><h3 className="font-bold text-lg mb-2 text-cyan-500 dark:text-cyan-400">Hashtags</h3><div className="relative p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3"><CopyButton textToCopy={allHashtags.map(tag => `#${tag}`).join(' ')} /><div className="pr-8"><HashtagGroup title="Broad" tags={content.hashtags.broad} className="text-cyan-600 dark:text-cyan-300" /><HashtagGroup title="Niche" tags={content.hashtags.niche} className="text-teal-600 dark:text-teal-300" /><HashtagGroup title="Trending" tags={content.hashtags.trending} className="text-sky-600 dark:text-sky-300" /></div></div></div>)}
        {content.postingTimes && content.postingTimes.length > 0 && (<div><h3 className="font-bold text-lg mb-2 text-amber-500 dark:text-amber-400">Suggested Post Times</h3><div className="relative p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-slate-700 rounded-lg"><CopyButton textToCopy={content.postingTimes.join(', ')} /><ul className="list-disc list-inside text-gray-700 dark:text-gray-300 pr-8">{content.postingTimes.map((time, i) => <li key={i}>{time}</li>)}</ul></div></div>)}
        <button onClick={handleCopyAll} className="w-full flex items-center justify-center bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">{copyAll ? <><CheckIcon className="w-5 h-5 mr-2 text-green-500"/> Copied!</> : 'Copy Everything ✨'}</button>
        {content.seoInsights && <SeoInsightsDisplay insights={content.seoInsights} onFixSeo={onFixGeneratedSeo} isLoading={isFixingSeo} />}
      </div>
    );
  };
  
  const renderSeoTab = () => {
    if (isSeoLoading) return <div className="flex flex-col items-center justify-center h-full min-h-[400px]"><Loader /><p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing SEO...</p></div>;
    if (error && activeTab === 'seo') return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4"><p className="text-red-500 dark:text-red-400 font-semibold">An Error Occurred</p><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p></div>;
    if (!inputSeoAnalysis) return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"><p className="text-2xl font-display text-gray-400 dark:text-gray-500">SEO Analysis will appear here</p><p className="text-gray-500 dark:text-gray-600 mt-2">Enter an idea and click "Generate SEO".</p></div>;

    return <InputSeoAnalysisDisplay analysis={inputSeoAnalysis} onFixSeo={onFixSeo} isLoading={isSeoLoading} />;
  }

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg">
      <div className="border-b border-gray-200 dark:border-slate-700 px-4">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
          <TabButton isActive={activeTab === 'content'} onClick={() => setActiveTab('content')}>Content</TabButton>
          <TabButton isActive={activeTab === 'seo'} onClick={() => setActiveTab('seo')}>SEO Analysis</TabButton>
        </nav>
      </div>
      <div className="p-6">
        {activeTab === 'content' ? renderContentTab() : renderSeoTab()}
      </div>
    </div>
  );
};