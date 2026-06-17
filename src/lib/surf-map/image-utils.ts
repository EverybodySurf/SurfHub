/**
 * Image URL manipulation for hero collage and feed cards.
 * Adds crop/dimension params to Unsplash, Pexels, and YouTube thumbnails.
 */

export function addCropParams(url: string, className: string): string {
  const colMatch = className.match(/col-span-(\d+)/);
  const rowMatch = className.match(/row-span-(\d+)/);
  
  if (!colMatch || !rowMatch) return url;
  
  const cols = parseInt(colMatch[1]);
  const rows = parseInt(rowMatch[1]);
  
  const width = cols * 120;
  const height = rows * 80;
  
  // YouTube thumbnails: swap to maxresdefault (true 16:9, no black bars)
  if (url.includes('i.ytimg.com')) {
    const match = url.match(/\/vi\/([a-zA-Z0-9_-]+)\/(?:hqdefault|maxresdefault|mqdefault|default|sddefault)/);
    if (match) {
      const videoId = match[1];
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return url;
  }
  
  // Unsplash: add fit=crop with dimensions
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format`;
  }
  
  // Pexels: similar approach
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=compress&cs=tinysrgb&w=${Math.max(width, 800)}`;
  }
  
  return url;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateCollageLayout() {
  return {
    opacities: Array(20).fill(1.0),
    scaleVariations: [
      1.02, 1.01, 1.0, 1.01, 1.0,
      0.99, 0.98, 0.97, 0.96, 0.95,
      0.94, 0.92, 0.90, 0.88, 0.86,
      0.84, 0.80, 0.80, 0.82, 0.85,
    ],
  };
}
