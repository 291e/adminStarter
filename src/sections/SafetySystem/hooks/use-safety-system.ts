import type { SafetySystem } from 'src/_mock/_safety-system';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseSafetySystemResult = {
  filtered: SafetySystem[];
  total: number;
};

export function useSafetySystem(systems: SafetySystem[]): UseSafetySystemResult {
  const filtered = useMemo(() => systems, [systems]);
  const total = filtered.length;

  return {
    filtered,
    total,
  };
}

