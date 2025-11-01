// Guest resume migration is no longer needed with new JSONB structure
// Users now have one resume stored directly in their account
// This file is kept for reference but disabled

export const guestResumeMigration = {
  migrateIfNeeded: async (): Promise<void> => {
    // Migration disabled - new structure doesn't use resume_id based system
    console.log('Guest resume migration disabled - using new JSONB structure');
  }
};
