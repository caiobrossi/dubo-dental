import { useState, useCallback } from 'react';

export type TableMode = 'paginated' | 'infinite';

export function useTableMode(initialMode: TableMode = 'paginated') {
  const [mode, setMode] = useState<TableMode>(initialMode);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'paginated' ? 'infinite' : 'paginated');
  }, []);

  const setPaginatedMode = useCallback(() => setMode('paginated'), []);
  const setInfiniteMode = useCallback(() => setMode('infinite'), []);

  return {
    mode,
    isPaginated: mode === 'paginated',
    isInfinite: mode === 'infinite',
    toggleMode,
    setPaginatedMode,
    setInfiniteMode,
  };
}