import { useEffect, useState } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'plans' }
  | { name: 'edit'; id: string }
  | { name: 'compare' };

function parse(): Route {
  const [a, b] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (a === 'plans') return { name: 'plans' };
  if (a === 'compare') return { name: 'compare' };
  if (a === 'plan' && b) return { name: 'edit', id: decodeURIComponent(b) };
  return { name: 'dashboard' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function go(path: string) {
  window.location.hash = path;
}
