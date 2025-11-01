import { BuilderState, BuilderStep } from '../types/builder';

const BUILDER_STORAGE_KEY = 'rezynt_resume_builder';

/**
 * Service for managing resume builder data in localStorage
 */
export class BuilderStorageService {
  /**
   * Get builder state from localStorage
   */
  static get(): BuilderState | null {
    try {
      const data = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Error reading builder data from localStorage:', error);
      return null;
    }
  }

  /**
   * Save builder state to localStorage
   */
  static save(state: Partial<BuilderState>): void {
    try {
      const current = this.get() || this.getDefaultState();
      const updated = { ...current, ...state };
      localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving builder data to localStorage:', error);
    }
  }

  /**
   * Update specific field in builder state
   */
  static updateField<K extends keyof BuilderState>(
    field: K, 
    value: BuilderState[K]
  ): void {
    this.save({ [field]: value } as Partial<BuilderState>);
  }

  /**
   * Mark step as completed
   */
  static markStepCompleted(step: BuilderStep): void {
    const current = this.get();
    if (!current) return;

    const completedSteps = new Set(current.completedSteps || []);
    completedSteps.add(step);
    
    this.save({ completedSteps: Array.from(completedSteps) });
  }

  /**
   * Set current step
   */
  static setCurrentStep(step: BuilderStep): void {
    this.save({ currentStep: step });
  }

  /**
   * Clear all builder data
   */
  static clear(): void {
    try {
      localStorage.removeItem(BUILDER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing builder data:', error);
    }
  }

  /**
   * Get default empty state
   */
  static getDefaultState(): BuilderState {
    return {
      currentStep: 'contact-info',
      completedSteps: [],
      personal_info: {
        first_name: '',
        last_name: '',
        city: '',
        country: '',
        contacts: {
          email: '',
          phone: '',
        },
      },
      professional_summary: '',
      skills: [],
      work_experience: [],
      education: [],
    };
  }

  /**
   * Initialize builder state if not exists
   */
  static initialize(): BuilderState {
    const existing = this.get();
    if (existing) return existing;

    const defaultState = this.getDefaultState();
    this.save(defaultState);
    return defaultState;
  }
}

