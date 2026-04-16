import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import type { StoryRecord } from '@/lib/story';

type Props = {
  story: StoryRecord;
  index: number;
};

const StoryCard = ({ story, index }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link to={`/story/${story.id}`} className="group block">
        <div className="p-1 rounded-xl shadow-book hover:shadow-card-hover transition-all duration-300 bg-card/90 group-hover:-translate-y-1 border border-border/70 backdrop-blur-md">
          {/* Cover */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden">
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="p-3 pt-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-terracotta">
              {story.category}
            </span>
            <h3 className="font-kannada user-scale-card-title font-semibold mt-0.5 leading-tight text-foreground line-clamp-2">
              {story.title}
            </h3>
            <p className="user-scale-card-meta text-muted-foreground mt-1">{story.author}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {story.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {story.readers}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default StoryCard;
