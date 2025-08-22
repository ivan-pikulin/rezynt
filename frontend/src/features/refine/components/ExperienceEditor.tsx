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
import { ResumeExperience, ResumeExperienceCreate, ResumeExperienceUpdate } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';

interface ExperienceEditorProps {
  experience: ResumeExperience[];
  resumeId: string;
  onExperienceUpdate: (experience: ResumeExperience[]) => void;
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
  const [localExperience, setLocalExperience] = useState<ResumeExperience[]>(experience);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ResumeExperience | null>(null);
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
    setEditingExperience(null);
  };

  const handleOpenDialog = (exp?: ResumeExperience) => {
    if (exp) {
      setEditingExperience(exp);
      setFormData({
        job_title: exp.job_title,
        company: exp.company,
        location: exp.location || '',
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        is_current: exp.is_current,
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

  const handleFormChange = (field: keyof ExperienceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleSaveExperience = async () => {
    if (!formData.job_title || !formData.company || !formData.start_date) {
      return; // Basic validation
    }

    setIsSaving(true);
    try {
      if (editingExperience) {
        // Update existing experience
        const updateData: ResumeExperienceUpdate = {
          job_title: formData.job_title,
          company: formData.company,
          location: formData.location || undefined,
          start_date: formData.start_date,
          end_date: formData.is_current ? undefined : (formData.end_date || undefined),
          is_current: formData.is_current,
          responsibilities: formData.responsibilities
        };

        const response = await resumeApi.updateExperience(resumeId, editingExperience.id, updateData);
        
        // Update local state with the returned data
        const updatedExperience = localExperience.map(exp => 
          exp.id === editingExperience.id 
            ? response.experience
            : exp
        );
        setLocalExperience(updatedExperience);
        onExperienceUpdate(updatedExperience);
      } else {
        // Add new experience
        const newExperienceData: ResumeExperienceCreate = {
          job_title: formData.job_title,
          company: formData.company,
          location: formData.location || undefined,
          start_date: formData.start_date,
          end_date: formData.is_current ? undefined : (formData.end_date || undefined),
          is_current: formData.is_current,
          responsibilities: formData.responsibilities
        };

        const response = await resumeApi.addExperience(resumeId, newExperienceData);
        
        // Add to local state - use the returned experience data
        const newExperience: ResumeExperience = {
          id: response.experience.id,
          resume_id: resumeId,
          job_title: response.experience.job_title,
          company: response.experience.company,
          location: response.experience.location,
          start_date: response.experience.start_date,
          end_date: response.experience.end_date,
          is_current: response.experience.is_current,
          responsibilities: response.experience.responsibilities,
          order: response.experience.order
        };
        
        const updatedExperience = [...localExperience, newExperience];
        setLocalExperience(updatedExperience);
        onExperienceUpdate(updatedExperience);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    try {
      await resumeApi.removeExperience(resumeId, experienceId);
      
      const updatedExperience = localExperience.filter(exp => exp.id !== experienceId);
      setLocalExperience(updatedExperience);
      onExperienceUpdate(updatedExperience);
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Box>
      {/* Header with Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          {t('refine.editor.experience')} ({localExperience.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {t('refine.editor.addExperience')}
        </Button>
      </Box>

      {/* Experience list */}
      {localExperience.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: 'text.secondary',
          border: '2px dashed #e0e0e0',
          borderRadius: 2
        }}>
          <Typography variant="body1">
            {t('refine.editor.noExperience')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            {t('refine.editor.addFirstExperience')}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {localExperience.map((exp) => (
            <Card key={exp.id} sx={{ 
              border: '1px solid #e0e0e0',
              '&:hover': {
                borderColor: '#007bff',
                boxShadow: '0 2px 8px rgba(0,123,255,0.1)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {exp.job_title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(exp.start_date)} - {exp.is_current ? t('refine.editor.present') : (exp.end_date ? formatDate(exp.end_date) : '')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(exp)}
                      sx={{ color: '#007bff' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteExperience(exp.id)}
                      sx={{ color: '#dc3545' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {exp.responsibilities.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      {t('refine.editor.responsibilities')}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {exp.responsibilities.map((responsibility, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 2, position: 'relative' }}>
                          • {responsibility}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingExperience ? t('refine.editor.editExperience') : t('refine.editor.addExperience')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label={t('refine.editor.jobTitle')}
              value={formData.job_title}
              onChange={(e) => handleFormChange('job_title', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.company')}
              value={formData.company}
              onChange={(e) => handleFormChange('company', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.location')}
              value={formData.location}
              onChange={(e) => handleFormChange('location', e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label={t('refine.editor.startDate')}
              value={formData.start_date}
              onChange={(e) => handleFormChange('start_date', e.target.value)}
              variant="outlined"
              size="small"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('refine.editor.endDate')}
              value={formData.end_date}
              onChange={(e) => handleFormChange('end_date', e.target.value)}
              variant="outlined"
              size="small"
              type="date"
              disabled={formData.is_current}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_current}
                    onChange={(e) => handleFormChange('is_current', e.target.checked)}
                  />
                }
                label={t('refine.editor.currentPosition')}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Responsibilities */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('refine.editor.responsibilities')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label={t('refine.editor.addResponsibility')}
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              variant="outlined"
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibility()}
            />
            <Button
              variant="contained"
              onClick={handleAddResponsibility}
              disabled={!newResponsibility.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <AddIcon />
            </Button>
          </Box>

          {formData.responsibilities.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {formData.responsibilities.map((responsibility, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    • {responsibility}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveResponsibility(index)}
                    sx={{ color: '#dc3545' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSaveExperience}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSaving || !formData.job_title || !formData.company || !formData.start_date}
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExperienceEditor;
