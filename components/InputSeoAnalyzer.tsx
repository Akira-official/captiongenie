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

/**
 * Analyzes the text for emotional impact using a sophisticated heuristic.
 * It calculates a score based on an expanded, weighted lexicon of emotive words,
 * handles negations (e.g., 'not good'), considers various intensifiers (e.g., 'very'),
 * and adds a bonus for exclamation marks. The final score is normalized by word count
 * to provide a more accurate 'Low', 'Medium', or 'High' rating of emotional power.
 */
const getEmotionalPower = (text: string): { level: 'Low' | 'Medium' | 'High'; color: string } => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return { level: 'Low', color: 'text-gray-500 dark:text-gray-400' };
  }

  // Expanded lexicon with weighted emotional words
  const sentimentLexicon: { [key: string]: number } = {
    // Strong (score: 3)
    'amazing': 3, 'incredible': 3, 'love': 3, 'best': 3, 'revolutionary': 3, 'life-changing': 3, 'unforgettable': 3, 'perfect': 3, 'fantastic': 3, 'wonderful': 3, 'breathtaking': 3, 'sensational': 3,
    'hate': -3, 'shocking': -3, 'heartbreaking': -3, 'terrible': -3, 'awful': -3, 'worst': -3, 'disaster': -3, 'horrible': -3, 'devastating': -3,
    // Medium (score: 2)
    'powerful': 2, 'magic': 2, 'guaranteed': 2, 'proven': 2, 'great': 2, 'happy': 2, 'excellent': 2, 'awesome': 2, 'beautiful': 2, 'stunning': 2,
    'urgent': -2, 'critical': -2, 'sad': -2, 'bad': -2, 'poor': -2, 'disappointing': -2, 'frustrating': -2,
    // Weak (score: 1)
    'good': 1, 'nice': 1, 'like': 1, 'cool': 1, 'fun': 1, 'decent': 1,
    'problem': -1, 'issue': -1, 'concern': -1, 'risk': -1,
  };

  const intensifiers: { [key: string]: number } = {
    'very': 1.5, 'extremely': 2.0, 'incredibly': 2.0, 'really': 1.5, 'so': 1.2, 'absolutely': 2.0, 'completely': 2.0, 'totally': 2.0,
  };
  
  const negations = new Set(['not', 'no', "don't", "isn't", "aren't", "wasn't", "weren't", "can't", "couldn't"]);

  let emotionalScore = 0;
  
  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i];
    const word = rawWord.replace(/[.,!?:;()"']/g, '');

    if (sentimentLexicon[word]) {
      let score = sentimentLexicon[word];
      
      // Check for intensifiers before the word
      if (i > 0 && intensifiers[words[i-1]]) {
        score *= intensifiers[words[i-1]];
      }
      
      // Check for negations before the word
      if (i > 0 && negations.has(words[i-1])) {
        score *= -0.5; // Dampen and reverse the score
      }
      
      // We care about intensity, not direction (positive/negative) for "power"
      emotionalScore += Math.abs(score);
    }
  }

  // Add a small bonus for exclamation marks as they indicate excitement/urgency
  const exclamationCount = (text.match(/!/g) || []).length;
  emotionalScore += exclamationCount * 0.5;

  // Normalize the score based on the word count to get an emotional density percentage
  const normalizedScore = (emotionalScore / wordCount) * 100;

  if (normalizedScore > 20) {
    return { level: 'High', color: 'text-green-500' };
  }
  if (normalizedScore > 8) {
    return { level: 'Medium', color: 'text-yellow-500' };
  }
  return { level: 'Low', color: 'text-gray-500 dark:text-gray-400' };
};


export const InputSeoAnalyzer: React.FC<InputSeoAnalyzerProps> = ({ text }) => {
  const wordCount = useMemo(() => countWords(text), [text]);
  const sentiment = useMemo(() => getSentimentScore(wordCount), [wordCount]);
  const emotionalPower = useMemo(() => getEmotionalPower(text), [text]);
  const charCount = text.length;

  // This component has been removed from the main InputForm to avoid confusion with the dedicated SEO analysis feature.
  // It is no longer displayed in the UI.
  if (true) return null;

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
        <span>Emotional Power: <span className={`font-semibold ${emotionalPower.color}`}>{emotionalPower.level}</span></span>
        <span>Character Count: {charCount}</span>
      </div>
    </div>
  );
};