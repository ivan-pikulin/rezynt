import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
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

interface EducationEditorProps {
  education: Education[];
  onEducationUpdate: (education: Education[]) => void;
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

const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  onEducationUpdate
}) => {
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
              <TextField
                size="small"
                placeholder={t('refine.editor.degree')}
                value={formDataArray[index]?.degree || ''}
                onChange={(e) => handleFieldChange(index, 'degree', e.target.value)}
                fullWidth
                sx={inputStyles}
              />
              <TextField
                size="small"
                placeholder={t('refine.editor.institution')}
                value={formDataArray[index]?.institution || ''}
                onChange={(e) => handleFieldChange(index, 'institution', e.target.value)}
                fullWidth
                sx={inputStyles}
              />
              <TextField
                size="small"
                placeholder={t('refine.editor.fieldOfStudy', 'Field of Study')}
                value={formDataArray[index]?.field_of_study || ''}
                onChange={(e) => handleFieldChange(index, 'field_of_study', e.target.value)}
                fullWidth
                sx={inputStyles}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder={t('refine.editor.city', 'City')}
                  value={formDataArray[index]?.city || ''}
                  onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                  sx={inputStyles}
                />
                <TextField
                  size="small"
                  placeholder={t('refine.editor.country', 'Country')}
                  value={formDataArray[index]?.country || ''}
                  onChange={(e) => handleFieldChange(index, 'country', e.target.value)}
                  sx={inputStyles}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="September 2020"
                  value={formDataArray[index]?.start_date || ''}
                  onChange={(e) => handleFieldChange(index, 'start_date', e.target.value)}
                  sx={inputStyles}
                />
                <TextField
                  size="small"
                  placeholder="May 2024"
                  value={formDataArray[index]?.end_date || ''}
                  onChange={(e) => handleFieldChange(index, 'end_date', e.target.value)}
                  sx={inputStyles}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                {t('refine.editor.relevantCourses', 'Relevant Courses')}
              </Typography>
              {formDataArray[index]?.relevant_courses.map((course, courseIndex) => (
                <Box key={courseIndex} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={course}
                    onChange={(e) => handleCourseChange(index, courseIndex, e.target.value)}
                    placeholder={t('refine.editor.courseName', 'Course name')}
                    sx={inputStyles}
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
};

export default EducationEditor;
