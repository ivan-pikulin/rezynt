from fastapi import APIRouter
from app.services.pdf_service import pdf_service

router = APIRouter()

@router.get("/test-pdf")
async def test_pdf_generation():
    """
    Test endpoint for PDF generation
    """
    # Simple test HTML
    test_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Test PDF</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
                line-height: 1.6;
            }
            h1 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            .section {
                margin: 20px 0;
            }
            .highlight {
                background-color: #f8f9fa;
                padding: 15px;
                border-left: 4px solid #3498db;
            }
        </style>
    </head>
    <body>
        <h1>Test Resume PDF</h1>
        
        <div class="section">
            <h2>Personal Information</h2>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>
        
        <div class="section">
            <h2>Professional Summary</h2>
            <div class="highlight">
                <p>Experienced software developer with 5+ years of experience in web development, 
                specializing in React, TypeScript, and Python. Proven track record of delivering 
                high-quality applications and leading development teams.</p>
            </div>
        </div>
        
        <div class="section">
            <h2>Skills</h2>
            <ul>
                <li>JavaScript / TypeScript</li>
                <li>React / Next.js</li>
                <li>Python / FastAPI</li>
                <li>PostgreSQL / MongoDB</li>
                <li>Docker / Kubernetes</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>Experience</h2>
            <h3>Senior Developer - Tech Corp</h3>
            <p><em>2020 - Present</em></p>
            <ul>
                <li>Led development of enterprise web applications</li>
                <li>Mentored junior developers</li>
                <li>Implemented CI/CD pipelines</li>
            </ul>
        </div>
    </body>
    </html>
    """
    
    try:
        # Generate PDF
        pdf_bytes, filename = pdf_service.generate_pdf_from_html(
            html_content=test_html,
            filename="test_resume.pdf"
        )
        
        # Return PDF as file response
        return pdf_service.create_file_response(pdf_bytes, filename)
        
    except Exception as e:
        return {"error": str(e)}
