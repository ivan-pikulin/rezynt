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
import { ResumeEducation, ResumeEducationCreate, ResumeEducationUpdate } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';

interface EducationEditorProps {
  education: ResumeEducation[];
  resumeId: string;
  onEducationUpdate: (education: ResumeEducation[]) => void;
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
  const [localEducation, setLocalEducation] = useState<ResumeEducation[]>(education);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<ResumeEducation | null>(null);
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
    setEditingEducation(null);
  };

  const handleOpenDialog = (edu?: ResumeEducation) => {
    if (edu) {
      setEditingEducation(edu);
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

  const handleFormChange = (field: keyof EducationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEducation = async () => {
    if (!formData.degree || !formData.institution) {
      return; // Basic validation
    }

    setIsSaving(true);
    try {
      if (editingEducation) {
        // Update existing education
        const updateData: ResumeEducationUpdate = {
          degree: formData.degree,
          institution: formData.institution,
          location: formData.location || undefined,
          graduation_date: formData.graduation_date || undefined
        };

        const response = await resumeApi.updateEducation(resumeId, editingEducation.id, updateData);
        
        // Update local state with the returned data
        const updatedEducation = localEducation.map(edu => 
          edu.id === editingEducation.id 
            ? response.education
            : edu
        );
        setLocalEducation(updatedEducation);
        onEducationUpdate(updatedEducation);
      } else {
        // Add new education
        const newEducationData: ResumeEducationCreate = {
          degree: formData.degree,
          institution: formData.institution,
          location: formData.location || undefined,
          graduation_date: formData.graduation_date || undefined
        };

        const response = await resumeApi.addEducation(resumeId, newEducationData);
        
        // Add to local state - use the returned education data
        const newEducation: ResumeEducation = {
          id: response.education.id,
          resume_id: resumeId,
          degree: response.education.degree,
          institution: response.education.institution,
          location: response.education.location,
          graduation_date: response.education.graduation_date,
          order: response.education.order
        };
        
        const updatedEducation = [...localEducation, newEducation];
        setLocalEducation(updatedEducation);
        onEducationUpdate(updatedEducation);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    try {
      await resumeApi.removeEducation(resumeId, educationId);
      
      const updatedEducation = localEducation.filter(edu => edu.id !== educationId);
      setLocalEducation(updatedEducation);
      onEducationUpdate(updatedEducation);
    } catch (error) {
      console.error('Error deleting education:', error);
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
          {t('refine.editor.education')} ({localEducation.length})
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
          {t('refine.editor.addEducation')}
        </Button>
      </Box>

      {/* Education list */}
      {localEducation.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: 'text.secondary',
          border: '2px dashed #e0e0e0',
          borderRadius: 2
        }}>
          <Typography variant="body1">
            {t('refine.editor.noEducation')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            {t('refine.editor.addFirstEducation')}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {localEducation.map((edu) => (
            <Card key={edu.id} sx={{ 
              border: '1px solid #e0e0e0',
              '&:hover': {
                borderColor: '#007bff',
                boxShadow: '0 2px 8px rgba(0,123,255,0.1)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {edu.degree}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </Typography>
                    {edu.graduation_date && (
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(edu.graduation_date)}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(edu)}
                      sx={{ color: '#007bff' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteEducation(edu.id)}
                      sx={{ color: '#dc3545' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
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
          {editingEducation ? t('refine.editor.editEducation') : t('refine.editor.addEducation')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label={t('refine.editor.degree')}
              value={formData.degree}
              onChange={(e) => handleFormChange('degree', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              fullWidth
              label={t('refine.editor.institution')}
              value={formData.institution}
              onChange={(e) => handleFormChange('institution', e.target.value)}
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
              label={t('refine.editor.graduationDate')}
              value={formData.graduation_date}
              onChange={(e) => handleFormChange('graduation_date', e.target.value)}
              variant="outlined"
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSaveEducation}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSaving || !formData.degree || !formData.institution}
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationEditor;
