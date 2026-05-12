import { useEffect, useState } from 'react';
import { getAllAssetPaths } from '../assets/manifest';

// ── Module-level image cache ────────────────────────────────────────────────
// Exported so renderers can do synchronous imageCache.get(path) lookups.
export const imageCache = new Map<string, HTMLImageElement>();

// ── Module-level loading — starts at import time, before React renders ──────
// This avoids any StrictMode double-effect / race issues.
const _allPaths = getAllAssetPaths();
let _resolved = 0;
let _loadComplete = _allPaths.length === 0;
const _progressCallbacks = new Set<(progress: number, done: boolean) => void>();

function _notify() {
  const progress = _allPaths.length > 0 ? _resolved / _allPaths.length : 1;
  _progressCallbacks.forEach((cb) => cb(progress, _loadComplete));
}

if (_allPaths.length > 0) {
  Promise.all(
    _allPaths.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.set(src, img);
            _resolved++;
            _notify();
            resolve();
          };
          img.onerror = () => {
            console.warn(`[AssetLoader] Failed to load: ${src}`);
            _resolved++;
            _notify();
            resolve();
          };
          img.src = src;
        }),
    ),
  ).then(() => {
    _loadComplete = true;
    _notify();
  });
}

// ── React hook ───────────────────────────────────────────────────────────────
interface UseAssetLoaderResult {
  loaded: boolean;
  progress: number;
}

export function useAssetLoader(): UseAssetLoaderResult {
  const [state, setState] = useState<UseAssetLoaderResult>(() => ({
    loaded: _loadComplete,
    progress: _allPaths.length > 0 ? _resolved / _allPaths.length : 1,
  }));

  useEffect(() => {
    // Already done by the time the effect mounts — update once
    if (_loadComplete) {
      setState({ loaded: true, progress: 1 });
      return;
    }

    const cb = (progress: number, done: boolean) => {
      setState({ loaded: done, progress });
    };
    _progressCallbacks.add(cb);

    // Check again in case loading finished between render and this effect
    if (_loadComplete) {
      setState({ loaded: true, progress: 1 });
    }

    return () => {
      _progressCallbacks.delete(cb);
    };
  }, []);

  return state;
}

