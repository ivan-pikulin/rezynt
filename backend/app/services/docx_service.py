import tempfile
import uuid
from io import BytesIO
from pathlib import Path
from typing import Any, Optional

from docx.shared import Cm
from docxtpl import DocxTemplate, InlineImage
from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from PIL import Image, ImageDraw, ImageFont


class DOCXService:
    """Service for DOCX resume generation from prepared Word templates."""

    DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    TEMPLATE_SLUGS = {"clarity", "sidebar", "professional", "frame"}
    FONT_CANDIDATES = (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    )

    def __init__(self) -> None:
        self.templates_dir = Path(__file__).resolve().parents[1] / "templates" / "docx"

    def _format_date(self, value: str | None) -> str:
        if not value:
            return ""

        months = {
            "01": "January",
            "02": "February",
            "03": "March",
            "04": "April",
            "05": "May",
            "06": "June",
            "07": "July",
            "08": "August",
            "09": "September",
            "10": "October",
            "11": "November",
            "12": "December",
        }
        if len(value) >= 7 and value[4] == "-":
            return f"{months.get(value[5:7], value[5:7])} {value[:4]}"
        return value

    def _build_context(self, resume_data: dict[str, Any]) -> dict[str, Any]:
        personal = resume_data.get("personal_info") or {}
        contacts = personal.get("contacts") or {}
        first_name = personal.get("first_name") or ""
        last_name = personal.get("last_name") or ""
        full_name = " ".join(part for part in [first_name, last_name] if part)
        contact_parts = [
            contacts.get("email"),
            contacts.get("phone"),
            contacts.get("linkedin"),
            contacts.get("website"),
        ]

        work_experience = []
        for exp in resume_data.get("work_experience") or []:
            start = self._format_date(exp.get("start_date"))
            end = self._format_date(exp.get("end_date")) if exp.get("end_date") else "Present"
            location = ", ".join(part for part in [exp.get("city"), exp.get("country")] if part)
            work_experience.append(
                {
                    **exp,
                    "period": f"{start} - {end}" if start else end,
                    "company_line": " | ".join(part for part in [exp.get("company"), location] if part),
                }
            )

        education = []
        for edu in resume_data.get("education") or []:
            location = ", ".join(part for part in [edu.get("city"), edu.get("country")] if part)
            education.append(
                {
                    **edu,
                    "end_date": self._format_date(edu.get("end_date")),
                    "institution_line": ", ".join(part for part in [edu.get("institution"), location] if part),
                }
            )

        skills = resume_data.get("skills") or []
        skill_pairs = []
        for index in range(0, len(skills), 2):
            skill_pairs.append(
                {
                    "left": skills[index],
                    "right": skills[index + 1] if index + 1 < len(skills) else "",
                }
            )

        return {
            "full_name": full_name,
            "first_name_upper": first_name.upper(),
            "last_name_upper": last_name.upper(),
            "first_initial": first_name[:1].upper(),
            "last_initial": last_name[:1].upper(),
            "contacts": {
                "email": contacts.get("email") or "",
                "phone": contacts.get("phone") or "",
                "linkedin": contacts.get("linkedin") or "",
                "website": contacts.get("website") or "",
            },
            "contact_line": " | ".join(part for part in contact_parts if part),
            "professional_summary": resume_data.get("professional_summary") or "",
            "skills": skills,
            "skill_pairs": skill_pairs,
            "skills_line": " • ".join(skills),
            "work_experience": work_experience,
            "education": education,
        }

    def _normalize_filename(self, filename: Optional[str]) -> str:
        final_filename = Path(filename or f"resume_{uuid.uuid4().hex[:8]}.docx").name
        if not final_filename.lower().endswith(".docx"):
            final_filename += ".docx"
        return final_filename

    def _get_bold_font_path(self) -> Path:
        for candidate in self.FONT_CANDIDATES:
            path = Path(candidate)
            if path.exists():
                return path
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не найден bold font для генерации DOCX-монограммы",
        )

    def _create_professional_logo_image(self, first_initial: str, last_initial: str) -> Path:
        try:
            size = 180
            brown = "#8B4513"
            image = Image.new("RGBA", (size, size), (255, 255, 255, 0))
            draw = ImageDraw.Draw(image)
            draw.rectangle((5, 5, size - 5, size - 5), outline=brown, width=6)
            draw.line((74, 111, 111, 74), fill=brown, width=3)

            font = ImageFont.truetype(str(self._get_bold_font_path()), 40)
            draw.text((28, 34), first_initial, fill=brown, font=font)
            draw.text((118, 112), last_initial, fill=brown, font=font)

            temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
            temp_file.close()
            logo_path = Path(temp_file.name)
            image.save(logo_path)
            return logo_path
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Не удалось сгенерировать DOCX-монограмму: {str(exc)}",
            )

    def generate_docx_from_resume(
        self,
        resume_data: dict[str, Any],
        template_slug: str,
        filename: Optional[str] = None,
    ) -> tuple[bytes, str]:
        """Generate a DOCX file from stored resume data."""
        if template_slug not in self.TEMPLATE_SLUGS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Недопустимый template_slug. Допустимы только: {', '.join(sorted(self.TEMPLATE_SLUGS))}",
            )

        template_path = self.templates_dir / f"{template_slug}.docx"
        if not template_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"DOCX шаблон не найден: {template_slug}",
            )

        logo_path: Path | None = None
        try:
            template = DocxTemplate(template_path)
            context = self._build_context(resume_data)

            if template_slug == "professional":
                logo_path = self._create_professional_logo_image(
                    context["first_initial"],
                    context["last_initial"],
                )
                context["logo_image"] = InlineImage(template, str(logo_path), width=Cm(1.55), height=Cm(1.55))

            template.render(context)
            output = BytesIO()
            template.save(output)
            return output.getvalue(), self._normalize_filename(filename)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Не удалось сгенерировать DOCX: {str(exc)}",
            )
        finally:
            if logo_path and logo_path.exists():
                logo_path.unlink(missing_ok=True)

    def save_docx_temp(self, docx_bytes: bytes, filename: str) -> str:
        try:
            temp_dir = Path(tempfile.gettempdir())
            temp_path = temp_dir / f"{uuid.uuid4().hex}_{filename}"
            temp_path.write_bytes(docx_bytes)
            return str(temp_path)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Не удалось сохранить DOCX: {str(exc)}",
            )

    def create_file_response(self, docx_bytes: bytes, filename: str) -> FileResponse:
        temp_file_path = self.save_docx_temp(docx_bytes, filename)
        return FileResponse(
            path=temp_file_path,
            filename=filename,
            media_type=self.DOCX_MEDIA_TYPE,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )


docx_service = DOCXService()
