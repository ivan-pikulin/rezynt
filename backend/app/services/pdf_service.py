import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional
import pdfkit
from fastapi import HTTPException, status
from fastapi.responses import FileResponse


class PDFService:
    """Service for PDF generation using PDFKit and wkhtmltopdf"""
    
    def __init__(self):
        self.wkhtmltopdf_path = self._get_wkhtmltopdf_path()
        self.config = pdfkit.configuration(wkhtmltopdf=self.wkhtmltopdf_path)
        
    def _get_wkhtmltopdf_path(self) -> str:
        """Get wkhtmltopdf executable path"""
        # Try common installation paths
        possible_paths = [
            '/usr/local/bin/wkhtmltopdf',
            '/usr/bin/wkhtmltopdf',
            'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe',
            'C:\\wkhtmltopdf\\bin\\wkhtmltopdf.exe',
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        # If not found, assume it's in PATH
        return 'wkhtmltopdf'
    
    def generate_pdf_from_html(
        self, 
        html_content: str, 
        filename: Optional[str] = None
    ) -> tuple[bytes, str]:
        """
        Generate PDF from HTML content
        
        Args:
            html_content: HTML string to convert
            filename: Optional filename for the PDF
            
        Returns:
            tuple: (pdf_bytes, filename)
        """
        try:
            # PDF generation options
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
                'enable-local-file-access': True,
                'no-outline': None,
                'print-media-type': None,
                'dpi': 300,
                'image-dpi': 300,
                'image-quality': 100,
                'disable-smart-shrinking': None,
                'zoom': 1.0
            }
            
            # Generate PDF
            pdf_bytes = pdfkit.from_string(
                html_content, 
                False, 
                options=options, 
                configuration=self.config
            )
            
            # Generate filename if not provided
            if not filename:
                filename = f"resume_{uuid.uuid4().hex[:8]}.pdf"
            elif not filename.endswith('.pdf'):
                filename += '.pdf'
                
            return pdf_bytes, filename
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF: {str(e)}"
            )
    
    def save_pdf_temp(self, pdf_bytes: bytes, filename: str) -> str:
        """
        Save PDF to temporary file
        
        Args:
            pdf_bytes: PDF content as bytes
            filename: Filename for the PDF
            
        Returns:
            str: Path to temporary file
        """
        try:
            # Create temporary file
            temp_dir = Path(tempfile.gettempdir())
            temp_file = temp_dir / filename
            
            # Write PDF content
            with open(temp_file, 'wb') as f:
                f.write(pdf_bytes)
                
            return str(temp_file)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save PDF: {str(e)}"
            )
    
    def create_file_response(self, pdf_bytes: bytes, filename: str) -> FileResponse:
        """
        Create FastAPI FileResponse for PDF download
        
        Args:
            pdf_bytes: PDF content as bytes
            filename: Filename for the PDF
            
        Returns:
            FileResponse: FastAPI file response
        """
        # Save to temporary file
        temp_file_path = self.save_pdf_temp(pdf_bytes, filename)
        
        # Create file response
        return FileResponse(
            path=temp_file_path,
            filename=filename,
            media_type='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )


# Global instance
pdf_service = PDFService()
