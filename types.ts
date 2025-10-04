// Fix: Removed unused and problematic 'os' import which is a Node.js module.

export enum Tone {
  Auto = "Auto",
  Witty = "Witty",
  Professional = "Professional",
  Casual = "Casual",
  Inspirational = "Inspirational",
  Humorous = "Humorous",
}

export enum Platform {
  Instagram = "Instagram",
  Twitter = "Twitter / X",
  LinkedIn = "LinkedIn",
  Facebook = "Facebook",
  TikTok = "TikTok",
  Blog = "Blog",
}

export interface SeoInsights {
  score: number;
  keywords: string[];
  suggestions: string[];
  optimizedTitles?: string[];
  optimizedDescriptions?: string[];
}

export interface InputSeoAnalysis {
  score: number;
  keywords: string[];
  suggestions: string[];
  emotionalPower?: 'Low' | 'Medium' | 'High';
}

export interface GeneratedContent {
  caption: string;
  hashtags: {
    broad: string[];
    niche: string[];
    trending: string[];
  };
  title?: string;
  postingTimes?: string[];
  seoInsights: SeoInsights;
}

export interface HistoryItem extends GeneratedContent {
  id: string;
  postIdea: string;
  timestamp: string;
  imagePreview?: string;
}