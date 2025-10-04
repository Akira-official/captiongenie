import React, { useCallback, useRef } from 'react';
import { Tone, Platform } from '../types';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { SearchIcon } from './icons/SearchIcon';
import { WrenchIcon } from './icons/WrenchIcon';

interface InputFormProps {
  postIdea: string;
  setPostIdea: (value: string) => void;
  tone: Tone;
  setTone: (value: Tone) => void;
  platform: Platform;
  setPlatform: (value: Platform) => void;
  includeTitle: boolean;
  setIncludeTitle: (value: boolean) => void;
  hashtagCount: number;
  setHashtagCount: (value: number) => void;
  enhanceStyle: boolean;
  setEnhanceStyle: (value: boolean) => void;
  image: { mimeType: string; data: string; preview: string } | null;
  setImage: (image: { mimeType: string; data: string; preview: string } | null) => void;
  isCaptionLoading: boolean;
  isSeoLoading: boolean;
  onGenerateCaption: () => void;
  onGenerateSeo: () => void;
  autoOptimizeSeo: boolean;
  setAutoOptimizeSeo: (value: boolean) => void;
}

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeInfo, data] = result.split(',', 2);
      if (!mimeInfo || !data) { reject(new Error('Invalid file format')); return; }
      const mimeType = mimeInfo.split(':')[1].split(';')[0];
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

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { alert("File is too large. Please select an image under 4MB."); return; }
      try {
        const { mimeType, data } = await fileToBase64(file);
        const preview = URL.createObjectURL(file);
        setImage({ mimeType, data, preview });
      } catch (error) { console.error("Error processing image:", error); alert("Failed to process image. Please try another file."); }
    }
  }, [setImage]);

  const handleRemoveImage = useCallback(() => {
    if (image && image.preview) { URL.revokeObjectURL(image.preview); }
    setImage(null);
    if (fileInputRef.current) { fileInputRef.current.value = ""; }
  }, [image, setImage]);

  const isLoading = isCaptionLoading || isSeoLoading;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg">
      <div>
        <label htmlFor="postIdea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          What's your post about?
        </label>
        <textarea
          id="postIdea"
          rows={4}
          className="w-full p-3 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="e.g., A review of the new AI-powered coffee machine..."
          value={postIdea}
          onChange={(e) => setPostIdea(e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Or, upload an image </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                 {image ? (
                    <div className="relative group">
                        <img src={image.preview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-cover" />
                        <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"> &#x2715; </button>
                    </div>
                ) : (
                    <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L20 16h-4a4 4 0 00-4 4v8m24-12l-8 8-4-4-4 4-4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" ref={fileInputRef}/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
                    </>
                )}
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
          <select id="tone" value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full p-2 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500">
            {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
          <select id="platform" value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full p-2 bg-white dark:bg-slate-900/70 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500">
             {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="hashtagCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags: <span className="font-bold text-purple-500">{hashtagCount}</span></label>
        <input id="hashtagCount" type="range" min="0" max="30" step="1" value={hashtagCount} onChange={e => setHashtagCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><WrenchIcon className="w-4 h-4 mr-2"/> Advanced Options</h3>
        <div className="relative flex items-start">
          <div className="flex items-center h-5"><input id="includeTitle" type="checkbox" checked={includeTitle} onChange={e => setIncludeTitle(e.target.checked)} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" /></div>
          <div className="ml-3 text-sm"><label htmlFor="includeTitle" className="font-medium text-gray-700 dark:text-gray-300">Include catchy title?</label><p className="text-gray-500 dark:text-gray-400">Good for YouTube, TikTok, or blog posts.</p></div>
        </div>
         <div className="relative flex items-start">
          <div className="flex items-center h-5"><input id="enhanceStyle" type="checkbox" checked={enhanceStyle} onChange={e => setEnhanceStyle(e.target.checked)} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" /></div>
          <div className="ml-3 text-sm"><label htmlFor="enhanceStyle" className="font-medium text-gray-700 dark:text-gray-300">Enhance style? ✨</label><p className="text-gray-500 dark:text-gray-400">Use emojis, formatting & call-to-actions.</p></div>
        </div>
         <div className="relative flex items-start">
          <div className="flex items-center h-5"><input id="autoOptimizeSeo" type="checkbox" checked={autoOptimizeSeo} onChange={e => setAutoOptimizeSeo(e.target.checked)} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" /></div>
          <div className="ml-3 text-sm"><label htmlFor="autoOptimizeSeo" className="font-medium text-gray-700 dark:text-gray-300">🎯 Auto Optimize SEO</label><p className="text-gray-500 dark:text-gray-400">Analyze SEO while generating captions.</p></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button type="button" onClick={onGenerateSeo} disabled={isLoading || !postIdea.trim()} className="w-full flex items-center justify-center bg-[#4d9fff] hover:bg-[#3d8eef] text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isSeoLoading && !isCaptionLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...</>) : (<><SearchIcon className="w-5 h-5 mr-2" />Generate SEO</>)}
        </button>
        <button type="button" onClick={onGenerateCaption} disabled={isLoading || (!postIdea.trim() && !image)} className="w-full flex items-center justify-center bg-[#7b4dff] hover:bg-[#6a3ceb] text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isCaptionLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : (<><MagicWandIcon className="w-5 h-5 mr-2" />Generate Caption</>)}
        </button>
      </div>
    </form>
  );
};
