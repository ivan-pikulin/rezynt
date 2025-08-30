import Box from '@mui/material/Box';
import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../types/resume';
import { createTemplate } from './templates';

interface ResumeRendererProps {
  data: ResumeData;
  templateId?: string;
  isPreview?: boolean;
  onExport?: () => void;
  scale?: number; // Add scaling support
  fitToContainer?: boolean; // New prop for adaptive scaling
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  data,
  templateId = 'tero',
  isPreview = true,
  onExport,
  scale = 1,
  fitToContainer = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(scale);

  // Function to calculate optimal scale
  const calculateOptimalScale = () => {
    if (!containerRef.current || !fitToContainer) return scale;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // A4 dimensions in pixels at 96 DPI
    const a4Width = 794; // ~210mm
    const a4Height = 1123; // ~297mm

    // Calculate scale by width and height with padding
    const padding = 20; // Padding for rounded corners and shadows
    const scaleByWidth = (containerWidth - padding) / a4Width;
    const scaleByHeight = (containerHeight - padding) / a4Height;

    // Take minimum scale so resume fits completely
    const optimalScale = Math.min(scaleByWidth, scaleByHeight, 1);

    const finalScale = Math.max(optimalScale, 0.1); // Minimum scale 0.1
    return finalScale;
  };

  // Update scale when container size changes
  useEffect(() => {
    // If fitToContainer is disabled, use passed scale
    if (!fitToContainer) {
      setCalculatedScale(scale);
      return;
    }

    const updateScale = () => {
      setCalculatedScale(calculateOptimalScale());
    };

    updateScale();

    // Add window resize listener
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitToContainer, scale]);

  const templateElement = createTemplate(templateId, {
    data,
    isPreview,
    onExport,
    scale: calculatedScale
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        p: 0,
        m: 0
      }}
    >
      <Box
        sx={{
          // For preview use aspectRatio, for export - fixed dimensions
          ...(isPreview ? {
            width: '100%',
            aspectRatio: '210 / 297', // A4 ratio
            maxWidth: '794px',
            maxHeight: '1123px'
          } : {
            width: '794px', // Fixed A4 width
            height: '1123px' // Fixed A4 height
          }),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: isPreview ? '12px' : '0',
          boxShadow: isPreview ? '0 8px 32px rgba(0, 0, 0, 0.12)' : 'none',
          overflow: 'hidden',
          backgroundColor: 'white',
          position: 'relative'
        }}
      >
        {templateElement}
      </Box>
    </Box>
  );
};

export default ResumeRenderer; 