import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BuilderState } from '../types/builder';
import { WorkExperience } from '../../../shared/types/resume';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

// Simple input component
const SimpleInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ placeholder, value, onChange }) => {
  return (
    <input
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

// Simple textarea component
const SimpleTextarea: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}> = ({ placeholder, value, onChange, rows = 2 }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
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
      onFocus={(e) => {
        e.target.style.borderColor = COLORS.primary.main;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
      }}
    />
  );
};

interface WorkExperienceStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Automatically add first empty experience if none exist
  useEffect(() => {
    if (!state.work_experience || state.work_experience.length === 0) {
      const newExperience: WorkExperience = {
        job_title: '',
        company: '',
        city: '',
        country: '',
        start_date: '',
        end_date: '',
        achievements: [],
      };
      onUpdate('work_experience', [newExperience]);
    }
  }, []);

  const handleAddExperience = () => {
    const newExperience: WorkExperience = {
      job_title: '',
      company: '',
      city: '',
      country: '',
      start_date: '',
      end_date: '',
      achievements: [],
    };

    onUpdate('work_experience', [...(state.work_experience || []), newExperience]);
    setEditingIndex((state.work_experience || []).length);
  };

  const handleUpdateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...(state.work_experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('work_experience', updated);
  };

  const handleDeleteExperience = (index: number) => {
    const updated = (state.work_experience || []).filter((_, i) => i !== index);
    onUpdate('work_experience', updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleAddAchievement = (expIndex: number) => {
    const updated = [...(state.work_experience || [])];
    const achievements = [...(updated[expIndex].achievements || []), ''];
    updated[expIndex] = { ...updated[expIndex], achievements };
    onUpdate('work_experience', updated);
  };

  const handleUpdateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const updated = [...(state.work_experience || [])];
    const achievements = [...(updated[expIndex].achievements || [])];
    achievements[achIndex] = value;
    updated[expIndex] = { ...updated[expIndex], achievements };
    onUpdate('work_experience', updated);
  };

  const handleDeleteAchievement = (expIndex: number, achIndex: number) => {
    const updated = [...(state.work_experience || [])];
    const achievements = (updated[expIndex].achievements || []).filter((_, i) => i !== achIndex);
    updated[expIndex] = { ...updated[expIndex], achievements };
    onUpdate('work_experience', updated);
  };

  const toggleCurrentPosition = (index: number, isChecked: boolean) => {
    handleUpdateExperience(index, 'end_date', isChecked ? null : '');
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(state.work_experience || []).map((exp, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 2.5, 
              border: `1px solid ${COLORS.common.border}`,
              borderRadius: '12px',
              boxShadow: 'none',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {exp.job_title || t('builder.workExperience.newExperience')}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleDeleteExperience(index)}
                sx={{ color: COLORS.error.main }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.jobTitle')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.workExperience.jobTitlePlaceholder')}
                  value={exp.job_title || ''}
                  onChange={(value) => handleUpdateExperience(index, 'job_title', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.company')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.workExperience.companyPlaceholder')}
                  value={exp.company || ''}
                  onChange={(value) => handleUpdateExperience(index, 'company', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.city')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.workExperience.cityPlaceholder')}
                  value={exp.city || ''}
                  onChange={(value) => handleUpdateExperience(index, 'city', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.country')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.workExperience.countryPlaceholder')}
                  value={exp.country || ''}
                  onChange={(value) => handleUpdateExperience(index, 'country', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.startDate')}
                </Typography>
                <input
                  type="month"
                  value={exp.start_date || ''}
                  onChange={(e) => handleUpdateExperience(index, 'start_date', e.target.value)}
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
                    e.target.style.borderColor = '#2563eb';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.workExperience.endDate')}
                </Typography>
                <input
                  type="month"
                  value={exp.end_date === null ? '' : (exp.end_date || '')}
                  onChange={(e) => handleUpdateExperience(index, 'end_date', e.target.value)}
                  disabled={exp.end_date === null}
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: exp.end_date === null ? '#f3f4f6' : '#F9FAFB',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    cursor: exp.end_date === null ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => {
                    if (exp.end_date !== null) {
                      e.target.style.borderColor = '#2563eb';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exp.end_date === null}
                      onChange={(e) => toggleCurrentPosition(index, e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('builder.workExperience.currentPosition')}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('builder.workExperience.responsibilities')}
                </Typography>
                {(exp.achievements || []).map((ach, achIndex) => (
                  <Box key={achIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <SimpleTextarea
                      placeholder={t('builder.workExperience.responsibilityPlaceholder')}
                      value={ach}
                      onChange={(value) => handleUpdateAchievement(index, achIndex, value)}
                      rows={2}
                    />
                    <IconButton 
                      size="small"
                      onClick={() => handleDeleteAchievement(index, achIndex)}
                      sx={{ color: COLORS.error.main }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddAchievement(index)}
                  sx={{ mt: 1 }}
                >
                  {t('builder.workExperience.addResponsibility')}
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddExperience}
          sx={{ 
            alignSelf: 'flex-start',
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          {t('builder.workExperience.addExperience')}
        </Button>
      </Box>
    </Box>
  );
};

