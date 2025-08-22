import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import DownloadOptions from './components/DownloadOptions';
import SuccessPage from './components/SuccessPage';
import ResumeRenderer from '../../shared/components/ResumeRenderer';
import { Resume } from '../../shared/services/api/types';
import { useTemplate } from '../../shared/hooks/useTemplate';
import { useResumeQuery } from '../../shared/hooks/useResumeQuery';
import { convertApiResumeToDisplayData } from '../refine/utils/resumeDataConverter';
import LoadingSpinner from '../refine/components/LoadingSpinner';
import ErrorMessage from '../refine/components/ErrorMessage';
import { useTranslation } from 'react-i18next';

const ExportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');
  const templateContainerRef = useRef<HTMLDivElement>(null);
  const { resume, isLoading: loading, error: queryError, refreshResume } = useResumeQuery(resumeId);
  const { selectedTemplate } = useTemplate(resumeId);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    navigate(`/refine?resume_id=${resumeId}`);
  };

  const handleStepClick = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start
        navigate('/');
        break;
      case 1: // Generate
        navigate(`/chat?resume_id=${resumeId}`);
        break;
      case 2: // Refine
        navigate(`/refine?resume_id=${resumeId}`);
        break;
      case 3: // Export - уже на этой странице
        break;
      default:
        break;
    }
  };

  const handleExportPDF = async () => {
    if (!templateContainerRef.current || !resume) return;
    
    setIsExporting(true);
    
    try {
      // Запрашиваем свежие данные перед экспортом
      await refreshResume();
      
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(templateContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      
      // Рассчитываем размеры изображения для одной страницы
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Если изображение выше страницы, масштабируем его
      let finalImgWidth = imgWidth;
      let finalImgHeight = imgHeight;
      
      if (imgHeight > pageHeight) {
        // Масштабируем по высоте, сохраняя пропорции
        const scale = pageHeight / imgHeight;
        finalImgWidth = imgWidth * scale;
        finalImgHeight = pageHeight;
      }
      
      // Центрируем изображение на странице
      const xOffset = (imgWidth - finalImgWidth) / 2;
      const yOffset = (pageHeight - finalImgHeight) / 2;
      
      // Добавляем изображение на одну страницу
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
      
      // Используем реальные данные для имени файла
      const displayData = convertApiResumeToDisplayData(resume);
      const fullName = `${displayData.personalInfo.firstName} ${displayData.personalInfo.lastName}`;
      const filename = `${fullName.replace(/\s+/g, '_')}_resume.pdf`;
      pdf.save(filename);
      
      // Показываем страницу успеха после успешного скачивания
      setShowSuccess(true);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackToStart = () => {
    setShowSuccess(false);
  };

  // Если нет resumeId, показываем ошибку
  if (!resumeId) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <ErrorMessage 
          message={t('refine.error.noResumeId')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // Если загрузка, показываем индикатор
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <LoadingSpinner message={t('refine.loading')} />
      </Box>
    );
  }

  // Если ошибка, показываем сообщение
  if (queryError || !resume) {
    return (
      <Box sx={{ 
        height: '100vh', 
        bgcolor: '#f5f6fa'
      }}>
        <ErrorMessage 
          message={queryError || t('refine.error.notFound')} 
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  // Если показываем страницу успеха, рендерим её
  if (showSuccess) {
    return <SuccessPage onBackToStart={handleBackToStart} />;
  }

  // Преобразуем данные резюме для отображения
  const displayData = convertApiResumeToDisplayData(resume);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f6fa'
    }}>
      {/* Общая шапка */}
      <Header 
        activeStep={3} 
        onBack={handleBack}
        showNextButton={false}
        previousButtonText="Refine"
        showLogo={true} // Показываем лого на десктопе
        onStepClick={handleStepClick}
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы
        py: { xs: 3, sm: 4, md: 6 } // Дополнительные вертикальные отступы
      }}>
        <DownloadOptions onExportPDF={handleExportPDF} isExporting={isExporting} />
      </Box>

      {/* Скрытый template для экспорта */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={templateContainerRef}>
          <ResumeRenderer 
            data={displayData} 
            scale={1}
            templateId={selectedTemplate?.id}
          />
        </div>
      </Box>
    </Box>
  );
};

export default ExportPage; 