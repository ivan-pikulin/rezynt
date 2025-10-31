import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Resume } from '../../../shared/services/api/types';
import { COLORS } from '../../../shared/theme/theme';
import EducationEditor from './EducationEditor';
import ExperienceEditor from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';

type Props = {
  resume: Resume;
  onResumeUpdate: (resume: Resume) => void;
  resumeId?: string | null;
};

const EditorAccordion: React.FC<Props> = ({ resume, onResumeUpdate, resumeId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [isSaving, setIsSaving] = useState(false);
  const [newContact, setNewContact] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>(
    { show: false, message: '', severity: 'success' }
  );

  const [formData, setFormData] = useState({
    title: resume.title,
    professional_summary: resume.professional_summary || '',
    first_name: resume.first_name || '',
    last_name: resume.last_name || '',
    location: resume.location || ''
  });

  const isGuestResume = useMemo(() => !resumeId || resumeId === 'guest' || resume.id === -1, [resumeId, resume.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isGuestResume && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated && user && !isGuestResume && resume.user_id !== user.id) {
      navigate('/login');
      return;
    }
  }, [authLoading, isAuthenticated, isGuestResume, navigate, resume.user_id, user]);

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

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasUnsavedChanges = () => {
    const original = {
      title: resume.title,
      professional_summary: resume.professional_summary || '',
      first_name: resume.first_name || '',
      last_name: resume.last_name || '',
      location: resume.location || ''
    };
    return Object.entries(formData).some(([k, v]) => v !== (original as any)[k]);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const original = {
        title: resume.title,
        professional_summary: resume.professional_summary || '',
        first_name: resume.first_name || '',
        last_name: resume.last_name || '',
        location: resume.location || ''
      };
      const changed = Object.entries(formData).filter(([k, v]) => v !== (original as any)[k]);
      if (changed.length === 0) {
        setSaveStatus({ show: true, message: t('refine.editor.noChangesToSave'), severity: 'success' });
        setIsSaving(false);
        return;
      }

      const basic: any = {};
      const personal: any = {};
      for (const [k, v] of changed) {
        if (['title', 'professional_summary'].includes(k)) basic[k] = v;
        if (['first_name', 'last_name', 'location'].includes(k)) personal[k] = v;
      }

      if (Object.keys(basic).length > 0) {
        if (resume.id === -1) guestResumeService.update(basic);
        else await resumeApi.updateResumePartial(resume.id, basic);
      }
      if (Object.keys(personal).length > 0) {
        if (resume.id === -1) guestResumeService.update(personal);
        else await resumeApi.updatePersonalInfo(resume.id, personal);
      }

      const updated = resume.id === -1 ? (guestResumeService.get() as any) : await resumeApi.getResume(resume.id);
      setLocalResume(updated);
      onResumeUpdate(updated);
      setSaveStatus({ show: true, message: t('refine.editor.allChangesSaved'), severity: 'success' });
    } catch (e) {
      setSaveStatus({ show: true, message: t('refine.editor.errorSavingChanges'), severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: COLORS.resume.header.background }}>
        <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', p: 1 }}>
          {/* Personal */}
          <Accordion disableGutters defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{t('refine.editor.personalInfo')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <TextField size="small" label={t('refine.editor.firstName')} value={formData.first_name} onChange={(e) => handleFieldChange('first_name', e.target.value)} />
                <TextField size="small" label={t('refine.editor.lastName')} value={formData.last_name} onChange={(e) => handleFieldChange('last_name', e.target.value)} />
                <TextField size="small" fullWidth label={t('refine.editor.location')} value={formData.location} onChange={(e) => handleFieldChange('location', e.target.value)} />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{t('refine.editor.contacts')}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField fullWidth size="small" placeholder={t('refine.editor.addContactPlaceholder')} value={newContact} onChange={(e) => setNewContact(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && newContact.trim() && setNewContact('')} />
                <Button size="small" variant="contained" startIcon={<AddIcon />} disabled={!newContact.trim()} onClick={() => setNewContact('')}>
                  {t('refine.editor.add')}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {localResume.contacts?.map((c, i) => (
                  <Chip key={i} label={c} onDelete={() => { /* managed in full editor; keep readonly removal to avoid scope creep */ }} deleteIcon={<DeleteIcon />} variant="outlined" />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Summary + Skills */}
          <Accordion disableGutters defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{t('refine.editor.skills')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{t('refine.editor.professionalSummary')}</Typography>
              <TextField fullWidth size="small" multiline rows={4} sx={{ mb: 2 }} label={t('refine.editor.professionalSummary')} value={formData.professional_summary} onChange={(e) => handleFieldChange('professional_summary', e.target.value)} />
              <SkillsEditor
                skills={localResume.skills || []}
                resumeId={resumeId || null}
                onSkillsUpdate={(updatedSkills) => {
                  setLocalResume((prev) => {
                    const updated = { ...prev, skills: updatedSkills };
                    onResumeUpdate(updated);
                    return updated;
                  });
                }}
              />
            </AccordionDetails>
          </Accordion>

          {/* Experience */}
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{t('refine.editor.experience')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ExperienceEditor
                experience={localResume.experience || []}
                resumeId={resumeId || null}
                onExperienceUpdate={(updatedExperience) => {
                  setLocalResume((prev) => {
                    const updated = { ...prev, experience: updatedExperience };
                    onResumeUpdate(updated);
                    return updated;
                  });
                }}
              />
            </AccordionDetails>
          </Accordion>

          {/* Education */}
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{t('refine.editor.education')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EducationEditor
                education={localResume.education || []}
                resumeId={resumeId || null}
                onEducationUpdate={(updatedEducation) => {
                  setLocalResume((prev) => {
                    const updated = { ...prev, education: updatedEducation };
                    onResumeUpdate(updated);
                    return updated;
                  });
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {!isGuestResume && (
        <Box sx={{ bgcolor: COLORS.resume.header.background, p: 2, display: 'flex', justifyContent: 'center', flexShrink: 0, height: 80 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveAllChanges}
            disabled={isSaving || !hasUnsavedChanges()}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: hasUnsavedChanges() ? COLORS.primary.main : COLORS.grey[400],
              '&:hover': { bgcolor: hasUnsavedChanges() ? COLORS.primary.dark : COLORS.grey[400] },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isSaving ? t('refine.editor.saving') : t('refine.editor.saveChanges')}
          </Button>
        </Box>
      )}

      <Snackbar open={saveStatus.show} autoHideDuration={3000} onClose={() => setSaveStatus((p) => ({ ...p, show: false }))}>
        <Alert severity={saveStatus.severity} sx={{ width: '100%' }}>
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditorAccordion;


