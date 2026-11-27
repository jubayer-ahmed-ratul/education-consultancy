import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'chunk_reload_attempted';

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  );
}

/**
 * Wraps React.lazy with a single retry and a guarded full-page reload when
 * a new deployment invalidates old hashed JS chunk URLs.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const mod = await importer();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(RELOAD_KEY);
      }
      return mod;
    } catch (firstErr) {
      try {
        const mod = await importer();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(RELOAD_KEY);
        }
        return mod;
      } catch (secondErr) {
        if (typeof window !== 'undefined' && isChunkLoadError(secondErr)) {
          const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
          if (!alreadyReloaded) {
            sessionStorage.setItem(RELOAD_KEY, '1');
            window.location.reload();
            return new Promise<{ default: T }>(() => {});
          }
        }
        throw secondErr ?? firstErr;
      }
    }
  });
}
