interface AffirmationTickerProps {
  text: string;
  isVisible: boolean;
}

export function AffirmationTicker({ text, isVisible }: AffirmationTickerProps) {
  if (!isVisible || !text) return null;

  return (
    <div className="affirmation-ticker">
      <div className="affirmation-glow" />
      <p className="affirmation-text" key={text}>
        {text}
      </p>
    </div>
  );
}
