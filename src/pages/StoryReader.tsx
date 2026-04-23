import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Users, Star } from 'lucide-react';
import { stories as sampleStories } from '@/data/stories';
import { addFeedback, getCoverImageUrl, getStoryById } from '@/services/api';
import { normalizeStoryRecord, type StoryRecord } from '@/lib/story';
import UserDisplayControls from '@/components/UserDisplayControls';

const quoteBoundaryPattern = /^["'“”‘’]|["'“”‘’]$/g;

const isQuoteParagraph = (paragraph: string) => {
  const trimmed = paragraph.trim();
  return trimmed.startsWith('>') || (trimmed.startsWith('“') && trimmed.endsWith('”'));
};

const normalizeQuoteText = (paragraph: string) =>
  paragraph.trim().replace(/^>\s?/, '').replace(quoteBoundaryPattern, '').trim();

const StoryReader = () => {
  const { id } = useParams();
  const [story, setStory] = useState<StoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await getStoryById(id ?? '');
        setStory(
          normalizeStoryRecord({
            ...data,
            cover: getCoverImageUrl(data.cover_image),
            author: 'Admin',
          })
        );
      } catch {
        const sample = sampleStories.find((s) => s.id === id);
        if (sample) {
          setStory(normalizeStoryRecord(sample));
        }
      }
      setLoading(false);
    };

    fetchStory();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() && rating === 0) {
      alert('Please add a rating or message');
      return;
    }

    const message = rating > 0
      ? `Rating: ${rating}/5${feedback.trim() ? ` - ${feedback.trim()}` : ''}`
      : feedback.trim();

    try {
      await addFeedback({ story_id: id, message });
      setFeedback('');
      setRating(0);
      alert('Feedback submitted!');
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  useEffect(() => {
    setActiveChapterIndex(0);
  }, [story?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-kannada text-xl text-muted-foreground">ಕಥೆ ಸಿಗಲಿಲ್ಲ</p>
          <Link to="/" className="text-terracotta mt-4 inline-block text-sm hover:underline">
            ← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ
          </Link>
        </div>
      </div>
    );
  }

  const chapters = story.chapters;
  const activeChapter = chapters[activeChapterIndex] ?? chapters[0];
  const chapterParagraphs = activeChapter?.content.split('\n\n').filter(Boolean) ?? [];
  const hasMultipleChapters = chapters.length > 1;
  const chapterProgress = chapters.length > 0 ? ((activeChapterIndex + 1) / chapters.length) * 100 : 0;
  const completedChapters = Math.max(0, activeChapterIndex);
  const completedProgressLabel = `${Math.round(chapterProgress)}%`;
  const goToChapter = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= chapters.length) {
      return;
    }

    setActiveChapterIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_top_left,rgba(233,123,70,0.12),transparent_30%)]" />
      <div className="reading-progress" style={{ width: `${chapterProgress}%` }} />

      <header className="glass-header sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <span className="font-kannada text-sm text-muted-foreground truncate flex-1">
            {story.title}
          </span>
          <UserDisplayControls compact />
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-3 sm:px-8 py-6 sm:py-12 pb-28 sm:pb-12">
        <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
          {hasMultipleChapters && (
            <aside className="hidden lg:block lg:sticky lg:top-20">
              <div className="h-[calc(100vh-7rem)] rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-book overflow-y-auto">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Progress</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{completedProgressLabel} read</p>
                  <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-terracotta h-2 rounded-full transition-all duration-500" style={{ width: `${chapterProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedChapters} of {chapters.length} chapters completed
                  </p>
                </div>

                <div className="space-y-2">
                  {chapters.map((chapter, index) => {
                    const isActive = index === activeChapterIndex;
                    const isCompleted = index < activeChapterIndex;

                    return (
                      <button
                        key={chapter.title + index}
                        type="button"
                        onClick={() => goToChapter(index)}
                        aria-current={isActive}
                        className={`w-full text-left p-3.5 rounded-xl transition border ${
                          isActive
                            ? 'border-terracotta bg-terracotta/15 text-foreground'
                            : 'border-transparent bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 h-5 w-5 rounded-full text-[11px] inline-flex items-center justify-center ${
                              isActive
                                ? 'bg-terracotta text-white'
                                : isCompleted
                                  ? 'bg-emerald-600/85 text-white'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="line-clamp-2 text-sm leading-5">{chapter.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}

          <motion.article
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full min-w-0"
          >
              <div className="w-full max-w-full sm:max-w-[800px] mx-auto min-w-0">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-book mb-8 border border-border/70">
                <img
                  src={
                    story.cover_image
                      ? `${import.meta.env.VITE_API_URL}/uploads/${story.cover_image}`
                      : "/placeholder.svg"
                  }
                  alt={story.title}
                  className="w-full h-40 object-cover rounded"
                />
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-terracotta">
                {story.category}
              </span>
              <h1 className="font-kannada text-xl sm:text-4xl user-scale-reader-title font-bold mt-2 leading-tight text-foreground break-words">
                {story.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 user-scale-reader-meta text-muted-foreground">
                <span className="font-kannada">{story.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {story.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {story.readers}
                </span>
              </div>

              <div className="h-px bg-border my-8" />

              {hasMultipleChapters && (
                <div className="mb-8 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm shadow-book overflow-hidden">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">ಅಧ್ಯಾಯ</p>
                      <h2 className="font-kannada text-xl sm:text-4xl user-scale-chapter-title font-semibold text-foreground break-words">
                        {activeChapter?.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      {activeChapterIndex + 1} / {chapters.length}
                    </p>
                  </div>

                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-terracotta h-2 rounded-full transition-all duration-500"
                      style={{ width: `${chapterProgress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 pb-1 lg:hidden">
                    {chapters.map((chapter, index) => (
                      <button
                        key={chapter.title + index}
                        type="button"
                        onClick={() => goToChapter(index)}
                        aria-current={index === activeChapterIndex}
                        className={`rounded-full px-3 py-2 text-sm break-words max-w-full transition-colors ${
                          index === activeChapterIndex
                            ? 'bg-terracotta text-white shadow-sm'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {chapter.title}
                      </button>
                    ))}
                  </div>

                  <div className="hidden sm:flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => goToChapter(activeChapterIndex - 1)}
                      disabled={activeChapterIndex === 0}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ಹಿಂದಿನ ಅಧ್ಯಾಯ
                    </button>
                    <button
                      type="button"
                      onClick={() => goToChapter(activeChapterIndex + 1)}
                      disabled={activeChapterIndex === chapters.length - 1}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground disabled:opacity-40"
                    >
                      ಮುಂದಿನ ಅಧ್ಯಾಯ
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {!hasMultipleChapters && activeChapter && (
                <div className="mb-8 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm shadow-book overflow-hidden">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">ಅಧ್ಯಾಯ 1</p>
                  <h2 className="font-kannada text-xl sm:text-4xl user-scale-chapter-title font-semibold text-foreground mt-1 break-words">
                    {activeChapter.title}
                  </h2>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.section
                  key={activeChapterIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45 }}
                  className="kannada-body reader-typography reading-surface text-foreground/95 px-4 sm:px-7 py-5 sm:py-7 rounded-2xl border border-border/70 bg-card/45 backdrop-blur-sm shadow-book overflow-hidden"
                >
                  {chapterParagraphs.map((paragraph, index) => {
                    if (isQuoteParagraph(paragraph)) {
                      return (
                        <blockquote key={index} className="reader-quote mb-7 break-words">
                          {normalizeQuoteText(paragraph)}
                        </blockquote>
                      );
                    }

                    return (
                      <p key={index} className={`mb-6 text-sm sm:text-lg leading-7 sm:leading-9 break-words ${index === 0 ? 'drop-cap' : ''}`} style={{ wordBreak: 'break-word' }}>
                        {paragraph}
                      </p>
                    );
                  })}
                </motion.section>
              </AnimatePresence>
            </div>
          </motion.article>
        </div>

        <div className="max-w-[800px] mx-auto text-center mt-12 pt-8 border-t border-border">
          <p className="font-kannada text-muted-foreground text-sm">— ಮುಗಿಯಿತು —</p>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= rating
                      ? 'text-terracotta fill-terracotta'
                      : 'text-terracotta/40 hover:text-terracotta'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="font-kannada text-xs text-muted-foreground mt-2">ಈ ಕಥೆಗೆ ರೇಟಿಂಗ್ ನೀಡಿ</p>
        </div>

        <div className="max-w-[800px] mx-auto mt-8 p-4 bg-card/70 rounded-2xl border border-border/70 shadow-book">
          <h3 className="font-kannada text-lg font-semibold mb-4">ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
            className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground h-28 mb-4 resize-none"
          />
          <button
            onClick={handleSubmitFeedback}
            className="bg-terracotta text-white px-5 py-2.5 rounded-full hover:bg-terracotta/90"
          >
            ಸಲ್ಲಿಸಿ
          </button>
        </div>

        {hasMultipleChapters && (
          <div className="sm:hidden fixed left-3 right-3 bottom-3 z-50">
            <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-book p-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => goToChapter(activeChapterIndex - 1)}
                  disabled={activeChapterIndex === 0}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  ಹಿಂದಿನ
                </button>
                <button
                  type="button"
                  onClick={() => goToChapter(activeChapterIndex + 1)}
                  disabled={activeChapterIndex === chapters.length - 1}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-terracotta text-white px-3 py-2.5 text-sm disabled:opacity-40"
                >
                  ಮುಂದಿನ
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReader;
