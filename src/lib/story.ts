export type Chapter = {
  title: string;
  content: string;
};

export type StoryRecord = {
  id: string;
  title: string;
  author: string;
  cover: string;
  cover_image: string;
  category: string;
  readTime: string;
  readers: string;
  excerpt: string;
  chapters: Chapter[];
};

export type ChapterDraft = Chapter;

const DEFAULT_CHAPTER_TITLE = 'ಅಧ್ಯಾಯ';
const DEFAULT_PLACEHOLDER = 'ಈ ಕಥೆಗೆ ವಿಷಯ ಇನ್ನೂ ಸೇರಿಸಲಾಗಿಲ್ಲ.';

const cleanText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeChapter = (chapter: unknown, index: number): Chapter | null => {
  if (typeof chapter === 'string') {
    const content = chapter.trim();
    return content ? { title: `${DEFAULT_CHAPTER_TITLE} ${index + 1}`, content } : null;
  }

  if (!chapter || typeof chapter !== 'object') {
    return null;
  }

  const typedChapter = chapter as Partial<Chapter> & { content?: unknown };
  const content = cleanText(typedChapter.content);
  if (!content) {
    return null;
  }

  const title = cleanText(typedChapter.title) || `${DEFAULT_CHAPTER_TITLE} ${index + 1}`;

  return { title, content };
};

const splitTextIntoChapters = (content: string): Chapter[] => {
  const paragraphs = content
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((paragraph, index) => ({
      title: `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
      content: paragraph,
    }));
  }

  const trimmedContent = content.trim();
  return trimmedContent ? [{ title: `${DEFAULT_CHAPTER_TITLE} 1`, content: trimmedContent }] : [];
};

const parseChapterSource = (source: unknown): Chapter[] => {
  if (Array.isArray(source)) {
    return source.map((chapter, index) => normalizeChapter(chapter, index)).filter(Boolean) as Chapter[];
  }

  if (typeof source === 'string') {
    const trimmed = source.trim();

    if (!trimmed) {
      return [];
    }

    try {
      return parseChapterSource(JSON.parse(trimmed));
    } catch {
      return splitTextIntoChapters(trimmed);
    }
  }

  if (source && typeof source === 'object') {
    const typedSource = source as { chapters?: unknown; content?: unknown };

    if (Array.isArray(typedSource.chapters)) {
      return parseChapterSource(typedSource.chapters);
    }

    if (typeof typedSource.content === 'string') {
      return splitTextIntoChapters(typedSource.content);
    }
  }

  return [];
};

const getWordCount = (chapters: Chapter[]) =>
  chapters.reduce((total, chapter) => total + chapter.content.split(/\s+/).filter(Boolean).length, 0);

export const createChapterDraft = (index: number): ChapterDraft => ({
  title: `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
  content: '',
});

export const parseStoryChapters = (source: unknown, allowPlaceholder = true): Chapter[] => {
  const chapters = parseChapterSource(source);

  if (chapters.length > 0 || !allowPlaceholder) {
    return chapters;
  }

  return [{ title: `${DEFAULT_CHAPTER_TITLE} 1`, content: DEFAULT_PLACEHOLDER }];
};

export const normalizeStoryRecord = (story: any): StoryRecord => {
  const chapters = parseStoryChapters(story?.chapters ?? story?.content);

  return {
    id: story?.id?.toString?.() ?? '',
    title: cleanText(story?.title),
    author: cleanText(story?.author) || 'Admin',
    cover: cleanText(story?.cover) || cleanText(story?.cover_image) || '/placeholder.svg',
    category: cleanText(story?.category),
    readTime:
      cleanText(story?.readTime) || `${Math.max(1, Math.ceil(getWordCount(chapters) / 180))} ನಿಮಿಷ`,
    readers: cleanText(story?.readers) || '0',
    excerpt:
      cleanText(story?.excerpt) ||
      chapters[0]?.content.slice(0, 120) ||
      DEFAULT_PLACEHOLDER,
    chapters,
  };
};

export const buildStoryContentPayload = (chapters: ChapterDraft[]) =>
  JSON.stringify({
    chapters: chapters
      .map((chapter, index) => ({
        title: cleanText(chapter.title) || `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
        content: cleanText(chapter.content),
      }))
      .filter((chapter) => chapter.content.length > 0),
  });

export const hasChapterContent = (chapters: ChapterDraft[]) =>
  chapters.some((chapter) => cleanText(chapter.content).length > 0);
