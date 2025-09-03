import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { UnifiedResumeEducation } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';

interface EducationEditorProps {
  education: UnifiedResumeEducation[];
  resumeId: number;
  onEducationUpdate: (education: UnifiedResumeEducation[]) => void;
}

interface EducationFormData {
  degree: string;
  institution: string;
  location: string;
  graduation_date: string;
}

const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  resumeId,
  onEducationUpdate
}) => {
  const { t } = useTranslation();
  const [localEducation, setLocalEducation] = useState<UnifiedResumeEducation[]>(education);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<EducationFormData>({
    degree: '',
    institution: '',
    location: '',
    graduation_date: ''
  });

  const resetForm = () => {
    setFormData({
      degree: '',
      institution: '',
      location: '',
      graduation_date: ''
    });
    setEditingEducationIndex(null);
  };

  const handleOpenDialog = (edu?: UnifiedResumeEducation, index?: number) => {
    if (edu && index !== undefined) {
      setEditingEducationIndex(index);
      setFormData({
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location || '',
        graduation_date: edu.graduation_date || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveEducation = async () => {
    if (!formData.degree.trim() || !formData.institution.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const educationData: UnifiedResumeEducation = {
        degree: formData.degree.trim(),
        institution: formData.institution.trim(),
        location: formData.location.trim() || undefined,
        graduation_date: formData.graduation_date || undefined
      };

      let updatedEducation: UnifiedResumeEducation[];
      
      if (editingEducationIndex !== null) {
        // Update existing education
        updatedEducation = [...localEducation];
        updatedEducation[editingEducationIndex] = educationData;
      } else {
        // Add new education
        updatedEducation = [...localEducation, educationData];
      }

      // Update the resume with new education data
      const resumeUpdate = {
        education: updatedEducation
      };
      
      await resumeApi.updateResumePartial(resumeId, resumeUpdate);
      
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedEducation = localEducation.filter((_, i) => i !== index);
      
      const resumeUpdate = {
        education: updatedEducation
      };
      
      await resumeApi.updateResumePartial(resumeId, resumeUpdate);
      
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
    } catch (error) {
      console.error('Error deleting education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          {t('refine.editor.education')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isSaving}
        >
          {t('refine.editor.addEducation')}
        </Button>
      </Box>

      {/* Education list */}
      {localEducation.map((edu, index) => (
        <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {edu.degree}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#7f8c8d', mb: 1 }}>
                  {edu.institution}
                  {edu.location && ` • ${edu.location}`}
                </Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  {edu.graduation_date && new Date(edu.graduation_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(edu, index)}
                  disabled={isSaving}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteEducation(index)}
                  disabled={isSaving}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Add/Edit dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEducationIndex !== null ? t('refine.editor.editEducation') : t('refine.editor.addEducation')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label={t('refine.editor.degree')}
              value={formData.degree}
              onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.institution')}
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.location')}
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
            <TextField
              fullWidth
              label={t('refine.editor.graduationDate')}
              type="date"
              value={formData.graduation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, graduation_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('refine.editor.cancel')}
          </Button>
          <Button
            onClick={handleSaveEducation}
            variant="contained"
            disabled={!formData.degree.trim() || !formData.institution.trim() || isSaving}
            startIcon={<SaveIcon />}
          >
            {isSaving ? t('refine.editor.saving') : t('refine.editor.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationEditor;
