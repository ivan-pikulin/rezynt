import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class AltoTemplate extends BaseTemplate {
  renderTemplate(): React.ReactElement {
    const { data } = this.props;
    
    return (
      <Box sx={{ 
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
        backgroundColor: 'white',
        maxWidth: '100%',
        boxSizing: 'border-box',
        '@media print': {
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          fontSize: '12px',
          lineHeight: 1.4,
          padding: '20px 30px',
          maxWidth: '100%',
          width: '100%',
          boxSizing: 'border-box'
        }
      }}>
        {/* Header with Logo, Name and Contact */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            maxWidth: '100%',
            overflow: 'hidden',
            marginBottom: '20px'
          }
        }}>
          {/* Left side - Logo and Name */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            flex: '1 1 auto',
            minWidth: 0,
            '@media print': {
              flex: '1 1 auto',
              minWidth: 0,
              overflow: 'hidden'
            }
          }}>
            {/* Square Logo */}
            <Box sx={{
              width: '60px',
              height: '60px',
              border: '2px solid #8B4513',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              flexShrink: 0,
              position: 'relative'
            }}>
              <Box sx={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#8B4513'
              }}>
                {data.first_name?.charAt(0) || ''}
              </Box>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '1px',
                height: '30px',
                backgroundColor: '#8B4513',
                transform: 'translate(-50%, -50%) rotate(45deg)'
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#8B4513'
              }}>
                {data.last_name?.charAt(0) || ''}
              </Box>
            </Box>
            
            {/* Name */}
            <Box sx={{
              flex: '1 1 auto',
              minWidth: 0,
              '@media print': {
                overflow: 'hidden'
              }
            }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#8B4513',
                  lineHeight: 1.1,
                  marginBottom: '4px'
                }}
              >
                {data.first_name?.toUpperCase() || ''}
              </Typography>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#8B4513',
                  lineHeight: 1.1
                }}
              >
                {data.last_name?.toUpperCase() || ''}
              </Typography>
            </Box>
          </Box>

          {/* Right side - Contact Info */}
          <Box sx={{ 
            textAlign: 'right',
            flex: '0 0 auto',
            maxWidth: '40%',
            '@media print': {
              maxWidth: '35%',
              overflow: 'hidden'
            }
          }}>
            {data.contacts?.map((contact, index) => (
              <Typography 
                key={index}
                variant="body1" 
                sx={{ 
                  fontSize: '14px',
                  marginBottom: '4px',
                  color: '#333'
                }}
              >
                {contact}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Professional Summary */}
        <Box sx={{ 
          marginBottom: '30px',
          '@media print': {
            marginBottom: '15px'
          }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {this.t('templates.sections.professionalSummary')}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '14px',
              lineHeight: 1.7,
              textAlign: 'justify'
            }}
          >
            {data.professional_summary || this.t('templates.sections.notProvided')}
          </Typography>
        </Box>

        {/* Skills */}
        <Box sx={{ 
          marginBottom: '30px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            overflow: 'hidden',
            marginBottom: '15px'
          }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {this.t('templates.sections.skills')}
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            maxWidth: '100%',
            boxSizing: 'border-box',
            '@media print': {
              overflow: 'hidden'
            }
          }}>
            {data.skills?.map((skill, index) => (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#555',
                  '&::before': {
                    content: '"•"',
                    marginRight: '8px',
                    color: '#8B4513'
                  }
                }}
              >
                {skill}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Experience */}
        <Box sx={{ 
          marginBottom: '30px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            overflow: 'hidden',
            marginBottom: '15px'
          }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {this.t('templates.sections.experience')}
          </Typography>
          {data.experience?.map((exp, index) => (
            <Box key={index} sx={{ marginBottom: '20px' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '4px'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}
                >
                  {exp.job_title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontStyle: 'italic'
                  }}
                >
                  {this.getWorkPeriod(exp.start_date || '', exp.end_date, this.isCurrentJob(exp.end_date))}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#34495e',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}
              >
                {exp.company} {exp.location ? `| ${exp.location}` : ''}
              </Typography>
              <Box component="ul" sx={{ 
                margin: 0, 
                paddingLeft: '20px',
                listStyleType: 'disc'
              }}>
                {exp.responsibilities?.map((responsibility, respIndex) => (
                  <Typography 
                    key={respIndex}
                    component="li"
                    variant="body2" 
                    sx={{ 
                      fontSize: '13px',
                      color: '#555',
                      marginBottom: '2px',
                      lineHeight: 1.5
                    }}
                  >
                    {responsibility}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Education */}
        <Box sx={{
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            overflow: 'hidden'
          }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {this.t('templates.sections.education')}
          </Typography>
          {data.education?.map((edu, index) => (
            <Box key={index} sx={{ marginBottom: '16px' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '4px'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}
                >
                  {edu.degree}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontStyle: 'italic'
                  }}
                >
                  {this.formatDate(edu.graduation_date || '')}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#34495e',
                  fontWeight: '500'
                }}
              >
                {edu.institution} {edu.location ? `, ${edu.location}` : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
} 