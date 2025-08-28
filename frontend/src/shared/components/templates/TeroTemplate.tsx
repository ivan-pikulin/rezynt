import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class TeroTemplate extends BaseTemplate {
  renderTemplate(): React.ReactElement {
    const { data } = this.props;
    
    return (
      <Box sx={{ 
        display: 'flex',
        height: '100%',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
        '@media print': {
          height: '100vh',
          overflow: 'hidden',
          fontSize: '12px',
          lineHeight: 1.4
        }
      }}>
        {/* Left Column - Main Content */}
        <Box sx={{ 
          width: '70%',
          backgroundColor: 'white',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            padding: '0.5em',
            overflow: 'hidden'
          }
        }}>
          {/* Header with Logo and Name */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            marginBottom: '30px'
          }}>
            {/* Logo */}
            <Box sx={{
              width: '60px',
              height: '60px',
              backgroundColor: '#8B4513',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              flexShrink: 0,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                border: '2px solid white',
                borderRadius: '50%',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }
            }}>
              <Typography 
                sx={{ 
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                {data.first_name?.charAt(0) || ''}{data.last_name?.charAt(0) || ''}
              </Typography>
            </Box>
            
            {/* Name */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginTop: '8px'
              }}
            >
              {this.getFullName().toUpperCase()}
            </Typography>
          </Box>

          {/* Professional Summary */}
          <Box sx={{ marginBottom: '30px' }}>
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
                Professional Summary
              </Typography>
              <Box sx={{ 
                flex: 1, 
                height: '2px', 
                backgroundColor: '#8B4513',
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
              {data.professional_summary}
            </Typography>
          </Box>

          {/* Experience */}
          <Box sx={{ marginBottom: '30px' }}>
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
                Experience
              </Typography>
              <Box sx={{ 
                flex: 1, 
                height: '2px', 
                backgroundColor: '#8B4513',
                marginLeft: '10px'
              }} />
            </Box>
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
                Education
              </Typography>
              <Box sx={{ 
                flex: 1, 
                height: '2px', 
                backgroundColor: '#8B4513',
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

        {/* Right Column - Dark Sidebar */}
        <Box sx={{ 
          width: '30%',
          backgroundColor: '#8B4513', // Dark reddish-brown background
          color: 'white',
          padding: '40px 25px',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            width: '200px',
            padding: '0.5em',
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
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
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
      </Box>
    );
  }
} 