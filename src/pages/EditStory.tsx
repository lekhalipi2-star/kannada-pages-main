import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getStoryById, updateStory } from '@/services/api';
import {
  createChapterDraft,
  hasChapterContent,
  normalizeStoryRecord,
  type ChapterDraft,
} from '@/lib/story';

const EditStory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [chapters, setChapters] = useState<ChapterDraft[]>([createChapterDraft(0)]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchStory();
  }, [navigate, id]);

  const fetchStory = async () => {
    try {
      const data = await getStoryById(id!);
      const story = normalizeStoryRecord(data);
      setTitle(story.title);
      setCategory(story.category);
      setChapters(
        story.chapters.length > 0
          ? story.chapters
          : [createChapterDraft(0)]
      );
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch story', variant: 'destructive' });
    }
    setLoading(false);
  };

  const updateChapter = (index: number, field: 'title' | 'content', value: string) => {
    setChapters((currentChapters) =>
      currentChapters.map((chapter, chapterIndex) =>
        chapterIndex === index ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const addChapter = () => {
    setChapters((currentChapters) => [...currentChapters, createChapterDraft(currentChapters.length)]);
  };

  const removeChapter = (index: number) => {
    setChapters((currentChapters) => {
      if (currentChapters.length === 1) {
        return currentChapters;
      }

      return currentChapters.filter((_, chapterIndex) => chapterIndex !== index);
    });
  };

  const moveChapter = (index: number, direction: -1 | 1) => {
    setChapters((currentChapters) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= currentChapters.length) {
        return currentChapters;
      }

      const nextChapters = [...currentChapters];
      const [currentChapter] = nextChapters.splice(index, 1);
      nextChapters.splice(targetIndex, 0, currentChapter);

      return nextChapters.map((chapter, chapterIndex) => ({
        ...chapter,
        title: chapter.title || `ಅಧ್ಯಾಯ ${chapterIndex + 1}`,
      }));
    });
  };

  const handleUpdateStory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!hasChapterContent(chapters)) {
      toast({ title: 'Error', description: 'Add at least one chapter with content', variant: 'destructive' });
      return;
    }

    try {
      await updateStory(id!, { title, category, chapters }, token);
      toast({ title: 'Success', description: 'Story updated successfully' });
      navigate('/admin');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update story', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Edit Story</h1>
        <div className="bg-card p-6 rounded-lg">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
            <div className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">Chapters</h3>
                <button
                  type="button"
                  onClick={addChapter}
                  className="text-sm text-terracotta hover:underline"
                >
                  Add chapter
                </button>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <div key={index} className="rounded-md border border-border p-4 bg-background/40 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder={`Chapter ${index + 1} title`}
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveChapter(index, -1)}
                          className="p-2 rounded-md border border-border text-muted-foreground disabled:opacity-30"
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChapter(index, 1)}
                          className="p-2 rounded-md border border-border text-muted-foreground disabled:opacity-30"
                          disabled={index === chapters.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeChapter(index)}
                          className="px-3 py-2 rounded-md border border-border text-sm text-red-500 disabled:opacity-30"
                          disabled={chapters.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <textarea
                      placeholder="Chapter content"
                      value={chapter.content}
                      onChange={(e) => updateChapter(index, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground h-32"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdateStory}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Update
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStory;