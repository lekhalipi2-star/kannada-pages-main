import { Moon, Sun, Type } from 'lucide-react';
import { useUserDisplaySettings } from '@/context/UserDisplaySettingsContext';

type Props = {
  compact?: boolean;
};

const UserDisplayControls = ({ compact = false }: Props) => {
  const {
    isDarkMode,
    toggleDarkMode,
    fontScale,
    increaseFontScale,
    decreaseFontScale,
  } = useUserDisplaySettings();

  const disabledDecrease = fontScale <= 0.9;
  const disabledIncrease = fontScale >= 1.35;

  return (
    <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
      <button
        type="button"
        onClick={toggleDarkMode}
        className="p-2 rounded-lg border border-border bg-card/70 hover:bg-secondary transition-colors"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Light mode' : 'Dark mode'}
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="flex items-center rounded-lg border border-border bg-card/70 overflow-hidden">
        <button
          type="button"
          onClick={decreaseFontScale}
          disabled={disabledDecrease}
          className="px-2.5 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-40"
          aria-label="Decrease font size"
          title="Decrease font size"
        >
          A-
        </button>

        <span className="px-2.5 text-[11px] text-muted-foreground border-x border-border inline-flex items-center gap-1">
          <Type className="w-3 h-3" />
          {Math.round(fontScale * 100)}%
        </span>

        <button
          type="button"
          onClick={increaseFontScale}
          disabled={disabledIncrease}
          className="px-2.5 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-40"
          aria-label="Increase font size"
          title="Increase font size"
        >
          A+
        </button>
      </div>
    </div>
  );
};

export default UserDisplayControls;
