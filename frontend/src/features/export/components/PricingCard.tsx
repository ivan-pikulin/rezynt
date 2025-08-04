import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import { exportApi } from '../exportApi';

interface PricingCardProps {
  title: string;
  price: number;
  currency: string;
  features: string[];
  featureValues: boolean[];
  buttonText: string;
  buttonVariant: 'contained' | 'outlined';
  isPopular: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  currency,
  features,
  featureValues,
  buttonText,
  buttonVariant,
  isPopular
}) => {
  const handleDownload = async () => {
    try {
      const plan = title.toLowerCase() as 'free' | 'pro';
      await exportApi.downloadResume(plan);
      console.log(`Successfully downloaded ${title} plan`);
    } catch (error) {
      console.error(`Failed to download ${title} plan:`, error);
    }
  };

  return (
    <Card 
      sx={{ 
        width: 400,
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: isPopular ? 'scale(1.05)' : 'scale(1)',
        border: isPopular ? '2px solid #1976d2' : '2px solid transparent',
        '&:hover': {
          transform: isPopular ? 'scale(1.07)' : 'scale(1.02)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}
    >
      {isPopular && (
        <Chip
          label="Most Popular"
          color="primary"
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        />
      )}
      
      <CardContent sx={{ p: 4 }}>
        {/* Заголовок и цена */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 1,
              fontWeight: 700,
              color: '#2c3e50'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              color: '#1976d2'
            }}
          >
            {price === 0 ? 'Free' : `$${price}`}
          </Typography>
          {price > 0 && (
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              per month
            </Typography>
          )}
        </Box>
        
        {/* Список фич */}
        <Box sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Box 
              key={feature}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
                borderBottom: index < features.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: featureValues[index] ? '#2c3e50' : '#7f8c8d',
                  textDecoration: featureValues[index] ? 'none' : 'line-through'
                }}
              >
                {feature}
              </Typography>
              {featureValues[index] ? (
                <CheckIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
              ) : (
                <CloseIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
              )}
            </Box>
          ))}
        </Box>
        
        {/* Кнопка */}
        <Button
          variant={buttonVariant}
          size="large"
          fullWidth
          onClick={handleDownload}
          sx={{
            borderRadius: '8px',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: buttonVariant === 'contained' ? '#1976d2' : 'transparent',
            color: buttonVariant === 'contained' ? 'white' : '#1976d2',
            borderColor: '#1976d2',
            '&:hover': {
              bgcolor: buttonVariant === 'contained' ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard; 