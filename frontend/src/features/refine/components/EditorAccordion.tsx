import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../../../shared/services/api';
import { guestResumeService } from '../../../shared/services/guestResumeService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Resume } from '../../../shared/services/api/types';
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
  const [newContact, setNewContact] = useState('');

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

  const accordionStyles = {
    '&:before': { display: 'none' },
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    mb: 2,
    backgroundColor: 'white',
    '& .MuiAccordionSummary-root': { 
      minHeight: '48px',
      padding: '12px 16px',
      '&.Mui-expanded': { minHeight: '48px', padding: '12px 16px' }
    },
    '& .MuiAccordionSummary-content': { margin: 0 },
    '& .MuiAccordionDetails-root': { padding: '16px' }
  };

  const sectionNameStyles = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#F9FAFB',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#e5e7eb',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '12px',
      padding: '8px 12px',
    },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#F5F7FA' }}>
        {/* Personal */}
        <Accordion disableGutters defaultExpanded sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.personalInfo')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField size="small" label={t('refine.editor.firstName')} value={formData.first_name} onChange={(e) => handleFieldChange('first_name', e.target.value)} sx={inputStyles} />
              <TextField size="small" label={t('refine.editor.lastName')} value={formData.last_name} onChange={(e) => handleFieldChange('last_name', e.target.value)} sx={inputStyles} />
              <TextField size="small" fullWidth label={t('refine.editor.location')} value={formData.location} onChange={(e) => handleFieldChange('location', e.target.value)} sx={inputStyles} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{t('refine.editor.contacts')}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField fullWidth size="small" placeholder={t('refine.editor.addContactPlaceholder')} value={newContact} onChange={(e) => setNewContact(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && newContact.trim() && setNewContact('')} sx={inputStyles} />
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

        {/* Professional Summary */}
        <Accordion disableGutters defaultExpanded sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.professionalSummary')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField fullWidth size="small" multiline rows={4} sx={inputStyles} value={formData.professional_summary} onChange={(e) => handleFieldChange('professional_summary', e.target.value)} />
          </AccordionDetails>
        </Accordion>

        {/* Skills */}
        <Accordion disableGutters defaultExpanded sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.skills')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
              inputStyles={inputStyles}
            />
          </AccordionDetails>
        </Accordion>

        {/* Experience */}
        <Accordion disableGutters sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.experience')}</Typography>
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
        <Accordion disableGutters sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.education')}</Typography>
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
  );
};

export default EditorAccordion;


