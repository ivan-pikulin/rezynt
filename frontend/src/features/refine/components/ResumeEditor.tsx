import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Psychology as SkillsIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resumeApi } from '../../../shared/services/api';
import { Resume } from '../../../shared/services/api/types';
import EducationEditor from './EducationEditor';
import ExperienceEditor from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';
import { COLORS } from '../../../shared/theme/theme';

interface ResumeEditorProps {
  resume: Resume;
  onResumeUpdate: (resume: Resume) => void;
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
  const [formData, setFormData] = useState({
    // Main fields
    title: resume.title,
    professional_summary: resume.professional_summary || '',
    
    // Personal information (using new UnifiedResume fields)
    first_name: resume.first_name || '',
    last_name: resume.last_name || '',
    location: resume.location || ''
  });
  
  const [newContact, setNewContact] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  });

  // Обновляем локальное состояние при изменении резюме
  useEffect(() => {
    setLocalResume(resume);
    setFormData({
      title: resume.title,
      professional_summary: resume.professional_summary || '',
      first_name: resume.first_name || '',
      last_name: resume.last_name || '',
      location: resume.location || ''
    });
  }, [resume]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Обработчик изменения полей формы
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Обработчики для контактов
  const handleAddContact = async () => {
    if (!newContact.trim()) return;

    setIsSaving(true);
    try {
      const updatedContacts = [...localResume.contacts, newContact.trim()];
      await resumeApi.updateContacts(localResume.id, updatedContacts);
      
      const updatedResume = { ...localResume, contacts: updatedContacts };
      setLocalResume(updatedResume);
      onResumeUpdate(updatedResume);
      setNewContact('');
    } catch (error) {
      console.error('Error adding contact:', error);
      setSaveStatus({
        show: true,
        message: t('refine.editor.errorAddingContact'),
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveContact = async (contactIndex: number) => {
    setIsSaving(true);
    try {
      const updatedContacts = localResume.contacts.filter((_, index) => index !== contactIndex);
      await resumeApi.updateContacts(localResume.id, updatedContacts);
      
      const updatedResume = { ...localResume, contacts: updatedContacts };
      setLocalResume(updatedResume);
      onResumeUpdate(updatedResume);
    } catch (error) {
      console.error('Error removing contact:', error);
      setSaveStatus({
        show: true,
        message: t('refine.editor.errorRemovingContact'),
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Функция для сохранения всех изменений
  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      // Собираем все измененные поля
      const originalData = {
        title: resume.title,
        professional_summary: resume.professional_summary || '',
        first_name: resume.first_name || '',
        last_name: resume.last_name || '',
        location: resume.location || ''
      };

      const changedFields = Object.entries(formData).filter(
        ([key, value]) => value !== originalData[key as keyof typeof originalData]
      );

      if (changedFields.length === 0) {
        setSaveStatus({
          show: true,
          message: t('refine.editor.noChangesToSave'),
          severity: 'success'
        });
        return;
      }

      // Группируем изменения по типам
      const mainUpdates: any = {};
      const personalInfoUpdates: any = {};

      for (const [fieldName, value] of changedFields) {
        if (['title', 'professional_summary'].includes(fieldName)) {
          mainUpdates[fieldName] = value;
        } else if (['first_name', 'last_name', 'location'].includes(fieldName)) {
          personalInfoUpdates[fieldName] = value;
        }
      }

      // Сохраняем основные поля резюме
      if (Object.keys(mainUpdates).length > 0) {
        await resumeApi.updateResumePartial(resume.id, mainUpdates);
      }

      // Сохраняем личную информацию (используем новый метод для UnifiedResume)
      if (Object.keys(personalInfoUpdates).length > 0) {
        await resumeApi.updatePersonalInfo(resume.id, personalInfoUpdates);
      }

      // Получаем обновленное резюме
      const updatedResume = await resumeApi.getResume(resume.id);
      
      // Обновляем локальное состояние
      setLocalResume(updatedResume);
      onResumeUpdate(updatedResume);

      setSaveStatus({
        show: true,
        message: t('refine.editor.allChangesSaved'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveStatus({
        show: true,
        message: t('refine.editor.errorSavingChanges'),
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Содержимое вкладок */}
              <Box sx={{ flex: 1, bgcolor: COLORS.resume.header.background, p: 2, minHeight: 0 }}>
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
                padding: '4px 4px 0 4px'
              },
              '& .MuiTab-root': {
                minHeight: 36,
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                py: 1,
                position: 'relative',
                background: COLORS.grey[100],
                border: 'none',
                margin: 0,
                borderRadius: '8px 8px 0 0',
                transform: 'skewX(-15deg)',
                transition: 'background-color 0.25s',
                flex: 1,
                '&:hover': {
                  background: COLORS.grey[200]
                },
                '&.Mui-selected': {
                  background: COLORS.primary.main,
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
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
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: COLORS.resume.text.primary }}>
                {t('refine.editor.personalInfo')}
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 3,
                mb: 4
              }}>
                <TextField
                  fullWidth
                  label={t('refine.editor.firstName')}
                  value={formData.first_name}
                  onChange={(e) => handleFieldChange('first_name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('refine.editor.lastName')}
                  value={formData.last_name}
                  onChange={(e) => handleFieldChange('last_name', e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('refine.editor.location')}
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Контакты */}
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: COLORS.resume.text.primary }}>
                {t('refine.editor.contacts')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('refine.editor.addContactPlaceholder')}
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddContact()}
                  disabled={isSaving}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddContact}
                  disabled={!newContact.trim() || isSaving}
                  size="small"
                >
                  {t('refine.editor.add')}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {localResume.contacts?.map((contact, index) => (
                  <Chip
                    key={index}
                    label={contact}
                    onDelete={() => handleRemoveContact(index)}
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
            </TabPanel>

            {/* Навыки */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: COLORS.resume.text.primary }}>
                {t('refine.editor.professionalSummary')}
              </Typography>
              
              <TextField
                fullWidth
                label={t('refine.editor.professionalSummary')}
                value={formData.professional_summary}
                onChange={(e) => handleFieldChange('professional_summary', e.target.value)}
                multiline
                rows={4}
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
              />
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: COLORS.resume.text.primary }}>
                {t('refine.editor.skills')}
              </Typography>
              
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
              <ExperienceEditor 
                experience={localResume.experience || []}
                resumeId={resume.id}
                onExperienceUpdate={(updatedExperience) => {
                  setLocalResume(prev => ({ ...prev, experience: updatedExperience }));
                  onResumeUpdate({ ...localResume, experience: updatedExperience });
                }}
              />
            </TabPanel>

            {/* Образование */}
            <TabPanel value={activeTab} index={3}>
              <EducationEditor 
                education={localResume.education || []}
                resumeId={resume.id}
                onEducationUpdate={(updatedEducation) => {
                  setLocalResume(prev => ({ ...prev, education: updatedEducation }));
                  onResumeUpdate({ ...localResume, education: updatedEducation });
                }}
              />
            </TabPanel>
          </Box>
        </Box>
      </Box>

      {/* Блок с кнопкой сохранения */}
      <Box sx={{ 
        bgcolor: COLORS.resume.header.background, 
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
            bgcolor: COLORS.primary.main,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              bgcolor: COLORS.primary.dark,
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {isSaving ? t('refine.editor.saving') : t('refine.editor.saveChanges')}
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



