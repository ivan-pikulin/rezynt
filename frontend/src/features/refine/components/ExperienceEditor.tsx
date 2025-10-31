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
  FormControlLabel,
  Switch,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { UnifiedResumeExperience } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';

interface ExperienceEditorProps {
  experience: UnifiedResumeExperience[];
  resumeId: string | null;
  onExperienceUpdate: (experience: UnifiedResumeExperience[]) => void;
}

interface ExperienceFormData {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  responsibilities: string[];
}

const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  resumeId,
  onExperienceUpdate
}) => {
  const { t } = useTranslation();
  const [localExperience, setLocalExperience] = useState<UnifiedResumeExperience[]>(experience);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formDataArray, setFormDataArray] = useState<Record<number, ExperienceFormData>>(() => {
    const initial: Record<number, ExperienceFormData> = {};
    experience.forEach((exp, idx) => {
      initial[idx] = {
        job_title: exp.job_title,
        company: exp.company,
        location: exp.location || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: !exp.end_date,
        responsibilities: [...exp.responsibilities]
      };
    });
    return initial;
  });

  const handleExpandChange = async (index: number | false) => {
    // Auto-save when collapsing the currently expanded item
    if (expandedIndex !== null && index === false) {
      await handleSaveExperience(expandedIndex);
    }
    setExpandedIndex(index === false ? null : index);
  };

  const handleFieldChange = (index: number, field: keyof ExperienceFormData, value: any) => {
    setFormDataArray(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const handleSaveExperience = async (index: number) => {
    const formData = formDataArray[index];
    if (!formData?.job_title.trim() || !formData?.company.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const experienceData: UnifiedResumeExperience = {
        job_title: formData.job_title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.is_current ? undefined : (formData.end_date || undefined),
        responsibilities: formData.responsibilities.filter(r => r.trim())
      };

      const updatedExperience = [...localExperience];
      updatedExperience[index] = experienceData;

      const resumeUpdate = { experience: updatedExperience };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ experience: updatedExperience as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      setExpandedIndex(null);
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedExperience = localExperience.filter((_, i) => i !== index);
      const resumeUpdate = { experience: updatedExperience };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ experience: updatedExperience as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      
      // Update form data indices
      const newFormData: Record<number, ExperienceFormData> = {};
      updatedExperience.forEach((exp, idx) => {
        newFormData[idx] = {
          job_title: exp.job_title,
          company: exp.company,
          location: exp.location || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          is_current: !exp.end_date,
          responsibilities: [...exp.responsibilities]
        };
      });
      setFormDataArray(newFormData);
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperience = async () => {
    setIsSaving(true);
    try {
      const newExperience: UnifiedResumeExperience = {
        job_title: '',
        company: '',
        location: undefined,
        start_date: undefined,
        end_date: undefined,
        responsibilities: []
      };

      const updatedExperience = [...localExperience, newExperience];
      const newIndex = updatedExperience.length - 1;
      
      setFormDataArray(prev => ({
        ...prev,
        [newIndex]: {
          job_title: '',
          company: '',
          location: '',
          start_date: '',
          end_date: '',
          is_current: false,
          responsibilities: []
        }
      }));
      
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      setExpandedIndex(newIndex);
    } catch (error) {
      console.error('Error adding experience:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addResponsibility = (index: number, responsibility: string) => {
    if (responsibility.trim()) {
      handleFieldChange(index, 'responsibilities', [...formDataArray[index].responsibilities, responsibility.trim()]);
    }
  };

  const removeResponsibility = (index: number, respIndex: number) => {
    handleFieldChange(index, 'responsibilities', 
      formDataArray[index].responsibilities.filter((_, i) => i !== respIndex)
    );
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
      {/* Experience list */}
      {localExperience.map((exp, index) => {
        const formData = formDataArray[index] || {
          job_title: exp.job_title,
          company: exp.company,
          location: exp.location || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          is_current: !exp.end_date,
          responsibilities: [...exp.responsibilities]
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
                  {formData.job_title || '(New Experience)'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  {formData.company}
                  {formData.location && ` • ${formData.location}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.jobTitle')}
                  value={formData.job_title}
                  onChange={(e) => handleFieldChange(index, 'job_title', e.target.value)}
                  required
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.company')}
                  value={formData.company}
                  onChange={(e) => handleFieldChange(index, 'company', e.target.value)}
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
                  label={t('refine.editor.startDate')}
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleFieldChange(index, 'start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label={t('refine.editor.endDate')}
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleFieldChange(index, 'end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={formData.is_current}
                  sx={inputStyles}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_current}
                      onChange={(e) => handleFieldChange(index, 'is_current', e.target.checked)}
                    />
                  }
                  label={t('refine.editor.currentPosition')}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('refine.editor.responsibilities')}
              </Typography>

              <ResponsibilityEditor
                responsibilities={formData.responsibilities}
                onAdd={(resp) => addResponsibility(index, resp)}
                onRemove={(respIndex) => removeResponsibility(index, respIndex)}
                inputStyles={inputStyles}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteExperience(index)}
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
          onClick={handleAddExperience}
          disabled={isSaving}
        >
          {t('refine.editor.addExperience')}
        </Button>
      </Box>
    </Box>
  );
};

const ResponsibilityEditor: React.FC<{
  responsibilities: string[];
  onAdd: (resp: string) => void;
  onRemove: (index: number) => void;
  inputStyles?: any;
}> = ({ responsibilities, onAdd, onRemove, inputStyles }) => {
  const { t } = useTranslation();
  const [localResponsibilities, setLocalResponsibilities] = React.useState<string[]>(responsibilities);
  const [newResponsibility, setNewResponsibility] = React.useState('');

  React.useEffect(() => {
    setLocalResponsibilities(responsibilities);
  }, [responsibilities]);

  const handleResponsibilityChange = (index: number, value: string) => {
    const updated = [...localResponsibilities];
    updated[index] = value;
    setLocalResponsibilities(updated);
  };

  const handleResponsibilityBlur = (index: number) => {
    const value = localResponsibilities[index];
    if (!value.trim()) {
      const updated = localResponsibilities.filter((_, i) => i !== index);
      setLocalResponsibilities(updated);
      onRemove(index);
    }
  };

  const handleNewResponsibilityBlur = () => {
    if (newResponsibility.trim()) {
      const updated = [...localResponsibilities, newResponsibility.trim()];
      setLocalResponsibilities(updated);
      onAdd(newResponsibility.trim());
      setNewResponsibility('');
    }
  };

  const handleNewResponsibilityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newResponsibility.trim()) {
      const updated = [...localResponsibilities, newResponsibility.trim()];
      setLocalResponsibilities(updated);
      onAdd(newResponsibility.trim());
      setNewResponsibility('');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {localResponsibilities.map((resp, index) => (
          <TextField
            key={index}
            fullWidth
            size="small"
            value={resp}
            onChange={(e) => handleResponsibilityChange(index, e.target.value)}
            onBlur={() => handleResponsibilityBlur(index)}
            sx={inputStyles}
          />
        ))}
        <TextField
          fullWidth
          size="small"
          value={newResponsibility}
          onChange={(e) => setNewResponsibility(e.target.value)}
          onBlur={handleNewResponsibilityBlur}
          onKeyPress={handleNewResponsibilityKeyPress}
          placeholder={t('refine.editor.addResponsibility')}
          sx={inputStyles}
        />
      </Box>
    </Box>
  );
};

export default ExperienceEditor;
