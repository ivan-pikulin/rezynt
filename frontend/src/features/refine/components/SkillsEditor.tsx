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
import { ResumeSkill } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';

interface SkillsEditorProps {
  skills: ResumeSkill[];
  resumeId: string;
  onSkillsUpdate: (skills: ResumeSkill[]) => void;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, resumeId, onSkillsUpdate }) => {
  const { t } = useTranslation();
  const [newSkillName, setNewSkillName] = useState('');
  const [editingSkill, setEditingSkill] = useState<ResumeSkill | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    try {
      const newSkill = await resumeApi.addSkill(resumeId, { name: newSkillName.trim() });
      onSkillsUpdate([...skills, newSkill]);
      setNewSkillName('');
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setIsSaving(true);
    try {
      await resumeApi.removeSkill(resumeId, skillId);
      onSkillsUpdate(skills.filter(skill => skill.id !== skillId));
    } catch (error) {
      console.error('Error deleting skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSkill = async () => {
    if (!editingSkill || !editingSkill.name.trim()) return;

    setIsSaving(true);
    try {
      // Удаляем старый навык и добавляем новый
      await resumeApi.removeSkill(resumeId, editingSkill.id);
      const newSkill = await resumeApi.addSkill(resumeId, { name: editingSkill.name.trim() });
      onSkillsUpdate(skills.map(skill => skill.id === editingSkill.id ? newSkill : skill));
      setEditDialogOpen(false);
      setEditingSkill(null);
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (skill: ResumeSkill) => {
    setEditingSkill(skill);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingSkill(null);
  };

  return (
    <Box>
      {/* Добавление нового навыка */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('refine.editor.skillName')}
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          disabled={isSaving}
        />
        <IconButton
          onClick={handleAddSkill}
          disabled={!newSkillName.trim() || isSaving}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Список навыков */}
      <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
        <List dense>
          {skills.map((skill) => (
            <ListItem key={skill.id} divider>
              <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <ListItemText primary={skill.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => openEditDialog(skill)}
                  disabled={isSaving}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDeleteSkill(skill.id)}
                  disabled={isSaving}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('refine.editor.editSkill')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('refine.editor.skillName')}
            fullWidth
            value={editingSkill?.name || ''}
            onChange={(e) => setEditingSkill(prev => prev ? { ...prev, name: e.target.value } : null)}
            onKeyPress={(e) => e.key === 'Enter' && handleEditSkill()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={isSaving}>
            {t('refine.editor.cancel')}
          </Button>
          <Button onClick={handleEditSkill} disabled={!editingSkill?.name.trim() || isSaving}>
            {t('refine.editor.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsEditor;
