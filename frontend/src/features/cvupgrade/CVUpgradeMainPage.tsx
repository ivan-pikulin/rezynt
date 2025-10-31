import React, { useState } from 'react';
import { Box, Typography, TextField, TextareaAutosize, Accordion, AccordionSummary, AccordionDetails, Button, CircularProgress, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const accordionSx = {
  '&:before': { display: 'none' },
  '& .MuiAccordionSummary-root': { 
    minHeight: '48px',
    padding: '12px 16px',
    '&.Mui-expanded': { minHeight: '48px', padding: '12px 16px' }
  },
  '& .MuiAccordionSummary-content': { margin: 0 },
  '& .MuiAccordionDetails-root': { padding: '16px' }
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '8px 0',
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    width: '32px',
    height: '32px',
    backgroundColor: '#2563eb',
    borderRadius: '4px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    fill: 'white',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 600,
    color: 'black',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  premiumButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
  },
  chevronDown: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '700px',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#F5F7FA',
    overflowY: 'auto' as const,
    padding: '24px',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#F5F7FA',
    borderLeft: '1px solid #e5e7eb',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    marginBottom: '16px',
  },
  sectionHeader: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  sectionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
    textTransform: 'capitalize' as const,
  },
  gridInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    padding: '16px',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: 'white',
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
  },
  saveNotification: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    marginLeft: '-350px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    zIndex: 1000,
  },
  checkIcon: {
    width: '14px',
    height: '14px',
    color: '#10b981',
  },
  saveText: {
    fontSize: '11px',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'none' as const,
  },
  rightContent: {
    padding: '16px',
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '16px',
  },
  circularScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
  },
  scoreCircle: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  scoreNumber: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#f97316',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1,
  },
  scoreStatus: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1f2937',
  },
  statusSubtext: {
    fontSize: '14px',
    color: '#6b7280',
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    marginBottom: '16px',
  },
  breakdownHeader: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  breakdownTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breakdownName: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#1f2937',
  },
  breakdownCount: {
    fontSize: '14px',
    color: '#6b7280',
  },
  breakdownProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  progressBar: {
    width: '48px',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s',
  },
  progressScore: {
    fontSize: '14px',
    fontWeight: 500,
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  actionButtons: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  repeatButton: {
    backgroundColor: 'white',
    color: '#2563eb',
    border: '1px solid #dbeafe',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectButton: {
    backgroundColor: '#0041B3',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const CVUpgradeMainPage: React.FC = () => {
  const [showSaveNotification, setShowSaveNotification] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    personal_info: true,
    summary: true,
    work_experience: false,
    education: false,
    skills: false,
  });
  
  // Expanded positions in Work Experience section
  const [expandedPositions, setExpandedPositions] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
    2: false,
  });
  
  // Expanded education items
  const [expandedEducationItems, setExpandedEducationItems] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
  });
  

  const handleSectionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections({ ...expandedSections, [section]: isExpanded });
  };
  
  const handlePositionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPositions({ ...expandedPositions, [index]: isExpanded });
  };
  
  const handleEducationItemChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedEducationItems({ ...expandedEducationItems, [index]: isExpanded });
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={styles.pageContainer}>
      {/* Header */}
      <Box sx={styles.header}>
        <Box sx={styles.headerContent}>
          <Box sx={styles.logoContainer}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 6 L24 14 L16 22 L8 14 Z" fill="#2563eb"/>
              <path d="M16 10 L16 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 14 L20 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <Typography sx={styles.logoText}>CV Upgrade</Typography>
          </Box>
          <Box sx={styles.headerActions}>
            <Button sx={styles.premiumButton} startIcon={<span>👑</span>}>
              Get Premium
            </Button>
            <Box sx={styles.avatarContainer} onClick={handleMenuOpen}>
              <Box sx={styles.avatar}>IP</Box>
              <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                }
              }}
            >
              <MenuItem onClick={handleMenuClose} sx={{ px: 2, py: 1.5, '&:hover': { backgroundColor: '#f9fafb' } }}>
                <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: '#6b7280' }} />
                <Typography sx={{ fontSize: '14px', color: '#1f2937' }}>Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ px: 2, py: 1.5, '&:hover': { backgroundColor: '#f9fafb' } }}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: '#6b7280' }} />
                <Typography sx={{ fontSize: '14px', color: '#1f2937' }}>Sign out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={styles.mainContent}>
        {/* Left Panel */}
        <Box sx={styles.leftPanel}>
          <Accordion 
            expanded={expandedSections.personal_info} 
            onChange={handleSectionChange('personal_info')}
            sx={{ ...styles.sectionCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={styles.sectionTitle}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22V8"/>
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
                  <circle cx="12" cy="5" r="3"/>
                </svg>
                <Typography sx={styles.sectionName}>Personal Info</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={styles.gridInputs}>
                <TextField placeholder="First Name" value="Ivan" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Last Name" value="PIKULIN" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Current Role (e.g., Frontend Developer)" value="Lead ML Developer" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Email" value="i.pikulin@abstergo.su" sx={styles.input} variant="outlined"/>
                <TextField placeholder="City" value="Moscow" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Country" value="Russia" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Phone" value="+7 985 279 91 76" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Photo URL" sx={styles.input} variant="outlined"/>
                <TextField placeholder="LinkedIn" sx={styles.input} variant="outlined"/>
                <TextField placeholder="GitHub" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Website" sx={styles.input} variant="outlined"/>
                <TextField placeholder="Twitter (X)" sx={styles.input} variant="outlined"/>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion 
            expanded={expandedSections.summary} 
            onChange={handleSectionChange('summary')}
            sx={{ ...styles.sectionCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={styles.sectionTitle}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="1.5"/>
                  <circle cx="15" cy="9" r="1.5"/>
                  <circle cx="9" cy="15" r="1.5"/>
                  <circle cx="15" cy="15" r="1.5"/>
                </svg>
                <Typography sx={styles.sectionName}>Summary</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TextareaAutosize
                value="Machine learning engineer with hands-on experience in building production-grade ML and LLM-based systems. Specialized in neural network design for chemistry, LLM applications, and multimodal model development. Proven ability to turn academic research into real-world solutions, from retrosynthesis modeling for Merck to a custom natural language SQL assistant. Strong background in system design and leading small, high-impact teams."
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#1f2937',
                  minHeight: '150px',
                  fontFamily: 'inherit',
                }}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion 
            expanded={expandedSections.work_experience} 
            onChange={handleSectionChange('work_experience')}
            sx={{ ...styles.sectionCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={styles.sectionTitle}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="1.5"/>
                  <circle cx="15" cy="9" r="1.5"/>
                  <circle cx="9" cy="15" r="1.5"/>
                  <circle cx="15" cy="15" r="1.5"/>
                </svg>
                <Typography sx={styles.sectionName}>Work Experience</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Position 1 */}
                <Accordion 
                  expanded={expandedPositions[0]}
                  onChange={handlePositionChange(0)}
                  sx={{ boxShadow: 'none', ...accordionSx }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                    <Box sx={styles.sectionTitle}>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="1.5"/>
                        <circle cx="15" cy="9" r="1.5"/>
                        <circle cx="9" cy="15" r="1.5"/>
                        <circle cx="15" cy="15" r="1.5"/>
                      </svg>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        Lead ML developer at Abstergo
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                      Position details will be here
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Position 2 */}
                <Accordion 
                  expanded={expandedPositions[1]}
                  onChange={handlePositionChange(1)}
                  sx={{ boxShadow: 'none', ...accordionSx }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                    <Box sx={styles.sectionTitle}>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="1.5"/>
                        <circle cx="15" cy="9" r="1.5"/>
                        <circle cx="9" cy="15" r="1.5"/>
                        <circle cx="15" cy="15" r="1.5"/>
                      </svg>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        ML Engineer at Science Data Experts
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                      Position details will be here
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Position 3 */}
                <Accordion 
                  expanded={expandedPositions[2]}
                  onChange={handlePositionChange(2)}
                  sx={{ boxShadow: 'none', ...accordionSx }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                    <Box sx={styles.sectionTitle}>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="1.5"/>
                        <circle cx="15" cy="9" r="1.5"/>
                        <circle cx="9" cy="15" r="1.5"/>
                        <circle cx="15" cy="15" r="1.5"/>
                      </svg>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        ML Chemistry Researcher at Moscow State University (MSU)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                      Position details will be here
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Add Position button */}
                <Button
                  startIcon={<AddIcon/>}
                  sx={{
                    mt: '8px',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      borderColor: '#d1d5db',
                    },
                  }}
                >
                  Add Position
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion 
            expanded={expandedSections.education} 
            onChange={handleSectionChange('education')}
            sx={{ ...styles.sectionCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={styles.sectionTitle}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="1.5"/>
                  <circle cx="15" cy="9" r="1.5"/>
                  <circle cx="9" cy="15" r="1.5"/>
                  <circle cx="15" cy="15" r="1.5"/>
                </svg>
                <Typography sx={styles.sectionName}>Education</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Education Item 1 */}
                <Accordion 
                  expanded={expandedEducationItems[0]}
                  onChange={handleEducationItemChange(0)}
                  sx={{ boxShadow: 'none', ...accordionSx }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                    <Box sx={styles.sectionTitle}>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="1.5"/>
                        <circle cx="15" cy="9" r="1.5"/>
                        <circle cx="9" cy="15" r="1.5"/>
                        <circle cx="15" cy="15" r="1.5"/>
                      </svg>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        Master of Science (MSc) in Computer Science at Moscow State University
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                      Education item details will be here
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Education Item 2 */}
                <Accordion 
                  expanded={expandedEducationItems[1]}
                  onChange={handleEducationItemChange(1)}
                  sx={{ boxShadow: 'none', ...accordionSx }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                    <Box sx={styles.sectionTitle}>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="1.5"/>
                        <circle cx="15" cy="9" r="1.5"/>
                        <circle cx="9" cy="15" r="1.5"/>
                        <circle cx="15" cy="15" r="1.5"/>
                      </svg>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        Bachelor of Science (BSc) in Computer Science at Moscow State University
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                      Education item details will be here
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Add Education button */}
                <Button
                  startIcon={<AddIcon/>}
                  sx={{
                    mt: '8px',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      borderColor: '#d1d5db',
                    },
                  }}
                >
                  Add Education
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion 
            expanded={expandedSections.skills} 
            onChange={handleSectionChange('skills')}
            sx={{ ...styles.sectionCard, boxShadow: 'none', ...accordionSx }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
              <Box sx={styles.sectionTitle}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="1.5"/>
                  <circle cx="15" cy="9" r="1.5"/>
                  <circle cx="9" cy="15" r="1.5"/>
                  <circle cx="15" cy="15" r="1.5"/>
                </svg>
                <Typography sx={styles.sectionName}>Skills</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Skills list */}
                <TextField 
                  placeholder="Python" 
                  value="Python" 
                  sx={styles.input} 
                  variant="outlined"
                />
                <TextField 
                  placeholder="JavaScript" 
                  sx={styles.input} 
                  variant="outlined"
                />
                <TextField 
                  placeholder="Machine Learning" 
                  sx={styles.input} 
                  variant="outlined"
                />

                {/* Add Skill button */}
                <Button
                  startIcon={<AddIcon/>}
                  sx={{
                    mt: '8px',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      borderColor: '#d1d5db',
                    },
                  }}
                >
                  Add Skill
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Right Panel */}
        <Box sx={styles.rightPanel}>
          <Box sx={styles.rightContent}>
            {/* Score Card */}
            <Box sx={styles.scoreCard}>
              <Box sx={styles.circularScore}>
                <Box sx={styles.scoreCircle}>
                  {/* Background gray ring */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={6}
                    sx={{
                      position: 'absolute',
                      color: '#e5e7eb',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  {/* Orange progress ring */}
                  <CircularProgress
                    variant="determinate"
                    value={54}
                    size={120}
                    thickness={6}
                    sx={{
                      position: 'absolute',
                      color: '#f97316',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    <Typography sx={styles.scoreNumber}>54</Typography>
                    <Typography sx={styles.scoreLabel}>Score</Typography>
                  </Box>
                </Box>
                <Box sx={styles.scoreStatus}>
                  <Typography sx={styles.statusText}>Weak</Typography>
                  <Typography sx={styles.statusSubtext}>Let's work on it!</Typography>
                </Box>
              </Box>
            </Box>

            {/* Breakdown Cards */}
            <Accordion expanded={false} sx={{ 
              ...styles.breakdownCard, 
              boxShadow: 'none',
              ...accordionSx
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <Box sx={styles.breakdownTitle}>
                    <Typography sx={styles.breakdownName}>Content & Messaging</Typography>
                    <Typography sx={styles.breakdownCount}>(16/27)</Typography>
                  </Box>
                  <Box sx={styles.breakdownProgress}>
                    <Box sx={styles.progressBar}>
                      <Box sx={{ ...styles.progressFill, width: '41%', backgroundColor: '#ef4444' }}/>
                    </Box>
                    <Typography sx={{ ...styles.progressScore, color: '#ef4444' }}>41</Typography>
                    <Box sx={{ ...styles.statusBadge, backgroundColor: '#fef2f2', color: '#ef4444' }}>
                      Needs Work
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
            </Accordion>

            <Accordion expanded={false} sx={{ 
              ...styles.breakdownCard, 
              boxShadow: 'none',
              ...accordionSx
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <Box sx={styles.breakdownTitle}>
                    <Typography sx={styles.breakdownName}>ATS & Keywords</Typography>
                    <Typography sx={styles.breakdownCount}>(7/11)</Typography>
                  </Box>
                  <Box sx={styles.breakdownProgress}>
                    <Box sx={styles.progressBar}>
                      <Box sx={{ ...styles.progressFill, width: '52%', backgroundColor: '#f97316' }}/>
                    </Box>
                    <Typography sx={{ ...styles.progressScore, color: '#f97316' }}>52</Typography>
                    <Box sx={{ ...styles.statusBadge, backgroundColor: '#fff7ed', color: '#f97316' }}>
                      Good
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
            </Accordion>

            <Accordion expanded={false} sx={{ 
              ...styles.breakdownCard, 
              boxShadow: 'none',
              ...accordionSx
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280' }}/>}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <Box sx={styles.breakdownTitle}>
                    <Typography sx={styles.breakdownName}>Tone & Grammar</Typography>
                    <Typography sx={styles.breakdownCount}>(0/3)</Typography>
                  </Box>
                  <Box sx={styles.breakdownProgress}>
                    <Box sx={styles.progressBar}>
                      <Box sx={{ ...styles.progressFill, width: '77%', backgroundColor: '#22c55e' }}/>
                    </Box>
                    <Typography sx={{ ...styles.progressScore, color: '#22c55e' }}>77</Typography>
                    <Box sx={{ ...styles.statusBadge, backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                      Strong
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
            </Accordion>

          </Box>
          
          {/* Action Buttons */}
          <Box sx={styles.actionButtons}>
            <Button sx={styles.repeatButton} startIcon={<RefreshIcon/>}>
              Repeat Analysis
            </Button>
            <Button sx={styles.selectButton} endIcon={<ArrowForwardIcon/>}>
              Select Template
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Save Notification */}
      {showSaveNotification && (
        <Box sx={styles.saveNotification}>
          <CheckCircleIcon sx={styles.checkIcon}/>
          <Typography sx={styles.saveText}>All changes saved at 11:10:39</Typography>
          <button style={styles.saveButton} onClick={() => setShowSaveNotification(false)}>
            Save now
          </button>
        </Box>
      )}
    </Box>
  );
};

export default CVUpgradeMainPage;

