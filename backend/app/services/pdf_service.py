import tempfile
import uuid
from pathlib import Path
from typing import Optional

from app.core.config import settings
from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration


class PDFService:
    """Service for PDF generation using WeasyPrint"""
    
    def __init__(self):
        self.font_config = FontConfiguration()
        
    def _get_watermark_css(self) -> str:
        """
        Generate CSS for watermark background
        
        Returns:
            str: CSS string with watermark styling
        """
        watermark_path = Path(settings.PDF_WATERMARK_PATH)
        
        # Check if watermark file exists
        if not watermark_path.exists():
            return ""
        
        # Convert to absolute path for WeasyPrint
        absolute_watermark_path = watermark_path.resolve()
        
        return f"""
            @page {{
                size: A4;
                margin: 0;
                padding: 0;
                border: none;
                @top-center {{
                    content: "";
                }}
                @bottom-center {{
                    content: "";
                }}
            }}
            
            body {{
                position: relative;
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                overflow: hidden;
                page-break-inside: avoid;
            }}
            
            body::before {{
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('file://{absolute_watermark_path}');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.3;
            }}
            
            * {{
                page-break-inside: avoid;
                page-break-after: avoid;
                page-break-before: avoid;
            }}
        """
        
    def generate_pdf_from_html(
        self, 
        html_content: str, 
        filename: Optional[str] = None,
        use_watermark: bool = True
    ) -> tuple[bytes, str]:
        """
        Generate PDF from HTML content using WeasyPrint
        
        Args:
            html_content: HTML string to convert
            filename: Optional filename for the PDF
            use_watermark: Whether to apply watermark (default: True)
            
        Returns:
            tuple: (pdf_bytes, filename)
        """
        try:
            # Create HTML object
            html = HTML(string=html_content)
            
            # Get watermark CSS only if requested
            watermark_css = self._get_watermark_css() if use_watermark else ""
            
            # Define CSS for PDF formatting
            # All users get PDF without margins, exactly one page
            css_string = f"""
                {watermark_css}
                @page {{
                    size: A4;
                    margin: 0;
                    padding: 0;
                    border: none;
                }}
                * {{
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    page-break-after: avoid;
                    page-break-before: avoid;
                }}
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
                detail=f"Не удалось сгенерировать PDF: {str(e)}"
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
                detail=f"Не удалось сохранить PDF: {str(e)}"
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
