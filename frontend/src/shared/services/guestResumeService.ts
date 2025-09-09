import { Resume } from './api/types';

const STORAGE_KEY = 'guest_resume_v1';

export const guestResumeService = {
  createOrGet(): Resume {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
    const now = new Date().toISOString();
    const resume: Resume = {
      id: -1,
      user_id: -1,
      title: 'My Resume',
      template_slug: 'nume',
      professional_summary: '',
      conversation_id: undefined,
      from_upload: false,
      created_at: now,
      updated_at: now,
      first_name: '',
      last_name: '',
      location: '',
      contacts: [],
      skills: [],
      experience: [],
      education: []
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
    const updated = { ...current, ...patch, updated_at: new Date().toISOString() } as Resume;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};


