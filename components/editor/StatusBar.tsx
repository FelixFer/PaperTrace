interface StatusBarProps {
  words: number;
  chars: number;
  readingTime: number;
}

export function StatusBar({ words, chars, readingTime }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-faint">
      <span>{words} words</span>
      <span>·</span>
      <span>{chars} characters</span>
      <span>·</span>
      <span>{readingTime} min read</span>
    </div>
  );
}
