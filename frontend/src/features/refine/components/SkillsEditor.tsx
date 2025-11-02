import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { COLORS } from '../../../shared/theme/theme';

// Simple input component
const SimpleInput: React.FC<{
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}> = ({ id, placeholder, value, onChange, onBlur, onKeyPress }) => {
  return (
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
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
      // Note: onBlur style change handled separately to avoid conflict with onBlur callback
    />
  );
};

interface SkillsEditorProps {
  skills: string[];
  onSkillsUpdate: (skills: string[]) => void;
  inputStyles?: any; // Deprecated, kept for backward compatibility
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onSkillsUpdate, inputStyles }) => {
  const { t } = useTranslation();
  const [localSkills, setLocalSkills] = useState<string[]>(skills);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...localSkills];
    updatedSkills[index] = value;
    setLocalSkills(updatedSkills);
  };

  const handleSkillBlur = (index: number) => {
    const value = localSkills[index];
    if (!value.trim()) {
      // Remove empty skills
      const updatedSkills = localSkills.filter((_, i) => i !== index);
      setLocalSkills(updatedSkills);
      onSkillsUpdate(updatedSkills);
    } else {
      onSkillsUpdate(localSkills);
    }
  };

  const handleNewSkillChange = (value: string) => {
    setNewSkill(value);
  };

  const handleNewSkillBlur = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...localSkills, newSkill.trim()];
      setLocalSkills(updatedSkills);
      setNewSkill('');
      onSkillsUpdate(updatedSkills);
    }
  };

  const handleNewSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      const updatedSkills = [...localSkills, newSkill.trim()];
      setLocalSkills(updatedSkills);
      setNewSkill('');
      onSkillsUpdate(updatedSkills);
    }
  };

  return (
    <Box>
      {/* Skills list */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
        {localSkills.map((skill, index) => (
          <SimpleInput
            key={index}
            id={`skill-${index}`}
            value={skill}
            onChange={(value) => handleSkillChange(index, value)}
            onBlur={() => handleSkillBlur(index)}
            placeholder=""
          />
        ))}
        <SimpleInput
          id="skill-new"
          value={newSkill}
          onChange={(value) => handleNewSkillChange(value)}
          onBlur={handleNewSkillBlur}
          onKeyPress={handleNewSkillKeyPress}
          placeholder={t('refine.editor.addSkillPlaceholder')}
        />
      </Box>
    </Box>
  );
};

export default SkillsEditor;
