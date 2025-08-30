import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class LumaTemplate extends BaseTemplate {
  renderTemplate(): React.ReactElement {
    const { data } = this.props;
    
    return (
      <Box sx={{ 
        display: 'flex',
        height: '100%',
        fontFamily: 'Georgia, serif',
        lineHeight: 1.6,
        color: '#333',
        '@media print': {
          height: '100vh',
          overflow: 'hidden',
          fontSize: '12px',
          lineHeight: 1.4
        }
      }}>
        {/* Left Column - Dark Sidebar */}
        <Box sx={{ 
          width: '35%',
          backgroundColor: '#8B4513', // Maroon/brown background
          color: 'white',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            width: '200px',
            padding: '15px',
            overflow: 'hidden'
          }
        }}>
          {/* Contact Information */}
          <Box sx={{ marginBottom: '40px' }}>
            {data.contacts?.map((contact, index) => (
              <Typography 
                key={index}
                variant="body1" 
                sx={{ 
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}
              >
                {contact}
              </Typography>
            ))}
          </Box>

          {/* Skills Section */}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Skills
            </Typography>
            <Box component="ul" sx={{ 
              margin: 0, 
              paddingLeft: '20px',
              listStyleType: 'disc'
            }}>
              {data.skills?.map((skill, index) => (
                <Typography 
                  key={index}
                  component="li"
                  variant="body2" 
                  sx={{ 
                    fontSize: '14px',
                    marginBottom: '8px',
                    lineHeight: 1.4
                  }}
                >
                  {skill}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Column - Main Content */}
        <Box sx={{ 
          width: '65%',
          backgroundColor: 'white',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            padding: '15px',
            overflow: 'hidden'
          }
        }}>
          {/* Name */}
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '20px'
            }}
          >
            {this.getFullName()}
          </Typography>

          {/* Professional Summary */}
          <Box sx={{ marginBottom: '30px' }}>
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
              Professional Summary
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: '14px',
                lineHeight: 1.7,
                textAlign: 'justify'
              }}
            >
              {data.professional_summary || 'Professional summary not provided'}
            </Typography>
          </Box>

          {/* Experience */}
          <Box sx={{ marginBottom: '30px' }}>
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
              Experience
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
          <Box>
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
              Education
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
      </Box>
    );
  }
} 