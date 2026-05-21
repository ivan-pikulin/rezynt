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
        self.premium_only = False

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
                title="Отсутствует имя",
                description="Добавьте свое имя в резюме",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 2. Check last name
        last_name = personal_info.get('last_name') or ''
        if not last_name.strip():
            points.append(self.create_point(
                field_path="personal_info.last_name",
                title="Отсутствует фамилия",
                description="Добавьте свою фамилию в резюме",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 3. Check current role (desired position)
        current_role = personal_info.get('current_role') or ''
        if not current_role.strip():
            points.append(self.create_point(
                field_path="personal_info.current_role",
                title="Отсутствует текущая роль",
                description="Добавьте свою текущую должность или целевую должность, чтобы помочь работодателям понять ваши карьерные цели.",
                metadata={"severity": "high", "score_impact": 7}
            ))

        # 4. Check city
        city = personal_info.get('city') or ''
        if not city.strip():
            points.append(self.create_point(
                field_path="personal_info.city",
                title="Пропавший город",
                description="Добавьте свой город, чтобы помочь работодателям понять ваше местоположение и потенциальные потребности в переезде.",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 5. Check email
        email = contacts.get('email') or ''
        if not email.strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Отсутствует адрес электронной почты",
                description="Добавьте свой адрес электронной почты — это необходимо, чтобы работодатели могли связаться с вами.",
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 6. Check phone
        phone = contacts.get('phone') or ''
        if not phone.strip():
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Отсутствует номер телефона",
                description="Добавьте свой номер телефона, чтобы предоставить дополнительный способ связи.",
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
                title="Недостаточное количество способов связи",
                description=f"Добавьте как минимум два способа связаться с вами (сейчас {available_contacts}).",
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # 8. Check professional summary (mechanical check only)
        summary = (resume.get('professional_summary') or '').strip()
        if not summary:
            points.append(self.create_point(
                field_path="professional_summary",
                title="Отсутствует профессиональное резюме",
                description="Добавьте убедительное профессиональное резюме, подчеркивающее ваши основные сильные стороны, опыт и карьерные цели.",
                metadata={"severity": "high", "score_impact": 6}
            ))

        # 9. Check work experience
        work_exp = resume.get('work_experience') or []
        if len(work_exp) == 0:
            description = """Добавьте свой опыт работы, чтобы продемонстрировать свой профессиональный опыт. Если у вас еще нет официального опыта работы, рассмотрите возможность включения:
• Личные проекты или побочные проекты
• Стажировки или ученичество
• Волонтерская работа или участие в общественной жизни
• Внештатная или контрактная работа
• Академические проекты с практическим применением.
• Вклад с открытым исходным кодом

Этот опыт продемонстрирует ваши навыки и инициативу потенциальным работодателям."""

            points.append(self.create_point(
                field_path="work_experience.new",
                title="Отсутствует опыт работы",
                description=description,
                metadata={"severity": "high", "score_impact": 8}
            ))

        # 10. Check education
        education = resume.get('education') or []
        if len(education) == 0:
            points.append(self.create_point(
                field_path="education.new",
                title="Отсутствующее образование",
                description="Добавьте свое образование (высшее образование, колледж, профессиональные курсы, сертификаты или соответствующие программы обучения)",
                metadata={"severity": "high", "score_impact": 7}
            ))

        return points

