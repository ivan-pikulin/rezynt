"""Rule: Missing Required Fields - Comprehensive validation of essential resume fields"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingRequiredFieldsRule(BaseRule):
    """Detects missing essential fields across the entire resume."""

    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8

    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check all required fields and generate appropriate improvement points."""
        points = []

        personal_info = resume.get('personal_info', {})
        contacts = personal_info.get('contacts', {})

        # 1. Check first name
        if not personal_info.get('first_name', '').strip():
            points.append(self.create_point(
                field_path="personal_info.first_name",
                title="Missing First Name",
                description="Add your first name to the resume",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 2. Check last name
        if not personal_info.get('last_name', '').strip():
            points.append(self.create_point(
                field_path="personal_info.last_name",
                title="Missing Last Name",
                description="Add your last name to the resume",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 3. Check job title (desired position)
        if not personal_info.get('job_title', '').strip():
            points.append(self.create_point(
                field_path="personal_info.job_title",
                title="Missing Job Title",
                description="Add your target job title or desired position to help employers understand your career goals",
                metadata={"severity": "high", "score_impact": 7}
            ))

        # 4. Check city
        if not personal_info.get('city', '').strip():
            points.append(self.create_point(
                field_path="personal_info.city",
                title="Missing City",
                description="Add your city to help employers understand your location and potential relocation needs",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 5. Check email
        if not contacts.get('email', '').strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.email",
                title="Missing Email Address",
                description="Add your email address - this is essential for employers to contact you",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 6. Check phone
        if not contacts.get('phone', '').strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.phone",
                title="Missing Phone Number",
                description="Add your phone number to provide an additional contact method",
                metadata={"severity": "medium", "score_impact": 5}
            ))

        # 7. Check minimum contacts (at least 2)
        available_contacts = sum([
            bool(contacts.get('email', '').strip()),
            bool(contacts.get('phone', '').strip()),
            bool(contacts.get('linkedin', '').strip()),
            bool(contacts.get('telegram', '').strip()),
            bool(contacts.get('github', '').strip()),
        ])

        if available_contacts < 2:
            points.append(self.create_point(
                field_path="personal_info.contacts",
                title="Insufficient Contact Methods",
                description=f"Add at least 2 ways to contact you (currently {available_contacts}).",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 8. Check professional summary (mechanical check only)
        summary = resume.get('professional_summary', '').strip()
        if not summary:
            points.append(self.create_point(
                field_path="professional_summary",
                title="Missing Professional Summary",
                description="Add a compelling professional summary that highlights your key strengths, expertise, and career objectives",
                metadata={"severity": "high", "score_impact": 6}
            ))

        # 9. Check work experience
        work_exp = resume.get('work_experience', [])
        if len(work_exp) == 0:
            description = """Add your work experience to showcase your professional background. If you don't have formal work experience yet, consider including:
• Personal projects or side projects
• Internships or apprenticeships
• Volunteer work or community involvement
• Freelance or contract work
• Academic projects with real-world applications
• Open-source contributions

These experiences demonstrate your skills and initiative to potential employers."""

            points.append(self.create_point(
                field_path="work_experience",
                title="Missing Work Experience",
                description=description,
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 10. Check education
        education = resume.get('education', [])
        if len(education) == 0:
            points.append(self.create_point(
                field_path="education",
                title="Missing Education",
                description="Add your educational background (university degree, college, professional courses, certifications, or relevant training programs)",
                metadata={"severity": "high", "score_impact": 7}
            ))

        return points
