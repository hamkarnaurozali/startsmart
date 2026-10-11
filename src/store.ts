import { useCallback, useEffect, useState } from 'react';
import type { Lang } from './i18n';
import { loadState, newId, newPlan, saveState, type StoredState } from './storage';
import type { BusinessType, Plan } from './types';

export function useStore() {
  const [state, setState] = useState<StoredState>(() => loadState());
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setSaveError(!saveState(state));
  }, [state]);

  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);

  const addPlan = useCallback((name: string, type: BusinessType, useSample: boolean): string => {
    const plan = newPlan(name, type, useSample);
    setState((s) => ({ ...s, plans: [plan, ...s.plans] }));
    return plan.id;
  }, []);

  const updatePlan = useCallback((id: string, fn: (p: Plan) => Plan) => {
    setState((s) => ({
      ...s,
      plans: s.plans.map((p) => (p.id === id ? { ...fn(p), updatedAt: Date.now() } : p)),
    }));
  }, []);

  const removePlan = useCallback((id: string) => {
    setState((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) }));
  }, []);

  const duplicatePlan = useCallback((id: string, suffix: string) => {
    setState((s) => {
      const src = s.plans.find((p) => p.id === id);
      if (!src) return s;
      const now = Date.now();
      const copy: Plan = {
        ...src,
        id: newId(),
        name: `${src.name} ${suffix}`.trim(),
        startup: { ...src.startup },
        monthly: { ...src.monthly },
        createdAt: now,
        updatedAt: now,
      };
      return { ...s, plans: [copy, ...s.plans] };
    });
  }, []);

  return { plans: state.plans, lang: state.lang, saveError, setLang, addPlan, updatePlan, removePlan, duplicatePlan };
}
