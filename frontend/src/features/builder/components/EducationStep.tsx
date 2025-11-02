import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
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
        e.target.style.borderColor = '#2563eb';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
      }}
    />
  );
};

interface EducationStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();

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
                <SimpleInput
                  placeholder={t('builder.education.degreePlaceholder')}
                  value={edu.degree || ''}
                  onChange={(value) => handleUpdateEducation(index, 'degree', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.institution')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.education.institutionPlaceholder')}
                  value={edu.institution || ''}
                  onChange={(value) => handleUpdateEducation(index, 'institution', value)}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.fieldOfStudy')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.education.fieldOfStudyPlaceholder')}
                  value={edu.field_of_study || ''}
                  onChange={(value) => handleUpdateEducation(index, 'field_of_study', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.city')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.education.cityPlaceholder')}
                  value={edu.city || ''}
                  onChange={(value) => handleUpdateEducation(index, 'city', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.country')}
                </Typography>
                <SimpleInput
                  placeholder={t('builder.education.countryPlaceholder')}
                  value={edu.country || ''}
                  onChange={(value) => handleUpdateEducation(index, 'country', value)}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  {t('builder.education.startDate')}
                </Typography>
                <input
                  type="month"
                  value={edu.start_date || ''}
                  onChange={(e) => handleUpdateEducation(index, 'start_date', e.target.value)}
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
                  {t('builder.education.graduationDate')}
                </Typography>
                <input
                  type="month"
                  value={edu.end_date || ''}
                  onChange={(e) => handleUpdateEducation(index, 'end_date', e.target.value)}
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

