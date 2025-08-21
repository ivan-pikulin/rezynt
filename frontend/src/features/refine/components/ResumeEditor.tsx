import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Resume } from '../../../shared/services/api/types';
import { resumeApi } from '../../../shared/services/api';
import SkillsEditor from './SkillsEditor';

interface ResumeEditorProps {
  resume: Resume;
  onResumeUpdate: (resume: Resume) => void;
}

interface EditableField {
  value: string;
  isEditing: boolean;
  originalValue: string;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resume, onResumeUpdate }) => {
  const { t } = useTranslation();
  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [editableFields, setEditableFields] = useState<Record<string, EditableField>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  // Инициализация редактируемых полей
  useEffect(() => {
    const fields: Record<string, EditableField> = {};
    
    // Основные поля
    fields['title'] = { value: resume.title, isEditing: false, originalValue: resume.title };
    fields['professional_summary'] = { value: resume.professional_summary || '', isEditing: false, originalValue: resume.professional_summary || '' };
    
    // Личная информация
    if (resume.personal_info) {
      fields['first_name'] = { value: resume.personal_info.first_name, isEditing: false, originalValue: resume.personal_info.first_name };
      fields['last_name'] = { value: resume.personal_info.last_name, isEditing: false, originalValue: resume.personal_info.last_name };
      fields['middle_name'] = { value: resume.personal_info.middle_name || '', isEditing: false, originalValue: resume.personal_info.middle_name || '' };
      fields['phone'] = { value: resume.personal_info.phone || '', isEditing: false, originalValue: resume.personal_info.phone || '' };
      fields['email'] = { value: resume.personal_info.email || '', isEditing: false, originalValue: resume.personal_info.email || '' };
      fields['location'] = { value: resume.personal_info.location || '', isEditing: false, originalValue: resume.personal_info.location || '' };
      fields['website'] = { value: resume.personal_info.website || '', isEditing: false, originalValue: resume.personal_info.website || '' };
      fields['linkedin'] = { value: resume.personal_info.linkedin || '', isEditing: false, originalValue: resume.personal_info.linkedin || '' };
      fields['github'] = { value: resume.personal_info.github || '', isEditing: false, originalValue: resume.personal_info.github || '' };
    }
    
    setEditableFields(fields);
  }, [resume]);

  // Функция для начала редактирования поля
  const startEditing = (fieldName: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isEditing: true }
    }));
  };

  // Функция для сохранения изменений поля
  const saveField = async (fieldName: string) => {
    const field = editableFields[fieldName];
    if (!field || field.value === field.originalValue) {
      setEditableFields(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], isEditing: false }
      }));
      return;
    }

    setIsSaving(true);
    try {
      let updatedResume: Resume;

      // Определяем, какое поле обновляем
      if (['title', 'professional_summary'].includes(fieldName)) {
        // Основные поля резюме
        const updateData = fieldName === 'title' ? { title: field.value } : { professional_summary: field.value };
        updatedResume = await resumeApi.updateResumePartial(resume.id, updateData);
      } else if (['first_name', 'last_name', 'middle_name', 'phone', 'email', 'location', 'website', 'linkedin', 'github'].includes(fieldName)) {
        // Поля личной информации
        const personalInfoUpdate: any = { [fieldName.replace('_', '')]: field.value };
        await resumeApi.updatePersonalInfo(resume.id, personalInfoUpdate);
        // Получаем обновленное резюме
        updatedResume = await resumeApi.getResume(resume.id);
      } else {
        throw new Error(`Unknown field: ${fieldName}`);
      }

      // Обновляем локальное состояние
      setLocalResume(updatedResume);
      onResumeUpdate(updatedResume);
      
      // Обновляем редактируемое поле
      setEditableFields(prev => ({
        ...prev,
        [fieldName]: { 
          value: field.value, 
          isEditing: false, 
          originalValue: field.value 
        }
      }));

      setSaveStatus({
        show: true,
        message: 'Изменения сохранены',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving field:', error);
      setSaveStatus({
        show: true,
        message: 'Ошибка при сохранении',
        severity: 'error'
      });
      
      // Возвращаем оригинальное значение
      setEditableFields(prev => ({
        ...prev,
        [fieldName]: { 
          value: field.originalValue, 
          isEditing: false, 
          originalValue: field.originalValue 
        }
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Функция для отмены редактирования
  const cancelEditing = (fieldName: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: { 
        value: prev[fieldName].originalValue, 
        isEditing: false, 
        originalValue: prev[fieldName].originalValue 
      }
    }));
  };

  // Функция для обновления значения поля
  const updateFieldValue = (fieldName: string, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value }
    }));
  };

  // Компонент для редактируемого поля
  const EditableField = ({ 
    fieldName, 
    label, 
    multiline = false, 
    rows = 1,
    type = 'text'
  }: {
    fieldName: string;
    label: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
  }) => {
    const field = editableFields[fieldName];
    if (!field) return null;

    if (field.isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label={label}
            value={field.value}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
            multiline={multiline}
            rows={rows}
            type={type}
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => saveField(fieldName)}
              disabled={isSaving}
              color="primary"
            >
              <SaveIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => cancelEditing(fieldName)}
              disabled={isSaving}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 2,
          p: 1,
          border: '1px solid transparent',
          borderRadius: 1,
          '&:hover': {
            border: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
              overflow: multiline ? 'visible' : 'hidden',
              textOverflow: multiline ? 'clip' : 'ellipsis'
            }}
          >
            {field.value || t('refine.editor.notFilled')}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => startEditing(fieldName)}
          sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, maxHeight: '100vh', overflow: 'auto' }}>


      {/* Основная информация */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('refine.editor.basicInfo')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <EditableField fieldName="title" label={t('refine.editor.resumeTitle')} />
          <EditableField 
            fieldName="professional_summary" 
            label={t('refine.editor.professionalSummary')} 
            multiline 
            rows={4}
          />
        </AccordionDetails>
      </Accordion>

      {/* Личная информация */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('refine.editor.personalInfo')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <EditableField fieldName="first_name" label={t('refine.editor.firstName')} />
            <EditableField fieldName="last_name" label={t('refine.editor.lastName')} />
            <EditableField fieldName="middle_name" label={t('refine.editor.middleName')} />
            <EditableField fieldName="phone" label={t('refine.editor.phone')} type="tel" />
            <EditableField fieldName="email" label={t('refine.editor.email')} type="email" />
            <EditableField fieldName="location" label={t('refine.editor.location')} />
            <EditableField fieldName="website" label={t('refine.editor.website')} type="url" />
            <EditableField fieldName="linkedin" label={t('refine.editor.linkedin')} type="url" />
            <EditableField fieldName="github" label="GitHub" type="url" />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Навыки */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('refine.editor.skills')} ({localResume.skills?.length || 0})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SkillsEditor 
            skills={localResume.skills || []}
            resumeId={resume.id}
            onSkillsUpdate={(updatedSkills) => {
              setLocalResume(prev => ({ ...prev, skills: updatedSkills }));
              onResumeUpdate({ ...localResume, skills: updatedSkills });
            }}
          />
        </AccordionDetails>
      </Accordion>

      {/* Опыт работы */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('refine.editor.experience')} ({localResume.experience?.length || 0})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('refine.editor.comingSoon')}
          </Typography>
          {localResume.experience?.map((exp) => (
            <Box key={exp.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {exp.job_title} в {exp.company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.start_date} - {exp.is_current ? 'Настоящее время' : exp.end_date}
              </Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Образование */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('refine.editor.education')} ({localResume.education?.length || 0})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('refine.editor.comingSoon')}
          </Typography>
          {localResume.education?.map((edu) => (
            <Box key={edu.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {edu.degree}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.institution}
              </Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Уведомления */}
      <Snackbar
        open={saveStatus.show}
        autoHideDuration={3000}
        onClose={() => setSaveStatus(prev => ({ ...prev, show: false }))}
      >
        <Alert severity={saveStatus.severity} sx={{ width: '100%' }}>
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeEditor;
