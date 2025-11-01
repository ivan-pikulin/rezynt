import { Resume } from './api/types';

const STORAGE_KEY = 'guest_resume_v2';

export const guestResumeService = {
  createOrGet(): Resume {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
    const resume: Resume = {
      professional_summary: '',
      skills: [],
      work_experience: [],
      education: [],
      languages_spoken: [],
      awards: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    return resume;
  },

  get(): Resume | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  update(patch: Partial<Resume>): Resume {
    const current = this.createOrGet();
    const updated = { ...current, ...patch } as Resume;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
