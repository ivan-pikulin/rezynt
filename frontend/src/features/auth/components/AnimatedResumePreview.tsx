import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { COLORS } from '../../../shared/theme/theme';
import ResumeRenderer from '../../../shared/components/ResumeRenderer';
import { ResumeData } from '../../../shared/types/resume';

const demoData: ResumeData[] = [
  {
    first_name: 'Sam',
    last_name: 'Altman',
    title: 'CEO & Co-founder',
    professional_summary: 'Visionary leader in artificial intelligence, driving innovation at the intersection of technology and human potential.',
    contacts: ['sam.altman@openai.com', '+1 (555) 123-4567', 'San Francisco, CA'],
    skills: ['AI Strategy', 'Product Vision', 'Team Leadership', 'Startup Scaling', 'Machine Learning'],
    experience: [
      {
        job_title: 'CEO',
        company: 'OpenAI',
        start_date: '2019-01',
        end_date: undefined,
        location: 'San Francisco, CA',
        responsibilities: [
          'Leading the development of advanced AI systems',
          'Managing strategic partnerships and business development',
          'Overseeing research and product teams'
        ]
      },
      {
        job_title: 'President',
        company: 'Y Combinator',
        start_date: '2014-01',
        end_date: '2019-01',
        location: 'Mountain View, CA',
        responsibilities: [
          'Managing startup accelerator program',
          'Providing mentorship to founders',
          'Building investor relationships'
        ]
      }
    ],
    education: [
      {
        degree: 'Computer Science',
        institution: 'Stanford University',
        graduation_date: '2008-06',
        location: 'Stanford, CA'
      }
    ]
  },
  {
    first_name: 'Elon',
    last_name: 'Musk',
    title: 'CEO & Chief Engineer',
    professional_summary: 'Entrepreneur and engineer revolutionizing transportation, energy, and space exploration.',
    contacts: ['elon.musk@tesla.com', '+1 (555) 987-6543', 'Austin, TX'],
    skills: ['Electric Vehicles', 'Rocket Engineering', 'Neural Interfaces', 'Sustainable Energy', 'Mars Colonization'],
    experience: [
      {
        job_title: 'CEO',
        company: 'Tesla',
        start_date: '2008-01',
        end_date: undefined,
        location: 'Austin, TX',
        responsibilities: [
          'Leading electric vehicle and clean energy company',
          'Overseeing product development and manufacturing',
          'Managing global operations and expansion'
        ]
      },
      {
        job_title: 'CEO & Chief Engineer',
        company: 'SpaceX',
        start_date: '2002-01',
        end_date: undefined,
        location: 'Hawthorne, CA',
        responsibilities: [
          'Developing reusable rocket technology',
          'Planning Mars colonization missions',
          'Managing satellite launch services'
        ]
      }
    ],
    education: [
      {
        degree: 'Physics & Economics',
        institution: 'University of Pennsylvania',
        graduation_date: '1997-06',
        location: 'Philadelphia, PA'
      }
    ]
  },
  {
    first_name: 'Donald',
    last_name: 'Trump',
    title: 'Businessman & Former President',
    professional_summary: 'Real estate developer and entrepreneur with extensive experience in business and politics.',
    contacts: ['contact@trump.com', '+1 (555) 456-7890', 'New York, NY'],
    skills: ['Real Estate Development', 'Business Negotiation', 'Political Leadership', 'Brand Management'],
    experience: [
      {
        job_title: '45th President',
        company: 'United States of America',
        start_date: '2017-01',
        end_date: '2021-01',
        location: 'Washington, DC',
        responsibilities: [
          'Leading the executive branch of government',
          'Managing domestic and foreign policy',
          'Overseeing federal agencies and departments'
        ]
      },
      {
        job_title: 'CEO',
        company: 'Trump Organization',
        start_date: '1971-01',
        end_date: undefined,
        location: 'New York, NY',
        responsibilities: [
          'Managing real estate development projects',
          'Overseeing hospitality and entertainment businesses',
          'Building and maintaining brand value'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        institution: 'Wharton School, University of Pennsylvania',
        graduation_date: '1968-06',
        location: 'Philadelphia, PA'
      }
    ]
  }
];

const templateIds = ['nume', 'vero', 'luma'];

const AnimatedResumePreview: React.FC = () => {
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayData, setDisplayData] = useState<ResumeData>(demoData[0]);

  // Data and template rotation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCurrentDataIndex(prev => (prev + 1) % demoData.length);
      setCurrentTemplateIndex(prev => (prev + 1) % templateIds.length);
    }, 8000);
    return () => clearInterval(rotationInterval);
  }, []);

  // Text animation effect
  useEffect(() => {
    const animateText = async () => {
      setIsAnimating(true);
      const currentData = demoData[currentDataIndex];
      
      // Animate each field with typing effect
      const fields: (keyof ResumeData)[] = [
        'first_name', 'last_name', 'title', 'professional_summary', 
        'contacts', 'skills', 'experience', 'education'
      ];

      for (const field of fields) {
        if (field === 'contacts' || field === 'skills' || field === 'experience' || field === 'education') {
          // For array fields, animate each item
          const currentArray = currentData[field] as any[];
          const newArray: any[] = [];
          
          for (let i = 0; i < currentArray.length; i++) {
            const item = currentArray[i];
            if (field === 'experience' || field === 'education') {
              // Animate complex objects
              const animatedItem = { ...item };
              if (field === 'experience') {
                animatedItem.responsibilities = [];
                for (let j = 0; j < (item.responsibilities || []).length; j++) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  animatedItem.responsibilities.push(item.responsibilities[j]);
                  setDisplayData(prev => ({
                    ...prev,
                    [field]: [...newArray, animatedItem]
                  }));
                }
              }
              newArray.push(animatedItem);
            } else {
              // Animate simple array items
              await new Promise(resolve => setTimeout(resolve, 150));
              newArray.push(item);
              setDisplayData(prev => ({
                ...prev,
                [field]: newArray
              }));
            }
          }
        } else {
          // For string fields, animate character by character
          const text = currentData[field] as string;
          let currentText = '';
          
          for (let i = 0; i <= text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            currentText = text.slice(0, i);
            setDisplayData(prev => ({
              ...prev,
              [field]: currentText
            }));
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setIsAnimating(false);
    };

    animateText();
  }, [currentDataIndex]);

  const currentTemplate = templateIds[currentTemplateIndex];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative'
    }}>
      {/* Resume content */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 1, 
          height: '100%',
          bgcolor: 'white',
          borderRadius: 2,
          border: `1px solid ${COLORS.grey[200]}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Resume renderer with fixed small scale */}
        <Box sx={{ 
          height: '100%',
          position: 'relative'
        }}>
          <ResumeRenderer
            data={displayData}
            templateId={currentTemplate}
            isPreview={true}
            fitToContainer={false}
            scale={0.35}
          />
          
          {/* Typing cursor overlay */}
          {isAnimating && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                px: 3,
                py: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 5,
                border: `1px solid ${COLORS.grey[200]}`
              }}
            >
              <Box 
                sx={{ 
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: COLORS.primary.main,
                  animation: 'pulse 1s infinite'
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: COLORS.grey[700],
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                AI Writing...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Cursor animation overlay */}
        {isAnimating && (
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: COLORS.grey[500],
              fontSize: '0.75rem',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              px: 2,
              py: 1,
              borderRadius: 1,
              zIndex: 5,
              border: `1px solid ${COLORS.grey[200]}`
            }}
          >
            <Box 
              sx={{ 
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: COLORS.primary.main,
                animation: 'pulse 1s infinite'
              }} 
            />
            Typing...
          </Box>
        )}
      </Paper>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}
      </style>
    </Box>
  );
};

export default AnimatedResumePreview;
