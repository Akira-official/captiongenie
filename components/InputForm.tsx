import React, { useCallback, useRef } from 'react';
import { Tone, Platform } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SearchIcon } from './icons/SearchIcon';

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

interface InputFormProps {
  postIdea: string;
  setPostIdea: (idea: string) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  includeTitle: boolean;
  setIncludeTitle: (include: boolean) => void;
  hashtagCount: number;
  setHashtagCount: (count: number) => void;
  enhanceStyle: boolean;
  setEnhanceStyle: (enhance: boolean) => void;
  image: { mimeType: string; data: string; preview: string } | null;
  setImage: (image: { mimeType: string; data: string; preview: string } | null) => void;
  isCaptionLoading: boolean;
  isSeoLoading: boolean;
  onGenerateCaption: () => void;
  onGenerateSeo: () => void;
  autoOptimizeSeo: boolean;
  setAutoOptimizeSeo: (optimize: boolean) => void;
}

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
      const data = result.split(',')[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};


export const InputForm: React.FC<InputFormProps> = ({
  postIdea, setPostIdea,
  tone, setTone,
  platform, setPlatform,
  includeTitle, setIncludeTitle,
  hashtagCount, setHashtagCount,
  enhanceStyle, setEnhanceStyle,
  image, setImage,
  isCaptionLoading, isSeoLoading,
  onGenerateCaption, onGenerateSeo,
  autoOptimizeSeo, setAutoOptimizeSeo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("Image size should be less than 4MB.");
        return;
      }
      try {
        const { mimeType, data } = await fileToBase64(file);
        const preview = URL.createObjectURL(file);
        setImage({ mimeType, data, preview });
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("Failed to process image.");
      }
    }
  }, [setImage]);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg space-y-6">
      <div>
        <label htmlFor="post-idea" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Your Post Idea or Topic
        </label>
        <textarea
          id="post-idea"
          value={postIdea}
          onChange={(e) => setPostIdea(e.target.value)}
          placeholder="e.g., A new product launch for a sustainable coffee brand"
          className="w-full h-32 p-3 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Add an Image (Optional)
        </label>
        {image ? (
          <div className="relative group">
            <img src={image.preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <button onClick={handleRemoveImage} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleImageUploadClick} className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Click to upload</span>
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 4MB</span>
          </button>
        )}
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tone</label>
          <select id="tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full p-2 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="platform" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Platform</label>
          <select id="platform" value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full p-2 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="hashtag-count" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Number of Hashtags ({hashtagCount})
        </label>
        <input
          id="hashtag-count"
          type="range"
          min="0"
          max="30"
          value={hashtagCount}
          onChange={e => setHashtagCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
        />
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Include a Title?</span>
          <div className="relative">
            <input type="checkbox" checked={includeTitle} onChange={e => setIncludeTitle(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </div>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enhance Style (Emojis, Formatting)?</span>
          <div className="relative">
            <input type="checkbox" checked={enhanceStyle} onChange={e => setEnhanceStyle(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </div>
        </label>
        <label className="flex items-center justify-between cursor-pointer p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
          <div>
            <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Auto-Analyze & Optimize SEO?</span>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Generates SEO analysis for your input when creating captions.</p>
          </div>
          <div className="relative ml-4">
            <input type="checkbox" checked={autoOptimizeSeo} onChange={e => setAutoOptimizeSeo(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </div>
        </label>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onGenerateCaption}
          disabled={isCaptionLoading || (!postIdea.trim() && !image)}
          className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCaptionLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Caption
            </>
          )}
        </button>
        <button
          onClick={onGenerateSeo}
          disabled={isSeoLoading || !postIdea.trim()}
          className="w-full md:w-auto flex items-center justify-center bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSeoLoading ? (
             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <>
              <SearchIcon className="w-5 h-5 mr-2" />
              Generate SEO
            </>
          )}
        </button>
      </div>
    </div>
  );
};
