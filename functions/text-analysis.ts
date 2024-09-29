import { createCanvas } from 'canvas';
import Fuse from 'fuse.js';

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getTextWidth(text: string, fontSize: number = 16, fontFamily: string = "Arial") {
  const canvas = createCanvas(200, 200); // Adjust dimensions as needed
  const context = canvas.getContext('2d');
  if (context) {
    context.font = `${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  }
  return 0;
}

export function filterOnQuery(query: string, data: Term[], keys: string[] = ['name']) {
  return data.filter(term => {
    if (query.trim()) {
      const fuse = new Fuse([term], {
        keys: keys,
        includeScore: true,
        threshold: 0.5,
      });
      const results = fuse.search(query);
      return results.length > 0;
    }
    return true;
  });
}