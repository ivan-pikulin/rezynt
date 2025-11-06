import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import AddIcon from '@mui/icons-material/Add';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Resume } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';
import EducationEditor, { EducationEditorHandle } from './EducationEditor';
import ExperienceEditor, { ExperienceEditorHandle } from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';
import { pulseElement } from '../utils/pulseAnimation';
import { addButtonStyle } from '../styles/buttonStyles';

// Contact configuration
const CONTACT_CONFIGS = [
  { field: 'email', icon: EmailIcon, label: 'Email' },
  { field: 'phone', icon: PhoneIcon, label: 'Phone' },
  { field: 'telegram', icon: TelegramIcon, label: 'Telegram' },
  { field: 'whatsapp', icon: WhatsAppIcon, label: 'WhatsApp' },
  { field: 'linkedin', icon: LinkedInIcon, label: 'LinkedIn' },
  { field: 'github', icon: GitHubIcon, label: 'GitHub' },
  { field: 'website', icon: LanguageIcon, label: 'Website' },
  { field: 'twitter', icon: TwitterIcon, label: 'Twitter' },
  { field: 'instagram', icon: InstagramIcon, label: 'Instagram' },
] as const;

// Simple input component to replace MUI TextField
const SimpleInput: React.FC<{
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}> = ({ id, placeholder, value, onChange, onBlur }) => {
  return (
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
        if (onBlur) onBlur();
      }}
      style={{
        width: '100%',
        fontSize: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #e5e7eb',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = COLORS.primary.main;
      }}
    />
  );
};

type Props = {
  resume: Resume;
  onResumeUpdate: (resume: Resume, addToHistory?: boolean) => void;
};

export type EditorAccordionHandle = {
  navigateToField: (fieldPath: string) => void;
};

const EditorAccordion = forwardRef<EditorAccordionHandle, Props>(({ resume, onResumeUpdate }, ref) => {
  const { t } = useTranslation();

  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(
    new Set(['personal', 'summary', 'skills'])
  );
  
  const experienceEditorRef = useRef<ExperienceEditorHandle>(null);
  const educationEditorRef = useRef<EducationEditorHandle>(null);
  const addContactButtonRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState({
    professional_summary: resume.professional_summary || '',
    first_name: resume.personal_info?.first_name || '',
    last_name: resume.personal_info?.last_name || '',
    current_role: resume.personal_info?.current_role || '',
    city: resume.personal_info?.city || '',
    country: resume.personal_info?.country || '',
    // Contacts
    email: resume.personal_info?.contacts?.email || '',
    phone: resume.personal_info?.contacts?.phone || '',
    telegram: resume.personal_info?.contacts?.telegram || '',
    whatsapp: resume.personal_info?.contacts?.whatsapp || '',
    linkedin: resume.personal_info?.contacts?.linkedin || '',
    github: resume.personal_info?.contacts?.github || '',
    website: resume.personal_info?.contacts?.website || '',
    twitter: resume.personal_info?.contacts?.twitter || '',
    instagram: resume.personal_info?.contacts?.instagram || ''
  });

  // State for contact menu
  const [contactMenuAnchor, setContactMenuAnchor] = useState<null | HTMLElement>(null);
  const [visibleContacts, setVisibleContacts] = useState<Set<string>>(() => {
    const visible = new Set<string>();
    CONTACT_CONFIGS.forEach(({ field }) => {
      if (resume.personal_info?.contacts?.[field as keyof typeof resume.personal_info.contacts]) {
        visible.add(field);
      }
    });
    return visible;
  });

  useEffect(() => {
    // Always update localResume when resume prop changes
    // This is important for undo/redo to work properly
    setLocalResume(resume);
    setFormData({
      professional_summary: resume.professional_summary || '',
      first_name: resume.personal_info?.first_name || '',
      last_name: resume.personal_info?.last_name || '',
      current_role: resume.personal_info?.current_role || '',
      city: resume.personal_info?.city || '',
      country: resume.personal_info?.country || '',
      // Contacts
      email: resume.personal_info?.contacts?.email || '',
      phone: resume.personal_info?.contacts?.phone || '',
      telegram: resume.personal_info?.contacts?.telegram || '',
      whatsapp: resume.personal_info?.contacts?.whatsapp || '',
      linkedin: resume.personal_info?.contacts?.linkedin || '',
      github: resume.personal_info?.contacts?.github || '',
      website: resume.personal_info?.contacts?.website || '',
      twitter: resume.personal_info?.contacts?.twitter || '',
      instagram: resume.personal_info?.contacts?.instagram || ''
    });
    
    // Update visible contacts
    const visible = new Set<string>();
    CONTACT_CONFIGS.forEach(({ field }) => {
      if (resume.personal_info?.contacts?.[field as keyof typeof resume.personal_info.contacts]) {
        visible.add(field);
      }
    });
    setVisibleContacts(visible);
  }, [resume]);

  // Toggle accordion
  const toggleAccordion = (accordionId: string) => {
    setExpandedAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      return newSet;
    });
  };

  // Navigate to specific field based on field_path
  useImperativeHandle(ref, () => {
    const navigateToField = (fieldPath: string) => {
      console.log('📍 EditorAccordion.navigateToField called:', fieldPath);
      
      // Check for .new suffix (indicates pulse add button)
      const hasNewSuffix = fieldPath.endsWith('.new');
      const cleanPath = hasNewSuffix ? fieldPath.replace(/\.new$/, '') : fieldPath;
      
      // Parse field_path (e.g., "work_experience[0].achievements", "professional_summary", "personal_info.email")
      const parts = cleanPath.split('.');
      const mainFieldWithIndex = parts[0]; // e.g., "work_experience[0]"
      const mainField = mainFieldWithIndex.split('[')[0]; // e.g., "work_experience"
      
      // Extract array index if present
      const indexMatch = mainFieldWithIndex.match(/\[(\d+)\]/);
      const arrayIndex = indexMatch ? parseInt(indexMatch[1], 10) : null;
      
      // Get sub-field (after the dot)
      const subField = parts.slice(1).join('.'); // e.g., "achievements" or "email"
      
      console.log('🔍 Parsed field path:', {
        mainField,
        arrayIndex,
        subField,
        hasNewSuffix,
        fullPath: fieldPath
      });
      
      // Map field to accordion ID
      let accordionId = '';
      if (mainField === 'personal_info') {
        accordionId = 'personal';
      } else if (mainField === 'professional_summary') {
        accordionId = 'summary';
      } else if (mainField === 'skills') {
        accordionId = 'skills';
      } else if (mainField === 'work_experience') {
        accordionId = 'experience';
      } else if (mainField === 'education') {
        accordionId = 'education';
      }
      
      // Open the accordion if it's not already open
      if (accordionId) {
        setExpandedAccordions((prev) => {
          const newSet = new Set(prev);
          newSet.add(accordionId);
          return newSet;
        });
        
        // For nested fields (experience/education), delegate to child editor
        setTimeout(() => {
          if (mainField === 'work_experience' && arrayIndex !== null && experienceEditorRef.current) {
            // Navigate to specific experience field
            console.log('➡️ Delegating to ExperienceEditor:', { arrayIndex, subField, hasNewSuffix });
            experienceEditorRef.current.navigateToField(arrayIndex, subField || 'job_title', hasNewSuffix);
          } else if (mainField === 'work_experience' && arrayIndex === null && hasNewSuffix && experienceEditorRef.current) {
            // .new suffix without index - pulse Add Experience button
            console.log('➡️ Pulsing Add Experience button (.new suffix)');
            experienceEditorRef.current.pulseAddButton();
          } else if (mainField === 'education' && arrayIndex !== null && educationEditorRef.current) {
            // Navigate to specific education field
            console.log('➡️ Delegating to EducationEditor:', { arrayIndex, subField, hasNewSuffix });
            educationEditorRef.current.navigateToField(arrayIndex, subField || 'degree', hasNewSuffix);
          } else if (mainField === 'education' && arrayIndex === null && hasNewSuffix && educationEditorRef.current) {
            // .new suffix without index - pulse Add Education button
            console.log('➡️ Pulsing Add Education button (.new suffix)');
            educationEditorRef.current.pulseAddButton();
          } else {
            console.log('➡️ Navigating to simple field:', { accordionId, mainField, subField });
            // For simple fields, just scroll to accordion and focus on field
            const element = document.getElementById(`accordion-${accordionId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Try to focus on the specific field if it exists
            setTimeout(() => {
              let fieldId = '';
              if (mainField === 'personal_info' && subField) {
                // Special case: 'contacts' with .new suffix - pulse Add Contact button
                if (subField === 'contacts' && hasNewSuffix) {
                  console.log('🔑 Field path is "contacts.new", pulsing Add Contact button');
                  console.log('🔍 addContactButtonRef.current exists:', !!addContactButtonRef.current);
                  
                  if (addContactButtonRef.current) {
                    console.log('✅ Found Add Contact button, pulsing...');
                    pulseElement(addContactButtonRef.current);
                  } else {
                    console.log('❌ Add Contact button ref not found');
                  }
                  return; // Don't try to focus on field
                } else if (subField === 'contacts') {
                  // Just 'contacts' without .new - scroll to contacts section
                  const element = document.getElementById('accordion-personal');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  return;
                } else {
                  // Handle nested contacts fields: contacts.email -> email
                  const actualField = subField.includes('contacts.') 
                    ? subField.replace('contacts.', '') 
                    : subField;
                  fieldId = `personal-${actualField}`;
                  console.log('🔑 Generated field ID for personal_info:', { subField, actualField, fieldId });
                }
              } else if (mainField === 'personal_info' && !subField) {
                // No subfield specified - focus on first personal info field
                fieldId = 'personal-first_name';
                console.log('🔑 No subfield, focusing on first field:', fieldId);
              } else if (mainField === 'professional_summary') {
                fieldId = 'professional-summary';
              } else if (mainField === 'skills') {
                // Focus on new skill input
                fieldId = 'skill-new';
                console.log('🔑 Skills field, focusing on new skill input:', fieldId);
              }
              
              if (fieldId) {
                console.log('🔎 Trying to focus on field:', fieldId);
                const inputElement = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
                
                if (inputElement) {
                  console.log('✅ Input element found:', inputElement.tagName);
                  
                  // Scroll into view
                  inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Additional delay to ensure scroll completes before focusing
                  setTimeout(() => {
                    console.log('🎯 Focusing on element...');
                    
                    // Focus and select
                    inputElement.focus();
                    if (inputElement.select) {
                      inputElement.select();
                    }
                    
                    // Add highlight animation
                    const originalTransition = inputElement.style.transition;
                    const originalBoxShadow = inputElement.style.boxShadow;
                    
                    // Apply smooth pulsing highlight
                    inputElement.style.transition = 'box-shadow 0.3s ease-in-out';
                    inputElement.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.4)';
                    
                    // Fade out after 2 seconds
                    setTimeout(() => {
                      inputElement.style.boxShadow = '0 0 0 0 rgba(37, 99, 235, 0)';
                      
                      // Clean up after transition completes
                      setTimeout(() => {
                        inputElement.style.transition = originalTransition;
                        inputElement.style.boxShadow = originalBoxShadow;
                      }, 300);
                    }, 2000);
                    
                    console.log('✅ Focus completed');
                  }, 100);
                } else {
                  console.log('❌ Field element not found:', fieldId);
                  console.log('Available personal fields:', 
                    Array.from(document.querySelectorAll('[id^="personal-"]')).map(el => el.id)
                  );
                }
              }
            }, 200);
          }
        }, 150);
      }
    };
    
    return { navigateToField };
  }, []);

  const handleFieldChange = (field: string, value: string, isBlur: boolean = false) => {
    console.log('✏️ EditorAccordion: field changed', { field, value, isBlur });
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Contact fields
    const contactFields = ['email', 'phone', 'telegram', 'whatsapp', 'linkedin', 'github', 'website', 'twitter', 'instagram'];
    
    // If blur event and value is empty and it's a contact field, hide it
    if (isBlur && !value.trim() && contactFields.includes(field)) {
      setVisibleContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
    
    // Update local resume immediately with deep copy of nested objects
    const updated = { 
      ...localResume,
      personal_info: localResume.personal_info ? {
        ...localResume.personal_info,
        contacts: localResume.personal_info.contacts ? {
          ...localResume.personal_info.contacts
        } : {}
      } : {
        contacts: {}
      }
    };
    
    if (field === 'professional_summary') {
      updated.professional_summary = value;
    } else if (contactFields.includes(field)) {
      // Update contacts - remove if empty, otherwise set value
      if (!value.trim()) {
        delete (updated.personal_info!.contacts as any)[field];
      } else {
        (updated.personal_info!.contacts as any)[field] = value;
      }
    } else {
      // Update personal info fields
      (updated.personal_info as any)[field] = value;
    }
    
    console.log('✏️ EditorAccordion: calling onResumeUpdate', {
      field,
      isBlur,
      updatedResume: JSON.stringify(updated).substring(0, 150) + '...'
    });
    
    setLocalResume(updated);
    // Add to history only on blur (field editing complete)
    onResumeUpdate(updated, isBlur);
  };

  // Handle adding a contact
  const handleAddContact = (field: string) => {
    setVisibleContacts(prev => {
      const newSet = new Set(prev);
      newSet.add(field);
      return newSet;
    });
    setContactMenuAnchor(null);
    
    // Focus on the new field after a short delay
    setTimeout(() => {
      const element = document.getElementById(`personal-${field}`);
      if (element) {
        element.focus();
      }
    }, 100);
  };

  const accordionStyles = {
    '&:before': { display: 'none' },
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    mb: 2,
    backgroundColor: 'white',
    '& .MuiAccordionSummary-root': { 
      minHeight: '48px',
      padding: '12px 16px',
      '&.Mui-expanded': { minHeight: '48px', padding: '12px 16px' }
    },
    '& .MuiAccordionSummary-content': { margin: 0 },
    '& .MuiAccordionDetails-root': { padding: '8px 16px 16px 16px' }
  };

  const sectionNameStyles = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#F9FAFB',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#e5e7eb',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '12px',
      padding: '8px 12px',
    },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#F5F7FA' }}>
        {/* Personal Info */}
        <Accordion 
          id="accordion-personal"
          disableGutters 
          expanded={expandedAccordions.has('personal')}
          onChange={() => toggleAccordion('personal')}
          sx={accordionStyles}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.personalInfo')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <SimpleInput
                id="personal-first_name"
                placeholder={t('refine.editor.firstName')} 
                value={formData.first_name} 
                onChange={(value) => handleFieldChange('first_name', value, false)}
                onBlur={() => handleFieldChange('first_name', formData.first_name, true)}
              />
              <SimpleInput
                id="personal-last_name"
                placeholder={t('refine.editor.lastName')} 
                value={formData.last_name} 
                onChange={(value) => handleFieldChange('last_name', value, false)}
                onBlur={() => handleFieldChange('last_name', formData.last_name, true)}
              />
              <SimpleInput
                id="personal-current_role"
                placeholder={t('refine.editor.currentRole', 'Current Role')} 
                value={formData.current_role} 
                onChange={(value) => handleFieldChange('current_role', value, false)}
                onBlur={() => handleFieldChange('current_role', formData.current_role, true)}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <SimpleInput
                id="personal-city"
                placeholder={t('refine.editor.city', 'City')} 
                value={formData.city} 
                onChange={(value) => handleFieldChange('city', value, false)}
                onBlur={() => handleFieldChange('city', formData.city, true)}
              />
              <SimpleInput
                id="personal-country"
                placeholder={t('refine.editor.country', 'Country')} 
                value={formData.country} 
                onChange={(value) => handleFieldChange('country', value, false)}
                onBlur={() => handleFieldChange('country', formData.country, true)}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ mb: 2, fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
              {t('refine.editor.contacts')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CONTACT_CONFIGS.filter(({ field }) => visibleContacts.has(field)).map(({ field, icon: Icon, label }) => (
                <Box key={field} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Icon sx={{ fontSize: '20px', color: '#6b7280', flexShrink: 0 }} />
                  <SimpleInput
                    id={`personal-${field}`}
                    placeholder={label}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={(value) => handleFieldChange(field, value, false)}
                    onBlur={() => handleFieldChange(field, formData[field as keyof typeof formData] as string, true)}
                  />
                </Box>
              ))}
              
              {visibleContacts.size < CONTACT_CONFIGS.length && (
                <>
                  <Button
                    ref={addContactButtonRef}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={(e) => setContactMenuAnchor(e.currentTarget)}
                    fullWidth
                    sx={addButtonStyle}
                  >
                    Add contact
                  </Button>
                  <Menu
                    anchorEl={contactMenuAnchor}
                    open={Boolean(contactMenuAnchor)}
                    onClose={() => setContactMenuAnchor(null)}
                  >
                    {CONTACT_CONFIGS.filter(({ field }) => !visibleContacts.has(field)).map(({ field, icon: Icon, label }) => (
                      <MenuItem
                        key={field}
                        onClick={() => handleAddContact(field)}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <Icon sx={{ fontSize: '18px', color: '#6b7280' }} />
                        <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Professional Summary */}
        <Accordion 
          id="accordion-summary"
          disableGutters 
          expanded={expandedAccordions.has('summary')}
          onChange={() => toggleAccordion('summary')}
          sx={accordionStyles}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.professionalSummary')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <textarea 
              id="professional-summary"
              rows={4}
              placeholder={t('refine.editor.professionalSummary')}
              value={formData.professional_summary} 
              onChange={(e) => handleFieldChange('professional_summary', e.target.value, false)}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primary.main;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                handleFieldChange('professional_summary', formData.professional_summary, true);
              }}
              style={{
                width: '100%',
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #e5e7eb',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out',
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Skills */}
        <Accordion 
          id="accordion-skills"
          disableGutters 
          expanded={expandedAccordions.has('skills')}
          onChange={() => toggleAccordion('skills')}
          sx={accordionStyles}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.skills')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SkillsEditor
              skills={localResume.skills || []}
              onSkillsUpdate={(updatedSkills) => {
                console.log('🎯 EditorAccordion: skills updated', { updatedSkills });
                const updated = { ...localResume, skills: updatedSkills };
                setLocalResume(updated);
                // Add to history when skills change (add/remove/edit)
                onResumeUpdate(updated, true);
              }}
              inputStyles={inputStyles}
            />
          </AccordionDetails>
        </Accordion>

        {/* Experience */}
        <Accordion 
          id="accordion-experience"
          disableGutters 
          expanded={expandedAccordions.has('experience')}
          onChange={() => toggleAccordion('experience')}
          sx={accordionStyles}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.experience')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ExperienceEditor
              ref={experienceEditorRef}
              experience={localResume.work_experience || []}
              onExperienceUpdate={(updatedExperience) => {
                console.log('💼 EditorAccordion: experience updated', { 
                  itemsCount: updatedExperience.length 
                });
                const updated = { ...localResume, work_experience: updatedExperience };
                setLocalResume(updated);
                // Add to history when experience changes (add/remove/edit complete)
                onResumeUpdate(updated, true);
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Education */}
        <Accordion 
          id="accordion-education"
          disableGutters 
          expanded={expandedAccordions.has('education')}
          onChange={() => toggleAccordion('education')}
          sx={accordionStyles}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.education')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <EducationEditor
              ref={educationEditorRef}
              education={localResume.education || []}
              onEducationUpdate={(updatedEducation) => {
                console.log('🎓 EditorAccordion: education updated', { 
                  itemsCount: updatedEducation.length 
                });
                const updated = { ...localResume, education: updatedEducation };
                setLocalResume(updated);
                // Add to history when education changes (add/remove/edit complete)
                onResumeUpdate(updated, true);
              }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

    </Box>
  );
});

EditorAccordion.displayName = 'EditorAccordion';

export default EditorAccordion;
