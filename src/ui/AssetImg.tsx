import { useState } from 'react';

interface Props {
  src: string;
  fallback: string;
  className?: string;
}

export function AssetImg({ src, fallback, className }: Props): JSX.Element {
  const [ok, setOk] = useState(true);
  if (!ok) return <span className={className}>{fallback}</span>;
  return (
    <img
      src={src}
      alt=""
      className={className}
      draggable={false}
      onError={() => setOk(false)}
    />
  );
}
