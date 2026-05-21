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
    const personal_info = this.props.data.personal_info;
    if (!personal_info) return '';
    return `${personal_info.first_name || ''} ${personal_info.last_name || ''}`.trim();
  }

  /**
   * Get current role
   */
  protected getCurrentRole(): string {
    return this.props.data.personal_info?.current_role || '';
  }

  /**
   * Get location (city, country)
   */
  protected getLocation(): string {
    const personal_info = this.props.data.personal_info;
    if (!personal_info) return '';
    const parts = [];
    if (personal_info.city) parts.push(personal_info.city);
    if (personal_info.country) parts.push(personal_info.country);
    return parts.join(', ');
  }

  /**
   * Get contact information
   */
  protected getContactInfo(): string {
    const personal_info = this.props.data.personal_info;
    if (!personal_info?.contacts) return '';

    const contacts = personal_info.contacts;
    const contactParts: string[] = [];

    if (contacts.email) contactParts.push(contacts.email);
    if (contacts.phone) contactParts.push(contacts.phone);
    if (contacts.linkedin) contactParts.push(contacts.linkedin);
    if (contacts.website) contactParts.push(contacts.website);

    return contactParts.join(' | ');
  }

  /**
   * Format date - handles both "Month YYYY" and "YYYY-MM-DD" formats
   */
  protected formatDate(dateString: string): string {
    if (!dateString) return '';

    // If already in a readable month-year format, return as is
    if (dateString.match(/^[A-Za-zА-Яа-яЁё]+ \d{4}$/)) {
      return dateString;
    }

    // Try to parse as ISO date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    return date.toLocaleDateString('ru-RU', {
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
      return `${start} - по настоящее время`;
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
      'templates.sections.professionalSummary': 'Профессиональное резюме',
      'templates.sections.skills': 'Навыки',
      'templates.sections.experience': 'Опыт',
      'templates.sections.education': 'Образование',
      'templates.sections.languages': 'Языки',
      'templates.sections.awards': 'Награды',
      'templates.sections.notProvided': 'Профессиональное резюме не предоставлено'
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
