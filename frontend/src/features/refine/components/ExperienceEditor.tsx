import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { WorkExperience } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';

// Simple input component
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
      onFocus={(e) => {
        e.target.style.borderColor = COLORS.primary.main;
      }}
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
    />
  );
};

// Simple textarea component
const SimpleTextarea: React.FC<{
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
}> = ({ id, placeholder, value, onChange, onBlur, rows = 2 }) => {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      onFocus={(e) => {
        e.target.style.borderColor = COLORS.primary.main;
      }}
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
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out',
      }}
    />
  );
};

interface ExperienceEditorProps {
  experience: WorkExperience[];
  onExperienceUpdate: (experience: WorkExperience[]) => void;
}

export interface ExperienceEditorHandle {
  navigateToField: (index: number, fieldName: string) => void;
}

interface ExperienceFormData {
  job_title: string;
  company: string;
  short_description: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  achievements: string[];
  technologies_tools: string[];
}

const ExperienceEditor = forwardRef<ExperienceEditorHandle, ExperienceEditorProps>(({
  experience,
  onExperienceUpdate
}, ref) => {
  const { t } = useTranslation();
  const [localExperience, setLocalExperience] = useState<WorkExperience[]>(experience);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Sync with prop changes (important for undo/redo)
  useEffect(() => {
    console.log('💼 ExperienceEditor: syncing with prop', { count: experience.length });
    setLocalExperience(experience);
    
    // Rebuild form data from prop
    const newFormData: Record<number, ExperienceFormData> = {};
    experience.forEach((exp, idx) => {
      const allAchievements = [
        ...(exp.achievements || []),
        ...(exp.responsibilities || [])
      ];
      
      newFormData[idx] = {
        job_title: exp.job_title || '',
        company: exp.company || '',
        short_description: exp.short_description || '',
        city: exp.city || '',
        country: exp.country || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: !exp.end_date || exp.end_date.toLowerCase() === 'present',
        achievements: allAchievements,
        technologies_tools: exp.technologies_tools || []
      };
    });
    setFormDataArray(newFormData);
  }, [experience]);
  
  const [formDataArray, setFormDataArray] = useState<Record<number, ExperienceFormData>>(() => {
    const initial: Record<number, ExperienceFormData> = {};
    experience.forEach((exp, idx) => {
      // Merge responsibilities into achievements for backward compatibility
      const allAchievements = [
        ...(exp.achievements || []),
        ...(exp.responsibilities || [])
      ].filter((item, index, self) => item && self.indexOf(item) === index); // Remove duplicates
      
      initial[idx] = {
        job_title: exp.job_title || '',
        company: exp.company || '',
        short_description: exp.short_description || '',
        city: exp.city || '',
        country: exp.country || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: !exp.end_date,
        achievements: allAchievements,
        technologies_tools: [...(exp.technologies_tools || [])]
      };
    });
    return initial;
  });

  const handleExpandChange = (index: number | false) => {
    setExpandedIndex(index === false ? null : index);
  };

  // Expose navigation method
  useImperativeHandle(ref, () => ({
    navigateToField: (index: number, fieldName: string) => {
      console.log('📝 ExperienceEditor.navigateToField called:', { index, fieldName });
      
      // Check if accordion is already expanded
      const wasExpanded = expandedIndex === index;
      console.log('🔍 Accordion was expanded:', wasExpanded);
      
      // Expand the accordion for this experience entry
      setExpandedIndex(index);
      
      // Delay depends on whether accordion needs to expand
      const accordionDelay = wasExpanded ? 150 : 400;
      
      // Focus on the field after a delay to allow accordion to expand
      setTimeout(() => {
        // For array fields (achievements, technologies_tools),
        // try to focus on the first item or the add button if no items exist
        let fieldId = `experience-${index}-${fieldName}`;
        
        // If it's an array field, try the first item
        if (['achievements', 'technologies_tools'].includes(fieldName)) {
          const firstItemId = `${fieldId}-0`;
          const firstItem = document.getElementById(firstItemId);
          if (firstItem) {
            fieldId = firstItemId;
          } else {
            // No items exist, navigate to "Add" button instead
            const addButtonId = `experience-${index}-add-${fieldName === 'achievements' ? 'achievement' : 'technology'}-btn`;
            const addButton = document.getElementById(addButtonId);
            
            if (addButton) {
              console.log('🎯 No items found, navigating to Add button:', addButtonId);
              
              addButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Pulse animation for button (2 pulses) - after scroll completes
              setTimeout(() => {
                const originalTransform = addButton.style.transform;
                const originalTransition = addButton.style.transition;
                
                addButton.style.transition = 'transform 0.3s ease-in-out';
                
                // First pulse
                addButton.style.transform = 'scale(1.1)';
                setTimeout(() => {
                  addButton.style.transform = 'scale(1)';
                  
                  // Second pulse
                  setTimeout(() => {
                    addButton.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                      addButton.style.transform = 'scale(1)';
                      
                      // Clean up
                      setTimeout(() => {
                        addButton.style.transform = originalTransform;
                        addButton.style.transition = originalTransition;
                      }, 300);
                    }, 300);
                  }, 300);
                }, 300);
              }, 500);
              
              return;
            }
          }
        }
        
        console.log('🔎 Looking for element with ID:', fieldId);
        
        const element = document.getElementById(fieldId);
        if (element) {
          console.log('✅ Element found, focusing...');
          
          // Find the actual input/textarea element (might be nested in MUI TextField)
          let inputElement = element as HTMLElement;
          if (element.tagName === 'DIV') {
            const innerInput = element.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
            if (innerInput) {
              inputElement = innerInput;
            }
          }
          
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Small delay for scroll to complete
          setTimeout(() => {
            if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
              inputElement.focus();
              if (inputElement.select && typeof inputElement.select === 'function') {
                inputElement.select();
              }
            }
            
            // Add highlight animation to the actual input element
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
          }, 50);
        } else {
          console.log('❌ Element not found:', fieldId);
          console.log('Available IDs in experience:', 
            Array.from(document.querySelectorAll('[id^="experience-"]')).map(el => el.id)
          );
          
          // Fallback: scroll to the accordion itself
          const accordionElement = document.querySelector(`[id^="experience-${index}-"]`);
          if (accordionElement) {
            console.log('⚠️ Fallback: scrolling to accordion');
            accordionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, accordionDelay);
    }
  }), [expandedIndex]);

  // Update local state only (for onChange)
  const handleFieldChange = (index: number, field: keyof ExperienceFormData, value: any) => {
    setFormDataArray(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };
    
  // Save to parent and history (for onBlur)
  const handleFieldBlur = (index: number) => {
    const formData = formDataArray[index];
    const filteredAchievements = formData.achievements?.filter(a => a.trim()) || undefined;
    
    const experienceData: WorkExperience = {
      job_title: formData.job_title?.trim() || undefined,
      company: formData.company?.trim() || undefined,
      short_description: formData.short_description?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      country: formData.country?.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.is_current ? undefined : (formData.end_date || undefined),
      // Save achievements as both achievements and responsibilities for backward compatibility
      achievements: filteredAchievements,
      responsibilities: filteredAchievements,
      technologies_tools: formData.technologies_tools?.filter(t => t.trim()) || undefined
      };

      const updatedExperience = [...localExperience];
      updatedExperience[index] = experienceData;
    setLocalExperience(updatedExperience);
    onExperienceUpdate(updatedExperience);
  };

  const handleDeleteExperience = (index: number) => {
    const updatedExperience = localExperience.filter((_, i) => i !== index);
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      setExpandedIndex(null);
  };

  const handleAddExperience = () => {
    const newExperience: WorkExperience = {};

    const updatedExperience = [...localExperience, newExperience];
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      
      const newIndex = updatedExperience.length - 1;
      setFormDataArray(prev => ({
        ...prev,
        [newIndex]: {
          job_title: '',
          company: '',
        short_description: '',
        city: '',
        country: '',
          start_date: '',
          end_date: '',
        is_current: true,
        achievements: [],
        technologies_tools: []
        }
      }));
      setExpandedIndex(newIndex);
  };

  const handleAddAchievement = (index: number) => {
    const formData = formDataArray[index];
    setFormDataArray(prev => ({
      ...prev,
      [index]: {
        ...formData,
        achievements: [...formData.achievements, '']
      }
    }));
  };

  const handleDeleteAchievement = (expIndex: number, achIndex: number) => {
    const formData = formDataArray[expIndex];
    const newAchievements = formData.achievements.filter((_, i) => i !== achIndex);
    handleFieldChange(expIndex, 'achievements', newAchievements);
  };

  const handleAchievementChange = (expIndex: number, achIndex: number, value: string) => {
    const formData = formDataArray[expIndex];
    const newAchievements = [...formData.achievements];
    newAchievements[achIndex] = value;
    handleFieldChange(expIndex, 'achievements', newAchievements);
  };

  return (
    <Box>
      {localExperience.map((exp, index) => (
          <Accordion
            key={index}
            expanded={expandedIndex === index}
            onChange={(_, isExpanded) => handleExpandChange(isExpanded ? index : false)}
          disableGutters
          sx={{
            '&:before': { display: 'none' },
            borderRadius: '8px',
            mb: 2,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                {exp.job_title || t('refine.editor.newExperience')} {exp.company && `at ${exp.company}`}
                </Typography>
              <Box 
                component="div"
                onClick={(e) => { e.stopPropagation(); handleDeleteExperience(index); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <SimpleInput
                id={`experience-${index}-job_title`}
                placeholder={t('refine.editor.jobTitle')}
                value={formDataArray[index]?.job_title || ''}
                onChange={(value) => handleFieldChange(index, 'job_title', value)}
                onBlur={() => handleFieldBlur(index)}
              />
              <SimpleInput
                id={`experience-${index}-company`}
                placeholder={t('refine.editor.company')}
                value={formDataArray[index]?.company || ''}
                onChange={(value) => handleFieldChange(index, 'company', value)}
                onBlur={() => handleFieldBlur(index)}
              />
              <SimpleTextarea
                id={`experience-${index}-short_description`}
                placeholder={t('refine.editor.companyDescription', 'Brief company or project description')}
                value={formDataArray[index]?.short_description || ''}
                onChange={(value) => handleFieldChange(index, 'short_description', value)}
                onBlur={() => handleFieldBlur(index)}
                rows={2}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <SimpleInput
                  id={`experience-${index}-city`}
                  placeholder={t('refine.editor.city', 'City')}
                  value={formDataArray[index]?.city || ''}
                  onChange={(value) => handleFieldChange(index, 'city', value)}
                  onBlur={() => handleFieldBlur(index)}
                />
                <SimpleInput
                  id={`experience-${index}-country`}
                  placeholder={t('refine.editor.country', 'Country')}
                  value={formDataArray[index]?.country || ''}
                  onChange={(value) => handleFieldChange(index, 'country', value)}
                  onBlur={() => handleFieldBlur(index)}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <SimpleInput
                  id={`experience-${index}-start_date`}
                  placeholder="June 2024"
                  value={formDataArray[index]?.start_date || ''}
                  onChange={(value) => handleFieldChange(index, 'start_date', value)}
                  onBlur={() => handleFieldBlur(index)}
                />
                <input
                  id={`experience-${index}-end_date`}
                  type="text"
                  placeholder="August 2025"
                  value={formDataArray[index]?.end_date || ''}
                  onChange={(e) => handleFieldChange(index, 'end_date', e.target.value)}
                  disabled={formDataArray[index]?.is_current}
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: formDataArray[index]?.is_current ? '#f3f4f6' : '#F9FAFB',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    cursor: formDataArray[index]?.is_current ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => {
                    if (!formDataArray[index]?.is_current) {
                      e.target.style.borderColor = '#2563eb';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    handleFieldBlur(index);
                  }}
                />
              </Box>
                <FormControlLabel
                  control={
                    <Switch
                    checked={formDataArray[index]?.is_current || false}
                      onChange={(e) => handleFieldChange(index, 'is_current', e.target.checked)}
                    />
                  }
                  label={t('refine.editor.currentPosition')}
                />

              <Divider />
              <Typography variant="subtitle2">{t('refine.editor.achievements')}</Typography>
              {formDataArray[index]?.achievements.map((ach, achIndex) => (
                <Box key={achIndex} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <SimpleTextarea
                    id={`experience-${index}-achievements-${achIndex}`}
                    value={ach}
                    onChange={(value) => handleAchievementChange(index, achIndex, value)}
                    rows={2}
                  />
                  <Box 
                    component="div"
                    onClick={() => handleDeleteAchievement(index, achIndex)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      flexShrink: 0,
                      backgroundColor: '#F3F4F6',
                      '&:hover': { backgroundColor: '#E5E7EB' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '18px', color: '#6B7280' }} />
                  </Box>
                </Box>
              ))}
                <Button
                id={`experience-${index}-add-achievement-btn`}
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddAchievement(index)}
              >
                {t('refine.editor.addAchievement')}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
      ))}

        <Button
        variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddExperience}
        fullWidth
        sx={{ mt: 2 }}
        >
          {t('refine.editor.addExperience')}
        </Button>
    </Box>
  );
});

ExperienceEditor.displayName = 'ExperienceEditor';

export default ExperienceEditor;
