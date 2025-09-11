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
  FormControlLabel,
  Switch,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { UnifiedResumeExperience } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';
import { useAuthErrorHandler } from '../../../shared/hooks/useAuthErrorHandler';

interface ExperienceEditorProps {
  experience: UnifiedResumeExperience[];
  resumeId: string | null;
  onExperienceUpdate: (experience: UnifiedResumeExperience[]) => void;
}

interface ExperienceFormData {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  responsibilities: string[];
}

const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  resumeId,
  onExperienceUpdate
}) => {
  const { t } = useTranslation();
  const { handleAuthError } = useAuthErrorHandler();
  const [localExperience, setLocalExperience] = useState<UnifiedResumeExperience[]>(experience);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newResponsibility, setNewResponsibility] = useState('');
  
  const [formData, setFormData] = useState<ExperienceFormData>({
    job_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    responsibilities: []
  });

  const resetForm = () => {
    setFormData({
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      responsibilities: []
    });
    setNewResponsibility('');
    setEditingExperienceIndex(null);
  };

  const handleOpenDialog = (exp?: UnifiedResumeExperience, index?: number) => {
    if (exp && index !== undefined) {
      setEditingExperienceIndex(index);
      setFormData({
        job_title: exp.job_title,
        company: exp.company,
        location: exp.location || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        is_current: !exp.end_date,
        responsibilities: [...exp.responsibilities]
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

  const handleSaveExperience = async () => {
    if (!formData.job_title.trim() || !formData.company.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const experienceData: UnifiedResumeExperience = {
        job_title: formData.job_title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim() || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.is_current ? undefined : (formData.end_date || undefined),
        responsibilities: formData.responsibilities.filter(r => r.trim())
      };

      let updatedExperience: UnifiedResumeExperience[];
      
      if (editingExperienceIndex !== null) {
        // Update existing experience
        updatedExperience = [...localExperience];
        updatedExperience[editingExperienceIndex] = experienceData;
      } else {
        // Add new experience
        updatedExperience = [...localExperience, experienceData];
      }

      // Update the resume with new experience data
      const resumeUpdate = {
        experience: updatedExperience
      };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ experience: updatedExperience as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving experience:', error);
      // Handle 401 errors
      if (handleAuthError(error)) {
        return; // User will be redirected to login
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedExperience = localExperience.filter((_, i) => i !== index);
      
      const resumeUpdate = {
        experience: updatedExperience
      };
      
      if (resumeId === 'guest' || resumeId === '-1') {
        guestResumeService.update({ experience: updatedExperience as any });
      } else {
        await resumeApi.updateResumePartial(parseInt(resumeId!), resumeUpdate);
      }
      
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
    } catch (error) {
      console.error('Error deleting experience:', error);
      // Handle 401 errors
      if (handleAuthError(error)) {
        return; // User will be redirected to login
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          {t('refine.editor.experience')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isSaving}
        >
          {t('refine.editor.addExperience')}
        </Button>
      </Box>

      {/* Work experience list */}
      {localExperience.map((exp, index) => (
        <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {exp.job_title}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#7f8c8d', mb: 1 }}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </Typography>
                <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString()}
                  {exp.end_date && ` - ${new Date(exp.end_date).toLocaleDateString()}`}
                  {!exp.end_date && exp.start_date && ' - Present'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(exp, index)}
                  disabled={isSaving}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteExperience(index)}
                  disabled={isSaving}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#34495e' }}>
                  {t('refine.editor.responsibilities')}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {exp.responsibilities.map((resp, respIndex) => (
                    <Chip
                      key={respIndex}
                      label={resp}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add/Edit dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExperienceIndex !== null ? t('refine.editor.editExperience') : t('refine.editor.addExperience')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label={t('refine.editor.jobTitle')}
              value={formData.job_title}
              onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.company')}
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
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
              label={t('refine.editor.startDate')}
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('refine.editor.endDate')}
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              disabled={formData.is_current}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_current}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    is_current: e.target.checked,
                    end_date: e.target.checked ? '' : prev.end_date
                  }))}
                />
              }
              label={t('refine.editor.currentPosition')}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('refine.editor.responsibilities')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('refine.editor.addResponsibility')}
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
            />
            <Button
              variant="outlined"
              onClick={addResponsibility}
              disabled={!newResponsibility.trim()}
            >
              {t('refine.editor.add')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.responsibilities.map((resp, index) => (
              <Chip
                key={index}
                label={resp}
                onDelete={() => removeResponsibility(index)}
                variant="outlined"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('refine.editor.cancel')}
          </Button>
          <Button
            onClick={handleSaveExperience}
            variant="contained"
            disabled={!formData.job_title.trim() || !formData.company.trim() || isSaving}
            startIcon={<SaveIcon />}
          >
            {isSaving ? t('refine.editor.saving') : t('refine.editor.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExperienceEditor;
