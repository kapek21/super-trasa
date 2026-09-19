interface Props {
  emoji: string;
}

export function BrickFace({ emoji }: Props): JSX.Element {
  return (
    <span className="brick-face" aria-hidden="true">
      {emoji}
    </span>
  );
}
