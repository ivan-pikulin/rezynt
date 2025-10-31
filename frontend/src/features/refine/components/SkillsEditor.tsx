import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField
} from '@mui/material';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';

interface SkillsEditorProps {
  skills: string[];
  resumeId: string | null;
  onSkillsUpdate: (skills: string[]) => void;
  inputStyles?: any;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, resumeId, onSkillsUpdate, inputStyles }) => {
  const { t } = useTranslation();
  const [localSkills, setLocalSkills] = useState<string[]>(skills);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...localSkills];
    updatedSkills[index] = value;
    setLocalSkills(updatedSkills);
  };

  const handleSkillBlur = async (index: number) => {
    const value = localSkills[index];
    if (!value.trim()) {
      // Remove empty skills
      const updatedSkills = localSkills.filter((_, i) => i !== index);
      setLocalSkills(updatedSkills);
      await saveSkills(updatedSkills);
    } else {
      await saveSkills(localSkills);
    }
  };

  const handleNewSkillChange = (value: string) => {
    setNewSkill(value);
  };

  const handleNewSkillBlur = async () => {
    if (newSkill.trim()) {
      const updatedSkills = [...localSkills, newSkill.trim()];
      setLocalSkills(updatedSkills);
      setNewSkill('');
      await saveSkills(updatedSkills);
    }
  };

  const handleNewSkillKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      const updatedSkills = [...localSkills, newSkill.trim()];
      setLocalSkills(updatedSkills);
      setNewSkill('');
      await saveSkills(updatedSkills);
    }
  };

  const saveSkills = async (updatedSkills: string[]) => {
    setIsSaving(true);
    try {
      const cleanedSkills = updatedSkills.filter(skill => skill.trim());
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ skills: cleanedSkills as any });
      } else {
        await resumeApi.updateSkills(parseInt(resumeId!), cleanedSkills);
      }
      onSkillsUpdate(cleanedSkills);
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      {/* Skills list */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
        {localSkills.map((skill, index) => (
          <TextField
            key={index}
            fullWidth
            size="small"
            value={skill}
            onChange={(e) => handleSkillChange(index, e.target.value)}
            onBlur={() => handleSkillBlur(index)}
            disabled={isSaving}
            sx={inputStyles}
          />
        ))}
        <TextField
          fullWidth
          size="small"
          value={newSkill}
          onChange={(e) => handleNewSkillChange(e.target.value)}
          onBlur={handleNewSkillBlur}
          onKeyPress={handleNewSkillKeyPress}
          placeholder={t('refine.editor.addSkillPlaceholder')}
          disabled={isSaving}
          sx={inputStyles}
        />
      </Box>
    </Box>
  );
};

export default SkillsEditor;
