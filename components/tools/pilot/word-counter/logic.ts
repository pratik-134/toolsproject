export interface WordCountStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  keywordDensity: { word: string; count: number; percentage: number }[];
}

export function analyzeText(text: string): WordCountStats {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      keywordDensity: [],
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Words count
  const wordMatches = text.trim().match(/[a-zA-Z0-9\u00C0-\u024F'’\-]+/g);
  const words = wordMatches ? wordMatches.length : 0;

  // Sentences count (split by ., !, ?, or newline)
  const sentenceMatches = text.match(/[^.!?\n]+[.!?\n]+/g);
  const sentences = sentenceMatches ? sentenceMatches.length : text.trim() ? 1 : 0;

  // Paragraphs count
  const paragraphMatches = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphMatches.length;

  // Reading time (~225 wpm)
  const readingTimeMinutes = Math.ceil((words / 225) * 10) / 10;
  // Speaking time (~130 wpm)
  const speakingTimeMinutes = Math.ceil((words / 130) * 10) / 10;

  // Keyword density (words longer than 2 characters, top 8)
  const freqMap = new Map<string, number>();
  if (wordMatches) {
    for (const raw of wordMatches) {
      const lower = raw.toLowerCase();
      if (lower.length > 2) {
        freqMap.set(lower, (freqMap.get(lower) || 0) + 1);
      }
    }
  }

  const sortedWords = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const keywordDensity = sortedWords.map(([w, count]) => ({
    word: w,
    count,
    percentage: words > 0 ? Math.round((count / words) * 100 * 10) / 10 : 0,
  }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
    keywordDensity,
  };
}
