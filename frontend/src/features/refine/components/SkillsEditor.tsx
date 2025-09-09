import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';

interface SkillsEditorProps {
  skills: string[];
  resumeId: number;
  onSkillsUpdate: (skills: string[]) => void;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, resumeId, onSkillsUpdate }) => {
  const { t } = useTranslation();
  const [newSkillName, setNewSkillName] = useState('');
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    try {
      const updatedSkills = [...skills, newSkillName.trim()];
      if (resumeId === -1) {
        guestResumeService.update({ skills: updatedSkills as any });
      } else {
        await resumeApi.updateSkills(resumeId, updatedSkills);
      }
      onSkillsUpdate(updatedSkills);
      setNewSkillName('');
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (skillIndex: number) => {
    setIsSaving(true);
    try {
      const updatedSkills = skills.filter((_, index) => index !== skillIndex);
      if (resumeId === -1) {
        guestResumeService.update({ skills: updatedSkills as any });
      } else {
        await resumeApi.updateSkills(resumeId, updatedSkills);
      }
      onSkillsUpdate(updatedSkills);
    } catch (error) {
      console.error('Error deleting skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSkill = async () => {
    if (editingSkillIndex === null || !editingSkillName.trim()) return;

    setIsSaving(true);
    try {
      const updatedSkills = [...skills];
      updatedSkills[editingSkillIndex] = editingSkillName.trim();
      if (resumeId === -1) {
        guestResumeService.update({ skills: updatedSkills as any });
      } else {
        await resumeApi.updateSkills(resumeId, updatedSkills);
      }
      onSkillsUpdate(updatedSkills);
      setEditDialogOpen(false);
      setEditingSkillIndex(null);
      setEditingSkillName('');
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (skillIndex: number, skillName: string) => {
    setEditingSkillIndex(skillIndex);
    setEditingSkillName(skillName);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingSkillIndex(null);
    setEditingSkillName('');
  };

  return (
    <Box>
      {/* Добавление нового навыка */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('refine.editor.addSkillPlaceholder')}
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          disabled={isSaving}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSkill}
          disabled={!newSkillName.trim() || isSaving}
          size="small"
        >
          {t('refine.editor.add')}
        </Button>
      </Box>

      {/* Список навыков */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={() => handleDeleteSkill(index)}
            deleteIcon={<DeleteIcon />}
            variant="outlined"
            sx={{
              '& .MuiChip-deleteIcon': {
                color: 'error.main',
                '&:hover': {
                  color: 'error.dark'
                }
              }
            }}
          />
        ))}
      </Box>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('refine.editor.editSkill')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('refine.editor.skillName')}
            value={editingSkillName}
            onChange={(e) => setEditingSkillName(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>
            {t('refine.editor.cancel')}
          </Button>
          <Button 
            onClick={handleEditSkill} 
            variant="contained"
            disabled={!editingSkillName.trim() || isSaving}
          >
            {t('refine.editor.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsEditor;
