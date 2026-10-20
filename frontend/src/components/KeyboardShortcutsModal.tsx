import React, { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'P', desc: 'Open Post a Take composer' },
    { key: 'F', desc: 'Jump to Takes Feed' },
    { key: 'L', desc: 'Open Credibility Index Leaderboard' },
    { key: 'H', desc: 'Navigate to Overview / Home' },
    { key: 'M', desc: 'View My Forecaster Profile' },
    { key: '?', desc: 'Toggle keyboard shortcuts menu' },
    { key: 'ESC', desc: 'Close open dialogs or detail drawers' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#17171A] border border-[#242428] w-full max-w-md text-left shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#242428] px-5 py-3.5 bg-[#111113]">
          <h2 id="shortcuts-title" className="text-sm font-bold font-mono text-[#FAFAFA] uppercase tracking-wider">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="text-[#71717A] hover:text-[#FAFAFA] font-mono text-sm px-1.5 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 font-mono text-xs">
          {shortcuts.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between py-1.5 border-b border-[#242428]/60">
              <span className="text-[#A1A1AA]">{desc}</span>
              <kbd className="px-2 py-1 bg-[#111113] border border-[#242428] text-[#00E5A0] font-semibold text-[11px] shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[#242428] bg-[#111113] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-mono text-[#FAFAFA] border border-[#242428] hover:border-[#383840]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
