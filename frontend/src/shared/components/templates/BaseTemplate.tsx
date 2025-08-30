import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { BaseTemplateProps, TemplateMethods } from './types';

/**
 * Base class for all resume templates
 * Provides common structure and methods for working with resume data
 */
export abstract class BaseTemplate extends React.Component<BaseTemplateProps, {}> implements TemplateMethods {
  
  protected containerRef = React.createRef<HTMLDivElement>();

  /**
   * Get full name from resume data
   */
  protected getFullName(): string {
    const { first_name, last_name } = this.props.data;
    return `${first_name || ''} ${last_name || ''}`.trim();
  }

  /**
   * Get contact information
   */
  protected getContactInfo(): string {
    const { contacts, location } = this.props.data;
    const contactStr = contacts.join(' | ');
    return location ? `${contactStr} | ${location}` : contactStr;
  }

  /**
   * Format date
   */
  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  /**
   * Get work period
   */
  protected getWorkPeriod(startDate: string, endDate?: string, isCurrent?: boolean): string {
    const start = this.formatDate(startDate);
    if (isCurrent || !endDate) {
      return `${start} - Current`;
    }
    return `${start} - ${this.formatDate(endDate)}`;
  }

  /**
   * Check if work is current
   */
  protected isCurrentJob(endDate?: string): boolean {
    return !endDate || new Date(endDate) > new Date();
  }

  /**
   * Export to PDF
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
   * Export to PNG
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
   * Abstract method for template rendering
   * Must be implemented in each specific template
   */
  abstract renderTemplate(): React.ReactElement;

  render() {
    // For export just return content without additional containers
    // ResumeRenderer already manages sizes and styles
    if (!this.props.isPreview) {
      return this.renderTemplate();
    }
    
    // For preview - scalable container (if needed)
    const a4Width = 794; // ~210mm
    const a4Height = 1123; // ~297mm
    const scale = this.props.scale ?? 0.4;
    
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          m: 0,
          p: 0
        }}
      >
        <Box
          ref={this.containerRef}
          sx={{
            width: a4Width,
            height: a4Height,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
            border: '2px solid #e0e0e0',
            transition: 'transform 0.3s ease-in-out',
            m: 0,
            p: 0
          }}
        >
          {this.renderTemplate()}
        </Box>
      </Box>
    );
  }
} 