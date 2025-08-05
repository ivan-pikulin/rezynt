import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import DownloadOptions from './components/DownloadOptions';
import { TemplateService } from '../../shared/services/templateService';
import { NumeTemplate } from '../../shared/components/templates';

const ExportPage: React.FC = () => {
  const navigate = useNavigate();
  const templateContainerRef = useRef<HTMLDivElement>(null);
  const demoData = TemplateService.createDemoData();
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    navigate('/refine');
  };

  const handleExportPDF = async () => {
    if (!templateContainerRef.current) return;
    
    setIsExporting(true);
    
    try {
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
      
      const fullName = `${demoData.personalInfo.firstName} ${demoData.personalInfo.lastName}`;
      const filename = `${fullName.replace(/\s+/g, '_')}_resume.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

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
      />
      
      {/* Основная область */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}>
        <DownloadOptions onExportPDF={handleExportPDF} isExporting={isExporting} />
      </Box>

      {/* Скрытый template для экспорта */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={templateContainerRef}>
          <NumeTemplate 
            data={demoData} 
            isPreview={false}
            scale={1}
          />
        </div>
      </Box>
    </Box>
  );
};

export default ExportPage; 