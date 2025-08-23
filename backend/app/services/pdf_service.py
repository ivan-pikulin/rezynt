import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from fastapi import HTTPException, status
from fastapi.responses import FileResponse


class PDFService:
    """Service for PDF generation using WeasyPrint"""
    
    def __init__(self):
        self.font_config = FontConfiguration()
        
    def generate_pdf_from_html(
        self, 
        html_content: str, 
        filename: Optional[str] = None
    ) -> tuple[bytes, str]:
        """
        Generate PDF from HTML content using WeasyPrint
        
        Args:
            html_content: HTML string to convert
            filename: Optional filename for the PDF
            
        Returns:
            tuple: (pdf_bytes, filename)
        """
        try:
            # Create HTML object
            html = HTML(string=html_content)
            
            # Define CSS for better PDF formatting
            css_string = """
                @page {
                    size: A4;
                    margin: 0.75in;
                    @top-center {
                        content: "";
                    }
                    @bottom-center {
                        content: "";
                    }
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                * {
                    box-sizing: border-box;
                }
            """
            
            css = CSS(string=css_string, font_config=self.font_config)
            
            # Generate PDF
            pdf_bytes = html.write_pdf(
                stylesheets=[css],
                font_config=self.font_config
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
