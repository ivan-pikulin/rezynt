import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class VeroTemplate extends BaseTemplate {
  renderTemplate(): React.ReactElement {
    const { data } = this.props;
    
    return (
      <Box sx={{ 
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
        backgroundColor: 'white'
      }}>
        {/* Header - Centered Name and Contact */}
        <Box sx={{ 
          textAlign: 'center',
          marginBottom: '40px'
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
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '14px',
              marginBottom: '4px',
              color: '#333'
            }}
          >
            {data.personalInfo.phone}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '14px',
              color: '#333'
            }}
          >
            {data.personalInfo.email}
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
            {data.professionalSummary}
          </Typography>
        </Box>

        {/* Skills */}
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
              Skills
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
            gap: '8px'
          }}>
            {data.skills.map((skill, index) => (
              <Typography 
                key={skill.id}
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
                {skill.name}
              </Typography>
            ))}
          </Box>
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
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
          {data.experience.map((exp, index) => (
            <Box key={exp.id} sx={{ marginBottom: '20px' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '13px',
                  color: '#7f8c8d',
                  fontStyle: 'italic',
                  marginBottom: '4px'
                }}
              >
                {this.getWorkPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: '4px'
                }}
              >
                {exp.jobTitle}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#34495e',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}
              >
                {exp.company} | {exp.location}
              </Typography>
              <Box component="ul" sx={{ 
                margin: 0, 
                paddingLeft: '20px',
                listStyleType: 'disc'
              }}>
                {exp.responsibilities.map((responsibility, respIndex) => (
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
              height: '1px', 
              backgroundColor: '#ddd',
              marginLeft: '10px'
            }} />
          </Box>
          {data.education.map((edu, index) => (
            <Box key={edu.id} sx={{ marginBottom: '16px' }}>
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
                  {this.formatDate(edu.graduationDate)}
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
                {edu.institution}, {edu.location}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
} 