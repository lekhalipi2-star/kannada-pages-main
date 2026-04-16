import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserDisplayControls from '@/components/UserDisplayControls';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-terracotta" />
            <span className="font-kannada text-lg font-semibold text-foreground tracking-tight">
              ಲೇಖ ಲಿಪಿ
            </span>
          </Link>

          {/* Desktop Nav */}
          {/* <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-terracotta transition-colors">
              ಮುಖಪುಟ
            </Link>
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-terracotta transition-colors">
              ವಿಭಾಗಗಳು
            </Link>
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-terracotta transition-colors">
              ಬರಹಗಾರರು
            </Link>
          </nav> */}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <UserDisplayControls compact />
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <div className="pb-2">
                <UserDisplayControls compact />
              </div>
              <Link to="/" className="text-sm font-medium py-2 text-foreground/80" onClick={() => setMenuOpen(false)}>ಮುಖಪುಟ</Link>
              <Link to="/" className="text-sm font-medium py-2 text-foreground/80" onClick={() => setMenuOpen(false)}>ವಿಭಾಗಗಳು</Link>
              <Link to="/" className="text-sm font-medium py-2 text-foreground/80" onClick={() => setMenuOpen(false)}>ಬರಹಗಾರರು</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
