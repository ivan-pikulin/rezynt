import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BuilderState } from '../types/builder';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';
import { ProTipBox } from './ProTipBox';

// Simple input component
const SimpleInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}> = ({ placeholder, value, onChange, onKeyPress }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
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

interface SkillsStepProps {
  state: BuilderState;
  onUpdate: <K extends keyof BuilderState>(field: K, value: BuilderState[K]) => void;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({ state, onUpdate }) => {
  const { t } = useTranslation();
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onUpdate('skills', [...(state.skills || []), newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index: number) => {
    const updated = (state.skills || []).filter((_, i) => i !== index);
    onUpdate('skills', updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <SimpleInput
            placeholder={t('builder.skills.placeholder')}
            value={newSkill}
            onChange={(value) => setNewSkill(value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSkill}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              minWidth: '100px',
            }}
          >
            {t('builder.skills.add')}
          </Button>
        </Box>

        {(state.skills || []).length > 0 && (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            p: 1.5,
            border: `1px solid ${COLORS.common.border}`,
            borderRadius: '12px',
            backgroundColor: COLORS.grey[50],
          }}>
            {(state.skills || []).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => handleDeleteSkill(index)}
                sx={{
                  backgroundColor: COLORS.primary.light,
                  '& .MuiChip-deleteIcon': {
                    color: COLORS.primary.main,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <ProTipBox
        title={t('builder.skills.tip')}
        description={t('builder.skills.tipDescription')}
      />
    </Box>
  );
};
