import { resumeApi } from './api/resumeApi';
import { guestResumeService } from './guestResumeService';

export async function migrateGuestResumeIfAny(): Promise<number | null> {
  const guest = guestResumeService.get();
  if (!guest) return null;

  // Create resume on server
  const created = await resumeApi.createResume({
    title: guest.title || 'My Resume',
    template_slug: guest.template_slug || 'nume',
    professional_summary: guest.professional_summary || ''
  });

  // Update fields
  const patch: any = {
    first_name: guest.first_name,
    last_name: guest.last_name,
    location: guest.location,
    contacts: guest.contacts,
    skills: guest.skills,
    experience: guest.experience,
    education: guest.education,
  };
  await resumeApi.updateResumePartial(created.id, patch);

  guestResumeService.clear();
  return created.id;
}


