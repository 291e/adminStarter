import type { SafetySystem } from 'src/services/safety-system/safety-system.types';
import { useMemo } from 'react';

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

