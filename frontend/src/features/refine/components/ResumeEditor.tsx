import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Typography,
  Tabs,
  Tab,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as SkillsIcon
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resume-tabpanel-${index}`}
      aria-labelledby={`resume-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `resume-tab-${index}`,
    'aria-controls': `resume-tabpanel-${index}`,
  };
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resume, onResumeUpdate }) => {
  const { t } = useTranslation();
  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [editableFields, setEditableFields] = useState<Record<string, EditableField>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Функция для начала редактирования поля
  const startEditing = (fieldName: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isEditing: true }
    }));
  };



  // Функция для обновления значения поля
  const updateFieldValue = (fieldName: string, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value }
    }));
  };

  // Функция для сохранения всех изменений
  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      // Собираем все измененные поля
      const changedFields = Object.entries(editableFields).filter(
        ([_, field]) => field.value !== field.originalValue
      );

      if (changedFields.length === 0) {
        setSaveStatus({
          show: true,
          message: 'Нет изменений для сохранения',
          severity: 'success'
        });
        return;
      }

      // Группируем изменения по типам
      const mainUpdates: any = {};
      const personalInfoUpdates: any = {};

      for (const [fieldName, field] of changedFields) {
        if (['title', 'professional_summary'].includes(fieldName)) {
          mainUpdates[fieldName] = field.value;
        } else if (['first_name', 'last_name', 'middle_name', 'phone', 'email', 'location', 'website', 'linkedin', 'github'].includes(fieldName)) {
          // Преобразуем имена полей для API
          const apiFieldName = fieldName.replace('_', '');
          personalInfoUpdates[apiFieldName] = field.value;
        }
      }

      // Сохраняем основные поля резюме
      if (Object.keys(mainUpdates).length > 0) {
        await resumeApi.updateResumePartial(resume.id, mainUpdates);
      }

      // Сохраняем личную информацию
      if (Object.keys(personalInfoUpdates).length > 0) {
        await resumeApi.updatePersonalInfo(resume.id, personalInfoUpdates);
      }

      // Получаем обновленное резюме
      const updatedResume = await resumeApi.getResume(resume.id);
      
      // Обновляем локальное состояние
      setLocalResume(updatedResume);
      onResumeUpdate(updatedResume);
      
      // Обновляем редактируемые поля
      setEditableFields(prev => {
        const updated = { ...prev };
        for (const [fieldName, field] of changedFields) {
          updated[fieldName] = {
            ...field,
            isEditing: false,
            originalValue: field.value
          };
        }
        return updated;
      });

      setSaveStatus({
        show: true,
        message: 'Все изменения сохранены',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveStatus({
        show: true,
        message: 'Ошибка при сохранении изменений',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
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
          sx={{ mb: 2 }}
        />
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Содержимое вкладок */}
      <Box sx={{ flex: 1, bgcolor: '#f8fbff', p: 2, minHeight: 0 }}>
        <Box sx={{ 
          bgcolor: 'white', 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Вкладки */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="resume editor tabs"
            variant="fullWidth"
            sx={{
              flexShrink: 0,
              '& .MuiTabs-indicator': {
                display: 'none'
              },
              '& .MuiTabs-flexContainer': {
                background: 'white',
                borderRadius: '8px 8px 0 0',
                overflow: 'hidden',
                gap: '2px',
                padding: '8px 8px 0 8px'
              },
                          '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              position: 'relative',
              background: '#f5f5f5',
              border: 'none',
              margin: 0,
              borderRadius: '8px 8px 0 0',
              transform: 'skewX(-15deg)',
              transition: 'background-color 0.25s',
              flex: 1,
              '&:hover': {
                background: '#e8e8e8'
              },
              '&.Mui-selected': {
                background: '#007bff',
                color: 'white',
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
                transform: 'skewX(15deg)',
                color: 'inherit'
              }
            }
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              {...a11yProps(0)} 
              title={t('refine.editor.personalInfo')}
            />
            <Tab 
              icon={<SkillsIcon />} 
              {...a11yProps(1)} 
              title={`${t('refine.editor.skills')} (${localResume.skills?.length || 0})`}
            />
            <Tab 
              icon={<WorkIcon />} 
              {...a11yProps(2)} 
              title={`${t('refine.editor.experience')} (${localResume.experience?.length || 0})`}
            />
            <Tab 
              icon={<SchoolIcon />} 
              {...a11yProps(3)} 
              title={`${t('refine.editor.education')} (${localResume.education?.length || 0})`}
            />
          </Tabs>

          {/* Содержимое панелей */}
          <Box sx={{ 
            p: 3, 
            flex: 1, 
            overflow: 'auto',
            bgcolor: 'white'
          }}>
          {/* Личная информация */}
          <TabPanel value={activeTab} index={0}>
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
          </TabPanel>

          {/* Навыки */}
          <TabPanel value={activeTab} index={1}>
            <EditableField 
              fieldName="professional_summary" 
              label={t('refine.editor.professionalSummary')} 
              multiline 
              rows={4}
            />
            <Divider sx={{ my: 3 }} />
            <SkillsEditor 
              skills={localResume.skills || []}
              resumeId={resume.id}
              onSkillsUpdate={(updatedSkills) => {
                setLocalResume(prev => ({ ...prev, skills: updatedSkills }));
                onResumeUpdate({ ...localResume, skills: updatedSkills });
              }}
            />
          </TabPanel>

          {/* Опыт работы */}
          <TabPanel value={activeTab} index={2}>
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
          </TabPanel>

          {/* Образование */}
          <TabPanel value={activeTab} index={3}>
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
          </TabPanel>
          </Box>
        </Box>
      </Box>

      {/* Блок с кнопкой сохранения */}
      <Box sx={{ 
        bgcolor: '#f8fbff', 
        p: 2, 
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
        height: 80
      }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveAllChanges}
          disabled={isSaving}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

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
