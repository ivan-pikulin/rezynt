import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField
} from '@mui/material';

interface SkillsEditorProps {
  skills: string[];
  onSkillsUpdate: (skills: string[]) => void;
  inputStyles?: any;
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
          <TextField
            key={index}
            id={`skill-${index}`}
            fullWidth
            size="small"
            value={skill}
            onChange={(e) => handleSkillChange(index, e.target.value)}
            onBlur={() => handleSkillBlur(index)}
            sx={inputStyles}
          />
        ))}
        <TextField
          id="skill-new"
          fullWidth
          size="small"
          value={newSkill}
          onChange={(e) => handleNewSkillChange(e.target.value)}
          onBlur={handleNewSkillBlur}
          onKeyPress={handleNewSkillKeyPress}
          placeholder={t('refine.editor.addSkillPlaceholder')}
          sx={inputStyles}
        />
      </Box>
    </Box>
  );
};

export default SkillsEditor;
