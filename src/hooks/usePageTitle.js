import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | GCLBA Compliance` : 'GCLBA Compliance Portal';
    return () => { document.title = prev; };
  }, [title]);
}
