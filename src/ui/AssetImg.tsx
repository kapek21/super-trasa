import { useState } from 'react';

interface Props {
  src: string;
  fallback: string;
  className?: string;
}

function withBase(src: string): string {
  if (/^(https?:|data:)/i.test(src)) return src;
  const base = import.meta.env.BASE_URL || '/';
  const path = src.replace(/^\//, '');
  return `${base.endsWith('/') ? base : `${base}/`}${path}`;
}

export function AssetImg({ src, fallback, className }: Props): JSX.Element {
  const href = withBase(src);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  if (failedFor === href) return <span className={className}>{fallback}</span>;
  return (
    <img
      src={href}
      alt=""
      className={className}
      draggable={false}
      onError={() => setFailedFor(href)}
    />
  );
}
