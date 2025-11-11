import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class FrameTemplate extends BaseTemplate {
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
        {/* Header - Centered Name and Contact */}
        <Box sx={{ 
          textAlign: 'center',
          marginBottom: '40px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            overflow: 'hidden',
            marginBottom: '20px'
          }
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#8B4513',
              marginBottom: '12px',
              lineHeight: 1.1
            }}
          >
            {this.getFullName()}
          </Typography>
          <Box sx={{ marginTop: '8px' }}>
            {data.personal_info?.contacts?.email && (
              <Typography variant="body1" sx={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                {data.personal_info.contacts.email}
              </Typography>
            )}
            {data.personal_info?.contacts?.phone && (
              <Typography variant="body1" sx={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                {data.personal_info.contacts.phone}
              </Typography>
            )}
            {data.personal_info?.contacts?.linkedin && (
              <Typography variant="body1" sx={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                {data.personal_info.contacts.linkedin}
              </Typography>
            )}
            {data.personal_info?.contacts?.website && (
              <Typography variant="body1" sx={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                {data.personal_info.contacts.website}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Professional Summary */}
        <Box sx={{ 
          marginBottom: '30px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          '@media print': {
            overflow: 'hidden',
            marginBottom: '15px'
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '10px'
              }}
            >
              {this.t('templates.sections.professionalSummary')}
            </Typography>
            <Box sx={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '10px'
              }}
            >
              {this.t('templates.sections.skills')}
            </Typography>
            <Box sx={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '10px'
              }}
            >
              {this.t('templates.sections.experience')}
            </Typography>
            <Box sx={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
          {data.work_experience?.map((exp, index) => (
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
                {exp.company} {(exp.city || exp.country) ? `| ${[exp.city, exp.country].filter(Boolean).join(', ')}` : ''}
              </Typography>
              <Box component="ul" sx={{ 
                margin: 0, 
                paddingLeft: '20px',
                listStyleType: 'disc'
              }}>
                {exp.achievements?.map((achievement, achIndex) => (
                  <Typography 
                    key={achIndex}
                    component="li"
                    variant="body2" 
                    sx={{ 
                      fontSize: '13px',
                      color: '#555',
                      marginBottom: '2px',
                      lineHeight: 1.5
                    }}
                  >
                    {achievement}
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '10px'
              }}
            >
              {this.t('templates.sections.education')}
            </Typography>
            <Box sx={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
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
                  {this.formatDate(edu.end_date || '')}
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
                {edu.institution} {(edu.city || edu.country) ? `, ${[edu.city, edu.country].filter(Boolean).join(', ')}` : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
}

