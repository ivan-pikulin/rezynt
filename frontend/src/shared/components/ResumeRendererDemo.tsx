import React, { useState } from 'react';
import { Box, Button, Typography, Switch, FormControlLabel } from '@mui/material';
import ResumeRenderer from './ResumeRenderer';
import { TemplateService } from '../services/templateService';

/**
 * Demo component for testing adaptive scaling of ResumeRenderer
 */
const ResumeRendererDemo: React.FC = () => {
  const [fitToContainer, setFitToContainer] = useState(true);
  const [debug, setDebug] = useState(false);
  const [containerSize, setContainerSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  const demoData = TemplateService.createDemoData();

  const getContainerStyle = (size: 'small' | 'medium' | 'large') => {
    const sizes = {
      small: { width: '300px', height: '400px' },
      medium: { width: '600px', height: '800px' },
      large: { width: '100%', height: '90vh' }
    };
    
    return {
      ...sizes[size],
      border: '2px dashed #ccc',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    };
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        ResumeRenderer Demo - Adaptive Scaling
      </Typography>
      
              {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={fitToContainer}
              onChange={(e) => setFitToContainer(e.target.checked)}
            />
          }
                      label="Adaptive Scaling"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={debug}
              onChange={(e) => setDebug(e.target.checked)}
            />
          }
          label="Debug"
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant={containerSize === 'small' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setContainerSize('small')}
          >
                         Small
          </Button>
          <Button 
            variant={containerSize === 'medium' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setContainerSize('medium')}
          >
                         Medium
          </Button>
          <Button 
            variant={containerSize === 'large' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setContainerSize('large')}
          >
                         Large
          </Button>
        </Box>
      </Box>
      
              {/* Information */}
      <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <Typography variant="body2">
                     <strong>Current settings:</strong><br/>
           • Adaptive scaling: {fitToContainer ? 'Enabled' : 'Disabled'}<br/>
           • Container size: {containerSize}<br/>
           • Debug: {debug ? 'Enabled' : 'Disabled'}
        </Typography>
      </Box>
      
              {/* Resume container */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Box sx={getContainerStyle(containerSize)}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center', color: '#666' }}>
                         Container: {containerSize}
          </Typography>
          
          <Box sx={{ flex: 1, position: 'relative' }}>
            <ResumeRenderer
              data={demoData}
              fitToContainer={fitToContainer}
              debug={debug}
              scale={fitToContainer ? undefined : 0.5}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResumeRendererDemo; 