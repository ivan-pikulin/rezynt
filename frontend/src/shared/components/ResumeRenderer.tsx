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

  // Функция для расчета оптимального масштаба
  const calculateOptimalScale = () => {
    if (!containerRef.current || !fitToContainer) return scale;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // A4 размеры в пикселях при 96 DPI
    const a4Width = 794; // ~210mm
    const a4Height = 1123; // ~297mm
    
    // Вычисляем масштаб по ширине и высоте с учетом отступов
    const padding = 20; // Отступы для скруглений и теней
    const scaleByWidth = (containerWidth - padding) / a4Width;
    const scaleByHeight = (containerHeight - padding) / a4Height;
    
    // Берем минимальный масштаб, чтобы резюме поместилось полностью
    const optimalScale = Math.min(scaleByWidth, scaleByHeight, 1);
    
    const finalScale = Math.max(optimalScale, 0.1); // Минимальный масштаб 0.1
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
      <Box
        sx={{
          // Для превью используем aspectRatio, для экспорта - фиксированные размеры
          ...(isPreview ? {
            width: '100%',
            aspectRatio: '210 / 297', // A4 соотношение
            maxWidth: '794px',
            maxHeight: '1123px'
          } : {
            width: '794px', // Фиксированная ширина A4
            height: '1123px' // Фиксированная высота A4
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