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
import { exportApi } from './exportApi';

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
      
      // Получаем полный HTML с CSS стилями
      const fullHtml = getFullHTMLWithStyles(templateContainerRef.current);
      
      // Используем реальные данные для имени файла
      const displayData = convertApiResumeToDisplayData(resume);
      const fullName = `${displayData.first_name || ''} ${displayData.last_name || ''}`.trim();
      const filename = `${fullName.replace(/\s+/g, '_')}_resume.pdf`;
      
      // Отправляем запрос на бэкенд для генерации PDF
      const pdfBlob = await exportApi.exportToPDF(resumeId!, {
        html_content: fullHtml,
        filename: filename,
        template_id: selectedTemplate?.id
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Показываем страницу успеха после успешного скачивания
      setShowSuccess(true);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Функция для получения полного HTML с CSS стилями
  const getFullHTMLWithStyles = (element: HTMLElement): string => {
    // Получаем все CSS стили из document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Игнорируем CORS ошибки для внешних стилей
          return '';
        }
      })
      .filter(style => style.length > 0)
      .join('\n');

    // Создаем полный HTML документ
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <style>
            ${styles}
            /* Дополнительные стили для PDF */
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;
    
    return fullHtml;
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
        <div ref={templateContainerRef} style={{ width: '794px', height: '1123px' }}>
          <ResumeRenderer 
            data={displayData} 
            scale={1}
            templateId={selectedTemplate?.id}
            fitToContainer={false}
          />
        </div>
      </Box>
    </Box>
  );
};

export default ExportPage; 