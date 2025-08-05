import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ResumeData } from '../types/resume';
import { createTemplate } from './templates';

interface ResumeRendererProps {
  data: ResumeData;
  templateId?: string;
  isPreview?: boolean;
  onExport?: () => void;
  scale?: number; // Добавляем поддержку масштабирования
  fitToContainer?: boolean; // Новый проп для адаптивного масштабирования
  debug?: boolean; // Отладочный режим
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ 
  data, 
  templateId = 'nume', 
  isPreview = true,
  onExport,
  scale = 1,
  fitToContainer = true,
  debug = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedScale, setCalculatedScale] = useState(scale);

  // Функция для расчета оптимального масштаба
  const calculateOptimalScale = () => {
    if (!containerRef.current || !fitToContainer) return scale;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // A4 размеры в пикселях при 96 DPI
    const a4Width = 794; // ~210mm
    const a4Height = 1123; // ~297mm
    
    // Вычисляем масштаб по ширине и высоте
    const scaleByWidth = (containerWidth - 40) / a4Width; // 40px для отступов
    const scaleByHeight = (containerHeight - 40) / a4Height; // 40px для отступов
    
    // Берем минимальный масштаб, чтобы резюме поместилось полностью
    const optimalScale = Math.min(scaleByWidth, scaleByHeight, 1);
    
    const finalScale = Math.max(optimalScale, 0.1); // Минимальный масштаб 0.1
    
    if (debug) {
      console.log('ResumeRenderer Debug:', {
        containerWidth,
        containerHeight,
        a4Width,
        a4Height,
        scaleByWidth,
        scaleByHeight,
        optimalScale,
        finalScale,
        fitToContainer
      });
    }
    
    return finalScale;
  };

  // Обновляем масштаб при изменении размера контейнера
  useEffect(() => {
    // Если fitToContainer отключен, используем переданный scale
    if (!fitToContainer) {
      setCalculatedScale(scale);
      return;
    }

    const updateScale = () => {
      setCalculatedScale(calculateOptimalScale());
    };

    updateScale();
    
    // Добавляем слушатель изменения размера окна
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
      {templateElement}
    </Box>
  );
};

export default ResumeRenderer; 