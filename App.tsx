
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { generateCaption, analyzeInputForSeo, rewriteTextForSeo } from './services/geminiService';
import { Tone, Platform, type GeneratedContent, type HistoryItem, type InputSeoAnalysis } from './types';
import { ThemeToggle } from './components/ThemeToggle';

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const HistoryPanel: React.FC<{ isOpen: boolean; onClose: () => void; history: HistoryItem[] }> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-20" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200">Recent Captions</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"><CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-500 text-center py-8">No history yet. Generate a caption to see it here!</p>
        ) : (
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{item.timestamp}</p>
                <div className="flex gap-4">
                  {(item.imagePreview) && <img src={item.imagePreview} alt="Post preview" className="w-16 h-16 rounded-md object-cover" />}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">"{item.postIdea}"</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  // Fix: Explicitly type the theme state to prevent type inference issues where it's inferred as `string` instead of `'light' | 'dark'`.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [postIdea, setPostIdea] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.Auto);
  const [platform, setPlatform] = useState<Platform>(Platform.Instagram);
  const [includeTitle, setIncludeTitle] = useState(false);
  const [hashtagCount, setHashtagCount] = useState(10);
  const [enhanceStyle, setEnhanceStyle] = useState(false);
  const [image, setImage] = useState<{ mimeType: string; data: string; preview: string } | null>(null);
  const [autoOptimizeSeo, setAutoOptimizeSeo] = useState(false);
  
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [inputSeoAnalysis, setInputSeoAnalysis] = useState<InputSeoAnalysis | null>(null);
  
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); localStorage.setItem('theme', 'dark');
    } else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [theme]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('captionGenieHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('captionGenieHistory');
    }
  }, []);

  const addToHistory = useCallback((content: GeneratedContent, postIdea: string, imagePreview?: string) => {
    setHistory(prevHistory => {
      const newHistoryItem: HistoryItem = { ...content, id: new Date().toISOString() + Math.random(), postIdea: postIdea || (imagePreview ? "Image-based post" : "Untitled post"), timestamp: new Date().toLocaleString(), imagePreview, };
      const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 5);
      localStorage.setItem('captionGenieHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const handleGenerateCaption = useCallback(async () => {
    if (!postIdea.trim() && !image) { setError('Please enter a post idea or upload an image.'); return; }
    setIsCaptionLoading(true);
    if (autoOptimizeSeo) setIsSeoLoading(true);
    setError(null);
    setGeneratedContent(null);
    setInputSeoAnalysis(null);

    try {
      const captionPromise = generateCaption({ postIdea, tone, platform, includeTitle, hashtagCount, enhanceStyle, image: image ? { mimeType: image.mimeType, data: image.data } : undefined, });
      const seoPromise = autoOptimizeSeo ? analyzeInputForSeo(postIdea) : Promise.resolve(null);
      
      const [captionResult, seoResult] = await Promise.all([captionPromise, seoPromise]);
      
      setGeneratedContent(captionResult);
      addToHistory(captionResult, postIdea, image?.preview);
      if (seoResult) setInputSeoAnalysis(seoResult);

      setActiveTab('content');
    } catch (err) {
      console.error(err);
      setError(`Failed to generate content. ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
    } finally {
      setIsCaptionLoading(false);
      setIsSeoLoading(false);
    }
  }, [postIdea, tone, platform, includeTitle, hashtagCount, enhanceStyle, image, addToHistory, autoOptimizeSeo]);
  
  const handleGenerateSeo = useCallback(async () => {
    if (!postIdea.trim()) { setError('Please enter a post idea to analyze.'); return; }
    setIsSeoLoading(true);
    setError(null);
    setInputSeoAnalysis(null);
    try {
      const result = await analyzeInputForSeo(postIdea);
      setInputSeoAnalysis(result);
      setActiveTab('seo');
    } catch (err) {
      console.error(err);
      setError(`Failed to analyze SEO. ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
    } finally {
      setIsSeoLoading(false);
    }
  }, [postIdea]);

  const handleFixSeo = useCallback(async () => {
    if (!postIdea.trim()) { setError('Please enter a post idea to fix.'); return; }
    setIsSeoLoading(true);
    setError(null);
    try {
      const { rewrittenText } = await rewriteTextForSeo(postIdea);
      setPostIdea(rewrittenText);
      const newAnalysis = await analyzeInputForSeo(rewrittenText);
      setInputSeoAnalysis(newAnalysis);
      setActiveTab('seo');
    } catch (err) {
      console.error(err);
      setError(`Failed to fix SEO. ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
    } finally {
      setIsSeoLoading(false);
    }
  }, [postIdea]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 text-gray-800 dark:text-gray-200">
       <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button onClick={() => setIsHistoryOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors" aria-label="View history" >
                <HistoryIcon className="w-6 h-6" />
              </button>
            </div>
        </Header>
        <main className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <InputForm
              postIdea={postIdea} setPostIdea={setPostIdea}
              tone={tone} setTone={setTone}
              platform={platform} setPlatform={setPlatform}
              includeTitle={includeTitle} setIncludeTitle={setIncludeTitle}
              hashtagCount={hashtagCount} setHashtagCount={setHashtagCount}
              enhanceStyle={enhanceStyle} setEnhanceStyle={setEnhanceStyle}
              image={image} setImage={setImage}
              isCaptionLoading={isCaptionLoading} isSeoLoading={isSeoLoading}
              onGenerateCaption={handleGenerateCaption} onGenerateSeo={handleGenerateSeo}
              autoOptimizeSeo={autoOptimizeSeo} setAutoOptimizeSeo={setAutoOptimizeSeo}
            />
          </div>
          <div className="w-full sticky top-8">
            <OutputDisplay 
              content={generatedContent}
              inputSeoAnalysis={inputSeoAnalysis}
              isCaptionLoading={isCaptionLoading}
              isSeoLoading={isSeoLoading}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onFixSeo={handleFixSeo}
            />
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-500 text-sm">
            <p>Powered by Gemini API</p>
            <p className="text-xs mt-1">Made by Akira Group 💜</p>
        </footer>
      </div>
    </div>
  );
}