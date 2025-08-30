import { Box, Typography } from '@mui/material';
import React from 'react';
import { BaseTemplate } from './BaseTemplate';

export class NumeTemplate extends BaseTemplate {
  renderTemplate(): React.ReactElement {
    const { data } = this.props;
    
    return (
      <Box sx={{ 
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        color: '#333',
        '@media print': {
          height: '100vh',
          overflow: 'hidden',
          fontSize: '12px',
          lineHeight: 1.4,
          padding: '15px'
        }
      }}>
        {/* Header */}
        <Box sx={{ marginBottom: '24px' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}
          >
            {this.getFullName()}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '14px',
              color: '#7f8c8d',
              marginBottom: '16px'
            }}
          >
            {this.getContactInfo()}
          </Typography>
        </Box>

        {/* Professional Summary */}
        <Box sx={{ marginBottom: '24px' }}>
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

        {/* Skills */}
        <Box sx={{ marginBottom: '24px' }}>
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
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.skills?.map((skill, index) => (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#555',
                  '&:not(:last-child)': {
                    '&::after': {
                      content: '"•"',
                      margin: '0 8px',
                      color: '#bdc3c7'
                    }
                  }
                }}
              >
                {skill}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Experience */}
        <Box sx={{ marginBottom: '24px' }}>
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
                  {exp.job_title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontStyle: 'italic',
                    '@media print': {
                      fontStyle: 'italic !important'
                    }
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
                    fontStyle: 'italic',
                    '@media print': {
                      fontStyle: 'italic !important'
                    }
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