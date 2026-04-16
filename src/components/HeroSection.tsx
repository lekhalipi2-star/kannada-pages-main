import { motion } from 'framer-motion';
import heroBg from '@/assets/hero-bg.jpg';

const HeroSection = () => {
  return (
  <section className="relative overflow-hidden rounded-2xl mx-4 sm:mx-6 mt-6 mb-8 border border-white/10 shadow-book">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/35" />
      </div>

      {/* Content */}
      <div className="relative px-6 sm:px-10 py-12 sm:py-16 max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="font-kannada user-scale-hero-title font-bold text-paper leading-tight"
        >
          ನಿಮ್ಮ ಕಥೆಗಳು,
          <br />
          ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="font-kannada user-scale-hero-subtitle text-paper/75 mt-4 leading-relaxed max-w-md"
        >
          ಕನ್ನಡದ ಅತ್ಯುತ್ತಮ ಕಥೆಗಳನ್ನು ಓದಿ. ನಿಮ್ಮ ಸೃಜನಶೀಲತೆಯನ್ನು ಜಗತ್ತಿಗೆ ತೋರಿಸಿ.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 flex gap-3"
        >
          <button className="px-5 py-2.5 bg-terracotta text-primary-foreground rounded-lg text-sm font-medium hover:bg-terracotta-hover transition-colors">
          ಓದಲು ಪ್ರಾರಂಭಿಸಿ
          </button>
          <button className="px-5 py-2.5 bg-paper/10 text-paper border border-paper/20 rounded-lg text-sm font-medium hover:bg-paper/20 transition-colors">
            ಬರೆಯಿರಿ
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
