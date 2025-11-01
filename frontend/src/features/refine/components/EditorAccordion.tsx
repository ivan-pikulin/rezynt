import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Resume } from '../../../shared/services/api/types';
import EducationEditor from './EducationEditor';
import ExperienceEditor from './ExperienceEditor';
import SkillsEditor from './SkillsEditor';

type Props = {
  resume: Resume;
  onResumeUpdate: (resume: Resume) => void;
};

const EditorAccordion: React.FC<Props> = ({ resume, onResumeUpdate }) => {
  const { t } = useTranslation();

  const [localResume, setLocalResume] = useState<Resume>(resume);

  const [formData, setFormData] = useState({
    professional_summary: resume.professional_summary || '',
    first_name: resume.personal_info?.first_name || '',
    last_name: resume.personal_info?.last_name || '',
    current_role: resume.personal_info?.current_role || '',
    city: resume.personal_info?.city || '',
    country: resume.personal_info?.country || '',
    // Contacts
    email: resume.personal_info?.contacts?.email || '',
    phone: resume.personal_info?.contacts?.phone || '',
    telegram: resume.personal_info?.contacts?.telegram || '',
    whatsapp: resume.personal_info?.contacts?.whatsapp || '',
    linkedin: resume.personal_info?.contacts?.linkedin || '',
    github: resume.personal_info?.contacts?.github || '',
    website: resume.personal_info?.contacts?.website || '',
    twitter: resume.personal_info?.contacts?.twitter || '',
    instagram: resume.personal_info?.contacts?.instagram || ''
  });

  useEffect(() => {
    setLocalResume(resume);
    setFormData({
      professional_summary: resume.professional_summary || '',
      first_name: resume.personal_info?.first_name || '',
      last_name: resume.personal_info?.last_name || '',
      current_role: resume.personal_info?.current_role || '',
      city: resume.personal_info?.city || '',
      country: resume.personal_info?.country || '',
      // Contacts
      email: resume.personal_info?.contacts?.email || '',
      phone: resume.personal_info?.contacts?.phone || '',
      telegram: resume.personal_info?.contacts?.telegram || '',
      whatsapp: resume.personal_info?.contacts?.whatsapp || '',
      linkedin: resume.personal_info?.contacts?.linkedin || '',
      github: resume.personal_info?.contacts?.github || '',
      website: resume.personal_info?.contacts?.website || '',
      twitter: resume.personal_info?.contacts?.twitter || '',
      instagram: resume.personal_info?.contacts?.instagram || ''
    });
  }, [resume]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update local resume immediately
    const updated = { ...localResume };
    if (!updated.personal_info) {
      updated.personal_info = {};
    }
    
    // Contact fields
    const contactFields = ['email', 'phone', 'telegram', 'whatsapp', 'linkedin', 'github', 'website', 'twitter', 'instagram'];
    
    if (field === 'professional_summary') {
      updated.professional_summary = value;
    } else if (contactFields.includes(field)) {
      // Update contacts
      if (!updated.personal_info.contacts) {
        updated.personal_info.contacts = {};
      }
      (updated.personal_info.contacts as any)[field] = value;
    } else {
      // Update personal info fields
      (updated.personal_info as any)[field] = value;
    }
    
    setLocalResume(updated);
    onResumeUpdate(updated);
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
        {/* Personal Info */}
        <Accordion disableGutters defaultExpanded sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.personalInfo')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField 
                size="small" 
                placeholder={t('refine.editor.firstName')} 
                value={formData.first_name} 
                onChange={(e) => handleFieldChange('first_name', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder={t('refine.editor.lastName')} 
                value={formData.last_name} 
                onChange={(e) => handleFieldChange('last_name', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                fullWidth 
                placeholder={t('refine.editor.currentRole', 'Current Role')} 
                value={formData.current_role} 
                onChange={(e) => handleFieldChange('current_role', e.target.value)} 
                sx={inputStyles} 
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField 
                size="small" 
                placeholder={t('refine.editor.city', 'City')} 
                value={formData.city} 
                onChange={(e) => handleFieldChange('city', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder={t('refine.editor.country', 'Country')} 
                value={formData.country} 
                onChange={(e) => handleFieldChange('country', e.target.value)} 
                sx={inputStyles} 
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t('refine.editor.contacts')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField 
                size="small" 
                placeholder={t('refine.editor.email')} 
                value={formData.email} 
                onChange={(e) => handleFieldChange('email', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder={t('refine.editor.phone')} 
                value={formData.phone} 
                onChange={(e) => handleFieldChange('phone', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="Telegram" 
                value={formData.telegram} 
                onChange={(e) => handleFieldChange('telegram', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="WhatsApp" 
                value={formData.whatsapp} 
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="LinkedIn" 
                value={formData.linkedin} 
                onChange={(e) => handleFieldChange('linkedin', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="GitHub" 
                value={formData.github} 
                onChange={(e) => handleFieldChange('github', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="Website" 
                value={formData.website} 
                onChange={(e) => handleFieldChange('website', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="Twitter" 
                value={formData.twitter} 
                onChange={(e) => handleFieldChange('twitter', e.target.value)} 
                sx={inputStyles} 
              />
              <TextField 
                size="small" 
                placeholder="Instagram" 
                value={formData.instagram} 
                onChange={(e) => handleFieldChange('instagram', e.target.value)} 
                sx={inputStyles} 
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Professional Summary */}
        <Accordion disableGutters defaultExpanded sx={accordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }} />}>
            <Typography sx={sectionNameStyles}>{t('refine.editor.professionalSummary')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField 
              fullWidth 
              size="small" 
              multiline 
              rows={4} 
              sx={inputStyles} 
              value={formData.professional_summary} 
              onChange={(e) => handleFieldChange('professional_summary', e.target.value)} 
            />
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
              onSkillsUpdate={(updatedSkills) => {
                const updated = { ...localResume, skills: updatedSkills };
                setLocalResume(updated);
                  onResumeUpdate(updated);
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
              experience={localResume.work_experience || []}
              onExperienceUpdate={(updatedExperience) => {
                const updated = { ...localResume, work_experience: updatedExperience };
                setLocalResume(updated);
                  onResumeUpdate(updated);
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
              onEducationUpdate={(updatedEducation) => {
                const updated = { ...localResume, education: updatedEducation };
                setLocalResume(updated);
                  onResumeUpdate(updated);
              }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

    </Box>
  );
};

export default EditorAccordion;
