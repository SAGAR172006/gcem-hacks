import { httpClient } from '../services/axios';
import { config } from '../config';

export const imageAgent = async (query: string): Promise<string | null> => {
  try {
    if (config.unsplashKey) {
      const res = await httpClient.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${config.unsplashKey}`
      );
      if (res.data?.urls?.regular) {
        return res.data.urls.regular;
      }
    }
    // Fallback to source.unsplash (Note: source.unsplash.com is deprecated but sometimes works for generic terms)
    return `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
  } catch (error) {
    console.warn(`[ImageAgent] Unsplash fetch failed for "${query}"`);
    // Safe fallback image if everything fails
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
};
