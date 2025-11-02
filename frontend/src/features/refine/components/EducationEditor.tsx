import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { Education } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';

// Simple input component
const SimpleInput: React.FC<{
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, placeholder, value, onChange }) => {
  return (
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
      }}
    />
  );
};

interface EducationEditorProps {
  education: Education[];
  onEducationUpdate: (education: Education[]) => void;
}

export interface EducationEditorHandle {
  navigateToField: (index: number, fieldName: string) => void;
}

interface EducationFormData {
  degree: string;
  institution: string;
  field_of_study: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  relevant_courses: string[];
}

const EducationEditor = forwardRef<EducationEditorHandle, EducationEditorProps>(({
  education,
  onEducationUpdate
}, ref) => {
  const { t } = useTranslation();
  const [localEducation, setLocalEducation] = useState<Education[]>(education);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const [formDataArray, setFormDataArray] = useState<Record<number, EducationFormData>>(() => {
    const initial: Record<number, EducationFormData> = {};
    education.forEach((edu, idx) => {
      initial[idx] = {
        degree: edu.degree || '',
        institution: edu.institution || '',
        field_of_study: edu.field_of_study || '',
        city: edu.city || '',
        country: edu.country || '',
        start_date: edu.start_date || '',
        end_date: edu.end_date || '',
        relevant_courses: [...(edu.relevant_courses || [])]
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
      console.log('🎓 EducationEditor.navigateToField called:', { index, fieldName });
      
      // Expand the accordion for this education entry
      setExpandedIndex(index);
      
      // Focus on the field after a delay to allow accordion to expand
      setTimeout(() => {
        // For array fields (relevant_courses), try to focus on the first item or the section
        let fieldId = `education-${index}-${fieldName}`;
        
        // If it's an array field, try the first item
        if (fieldName === 'relevant_courses') {
          const firstItemId = `${fieldId}-0`;
          const firstItem = document.getElementById(firstItemId);
          if (firstItem) {
            fieldId = firstItemId;
          }
        }
        
        console.log('🔎 Looking for element with ID:', fieldId);
        
        const inputElement = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
        if (inputElement) {
          console.log('✅ Input element found:', inputElement.tagName);
          
          inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Small delay for scroll to complete
          setTimeout(() => {
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
          }, 50);
        } else {
          console.log('❌ Element not found:', fieldId);
          console.log('Available IDs in education:', 
            Array.from(document.querySelectorAll('[id^="education-"]')).map(el => el.id)
          );
          
          // Fallback: scroll to the accordion itself
          const accordionElement = document.querySelector(`[id^="education-${index}-"]`);
          if (accordionElement) {
            console.log('⚠️ Fallback: scrolling to accordion');
            accordionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 150);
    }
  }), []);

  const handleFieldChange = (index: number, field: keyof EducationFormData, value: any) => {
    setFormDataArray(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
    
    // Auto-update
    const formData = { ...formDataArray[index], [field]: value };
    const educationData: Education = {
      degree: formData.degree?.trim() || undefined,
      institution: formData.institution?.trim() || undefined,
      field_of_study: formData.field_of_study?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      relevant_courses: formData.relevant_courses?.filter(c => c.trim()) || undefined
    };

    const updatedEducation = [...localEducation];
    updatedEducation[index] = educationData;
    setLocalEducation(updatedEducation);
    onEducationUpdate(updatedEducation);
  };

  const handleDeleteEducation = (index: number) => {
    const updatedEducation = localEducation.filter((_, i) => i !== index);
    setLocalEducation(updatedEducation);
    onEducationUpdate(updatedEducation);
    setExpandedIndex(null);
  };

  const handleAddEducation = () => {
    const newEducation: Education = {};

    const updatedEducation = [...localEducation, newEducation];
    setLocalEducation(updatedEducation);
    onEducationUpdate(updatedEducation);
    
    const newIndex = updatedEducation.length - 1;
    setFormDataArray(prev => ({
      ...prev,
      [newIndex]: {
        degree: '',
        institution: '',
        field_of_study: '',
        city: '',
        country: '',
        start_date: '',
        end_date: '',
        relevant_courses: []
      }
    }));
    setExpandedIndex(newIndex);
  };

  const handleAddCourse = (index: number) => {
    const formData = formDataArray[index];
    setFormDataArray(prev => ({
      ...prev,
      [index]: {
        ...formData,
        relevant_courses: [...formData.relevant_courses, '']
      }
    }));
  };

  const handleDeleteCourse = (eduIndex: number, courseIndex: number) => {
    const formData = formDataArray[eduIndex];
    const newCourses = formData.relevant_courses.filter((_, i) => i !== courseIndex);
    handleFieldChange(eduIndex, 'relevant_courses', newCourses);
  };

  const handleCourseChange = (eduIndex: number, courseIndex: number, value: string) => {
    const formData = formDataArray[eduIndex];
    const newCourses = [...formData.relevant_courses];
    newCourses[courseIndex] = value;
    handleFieldChange(eduIndex, 'relevant_courses', newCourses);
  };

  return (
    <Box>
      {localEducation.map((edu, index) => (
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
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                {edu.degree || t('refine.editor.newEducation')} {edu.institution && `at ${edu.institution}`}
              </Typography>
              <Box 
                component="div"
                onClick={(e) => { e.stopPropagation(); handleDeleteEducation(index); }}
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
                id={`education-${index}-degree`}
                placeholder={t('refine.editor.degree')}
                value={formDataArray[index]?.degree || ''}
                onChange={(value) => handleFieldChange(index, 'degree', value)}
              />
              <SimpleInput
                id={`education-${index}-institution`}
                placeholder={t('refine.editor.institution')}
                value={formDataArray[index]?.institution || ''}
                onChange={(value) => handleFieldChange(index, 'institution', value)}
              />
              <SimpleInput
                id={`education-${index}-field_of_study`}
                placeholder={t('refine.editor.fieldOfStudy', 'Field of Study')}
                value={formDataArray[index]?.field_of_study || ''}
                onChange={(value) => handleFieldChange(index, 'field_of_study', value)}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <SimpleInput
                  id={`education-${index}-city`}
                  placeholder={t('refine.editor.city', 'City')}
                  value={formDataArray[index]?.city || ''}
                  onChange={(value) => handleFieldChange(index, 'city', value)}
                />
                <SimpleInput
                  id={`education-${index}-country`}
                  placeholder={t('refine.editor.country', 'Country')}
                  value={formDataArray[index]?.country || ''}
                  onChange={(value) => handleFieldChange(index, 'country', value)}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <SimpleInput
                  id={`education-${index}-start_date`}
                  placeholder="September 2020"
                  value={formDataArray[index]?.start_date || ''}
                  onChange={(value) => handleFieldChange(index, 'start_date', value)}
                />
                <SimpleInput
                  id={`education-${index}-end_date`}
                  placeholder="May 2024"
                  value={formDataArray[index]?.end_date || ''}
                  onChange={(value) => handleFieldChange(index, 'end_date', value)}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                {t('refine.editor.relevantCourses', 'Relevant Courses')}
              </Typography>
              {formDataArray[index]?.relevant_courses.map((course, courseIndex) => (
                <Box key={courseIndex} sx={{ display: 'flex', gap: 1 }}>
                  <SimpleInput
                    id={`education-${index}-relevant_courses-${courseIndex}`}
                    value={course}
                    onChange={(value) => handleCourseChange(index, courseIndex, value)}
                    placeholder={t('refine.editor.courseName', 'Course name')}
                  />
                  <IconButton size="small" onClick={() => handleDeleteCourse(index, courseIndex)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddCourse(index)}
              >
                {t('refine.editor.addCourse', 'Add Course')}
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddEducation}
        fullWidth
        sx={{ mt: 2 }}
      >
        {t('refine.editor.addEducation')}
      </Button>
    </Box>
  );
});

EducationEditor.displayName = 'EducationEditor';

export default EducationEditor;
