import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseTemplateProps } from './types';

/**
 * Base class for all resume templates
 * Provides common structure and methods for working with resume data
 */
export abstract class BaseTemplate extends React.Component<BaseTemplateProps, {}> {
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
   * Get translation for a key
   */
  protected t(key: string): string {
    if (this.props.t) {
      return this.props.t(key);
    }
    // Fallback to English if translation function not provided
    const translations: Record<string, string> = {
      'templates.sections.professionalSummary': 'Professional Summary',
      'templates.sections.skills': 'Skills',
      'templates.sections.experience': 'Experience',
      'templates.sections.education': 'Education',
      'templates.sections.notProvided': 'Professional summary not provided'
    };
    return translations[key] || key;
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
            width: a4Width * scale,
            height: a4Height * scale,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'all 0.3s ease-in-out',
            m: 0,
            p: 0
          }}
        >
          <Box
            sx={{
              width: a4Width,
              height: a4Height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              overflow: 'hidden'
            }}
          >
            {this.renderTemplate()}
          </Box>
        </Box>
      </Box>
    );
  }
} 