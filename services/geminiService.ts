import { GoogleGenAI, Type } from "@google/genai";
import { Tone, Platform, GeneratedContent, InputSeoAnalysis } from '../types';

// The guidelines state to assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const captionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    caption: {
      type: Type.STRING,
      description: "The main caption for the social media post. It should be engaging and relevant to the topic and/or image provided."
    },
    hashtags: {
      type: Type.OBJECT,
      properties: {
        broad: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of broad-category hashtags without the '#' symbol." },
        niche: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific, niche hashtags without the '#' symbol." },
        trending: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of currently trending hashtags relevant to the topic, if any, without the '#' symbol." },
      },
      required: ['broad', 'niche', 'trending']
    },
    title: { type: Type.STRING, description: "A catchy, optional title for the post (e.g., for YouTube Shorts, Reels, or a blog post). This should only be present if requested." },
    postingTimes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 suggested optimal times to post for maximum engagement (e.g., 'Tuesday at 2:00 PM EST')." },
    seoInsights: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "An SEO score from 0 to 100, estimating the content's potential for visibility and engagement." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of primary and secondary keywords identified from the post idea and/or image." },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actionable suggestions to improve the content's SEO and engagement." },
        optimizedTitles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 alternative, SEO-optimized titles." },
        optimizedDescriptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 alternative, SEO-optimized descriptions or captions." },
      },
      required: ['score', 'keywords', 'suggestions']
    },
  },
  required: ['caption', 'hashtags', 'seoInsights']
};

export interface GenerateCaptionOptions {
  postIdea: string;
  tone: Tone;
  platform: Platform;
  includeTitle: boolean;
  hashtagCount: number;
  enhanceStyle: boolean;
  image?: { mimeType: string; data: string };
}

export const generateCaption = async (options: GenerateCaptionOptions): Promise<GeneratedContent> => {
  const { postIdea, tone, platform, includeTitle, hashtagCount, enhanceStyle, image } = options;
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are CaptionGenie, an expert social media marketing assistant. Your goal is to generate viral, engaging, and SEO-optimized content.
- Adhere strictly to the user's requirements for tone, platform, and other options.
- If tone is 'Auto', select the most appropriate tone.
- Generate exactly ${hashtagCount} total hashtags, categorized into 'broad', 'niche', and 'trending'. Do not include the '#' symbol in the strings.
- Provide detailed SEO insights for the *generated caption*: a score (0-100), relevant keywords, and actionable improvement suggestions.
- If 'Include Title' is true, provide a catchy title. Otherwise, the title field can be null or an empty string.
- If 'Enhance Style' is true, use relevant emojis, creative formatting (like bullet points or short paragraphs), and a strong call-to-action.
- Your entire response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or formatting outside of the JSON object.`;

  const userPrompt = `Generate a social media post for ${platform}.
- Tone: ${tone}
${postIdea ? `- Post Idea: "${postIdea}"` : ''}
${image ? '- An image is provided as context. Base the content on this image.' : ''}
- Include Title: ${includeTitle}
- Enhance Style: ${enhanceStyle}
`;
  const contents: any[] = [];
  if (image) { contents.push({ inlineData: { mimeType: image.mimeType, data: image.data } }); }
  contents.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: { systemInstruction, responseMimeType: "application/json", responseSchema: captionResponseSchema, temperature: 0.7, topP: 0.95 }
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as GeneratedContent;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error(error instanceof Error ? `Failed to generate content: ${error.message}` : "An unknown error occurred while generating content.");
  }
};

const inputSeoAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "An SEO score from 0 to 100 for the user's input text, based on keyword richness, clarity, and engagement potential." },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the most relevant keywords found in the text." },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actionable suggestions to improve the text's SEO." },
    emotionalPower: { type: Type.STRING, description: "An assessment of the text's emotional impact, rated as 'Low', 'Medium', or 'High'." }
  },
  required: ['score', 'keywords', 'suggestions', 'emotionalPower']
};

export const analyzeInputForSeo = async (text: string): Promise<InputSeoAnalysis> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an SEO expert. Analyze the provided text for its SEO performance. Your analysis should focus on keyword richness, readability, tone, and engagement potential. For the 'emotionalPower' rating, perform a nuanced analysis: consider the overall sentiment (positive, negative, neutral), the intensity of the language used (e.g., 'good' vs. 'revolutionary'), and the presence of emotional triggers or power words. Based on this sophisticated analysis, provide a rating of 'Low', 'Medium', or 'High'. Provide a score, list the primary keywords you found, give actionable suggestions for improvement, and include the emotional power rating. Your response must be a single, valid JSON object that strictly adheres to the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this text: "${text}"`,
      config: { systemInstruction, responseMimeType: "application/json", responseSchema: inputSeoAnalysisSchema }
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as InputSeoAnalysis;
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    throw new Error(error instanceof Error ? `Failed to analyze SEO: ${error.message}` : "An unknown error occurred during SEO analysis.");
  }
};

const rewriteTextSchema = {
  type: Type.OBJECT,
  properties: {
    rewrittenText: { type: Type.STRING, description: "The rewritten, SEO-optimized version of the original text." }
  },
  required: ['rewrittenText']
};

export const rewriteTextForSeo = async (text: string): Promise<{ rewrittenText: string }> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert copywriter and SEO specialist. Rewrite the following text to significantly improve its SEO score to be above 85. Focus on incorporating relevant keywords naturally, improving clarity, strengthening the call-to-action, and enhancing the overall tone for better engagement. Your response must be a single, valid JSON object with the rewritten text.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Rewrite this text for better SEO: "${text}"`,
      config: { systemInstruction, responseMimeType: "application/json", responseSchema: rewriteTextSchema }
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error rewriting text for SEO:", error);
    throw new Error(error instanceof Error ? `Failed to rewrite text: ${error.message}` : "An unknown error occurred while rewriting text.");
  }
};