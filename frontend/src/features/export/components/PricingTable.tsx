import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PricingCard from './PricingCard';

const PricingTable: React.FC = () => {
  const features = [
    'PDF Export',
    'Word Export', 
    'PNG Export',
    'Multiple Templates',
    'AI Suggestions',
    'Priority Support',
    'No Watermarks',
    'Unlimited Downloads'
  ];

  const freeFeatures = [true, false, false, false, false, false, false, false];
  const proFeatures = [true, true, true, true, true, true, true, true];

  return (
    <Box sx={{ 
      maxWidth: 900,
      width: '100%'
    }}>
      {/* Заголовок */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 700,
          color: '#2c3e50',
          textAlign: 'center'
        }}
      >
        Choose Your Plan
      </Typography>
      
      {/* Таблица тарифов */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3,
        justifyContent: 'center'
      }}>
        <PricingCard
          title="Free"
          price={0}
          currency="USD"
          features={features}
          featureValues={freeFeatures}
          buttonText="Download with Watermarks"
          buttonVariant="outlined"
          isPopular={false}
        />
        
        <PricingCard
          title="Pro"
          price={9.99}
          currency="USD"
          features={features}
          featureValues={proFeatures}
          buttonText="Clean Download"
          buttonVariant="contained"
          isPopular={true}
        />
      </Box>
    </Box>
  );
};

export default PricingTable; 