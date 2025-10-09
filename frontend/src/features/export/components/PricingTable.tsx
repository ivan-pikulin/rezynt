import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import PricingCard from './PricingCard';

const PricingTable: React.FC = () => {
  const { t } = useTranslation();
  const features = [
    t('export.pricing.features.pdfExport'),
    t('export.pricing.features.wordExport'), 
    t('export.pricing.features.pngExport'),
    t('export.pricing.features.multipleTemplates'),
    t('export.pricing.features.aiSuggestions'),
    t('export.pricing.features.prioritySupport'),
    t('export.pricing.features.noWatermarks'),
    t('export.pricing.features.unlimitedDownloads')
  ];

  const freeFeatures = [true, false, false, false, false, false, false, false];
  const proFeatures = [true, true, true, true, true, true, true, true];

  return (
    <Box sx={{ 
      maxWidth: 900,
      width: '100%'
    }}>
              {/* Title */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 700,
          color: '#2c3e50',
          textAlign: 'center'
        }}
      >
        {t('export.pricing.title')}
      </Typography>
      
              {/* Pricing table */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3,
        justifyContent: 'center'
      }}>
        <PricingCard
          title={t('export.pricing.plans.free.title')}
          price={0}
          currency="USD"
          features={features}
          featureValues={freeFeatures}
          buttonText={t('export.pricing.plans.free.buttonText')}
          buttonVariant="outlined"
          isPopular={false}
        />
        
        <PricingCard
          title={t('export.pricing.plans.pro.title')}
          price={9.99}
          currency="USD"
          features={features}
          featureValues={proFeatures}
          buttonText={t('export.pricing.plans.pro.buttonText')}
          buttonVariant="contained"
          isPopular={true}
        />
      </Box>
    </Box>
  );
};

export default PricingTable; 