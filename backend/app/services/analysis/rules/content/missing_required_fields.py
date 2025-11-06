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
        first_name = personal_info.get('first_name') or ''
        if not first_name.strip():
            points.append(self.create_point(
                field_path="personal_info.first_name",
                title="Missing First Name",
                description="Add your first name to the resume",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 2. Check last name
        last_name = personal_info.get('last_name') or ''
        if not last_name.strip():
            points.append(self.create_point(
                field_path="personal_info.last_name",
                title="Missing Last Name",
                description="Add your last name to the resume",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 3. Check current role (desired position)
        current_role = personal_info.get('current_role') or ''
        if not current_role.strip():
            points.append(self.create_point(
                field_path="personal_info.current_role",
                title="Missing Current Role",
                description="Add your current role or target job title to help employers understand your career goals",
                metadata={"severity": "high", "score_impact": 7}
            ))

        # 4. Check city
        city = personal_info.get('city') or ''
        if not city.strip():
            points.append(self.create_point(
                field_path="personal_info.city",
                title="Missing City",
                description="Add your city to help employers understand your location and potential relocation needs",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 5. Check email
        email = contacts.get('email') or ''
        if not email.strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Missing Email Address",
                description="Add your email address - this is essential for employers to contact you",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 6. Check phone
        phone = contacts.get('phone') or ''
        if not phone.strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Missing Phone Number",
                description="Add your phone number to provide an additional contact method",
                metadata={"severity": "medium", "score_impact": 5}
            ))

        # 7. Check minimum contacts (at least 2)
        available_contacts = sum([
            bool((contacts.get('email') or '').strip()),
            bool((contacts.get('phone') or '').strip()),
            bool((contacts.get('linkedin') or '').strip()),
            bool((contacts.get('telegram') or '').strip()),
            bool((contacts.get('github') or '').strip()),
        ])

        if available_contacts < 2:
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Insufficient Contact Methods",
                description=f"Add at least 2 ways to contact you (currently {available_contacts}).",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 8. Check professional summary (mechanical check only)
        summary = (resume.get('professional_summary') or '').strip()
        if not summary:
            points.append(self.create_point(
                field_path="professional_summary",
                title="Missing Professional Summary",
                description="Add a compelling professional summary that highlights your key strengths, expertise, and career objectives",
                metadata={"severity": "high", "score_impact": 6}
            ))

        # 9. Check work experience
        work_exp = resume.get('work_experience') or []
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
                field_path="work_experience.new",
                title="Missing Work Experience",
                description=description,
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 10. Check education
        education = resume.get('education') or []
        if len(education) == 0:
            points.append(self.create_point(
                field_path="education.new",
                title="Missing Education",
                description="Add your educational background (university degree, college, professional courses, certifications, or relevant training programs)",
                metadata={"severity": "high", "score_impact": 7}
            ))

        return points
