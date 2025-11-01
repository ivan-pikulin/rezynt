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
import { WorkExperience } from '../../../shared/services/api/types';

interface ExperienceEditorProps {
  experience: WorkExperience[];
  onExperienceUpdate: (experience: WorkExperience[]) => void;
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
  responsibilities: string[];
  achievements: string[];
  technologies_tools: string[];
}

const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  onExperienceUpdate
}) => {
  const { t } = useTranslation();
  const [localExperience, setLocalExperience] = useState<WorkExperience[]>(experience);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const [formDataArray, setFormDataArray] = useState<Record<number, ExperienceFormData>>(() => {
    const initial: Record<number, ExperienceFormData> = {};
    experience.forEach((exp, idx) => {
      initial[idx] = {
        job_title: exp.job_title || '',
        company: exp.company || '',
        short_description: exp.short_description || '',
        city: exp.city || '',
        country: exp.country || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: !exp.end_date,
        responsibilities: [...(exp.responsibilities || [])],
        achievements: [...(exp.achievements || [])],
        technologies_tools: [...(exp.technologies_tools || [])]
      };
    });
    return initial;
  });

  const handleExpandChange = (index: number | false) => {
    setExpandedIndex(index === false ? null : index);
  };

  const handleFieldChange = (index: number, field: keyof ExperienceFormData, value: any) => {
    setFormDataArray(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
    
    // Auto-update
    const formData = { ...formDataArray[index], [field]: value };
    const experienceData: WorkExperience = {
      job_title: formData.job_title?.trim() || undefined,
      company: formData.company?.trim() || undefined,
      short_description: formData.short_description?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      country: formData.country?.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.is_current ? undefined : (formData.end_date || undefined),
      responsibilities: formData.responsibilities?.filter(r => r.trim()) || undefined,
      achievements: formData.achievements?.filter(a => a.trim()) || undefined,
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
        responsibilities: [],
        achievements: [],
        technologies_tools: []
        }
      }));
      setExpandedIndex(newIndex);
  };

  const handleAddResponsibility = (index: number) => {
    const formData = formDataArray[index];
    setFormDataArray(prev => ({
      ...prev,
      [index]: {
        ...formData,
        responsibilities: [...formData.responsibilities, '']
      }
    }));
  };

  const handleDeleteResponsibility = (expIndex: number, respIndex: number) => {
    const formData = formDataArray[expIndex];
    const newResponsibilities = formData.responsibilities.filter((_, i) => i !== respIndex);
    handleFieldChange(expIndex, 'responsibilities', newResponsibilities);
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const formData = formDataArray[expIndex];
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[respIndex] = value;
    handleFieldChange(expIndex, 'responsibilities', newResponsibilities);
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
          }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                {exp.job_title || t('refine.editor.newExperience')} {exp.company && `at ${exp.company}`}
                </Typography>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteExperience(index); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                size="small"
                placeholder={t('refine.editor.jobTitle')}
                value={formDataArray[index]?.job_title || ''}
                onChange={(e) => handleFieldChange(index, 'job_title', e.target.value)}
                  fullWidth
                sx={inputStyles}
              />
              <TextField
                  size="small"
                placeholder={t('refine.editor.company')}
                value={formDataArray[index]?.company || ''}
                onChange={(e) => handleFieldChange(index, 'company', e.target.value)}
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
                  placeholder="June 2024"
                  value={formDataArray[index]?.start_date || ''}
                  onChange={(e) => handleFieldChange(index, 'start_date', e.target.value)}
                  sx={inputStyles}
                />
                <TextField
                  size="small"
                  placeholder="August 2025"
                  value={formDataArray[index]?.end_date || ''}
                  onChange={(e) => handleFieldChange(index, 'end_date', e.target.value)}
                  disabled={formDataArray[index]?.is_current}
                  sx={inputStyles}
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
              <Typography variant="subtitle2">{t('refine.editor.responsibilities')}</Typography>
              {formDataArray[index]?.responsibilities.map((resp, respIndex) => (
                <Box key={respIndex} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)}
                    sx={inputStyles}
              />
                  <IconButton size="small" onClick={() => handleDeleteResponsibility(index, respIndex)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
                <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddResponsibility(index)}
              >
                {t('refine.editor.addResponsibility')}
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
};

export default ExperienceEditor;
