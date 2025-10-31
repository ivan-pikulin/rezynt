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
import { UnifiedResumeEducation } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';

interface EducationEditorProps {
  education: UnifiedResumeEducation[];
  resumeId: string | null;
  onEducationUpdate: (education: UnifiedResumeEducation[]) => void;
}

interface EducationFormData {
  degree: string;
  institution: string;
  location: string;
  graduation_date: string;
}

const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  resumeId,
  onEducationUpdate
}) => {
  const { t } = useTranslation();
  const [localEducation, setLocalEducation] = useState<UnifiedResumeEducation[]>(education);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formDataArray, setFormDataArray] = useState<Record<number, EducationFormData>>(() => {
    const initial: Record<number, EducationFormData> = {};
    education.forEach((edu, idx) => {
      initial[idx] = {
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location || '',
        graduation_date: edu.graduation_date || ''
      };
    });
    return initial;
  });

  const handleExpandChange = async (index: number | false) => {
    // Auto-save when collapsing the currently expanded item
    if (expandedIndex !== null && index === false) {
      await handleSaveEducation(expandedIndex);
    }
    setExpandedIndex(index === false ? null : index);
  };

  const handleFieldChange = (index: number, field: keyof EducationFormData, value: any) => {
    setFormDataArray(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const handleSaveEducation = async (index: number) => {
    const formData = formDataArray[index];
    if (!formData?.degree.trim() || !formData?.institution.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const educationData: UnifiedResumeEducation = {
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        location: formData.location.trim() || undefined,
        graduation_date: formData.graduation_date || undefined
      };

      const updatedEducation = [...localEducation];
      updatedEducation[index] = educationData;

      const resumeUpdate = { education: updatedEducation };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ education: updatedEducation as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
      setExpandedIndex(null);
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedEducation = localEducation.filter((_, i) => i !== index);
      const resumeUpdate = { education: updatedEducation };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ education: updatedEducation as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
      
      // Update form data indices
      const newFormData: Record<number, EducationFormData> = {};
      updatedEducation.forEach((edu, idx) => {
        newFormData[idx] = {
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location || '',
          graduation_date: edu.graduation_date || ''
        };
      });
      setFormDataArray(newFormData);
    } catch (error) {
      console.error('Error deleting education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async () => {
    setIsSaving(true);
    try {
      const newEducation: UnifiedResumeEducation = {
        degree: '',
        institution: '',
        location: undefined,
        graduation_date: undefined
      };

      const updatedEducation = [...localEducation, newEducation];
      const newIndex = updatedEducation.length - 1;
      
      setFormDataArray(prev => ({
        ...prev,
        [newIndex]: {
          degree: '',
          institution: '',
          location: '',
          graduation_date: ''
        }
      }));
      
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
      setExpandedIndex(newIndex);
    } catch (error) {
      console.error('Error adding education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const accordionStyles = {
    '&:before': { display: 'none' },
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
      {/* Education list */}
      {localEducation.map((edu, index) => {
        const formData = formDataArray[index] || {
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location || '',
          graduation_date: edu.graduation_date || ''
        };

        return (
          <Accordion
            key={index}
            expanded={expandedIndex === index}
            onChange={(_, isExpanded) => handleExpandChange(isExpanded ? index : false)}
            sx={accordionStyles}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {formData.degree || '(New Education)'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  {formData.institution}
                  {formData.location && ` • ${formData.location}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.degree')}
                  value={formData.degree}
                  onChange={(e) => handleFieldChange(index, 'degree', e.target.value)}
                  required
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.institution')}
                  value={formData.institution}
                  onChange={(e) => handleFieldChange(index, 'institution', e.target.value)}
                  required
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.location')}
                  value={formData.location}
                  onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.graduationDate')}
                  type="date"
                  value={formData.graduation_date}
                  onChange={(e) => handleFieldChange(index, 'graduation_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteEducation(index)}
                  disabled={isSaving}
                  sx={{
                    padding: '4px 12px',
                    color: '#1f2937',
                    backgroundColor: 'transparent',
                    fontSize: '12px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      color: '#1f2937',
                      backgroundColor: '#e8f0f5'
                    }
                  }}
                >
                  Remove
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEducation}
          disabled={isSaving}
        >
          {t('refine.editor.addEducation')}
        </Button>
      </Box>
    </Box>
  );
};

export default EducationEditor;
