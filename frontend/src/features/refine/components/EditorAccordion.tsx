import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Resume } from '../../../shared/services/api/types';
import EducationEditor, { EducationEditorHandle } from './EducationEditor';
import ExperienceEditor, { ExperienceEditorHandle } from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';

type Props = {
  resume: Resume;
  onResumeUpdate: (resume: Resume) => void;
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

  useEffect(() => {
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
    console.log('🔧 useImperativeHandle creating handle object');
    
    const navigateToField = (fieldPath: string) => {
      console.log('📍 EditorAccordion.navigateToField called:', fieldPath);
      
      // Parse field_path (e.g., "work_experience[0].achievements", "professional_summary", "personal_info.email")
      const parts = fieldPath.split('.');
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
            console.log('➡️ Delegating to ExperienceEditor:', { arrayIndex, subField });
            experienceEditorRef.current.navigateToField(arrayIndex, subField || 'job_title');
          } else if (mainField === 'education' && arrayIndex !== null && educationEditorRef.current) {
            // Navigate to specific education field
            console.log('➡️ Delegating to EducationEditor:', { arrayIndex, subField });
            educationEditorRef.current.navigateToField(arrayIndex, subField || 'degree');
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
                // Special case: just 'contacts' without specific field - focus on first contact field
                if (subField === 'contacts') {
                  fieldId = 'personal-email'; // Default to email field
                  console.log('🔑 Field path ends with "contacts", focusing on first field:', fieldId);
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
              }
              
              if (fieldId) {
                console.log('🔎 Trying to focus on field:', fieldId);
                const fieldElement = document.getElementById(fieldId);
                
                if (fieldElement) {
                  console.log('✅ Field element found (outer):', fieldElement.tagName);
                  
                  // For Material UI TextField, we need to find the actual input element
                  let inputElement = fieldElement as HTMLInputElement | HTMLTextAreaElement;
                  
                  // If it's a div (TextField wrapper), find the input/textarea inside
                  if (fieldElement.tagName === 'DIV') {
                    const innerInput = fieldElement.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
                    if (innerInput) {
                      inputElement = innerInput;
                      console.log('✅ Found inner input element:', innerInput.tagName);
                    }
                  }
                  
                  // Scroll into view
                  inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Additional delay to ensure scroll completes before focusing
                  setTimeout(() => {
                    console.log('🎯 Focusing on element...');
                    inputElement.focus();
                    // For text fields, also select the content for easy editing
                    if (inputElement.select && typeof inputElement.select === 'function') {
                      inputElement.select();
                    }
                    
                    // Add highlight animation
                    const originalTransition = inputElement.style.transition;
                    const originalBoxShadow = inputElement.style.boxShadow;
                    const originalBorderRadius = inputElement.style.borderRadius;
                    
                    // Apply smooth pulsing highlight with border radius
                    inputElement.style.transition = 'box-shadow 0.3s ease-in-out';
                    inputElement.style.borderRadius = '6px';
                    inputElement.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.4)';
                    
                    // Fade out after 2 seconds
                    setTimeout(() => {
                      inputElement.style.boxShadow = '0 0 0 0 rgba(37, 99, 235, 0)';
                      
                      // Clean up after transition completes
                      setTimeout(() => {
                        inputElement.style.transition = originalTransition;
                        inputElement.style.boxShadow = originalBoxShadow;
                        inputElement.style.borderRadius = originalBorderRadius;
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update local resume immediately
    const updated = { ...localResume };
    if (!updated.personal_info) {
      updated.personal_info = {};
    }
    
    // Contact fields
    const contactFields = ['email', 'phone', 'telegram', 'whatsapp', 'linkedin', 'github', 'website', 'twitter', 'instagram'];
    
    if (field === 'professional_summary') {
      updated.professional_summary = value;
    } else if (contactFields.includes(field)) {
      // Update contacts
      if (!updated.personal_info.contacts) {
        updated.personal_info.contacts = {};
      }
      (updated.personal_info.contacts as any)[field] = value;
    } else {
      // Update personal info fields
      (updated.personal_info as any)[field] = value;
    }
    
    setLocalResume(updated);
    onResumeUpdate(updated);
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
    '& .MuiAccordionDetails-root': { padding: '16px' }
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
              <TextField 
                id="personal-first_name"
                size="small" 
                placeholder={t('refine.editor.firstName')} 
                value={formData.first_name} 
                onChange={(e) => handleFieldChange('first_name', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-last_name"
                size="small" 
                placeholder={t('refine.editor.lastName')} 
                value={formData.last_name} 
                onChange={(e) => handleFieldChange('last_name', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-current_role"
                size="small" 
                fullWidth 
                placeholder={t('refine.editor.currentRole', 'Current Role')} 
                value={formData.current_role} 
                onChange={(e) => handleFieldChange('current_role', e.target.value)} 
                sx={inputStyles} 
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField 
                id="personal-city"
                size="small" 
                placeholder={t('refine.editor.city', 'City')} 
                value={formData.city} 
                onChange={(e) => handleFieldChange('city', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-country"
                size="small" 
                placeholder={t('refine.editor.country', 'Country')} 
                value={formData.country} 
                onChange={(e) => handleFieldChange('country', e.target.value)} 
                sx={inputStyles} 
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t('refine.editor.contacts')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField 
                id="personal-email"
                size="small" 
                placeholder={t('refine.editor.email')} 
                value={formData.email} 
                onChange={(e) => handleFieldChange('email', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-phone"
                size="small" 
                placeholder={t('refine.editor.phone')} 
                value={formData.phone} 
                onChange={(e) => handleFieldChange('phone', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-telegram"
                size="small" 
                placeholder="Telegram" 
                value={formData.telegram} 
                onChange={(e) => handleFieldChange('telegram', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-whatsapp"
                size="small" 
                placeholder="WhatsApp" 
                value={formData.whatsapp} 
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-linkedin"
                size="small" 
                placeholder="LinkedIn" 
                value={formData.linkedin} 
                onChange={(e) => handleFieldChange('linkedin', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-github"
                size="small" 
                placeholder="GitHub" 
                value={formData.github} 
                onChange={(e) => handleFieldChange('github', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-website"
                size="small" 
                placeholder="Website" 
                value={formData.website} 
                onChange={(e) => handleFieldChange('website', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-twitter"
                size="small" 
                placeholder="Twitter" 
                value={formData.twitter} 
                onChange={(e) => handleFieldChange('twitter', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                id="personal-instagram"
                size="small" 
                placeholder="Instagram" 
                value={formData.instagram} 
                onChange={(e) => handleFieldChange('instagram', e.target.value)} 
                sx={inputStyles} 
              />
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
            <TextField 
              id="professional-summary"
              fullWidth 
              size="small" 
              multiline 
              rows={4} 
              sx={inputStyles} 
              value={formData.professional_summary} 
              onChange={(e) => handleFieldChange('professional_summary', e.target.value)} 
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
                const updated = { ...localResume, skills: updatedSkills };
                setLocalResume(updated);
                  onResumeUpdate(updated);
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
                const updated = { ...localResume, work_experience: updatedExperience };
                setLocalResume(updated);
                  onResumeUpdate(updated);
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
                const updated = { ...localResume, education: updatedEducation };
                setLocalResume(updated);
                  onResumeUpdate(updated);
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
