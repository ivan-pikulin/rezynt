import { Resume, FixSuggestion } from '../../../shared/services/api/types';

/**
 * Get value from resume by field path
 * Examples:
 * - "professional_summary" → resume.professional_summary
 * - "work_experience[0].job_title" → resume.work_experience[0].job_title
 * - "work_experience[1].achievements[2]" → resume.work_experience[1].achievements[2]
 * - "skills" → resume.skills (can return array)
 */
export function getFieldValue(resume: Resume, fieldPath: string): any {
  try {
    const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
    let current: any = resume;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    // Return the value as is (can be string, array, object, etc.)
    return current;
  } catch (error) {
    console.error('Error getting field value:', error, fieldPath);
    return undefined;
  }
}

/**
 * Set value in resume by field path (immutable)
 * Returns new resume object with updated value
 */
export function setFieldValue(resume: Resume, fieldPath: string, value: string | string[]): Resume {
  const newResume = JSON.parse(JSON.stringify(resume)); // Deep clone
  
  try {
    const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
    let current: any = newResume;
    
    // Navigate to parent
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || current[part] === null) {
        // Create missing path
        const nextPart = parts[i + 1];
        current[part] = isNaN(Number(nextPart)) ? {} : [];
      }
      current = current[part];
    }
    
    // Set final value
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
    
    return newResume;
  } catch (error) {
    console.error('Error setting field value:', error, fieldPath);
    return resume;
  }
}

/**
 * Add value to array field by field path (immutable)
 * For type='add' operations
 */
export function addToArrayField(resume: Resume, fieldPath: string, value: string): Resume {
  const newResume = JSON.parse(JSON.stringify(resume)); // Deep clone
  
  try {
    // Parse field path
    const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
    let current: any = newResume;
    
    // Navigate to parent, creating missing paths
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i === parts.length - 1) {
        // Last part - this is the array to modify
        if (!Array.isArray(current[part])) {
          current[part] = [];
        }
        
        // Add values with duplicate check (handle comma-separated for skills)
        if (value.includes(',')) {
          const newItems = value.split(',').map(s => s.trim()).filter(Boolean);
          // Only add items that don't already exist (case-insensitive)
          const itemsToAdd = newItems.filter(newItem => 
            !current[part].some((existingItem: any) => 
              typeof existingItem === 'string' && 
              existingItem.toLowerCase() === newItem.toLowerCase()
            )
          );
          current[part].push(...itemsToAdd);
        } else {
          // Check if item already exists (case-insensitive)
          const exists = current[part].some((existingItem: any) => 
            typeof existingItem === 'string' && 
            existingItem.toLowerCase() === value.toLowerCase()
          );
          if (!exists) {
            current[part].push(value);
          }
        }
      } else {
        // Navigate deeper
        if (current[part] === undefined || current[part] === null) {
          const nextPart = parts[i + 1];
          current[part] = isNaN(Number(nextPart)) ? {} : [];
        }
        current = current[part];
      }
    }
    
    return newResume;
  } catch (error) {
    console.error('Error adding to array field:', error, fieldPath);
    return resume;
  }
}

/**
 * Apply fix suggestion to resume (immutable)
 */
export function applyFixToResume(
  resume: Resume,
  fixSuggestion: FixSuggestion
): Resume {
  if (!fixSuggestion.new_content) {
    return resume;
  }
  
  switch (fixSuggestion.type) {
    case 'replace':
      return setFieldValue(resume, fixSuggestion.field_path, fixSuggestion.new_content);
    
    case 'add':
      // For add, new_content should be a string (comma-separated for parsing)
      const contentToAdd = Array.isArray(fixSuggestion.new_content) 
        ? fixSuggestion.new_content.join(', ')
        : fixSuggestion.new_content;
      return addToArrayField(resume, fixSuggestion.field_path, contentToAdd);
    
    case 'delete':
      // TODO: Implement delete if needed
      return resume;
    
    default:
      return resume;
  }
}
