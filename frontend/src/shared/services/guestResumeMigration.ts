import { resumeApi } from './api/resumeApi';
import { guestResumeService } from './guestResumeService';

export async function migrateGuestResumeIfAny(): Promise<number | null> {
  const guest = guestResumeService.get();
  if (!guest) return null;

  try {
    // Check if user already has resumes
    const existingResumes = await resumeApi.getUserResumes();
    
    // If user already has resumes, ignore migration and clear guest data
    if (existingResumes && existingResumes.length > 0) {
      console.log('User already has resumes, skipping guest resume migration');
      return null;
    }

    // Check if guest resume has meaningful data (not just empty default)
    const hasData = guest.first_name || 
                   guest.last_name || 
                   guest.location || 
                   (guest.contacts && guest.contacts.length > 0) ||
                   (guest.skills && guest.skills.length > 0) ||
                   (guest.experience && guest.experience.length > 0) ||
                   (guest.education && guest.education.length > 0) ||
                   guest.professional_summary;

    // If no meaningful data, just clear guest data and skip migration
    if (!hasData) {
      console.log('Guest resume has no meaningful data, skipping migration');
      guestResumeService.clear();
      return null;
    }

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

    // Clear guest data after successful migration
    guestResumeService.clear();
    console.log('Guest resume successfully migrated to server');
    return created.id;
  } catch (error) {
    console.error('Error during guest resume migration:', error);
    // Don't clear guest data on error, allow retry on next login
    return null;
  }
}


