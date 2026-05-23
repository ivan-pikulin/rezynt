import { useState, useEffect, useCallback } from 'react';
import { BuilderFieldUpdate, BuilderState, BuilderStep, BUILDER_STEPS } from '../types/builder';
import { BuilderStorageService } from '../services/builderStorageService';

export function useBuilder() {
  const [state, setState] = useState<BuilderState>(() => 
    BuilderStorageService.initialize()
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    BuilderStorageService.save(state);
  }, [state]);

  const updateField = useCallback(<K extends keyof BuilderState>(
    field: K, 
    value: BuilderFieldUpdate<K>
  ) => {
    setState(prev => {
      const nextValue =
        typeof value === 'function'
          ? value(prev[field], prev)
          : value;
      return { ...prev, [field]: nextValue };
    });
  }, []);

  const goToStep = useCallback((step: BuilderStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const goToNextStep = useCallback(() => {
    const currentIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex < BUILDER_STEPS.length - 1) {
      const nextStep = BUILDER_STEPS[currentIndex + 1];
      
      // Mark current step as completed
      setState(prev => ({
        ...prev,
        currentStep: nextStep.id,
        completedSteps: Array.from(new Set([...prev.completedSteps, state.currentStep])),
      }));
    }
  }, [state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex > 0) {
      const prevStep = BUILDER_STEPS[currentIndex - 1];
      setState(prev => ({ ...prev, currentStep: prevStep.id }));
    }
  }, [state.currentStep]);

  const isStepCompleted = useCallback((step: BuilderStep) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);

  const canGoNext = useCallback(() => {
    const currentIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);
    return currentIndex < BUILDER_STEPS.length - 1;
  }, [state.currentStep]);

  const canGoBack = useCallback(() => {
    const currentIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep]);

  const getNextStepLabel = useCallback(() => {
    const currentIndex = BUILDER_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex < BUILDER_STEPS.length - 1) {
      return BUILDER_STEPS[currentIndex + 1].label;
    }
    return null;
  }, [state.currentStep]);

  const clearBuilder = useCallback(() => {
    BuilderStorageService.clear();
    setState(BuilderStorageService.getDefaultState());
  }, []);

  const getProgress = useCallback(() => {
    const totalSteps = BUILDER_STEPS.length;
    const completedCount = state.completedSteps.length;
    return Math.round((completedCount / totalSteps) * 100);
  }, [state.completedSteps]);

  return {
    state,
    updateField,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isStepCompleted,
    canGoNext,
    canGoBack,
    getNextStepLabel,
    clearBuilder,
    getProgress,
  };
}
