import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryFilter from '@/components/CategoryFilter';
import StoryCard from '@/components/StoryCard';
import { categories } from '@/data/stories';
import { getCoverImageUrl, getStories } from '@/services/api';
import { normalizeStoryRecord, type StoryRecord } from '@/lib/story';
import { getStories } from '@/services/api';
import { normalizeStoryRecord, type StoryRecord } from '@/lib/story';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('ಎಲ್ಲಾ');
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStories();
        console.log("API DATA:", data);

        const storyList = Array.isArray(data) ? data : [];

       const normalizedStories = storyList.map(normalizeStoryRecord);
        setStories(normalizedStories);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("FINAL STORIES:", stories);
  }, [stories]);

  const allStories = stories;

  const filtered = activeCategory === 'ಎಲ್ಲಾ'
    ? allStories
    : allStories.filter((s) => s.category === activeCategory);

  return (
    <div className="page-shell min-h-screen bg-background">
      <Header />
      <main className="relative z-10 container mx-auto max-w-6xl">
        <HeroSection />

        <section className="px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-kannada user-scale-section-title font-semibold text-foreground">
              ಜನಪ್ರಿಯ ಕಥೆಗಳು
            </h2>
          </div>

          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {filtered.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>

          {filtered.length === 0 && loaded && (
            <div className="text-center py-16">
              <p className="font-kannada text-muted-foreground text-lg">
                ಈ ವಿಭಾಗದಲ್ಲಿ ಕಥೆಗಳು ಇನ್ನೂ ಸೇರಿಸಲಾಗಿಲ್ಲ
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
