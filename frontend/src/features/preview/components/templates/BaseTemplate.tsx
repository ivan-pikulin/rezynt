import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { BaseTemplateProps, TemplateMethods } from './types';

/**
 * Базовый класс для всех шаблонов резюме
 * Предоставляет общую структуру и методы для работы с данными резюме
 */
export abstract class BaseTemplate extends React.Component<BaseTemplateProps, {}> implements TemplateMethods {
  
  protected containerRef = React.createRef<HTMLDivElement>();

  /**
   * Получить полное имя из данных резюме
   */
  protected getFullName(): string {
    const { firstName, lastName, middleName } = this.props.data.personalInfo;
    return middleName 
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;
  }

  /**
   * Получить контактную информацию
   */
  protected getContactInfo(): string {
    const { phone, email, location } = this.props.data.personalInfo;
    return `${phone} | ${email} | ${location}`;
  }

  /**
   * Форматировать дату
   */
  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  /**
   * Получить период работы
   */
  protected getWorkPeriod(startDate: string, endDate?: string, isCurrent?: boolean): string {
    const start = this.formatDate(startDate);
    if (isCurrent) {
      return `${start} - Current`;
    }
    return endDate ? `${start} - ${this.formatDate(endDate)}` : start;
  }

  /**
   * Экспорт в PDF
   */
  async exportToPDF(): Promise<void> {
    if (!this.containerRef.current) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(this.containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = `${this.getFullName().replace(/\s+/g, '_')}_resume.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Экспорт в PNG
   */
  async exportToPNG(): Promise<string> {
    if (!this.containerRef.current) return '';
    
    try {
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(this.containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      throw error;
    }
  }

  /**
   * Абстрактный метод для рендеринга шаблона
   * Должен быть реализован в каждом конкретном шаблоне
   */
  abstract renderTemplate(): React.ReactElement;

  render() {
    // A4 размеры в пикселях при 96 DPI
    const a4Width = 794; // ~210mm
    const a4Height = 1123; // ~297mm
    
    if (this.props.isPreview) {
      // Для превью - масштабируемый контейнер
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <Box
            ref={this.containerRef}
            sx={{
              width: a4Width,
              height: a4Height,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              transform: 'scale(var(--resume-scale, 0.4))',
              transformOrigin: 'top center',
              flexShrink: 0,
              border: '2px solid #e0e0e0'
            }}
          >
            {this.renderTemplate()}
          </Box>
        </Box>
      );
    } else {
      // Для экспорта - полный размер A4
      return (
        <Box
          ref={this.containerRef}
          sx={{
            width: a4Width,
            height: a4Height,
            backgroundColor: 'white',
            overflow: 'hidden',
            border: '1px solid #ccc'
          }}
        >
          {this.renderTemplate()}
        </Box>
      );
    }
  }
} 