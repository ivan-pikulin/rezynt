import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BuilderState } from '../types/builder';
import { Education } from '../../../shared/types/resume';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';

interface EducationStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();

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

  // Automatically add first empty education if none exist
  useEffect(() => {
    if (!state.education || state.education.length === 0) {
      const newEducation: Education = {
        institution: '',
        degree: '',
        field_of_study: '',
        city: '',
        country: '',
        start_date: '',
        end_date: '',
      };
      onUpdate('education', [newEducation]);
    }
  }, []);

  const handleAddEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      field_of_study: '',
      city: '',
      country: '',
      start_date: '',
      end_date: '',
    };

    onUpdate('education', [...(state.education || []), newEducation]);
  };

  const handleUpdateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...(state.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('education', updated);
  };

  const handleDeleteEducation = (index: number) => {
    const updated = (state.education || []).filter((_, i) => i !== index);
    onUpdate('education', updated);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          mb: 1,
          color: COLORS.resume.text.primary,
          fontSize: '1.5rem',
        }}
      >
        {t('builder.education.title')}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          color: COLORS.resume.text.secondary,
          fontSize: '14px',
        }}
      >
        {t('builder.education.description')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(state.education || []).map((edu, index) => (
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
                {edu.degree || t('builder.education.newEducation')}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleDeleteEducation(index)}
                sx={{ color: COLORS.error.main }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.degree')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('builder.education.degreePlaceholder')}
                  value={edu.degree || ''}
                  onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.institution')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('builder.education.institutionPlaceholder')}
                  value={edu.institution || ''}
                  onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.fieldOfStudy')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('builder.education.fieldOfStudyPlaceholder')}
                  value={edu.field_of_study || ''}
                  onChange={(e) => handleUpdateEducation(index, 'field_of_study', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.city')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('builder.education.cityPlaceholder')}
                  value={edu.city || ''}
                  onChange={(e) => handleUpdateEducation(index, 'city', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.country')}
                </Typography>
                <TextField
                  fullWidth
                  placeholder={t('builder.education.countryPlaceholder')}
                  value={edu.country || ''}
                  onChange={(e) => handleUpdateEducation(index, 'country', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.startDate')}
                </Typography>
                <TextField
                  fullWidth
                  type="month"
                  value={edu.start_date || ''}
                  onChange={(e) => handleUpdateEducation(index, 'start_date', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.graduationDate')}
                </Typography>
                <TextField
                  fullWidth
                  type="month"
                  value={edu.end_date || ''}
                  onChange={(e) => handleUpdateEducation(index, 'end_date', e.target.value)}
                  size="small"
                  sx={inputStyles}
                />
              </Box>
            </Box>
          </Paper>
        ))}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEducation}
          sx={{ 
            alignSelf: 'flex-start',
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          {t('builder.education.addEducation')}
        </Button>
      </Box>
    </Box>
  );
};

