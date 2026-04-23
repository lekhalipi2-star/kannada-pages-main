import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Trash2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStories, addStory, deleteStory, getFeedback } from '@/services/api';
import {
  createChapterDraft,
  hasChapterContent,
  normalizeStoryRecord,
  type ChapterDraft,
} from '@/lib/story';

type Story = {
  id: number;
  title: string;
  category: string;
  chapters: ChapterDraft[];
};

type FeedbackItem = {
  id: number;
  story_id: number;
  story_title: string | null;
  message: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<ChapterDraft[]>([createChapterDraft(0)]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchStories();
    fetchFeedbacks();
  }, [navigate]);

 const fetchStories = async () => {
    try {
      const data = await getStories();
      console.log(data);

      const storyList = Array.isArray(data) ? data : [];

      setStories(
        storyList.map((story: any) => {
          const normalized = normalizeStoryRecord(story);

          return {
            id: Number(normalized.id),
            title: normalized.title,
            category: normalized.category,
            chapters: normalized.chapters,
          };
        })
      );
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch stories', variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await getFeedback(token);
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch feedback', variant: 'destructive' });
    }
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

  const handleAddChapterStory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!hasChapterContent(chapters)) {
      toast({ title: 'Error', description: 'Add at least one chapter with content', variant: 'destructive' });
      return;
    }

    try {
      await addStory({ title, category, chapters, cover: file }, token);
      toast({ title: 'Success', description: 'Story added successfully' });
      setCreating(false);
      setTitle('');
      setCategory('');
      setFile(null);
      setChapters([createChapterDraft(0)]);
      fetchStories();
      fetchFeedbacks();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add story', variant: 'destructive' });
    }
  };

  const handleDeleteStory = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await deleteStory(id.toString(), token);
      toast({ title: 'Success', description: 'Story deleted successfully' });
      fetchStories();
      fetchFeedbacks();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete story', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/admin-login');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCreating(true)}
              className="bg-terracotta text-white px-4 py-2 rounded-md hover:bg-terracotta/90 flex items-center gap-2"
            >
              <Plus size={16} /> Add Story
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {creating && (
          <div className="bg-card p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Story</h2>
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
              <input
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-foreground">Chapters</h3>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="inline-flex items-center gap-2 text-sm text-terracotta hover:underline"
                  >
                    <PlusCircle size={16} /> Add chapter
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
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveChapter(index, 1)}
                            className="p-2 rounded-md border border-border text-muted-foreground disabled:opacity-30"
                            disabled={index === chapters.length - 1}
                          >
                            <ChevronDown size={16} />
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
                  onClick={handleAddChapterStory}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setCreating(false);
                    setTitle('');
                    setCategory('');
                    setFile(null);
                    setChapters([createChapterDraft(0)]);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

       <div className="grid gap-4">
  {stories.map((story) => (
    <div key={story.id} className="bg-card p-4 rounded-lg">
      <h3 className="text-lg font-semibold">{story.title}</h3>

      <p className="text-muted-foreground">{story.category}</p>

      <p className="text-sm mt-2">
  {story.chapters?.[0]?.content
    ? story.chapters[0].content.substring(0, 100)
    : "No content"}
</p>

<p className="text-xs text-muted-foreground mt-1">
  {story.chapters?.length || 0} chapters
</p>

      <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/edit/${story.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Feedback</h2>
          <div className="grid gap-3">
            {feedbacks.length === 0 ? (
              <div className="bg-card p-4 rounded-lg text-muted-foreground text-sm">
                No feedback submitted yet.
              </div>
            ) : (
              feedbacks.map((item) => (
                <div key={item.id} className="bg-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Story: {item.story_title || `ID ${item.story_id}`}
                  </p>
                  <p className="text-foreground">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
