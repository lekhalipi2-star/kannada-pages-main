import { motion } from 'framer-motion';

type Props = {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
};

const CategoryFilter = ({ categories, active, onSelect }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="relative px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors"
        >
          {active === cat && (
            <motion.div
              layoutId="category-pill"
              className="absolute inset-0 bg-terracotta rounded-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 font-kannada text-sm ${
              active === cat ? 'text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
