from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor, Twips
from docxtpl import DocxTemplate, InlineImage
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
TEMPLATE_PATH = BACKEND / "app/templates/docx/clarity.docx"
SIDEBAR_TEMPLATE_PATH = BACKEND / "app/templates/docx/sidebar.docx"
PROFESSIONAL_TEMPLATE_PATH = BACKEND / "app/templates/docx/professional.docx"
FRAME_TEMPLATE_PATH = BACKEND / "app/templates/docx/frame.docx"
OUTPUT_DIR = ROOT / "artifacts/resume_export"
SAMPLE_JSON_PATH = OUTPUT_DIR / "clarity_sample_resume.json"
FILLED_DOCX_PATH = OUTPUT_DIR / "clarity_sample_resume.docx"
PDF_PATH = OUTPUT_DIR / "clarity_sample_resume.pdf"
SIDEBAR_SAMPLE_JSON_PATH = OUTPUT_DIR / "sidebar_sample_resume.json"
SIDEBAR_FILLED_DOCX_PATH = OUTPUT_DIR / "sidebar_sample_resume.docx"
SIDEBAR_PDF_PATH = OUTPUT_DIR / "sidebar_sample_resume.pdf"
PROFESSIONAL_SAMPLE_JSON_PATH = OUTPUT_DIR / "professional_sample_resume.json"
PROFESSIONAL_FILLED_DOCX_PATH = OUTPUT_DIR / "professional_sample_resume.docx"
PROFESSIONAL_PDF_PATH = OUTPUT_DIR / "professional_sample_resume.pdf"
PROFESSIONAL_LOGO_PATH = OUTPUT_DIR / "professional_logo.png"
FRAME_SAMPLE_JSON_PATH = OUTPUT_DIR / "frame_sample_resume.json"
FRAME_FILLED_DOCX_PATH = OUTPUT_DIR / "frame_sample_resume.docx"
FRAME_PDF_PATH = OUTPUT_DIR / "frame_sample_resume.pdf"


SAMPLE_RESUME: dict[str, Any] = {
    "personal_info": {
        "first_name": "John",
        "last_name": "Doe",
        "current_role": "Senior Software Engineer",
        "city": "San Francisco",
        "country": "USA",
        "contacts": {
            "email": "john.doe@email.com",
            "phone": "+1 (555) 123-4567",
            "linkedin": "linkedin.com/in/johndoe",
            "website": "johndoe.dev",
        },
    },
    "professional_summary": (
        "Experienced software engineer with 8+ years of expertise in full-stack "
        "development, specializing in Python, React, and cloud technologies. "
        "Proven track record of leading teams and delivering scalable solutions."
    ),
    "skills": [
        "Python",
        "JavaScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Kubernetes",
        "Git",
        "REST APIs",
    ],
    "work_experience": [
        {
            "job_title": "Senior Software Engineer",
            "company": "TechCorp Inc.",
            "city": "San Francisco",
            "country": "USA",
            "start_date": "2022-03",
            "end_date": None,
            "achievements": [
                "Led development of microservices architecture serving 1M+ users",
                "Mentored 5 junior developers and conducted code reviews",
                "Implemented CI/CD pipeline reducing deployment time by 60%",
                "Optimized database queries improving performance by 40%",
            ],
        },
        {
            "job_title": "Software Engineer",
            "company": "StartupXYZ",
            "city": "Palo Alto",
            "country": "USA",
            "start_date": "2020-01",
            "end_date": "2022-02",
            "achievements": [
                "Developed full-stack web applications using React and Node.js",
                "Collaborated with product team to implement 15+ new features",
                "Reduced page load time by 50% through frontend optimization",
            ],
        },
    ],
    "education": [
        {
            "institution": "Stanford University",
            "degree": "Master of Science in Computer Science",
            "field_of_study": "Computer Science",
            "city": "Stanford",
            "country": "USA",
            "end_date": "2018-05",
        },
        {
            "institution": "University of California, Berkeley",
            "degree": "Bachelor of Science in Computer Engineering",
            "field_of_study": "Computer Engineering",
            "city": "Berkeley",
            "country": "USA",
            "end_date": "2016-05",
        },
    ],
}


def set_cell_border(cell: Any, color: str = "D9DEE3", size: str = "4") -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_cell_outer_border(cell: Any, color: str = "D9DEE3", size: str = "4") -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_cell_top_border(cell: Any, color: str = "D9DEE3", size: str = "4") -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    element = borders.find(qn("w:top"))
    if element is None:
        element = OxmlElement("w:top")
        borders.append(element)
    element.set(qn("w:val"), "single")
    element.set(qn("w:sz"), size)
    element.set(qn("w:space"), "0")
    element.set(qn("w:color"), color)


def set_cell_diagonal_border(cell: Any, color: str = "8B4513", size: str = "8") -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    diagonal = borders.find(qn("w:tl2br"))
    if diagonal is None:
        diagonal = OxmlElement("w:tl2br")
        borders.append(diagonal)
    diagonal.set(qn("w:val"), "single")
    diagonal.set(qn("w:sz"), size)
    diagonal.set(qn("w:space"), "0")
    diagonal.set(qn("w:color"), color)


def set_cell_shading(cell: Any, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shading = tc_pr.find(qn("w:shd"))
    if shading is None:
        shading = OxmlElement("w:shd")
        tc_pr.append(shading)
    shading.set(qn("w:fill"), fill)


def set_cell_margins(
    cell: Any,
    *,
    top: int = 0,
    start: int = 0,
    bottom: int = 0,
    end: int = 0,
) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    values = {
        "top": top,
        "start": start,
        "left": start,
        "bottom": bottom,
        "end": end,
        "right": end,
    }
    for key, value in values.items():
        node = tc_mar.find(qn(f"w:{key}"))
        if node is None:
            node = OxmlElement(f"w:{key}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_width(cell: Any, width_twips: int) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:type"), "dxa")
    tc_w.set(qn("w:w"), str(width_twips))


def set_table_width(table: Any, width_twips: int) -> None:
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:type"), "dxa")
    tbl_w.set(qn("w:w"), str(width_twips))


def set_table_grid(table: Any, column_widths_twips: list[int]) -> None:
    existing_grid = table._tbl.tblGrid
    if existing_grid is not None:
        table._tbl.remove(existing_grid)
    grid = OxmlElement("w:tblGrid")
    for width in column_widths_twips:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    table._tbl.insert(1, grid)


def set_paragraph_bottom_border(paragraph: Any, color: str = "BDC3C7", size: str = "8") -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    p_borders = p_pr.first_child_found_in("w:pBdr")
    if p_borders is None:
        p_borders = OxmlElement("w:pBdr")
        p_pr.append(p_borders)
    bottom = p_borders.find(qn("w:bottom"))
    if bottom is None:
        bottom = OxmlElement("w:bottom")
        p_borders.append(bottom)
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color)


def remove_paragraph(paragraph: Any) -> None:
    paragraph._element.getparent().remove(paragraph._element)
    paragraph._p = paragraph._element = None


def set_paragraph_spacing(paragraph: Any, before: int = 0, after: int = 0, line: float = 1.08) -> None:
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing = line


def apply_run(run: Any, *, size: int, color: str = "333333", bold: bool = False, italic: bool = False) -> None:
    run.font.name = "Arial"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic


def apply_source_sans(run: Any, *, size: int, color: str = "333333", bold: bool = False, italic: bool = False) -> None:
    run.font.name = "Arial"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic


def add_styled_paragraph(
    doc: Any,
    text: str,
    *,
    size: int = 10,
    color: str = "333333",
    bold: bool = False,
    italic: bool = False,
    before: int = 0,
    after: int = 0,
    line: float = 1.08,
    uppercase: bool = False,
    align: WD_ALIGN_PARAGRAPH | None = None,
) -> Any:
    paragraph = doc.add_paragraph()
    if align is not None:
        paragraph.alignment = align
    set_paragraph_spacing(paragraph, before=before, after=after, line=line)
    run = paragraph.add_run(text.upper() if uppercase else text)
    apply_run(run, size=size, color=color, bold=bold, italic=italic)
    return paragraph


def add_source_paragraph(
    container: Any,
    text: str,
    *,
    size: int = 10,
    color: str = "333333",
    bold: bool = False,
    italic: bool = False,
    before: int = 0,
    after: int = 0,
    line: float = 1.08,
    uppercase: bool = False,
    align: WD_ALIGN_PARAGRAPH | None = None,
    left_indent_cm: float | None = None,
) -> Any:
    paragraph = container.add_paragraph()
    if align is not None:
        paragraph.alignment = align
    if left_indent_cm is not None:
        paragraph.paragraph_format.left_indent = Cm(left_indent_cm)
    set_paragraph_spacing(paragraph, before=before, after=after, line=line)
    run = paragraph.add_run(text.upper() if uppercase else text)
    apply_source_sans(run, size=size, color=color, bold=bold, italic=italic)
    return paragraph


def add_source_split_line(
    container: Any,
    left_text: str,
    right_text: str,
    *,
    left_size: int = 11,
    right_size: int = 9,
    after: int = 3,
    line: float = 1.0,
    tab_stop_cm: float = 10.95,
) -> Any:
    paragraph = container.add_paragraph()
    paragraph.paragraph_format.tab_stops.add_tab_stop(Cm(tab_stop_cm), WD_TAB_ALIGNMENT.RIGHT)
    set_paragraph_spacing(paragraph, after=after, line=line)
    left_run = paragraph.add_run(left_text)
    apply_source_sans(left_run, size=left_size, color="2C3E50", bold=True)
    right_run = paragraph.add_run(f"\t{right_text}")
    apply_source_sans(right_run, size=right_size, color="7F8C8D", italic=True)
    return paragraph


def add_source_two_col_line(
    container: Any,
    left_text: str,
    right_text: str,
    *,
    left_width: int,
    right_width: int,
    left_size: int = 11,
    right_size: int = 9,
) -> Any:
    table = container.add_table(rows=1, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, left_width + right_width)
    set_table_grid(table, [left_width, right_width])
    table.columns[0].width = Twips(left_width)
    table.columns[1].width = Twips(right_width)
    for index, cell in enumerate(table.rows[0].cells):
        set_cell_border(cell, color="FFFFFF", size="0")
        set_cell_width(cell, [left_width, right_width][index])
        set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
        set_paragraph_spacing(cell.paragraphs[0], after=0, line=0.95)
    left_run = table.cell(0, 0).paragraphs[0].add_run(left_text)
    apply_source_sans(left_run, size=left_size, color="2C3E50", bold=True)
    right_p = table.cell(0, 1).paragraphs[0]
    right_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    right_run = right_p.add_run(right_text)
    apply_source_sans(right_run, size=right_size, color="7F8C8D", italic=True)
    return table


def add_source_education_entry(
    container: Any,
    degree: str,
    date: str,
    institution: str,
) -> Any:
    table = container.add_table(rows=2, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, 6219)
    set_table_grid(table, [3880, 2339])
    table.columns[0].width = Twips(3880)
    table.columns[1].width = Twips(2339)
    for row in table.rows:
        for index, cell in enumerate(row.cells):
            set_cell_border(cell, color="FFFFFF", size="0")
            set_cell_width(cell, [3880, 2339][index])
            set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    left = table.cell(0, 0)
    set_paragraph_spacing(left.paragraphs[0], after=0, line=0.95)
    degree_run = left.paragraphs[0].add_run(degree)
    apply_source_sans(degree_run, size=11, color="2C3E50", bold=True)

    right = table.cell(0, 1)
    set_paragraph_spacing(right.paragraphs[0], after=0, line=0.95)
    right.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    date_run = right.paragraphs[0].add_run(date)
    apply_source_sans(date_run, size=9, color="7F8C8D", italic=True)

    institution_cell = table.cell(1, 0).merge(table.cell(1, 1))
    set_cell_border(institution_cell, color="FFFFFF", size="0")
    set_cell_margins(institution_cell, top=0, start=0, bottom=0, end=0)
    set_paragraph_spacing(institution_cell.paragraphs[0], after=0, line=0.95)
    institution_run = institution_cell.paragraphs[0].add_run(institution)
    apply_source_sans(institution_run, size=10, color="34495E", bold=False)
    return table


def add_source_manual_bullet(
    container: Any,
    text: str,
    *,
    size: int,
    color: str,
    left_indent_cm: float,
    after: int,
    line: float,
) -> Any:
    paragraph = container.add_paragraph()
    paragraph.paragraph_format.left_indent = Cm(left_indent_cm)
    set_paragraph_spacing(paragraph, after=after, line=line)
    run = paragraph.add_run(f"• {text}")
    apply_source_sans(run, size=size, color=color)
    return paragraph


def add_section_heading(doc: Document, text: str) -> None:
    paragraph = add_styled_paragraph(
        doc,
        text,
        size=12,
        color="2C3E50",
        bold=True,
        after=7,
        uppercase=True,
    )
    set_paragraph_bottom_border(paragraph)


def add_professional_heading(container: Any, text: str, *, before: int = 0, after: int = 8) -> Any:
    return add_styled_paragraph(
        container,
        text,
        size=14,
        color="2C3E50",
        bold=True,
        before=before,
        after=after,
        line=1.0,
        uppercase=True,
    )


def add_professional_skill_pair(container: Any) -> Any:
    table = container.add_table(rows=1, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, 11000)
    set_table_grid(table, [5500, 5500])
    for index, cell in enumerate(table.rows[0].cells):
        set_cell_border(cell, color="FFFFFF", size="0")
        set_cell_width(cell, 5500)
        set_cell_margins(cell, top=0, start=0, bottom=0, end=160)
        paragraph = cell.paragraphs[0]
        set_paragraph_spacing(paragraph, after=5, line=1.0)
        value = "{{ row." + ("left" if index == 0 else "right") + " }}"
        bullet = paragraph.add_run("•  ")
        apply_run(bullet, size=10, color="8B4513")
        run = paragraph.add_run(value)
        apply_run(run, size=10, color="555555")
    return table


def add_professional_education_entry(
    container: Any,
    degree: str,
    date: str,
    institution: str,
) -> Any:
    table = container.add_table(rows=2, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, 11000)
    set_table_grid(table, [8200, 2800])
    for row in table.rows:
        for index, cell in enumerate(row.cells):
            set_cell_border(cell, color="FFFFFF", size="0")
            set_cell_width(cell, [8200, 2800][index])
            set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    left = table.cell(0, 0)
    set_paragraph_spacing(left.paragraphs[0], after=0, line=1.0)
    degree_run = left.paragraphs[0].add_run(degree)
    apply_run(degree_run, size=11, color="2C3E50", bold=True)

    right = table.cell(0, 1)
    set_paragraph_spacing(right.paragraphs[0], after=0, line=1.0)
    right.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    date_run = right.paragraphs[0].add_run(date)
    apply_run(date_run, size=10, color="7F8C8D", italic=True)

    institution_cell = table.cell(1, 0).merge(table.cell(1, 1))
    set_cell_border(institution_cell, color="FFFFFF", size="0")
    set_cell_margins(institution_cell, top=0, start=0, bottom=0, end=0)
    set_paragraph_spacing(institution_cell.paragraphs[0], after=0, line=1.0)
    institution_run = institution_cell.paragraphs[0].add_run(institution)
    apply_run(institution_run, size=10, color="34495E")
    return table


def add_frame_heading(container: Any, text: str, *, label_width: int, line_chars: int) -> Any:
    table_width = 11000
    table = container.add_table(rows=1, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, table_width)
    set_table_grid(table, [label_width, table_width - label_width])
    for index, cell in enumerate(table.rows[0].cells):
        set_cell_border(cell, color="FFFFFF", size="0")
        set_cell_width(cell, [label_width, table_width - label_width][index])
        set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

    label_p = table.cell(0, 0).paragraphs[0]
    set_paragraph_spacing(label_p, after=0, line=1.0)
    label_run = label_p.add_run(text.upper())
    apply_run(label_run, size=12, color="2C3E50", bold=True)

    line_p = table.cell(0, 1).paragraphs[0]
    line_cell = table.cell(0, 1)
    set_cell_margins(line_cell, top=0, start=0, bottom=0, end=0)
    set_paragraph_spacing(line_p, after=0, line=0.7)
    line_run = line_p.add_run("─" * line_chars)
    apply_run(line_run, size=8, color="DDDDDD")
    return table


def add_frame_skill_pair(container: Any) -> Any:
    table = container.add_table(rows=1, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, 11000)
    set_table_grid(table, [5500, 5500])
    for index, cell in enumerate(table.rows[0].cells):
        set_cell_border(cell, color="FFFFFF", size="0")
        set_cell_width(cell, 5500)
        set_cell_margins(cell, top=0, start=0, bottom=0, end=160)
        paragraph = cell.paragraphs[0]
        set_paragraph_spacing(paragraph, after=4, line=1.0)
        value = "{{ row." + ("left" if index == 0 else "right") + " }}"
        bullet = paragraph.add_run("•  ")
        apply_run(bullet, size=10, color="8B4513")
        run = paragraph.add_run(value)
        apply_run(run, size=10, color="555555")
    return table


def add_frame_education_entry(
    container: Any,
    degree: str,
    date: str,
    institution: str,
) -> Any:
    table = container.add_table(rows=2, cols=2)
    table.autofit = False
    table.allow_autofit = False
    set_table_width(table, 11000)
    set_table_grid(table, [8200, 2800])
    for row in table.rows:
        for index, cell in enumerate(row.cells):
            set_cell_border(cell, color="FFFFFF", size="0")
            set_cell_width(cell, [8200, 2800][index])
            set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    degree_p = table.cell(0, 0).paragraphs[0]
    set_paragraph_spacing(degree_p, after=0, line=1.0)
    degree_run = degree_p.add_run(degree)
    apply_run(degree_run, size=11, color="2C3E50", bold=True)

    date_p = table.cell(0, 1).paragraphs[0]
    set_paragraph_spacing(date_p, after=0, line=1.0)
    date_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    date_run = date_p.add_run(date)
    apply_run(date_run, size=10, color="7F8C8D", italic=True)

    institution_cell = table.cell(1, 0).merge(table.cell(1, 1))
    set_cell_border(institution_cell, color="FFFFFF", size="0")
    set_cell_margins(institution_cell, top=0, start=0, bottom=0, end=0)
    institution_p = institution_cell.paragraphs[0]
    set_paragraph_spacing(institution_p, after=0, line=1.0)
    institution_run = institution_p.add_run(institution)
    apply_run(institution_run, size=10, color="34495E")
    return table


def generate_professional_logo_image(first_initial: str, last_initial: str) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    size = 180
    brown = "#8B4513"
    image = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    draw.rectangle((5, 5, size - 5, size - 5), outline=brown, width=6)
    draw.line((74, 111, 111, 74), fill=brown, width=3)
    font_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    font = ImageFont.truetype(font_path, 40)
    draw.text((28, 34), first_initial, fill=brown, font=font)
    draw.text((118, 112), last_initial, fill=brown, font=font)
    image.save(PROFESSIONAL_LOGO_PATH)


def add_placeholder_docx_template() -> None:
    TEMPLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.start_type = WD_SECTION.NEW_PAGE
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.4)
    section.bottom_margin = Cm(1.35)
    section.left_margin = Cm(1.45)
    section.right_margin = Cm(1.45)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    normal.font.size = Pt(10)

    title = add_styled_paragraph(
        doc,
        "{{ full_name }}",
        size=22,
        color="2C3E50",
        bold=True,
        after=3,
        line=1.0,
    )
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT

    contact = add_styled_paragraph(
        doc,
        "{{ contact_line }}",
        size=10,
        color="7F8C8D",
        after=15,
        line=1.05,
    )
    set_paragraph_bottom_border(contact, color="E3E7EA", size="6")

    add_section_heading(doc, "Professional Summary")
    add_styled_paragraph(doc, "{{ professional_summary }}", size=10, after=14, line=1.15)

    add_section_heading(doc, "Skills")
    add_styled_paragraph(doc, "{{ skills_line }}", size=10, color="555555", after=14, line=1.15)

    add_section_heading(doc, "Experience")
    add_styled_paragraph(doc, "{%p for exp in work_experience %}", size=1, after=0)
    table = doc.add_table(rows=1, cols=2)
    table.autofit = False
    table.allow_autofit = False
    table.columns[0].width = Cm(11.9)
    table.columns[1].width = Cm(4.2)
    for cell in table.rows[0].cells:
        set_cell_border(cell, color="FFFFFF", size="0")
        cell.paragraphs[0].paragraph_format.space_after = Pt(0)
    left_run = table.cell(0, 0).paragraphs[0].add_run("{{ exp.job_title }}")
    apply_run(left_run, size=11, color="2C3E50", bold=True)
    right_p = table.cell(0, 1).paragraphs[0]
    right_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    right_run = right_p.add_run("{{ exp.period }}")
    apply_run(right_run, size=9, color="7F8C8D", italic=True)
    add_styled_paragraph(
        doc,
        "{{ exp.company_line }}",
        size=10,
        color="34495E",
        bold=True,
        after=4,
        line=1.05,
    )
    add_styled_paragraph(doc, "{%p for achievement in exp.achievements %}", size=1, after=0)
    add_source_manual_bullet(
        doc,
        "{{ achievement }}",
        size=9,
        color="555555",
        left_indent_cm=0.35,
        after=1,
        line=1.12,
    )
    add_styled_paragraph(doc, "{%p endfor %}", size=1, after=0)
    add_styled_paragraph(doc, "", size=1, after=8)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, after=0)

    add_section_heading(doc, "Education")
    add_styled_paragraph(doc, "{%p for edu in education %}", size=1, after=0)
    edu_table = doc.add_table(rows=1, cols=2)
    edu_table.autofit = False
    edu_table.allow_autofit = False
    edu_table.columns[0].width = Cm(11.9)
    edu_table.columns[1].width = Cm(4.2)
    for cell in edu_table.rows[0].cells:
        set_cell_border(cell, color="FFFFFF", size="0")
        cell.paragraphs[0].paragraph_format.space_after = Pt(0)
    edu_left = edu_table.cell(0, 0).paragraphs[0].add_run("{{ edu.degree }}")
    apply_run(edu_left, size=11, color="2C3E50", bold=True)
    edu_right_p = edu_table.cell(0, 1).paragraphs[0]
    edu_right_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    edu_right = edu_right_p.add_run("{{ edu.end_date }}")
    apply_run(edu_right, size=9, color="7F8C8D", italic=True)
    add_styled_paragraph(
        doc,
        "{{ edu.institution_line }}",
        size=10,
        color="34495E",
        bold=True,
        after=2,
        line=1.05,
    )
    add_styled_paragraph(doc, "{{ edu.field_of_study }}", size=9, color="7F8C8D", italic=True, after=8, line=1.05)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, after=0)

    doc.save(TEMPLATE_PATH)


def add_sidebar_docx_template() -> None:
    SIDEBAR_TEMPLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.start_type = WD_SECTION.NEW_PAGE
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(0)
    section.bottom_margin = Cm(0)
    section.left_margin = Cm(0)
    section.right_margin = Cm(0)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    normal.font.size = Pt(10)

    layout = doc.add_table(rows=1, cols=2)
    layout.alignment = WD_TABLE_ALIGNMENT.LEFT
    layout.autofit = False
    layout.allow_autofit = False
    set_table_width(layout, 11906)
    set_table_grid(layout, [4167, 7739])
    row = layout.rows[0]
    row.height = Cm(29.15)
    row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
    left = row.cells[0]
    right = row.cells[1]
    left.width = Twips(4167)
    right.width = Twips(7739)
    set_cell_width(left, 4167)
    set_cell_width(right, 7739)
    for cell in (left, right):
        set_cell_border(cell, color="FFFFFF", size="0")
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    set_cell_shading(left, "8B4513")
    set_cell_shading(right, "FFFFFF")
    set_cell_margins(left, top=720, start=620, bottom=520, end=560)
    set_cell_margins(right, top=640, start=700, bottom=760, end=700)
    remove_paragraph(left.paragraphs[0])
    remove_paragraph(right.paragraphs[0])

    for field in ("email", "phone", "linkedin"):
        add_source_paragraph(
            left,
            f"{{{{ contacts.{field} }}}}",
            size=10,
            color="FFFFFF",
            bold=False,
            after=6,
            line=1.0,
            left_indent_cm=0.78,
        )
    add_source_paragraph(left, "", size=1, after=20, left_indent_cm=0.78)
    add_source_paragraph(
        left,
        "Skills",
        size=14,
        color="FFFFFF",
        bold=True,
        after=14,
        line=1.0,
        uppercase=True,
        left_indent_cm=0.78,
    )
    add_source_paragraph(left, "{%p for skill in skills %}", size=1, color="8B4513", left_indent_cm=0.78)
    add_source_manual_bullet(
        left,
        "{{ skill }}",
        size=10,
        color="FFFFFF",
        left_indent_cm=0.92,
        after=4,
        line=1.18,
    )
    add_source_paragraph(left, "{%p endfor %}", size=1, color="8B4513", left_indent_cm=0.78)

    add_source_paragraph(
        right,
        "{{ full_name }}",
        size=24,
        color="2C3E50",
        bold=True,
        after=17,
        line=1.0,
    )

    add_source_paragraph(
        right,
        "Professional Summary",
        size=12,
        color="2C3E50",
        bold=True,
        after=8,
        line=1.0,
        uppercase=True,
    )
    add_source_paragraph(
        right,
        "{{ professional_summary }}",
        size=10,
        color="333333",
        after=22,
        line=1.12,
    )

    add_source_paragraph(
        right,
        "Experience",
        size=12,
        color="2C3E50",
        bold=True,
        after=8,
        line=1.0,
        uppercase=True,
    )
    add_source_paragraph(right, "{%p for exp in work_experience %}", size=1, color="FFFFFF")
    add_source_split_line(right, "{{ exp.job_title }}", "{{ exp.period }}", after=3)
    add_source_paragraph(
        right,
        "{{ exp.company_line }}",
        size=10,
        color="34495E",
        bold=True,
        after=5,
        line=1.0,
    )
    add_source_paragraph(right, "{%p for achievement in exp.achievements %}", size=1, color="FFFFFF")
    add_source_manual_bullet(
        right,
        "{{ achievement }}",
        size=9,
        color="555555",
        left_indent_cm=0.25,
        after=2,
        line=1.15,
    )
    add_source_paragraph(right, "{%p endfor %}", size=1, color="FFFFFF")
    add_source_paragraph(right, "", size=1, after=11)
    add_source_paragraph(right, "{%p endfor %}", size=1, color="FFFFFF")

    add_source_paragraph(
        right,
        "Education",
        size=12,
        color="2C3E50",
        bold=True,
        after=8,
        line=1.0,
        uppercase=True,
    )
    add_source_paragraph(right, "{%p for edu in education %}", size=1, color="FFFFFF")
    add_source_education_entry(
        right,
        "{{ edu.degree }}",
        "{{ edu.end_date }}",
        "{{ edu.institution_line }}",
    )
    add_source_paragraph(right, "{%p endfor %}", size=1, color="FFFFFF")

    doc.save(SIDEBAR_TEMPLATE_PATH)


def add_professional_docx_template() -> None:
    PROFESSIONAL_TEMPLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.start_type = WD_SECTION.NEW_PAGE
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(0.55)
    section.bottom_margin = Cm(0.55)
    section.left_margin = Cm(0.8)
    section.right_margin = Cm(0.8)

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    normal.font.size = Pt(10)

    header = doc.add_table(rows=1, cols=3)
    header.autofit = False
    header.allow_autofit = False
    set_table_width(header, 11000)
    set_table_grid(header, [1200, 5800, 4000])
    for index, cell in enumerate(header.rows[0].cells):
        set_cell_border(cell, color="FFFFFF", size="0")
        set_cell_width(cell, [1200, 5800, 4000][index])
        set_cell_margins(cell, top=0, start=0, bottom=0, end=0)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    logo_cell = header.cell(0, 0)
    logo_p = logo_cell.paragraphs[0]
    set_paragraph_spacing(logo_p, after=0, line=1.0)
    logo_p.add_run("{{ logo_image }}")

    name_cell = header.cell(0, 1)
    remove_paragraph(name_cell.paragraphs[0])
    add_styled_paragraph(
        name_cell,
        "{{ first_name_upper }}",
        size=24,
        color="8B4513",
        bold=True,
        after=0,
        line=0.95,
    )
    add_styled_paragraph(
        name_cell,
        "{{ last_name_upper }}",
        size=24,
        color="8B4513",
        bold=True,
        after=0,
        line=0.95,
    )

    contact_cell = header.cell(0, 2)
    remove_paragraph(contact_cell.paragraphs[0])
    for field in ("email", "phone", "linkedin"):
        add_styled_paragraph(
            contact_cell,
            f"{{{{ contacts.{field} }}}}",
            size=10,
            color="333333",
            after=2,
            line=1.0,
            align=WD_ALIGN_PARAGRAPH.RIGHT,
        )
    add_styled_paragraph(doc, "", size=1, after=2)

    add_professional_heading(doc, "Professional Summary")
    add_styled_paragraph(doc, "{{ professional_summary }}", size=10, color="333333", after=13, line=1.18)

    add_professional_heading(doc, "Skills")
    add_styled_paragraph(doc, "{%p for row in skill_pairs %}", size=1, color="FFFFFF")
    add_professional_skill_pair(doc)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")
    add_styled_paragraph(doc, "", size=1, after=6)

    add_professional_heading(doc, "Experience")
    add_styled_paragraph(doc, "{%p for exp in work_experience %}", size=1, color="FFFFFF")
    add_source_split_line(doc, "{{ exp.job_title }}", "{{ exp.period }}", after=3, tab_stop_cm=18.9)
    add_styled_paragraph(doc, "{{ exp.company_line }}", size=10, color="34495E", bold=True, after=4, line=1.0)
    add_styled_paragraph(doc, "{%p for achievement in exp.achievements %}", size=1, color="FFFFFF")
    add_source_manual_bullet(doc, "{{ achievement }}", size=9, color="555555", left_indent_cm=0.35, after=1, line=1.1)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")
    add_styled_paragraph(doc, "", size=1, after=9)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")

    add_professional_heading(doc, "Education")
    add_styled_paragraph(doc, "{%p for edu in education %}", size=1, color="FFFFFF")
    add_professional_education_entry(doc, "{{ edu.degree }}", "{{ edu.end_date }}", "{{ edu.institution_line }}")
    add_styled_paragraph(doc, "", size=1, after=6)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")

    doc.save(PROFESSIONAL_TEMPLATE_PATH)


def add_frame_docx_template() -> None:
    FRAME_TEMPLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.start_type = WD_SECTION.NEW_PAGE
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(0.55)
    section.bottom_margin = Cm(0.55)
    section.left_margin = Cm(0.8)
    section.right_margin = Cm(0.8)

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
    normal.font.size = Pt(10)

    add_styled_paragraph(
        doc,
        "{{ full_name }}",
        size=27,
        color="8B4513",
        bold=True,
        after=6,
        line=1.0,
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    for field in ("email", "phone", "linkedin", "website"):
        add_styled_paragraph(
            doc,
            f"{{{{ contacts.{field} }}}}",
            size=10,
            color="333333",
            after=2,
            line=1.0,
            align=WD_ALIGN_PARAGRAPH.CENTER,
        )
    add_styled_paragraph(doc, "", size=1, after=7)

    add_frame_heading(doc, "Professional Summary", label_width=3600, line_chars=58)
    add_styled_paragraph(doc, "{{ professional_summary }}", size=10, color="333333", after=13, line=1.18)

    add_frame_heading(doc, "Skills", label_width=1000, line_chars=82)
    add_styled_paragraph(doc, "{%p for row in skill_pairs %}", size=1, color="FFFFFF")
    add_frame_skill_pair(doc)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")
    add_styled_paragraph(doc, "", size=1, after=6)

    add_frame_heading(doc, "Experience", label_width=2000, line_chars=74)
    add_styled_paragraph(doc, "{%p for exp in work_experience %}", size=1, color="FFFFFF")
    add_source_split_line(
        doc,
        "{{ exp.job_title }}",
        "{{ exp.period }}",
        left_size=11,
        right_size=10,
        after=3,
        tab_stop_cm=18.9,
    )
    add_styled_paragraph(doc, "{{ exp.company_line }}", size=10, color="34495E", bold=False, after=4, line=1.0)
    add_styled_paragraph(doc, "{%p for achievement in exp.achievements %}", size=1, color="FFFFFF")
    add_source_manual_bullet(doc, "{{ achievement }}", size=9, color="555555", left_indent_cm=0.35, after=1, line=1.1)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")
    add_styled_paragraph(doc, "", size=1, after=9)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")

    add_frame_heading(doc, "Education", label_width=1900, line_chars=75)
    add_styled_paragraph(doc, "{%p for edu in education %}", size=1, color="FFFFFF")
    add_frame_education_entry(doc, "{{ edu.degree }}", "{{ edu.end_date }}", "{{ edu.institution_line }}")
    add_styled_paragraph(doc, "", size=1, after=6)
    add_styled_paragraph(doc, "{%p endfor %}", size=1, color="FFFFFF")

    doc.save(FRAME_TEMPLATE_PATH)


def format_date(value: str | None) -> str:
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


def build_context(resume: dict[str, Any]) -> dict[str, Any]:
    personal = resume.get("personal_info") or {}
    contacts = personal.get("contacts") or {}
    first_name = personal.get("first_name") or ""
    last_name = personal.get("last_name") or ""
    full_name = " ".join(part for part in [personal.get("first_name"), personal.get("last_name")] if part)
    contact_parts = [
        contacts.get("email"),
        contacts.get("phone"),
        contacts.get("linkedin"),
        contacts.get("website"),
    ]
    work_experience = []
    for exp in resume.get("work_experience") or []:
        start = format_date(exp.get("start_date"))
        end = format_date(exp.get("end_date")) if exp.get("end_date") else "Present"
        location = ", ".join(part for part in [exp.get("city"), exp.get("country")] if part)
        work_experience.append(
            {
                **exp,
                "period": f"{start} - {end}" if start else end,
                "company_line": " | ".join(part for part in [exp.get("company"), location] if part),
            }
        )
    education = []
    for edu in resume.get("education") or []:
        location = ", ".join(part for part in [edu.get("city"), edu.get("country")] if part)
        education.append(
            {
                **edu,
                "end_date": format_date(edu.get("end_date")),
                "institution_line": ", ".join(part for part in [edu.get("institution"), location] if part),
            }
        )
    skills = resume.get("skills") or []
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
        "professional_summary": resume.get("professional_summary") or "",
        "skills": skills,
        "skill_pairs": skill_pairs,
        "skills_line": " • ".join(skills),
        "work_experience": work_experience,
        "education": education,
    }


def render_filled_docx() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SAMPLE_JSON_PATH.write_text(json.dumps(SAMPLE_RESUME, ensure_ascii=False, indent=2), encoding="utf-8")
    template = DocxTemplate(TEMPLATE_PATH)
    template.render(build_context(SAMPLE_RESUME))
    template.save(FILLED_DOCX_PATH)


def render_sidebar_filled_docx() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SIDEBAR_SAMPLE_JSON_PATH.write_text(json.dumps(SAMPLE_RESUME, ensure_ascii=False, indent=2), encoding="utf-8")
    template = DocxTemplate(SIDEBAR_TEMPLATE_PATH)
    template.render(build_context(SAMPLE_RESUME))
    template.save(SIDEBAR_FILLED_DOCX_PATH)


def render_professional_filled_docx() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PROFESSIONAL_SAMPLE_JSON_PATH.write_text(json.dumps(SAMPLE_RESUME, ensure_ascii=False, indent=2), encoding="utf-8")
    template = DocxTemplate(PROFESSIONAL_TEMPLATE_PATH)
    context = build_context(SAMPLE_RESUME)
    generate_professional_logo_image(context["first_initial"], context["last_initial"])
    context["logo_image"] = InlineImage(template, str(PROFESSIONAL_LOGO_PATH), width=Cm(1.55), height=Cm(1.55))
    template.render(context)
    template.save(PROFESSIONAL_FILLED_DOCX_PATH)


def render_frame_filled_docx() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    FRAME_SAMPLE_JSON_PATH.write_text(json.dumps(SAMPLE_RESUME, ensure_ascii=False, indent=2), encoding="utf-8")
    template = DocxTemplate(FRAME_TEMPLATE_PATH)
    template.render(build_context(SAMPLE_RESUME))
    template.save(FRAME_FILLED_DOCX_PATH)


def build_clarity_html(resume: dict[str, Any]) -> str:
    context = build_context(resume)

    def esc(value: Any) -> str:
        return html.escape(str(value or ""))

    skills_html = "".join(f"<span>{esc(skill)}</span>" for skill in resume.get("skills") or [])
    exp_html = ""
    for exp in context["work_experience"]:
        achievements = "".join(f"<li>{esc(item)}</li>" for item in exp.get("achievements") or [])
        exp_html += f"""
          <div class="entry">
            <div class="entry-head">
              <h3>{esc(exp.get("job_title"))}</h3>
              <div class="period">{esc(exp.get("period"))}</div>
            </div>
            <div class="company">{esc(exp.get("company_line"))}</div>
            <ul>{achievements}</ul>
          </div>
        """
    edu_html = ""
    for edu in context["education"]:
        edu_html += f"""
          <div class="entry">
            <div class="entry-head">
              <h3>{esc(edu.get("degree"))}</h3>
              <div class="period">{esc(edu.get("end_date"))}</div>
            </div>
            <div class="company">{esc(edu.get("institution_line"))}</div>
            <div class="field">{esc(edu.get("field_of_study"))}</div>
          </div>
        """
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: A4; margin: 0; }}
    body {{ margin: 0; background: #fff; font-family: Arial, sans-serif; color: #333; }}
    .page {{ width: 794px; height: 1123px; padding: 40px; box-sizing: border-box; overflow: hidden; }}
    .header {{ margin-bottom: 24px; border-bottom: 1px solid #e3e7ea; padding-bottom: 16px; }}
    h1 {{ font-size: 28px; line-height: 1.15; margin: 0 0 8px 0; color: #2c3e50; font-weight: 700; }}
    .contact {{ font-size: 14px; color: #7f8c8d; }}
    section {{ margin-bottom: 24px; }}
    h2 {{ font-size: 16px; line-height: 1.2; margin: 0 0 12px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; }}
    p {{ font-size: 14px; line-height: 1.7; text-align: justify; margin: 0; }}
    .skills {{ display: flex; flex-wrap: wrap; gap: 0; font-size: 14px; color: #555; }}
    .skills span:not(:last-child)::after {{ content: "•"; color: #bdc3c7; margin: 0 8px; }}
    .entry {{ margin-bottom: 16px; }}
    .entry-head {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 4px; }}
    h3 {{ font-size: 15px; line-height: 1.25; margin: 0; color: #2c3e50; font-weight: 700; }}
    .period {{ font-size: 13px; color: #7f8c8d; font-style: italic; white-space: nowrap; }}
    .company {{ font-size: 14px; color: #34495e; margin-bottom: 8px; font-weight: 500; }}
    .field {{ font-size: 13px; color: #7f8c8d; font-style: italic; margin-top: 2px; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ font-size: 13px; color: #555; margin-bottom: 2px; line-height: 1.5; }}
  </style>
</head>
<body>
  <main class="page">
    <div class="header">
      <h1>{esc(context["full_name"])}</h1>
      <div class="contact">{esc(context["contact_line"])}</div>
    </div>
    <section>
      <h2>Professional Summary</h2>
      <p>{esc(context["professional_summary"])}</p>
    </section>
    <section>
      <h2>Skills</h2>
      <div class="skills">{skills_html}</div>
    </section>
    <section>
      <h2>Experience</h2>
      {exp_html}
    </section>
    <section>
      <h2>Education</h2>
      {edu_html}
    </section>
  </main>
</body>
</html>"""


def build_sidebar_html(resume: dict[str, Any]) -> str:
    context = build_context(resume)

    def esc(value: Any) -> str:
        return html.escape(str(value or ""))

    contact_html = "".join(
        f"<div>{esc(context['contacts'][field])}</div>"
        for field in ("email", "phone", "linkedin")
        if context["contacts"].get(field)
    )
    skills_html = "".join(f"<li>{esc(skill)}</li>" for skill in context["skills"])
    exp_html = ""
    for exp in context["work_experience"]:
        achievements = "".join(f"<li>{esc(item)}</li>" for item in exp.get("achievements") or [])
        exp_html += f"""
          <div class="entry">
            <div class="entry-head">
              <h3>{esc(exp.get("job_title"))}</h3>
              <div class="period">{esc(exp.get("period"))}</div>
            </div>
            <div class="company">{esc(exp.get("company_line"))}</div>
            <ul>{achievements}</ul>
          </div>
        """
    edu_html = ""
    for edu in context["education"]:
        edu_html += f"""
          <div class="entry education-entry">
            <div class="entry-head">
              <h3>{esc(edu.get("degree"))}</h3>
              <div class="period">{esc(edu.get("end_date"))}</div>
            </div>
            <div class="company">{esc(edu.get("institution_line"))}</div>
          </div>
        """
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: A4; margin: 0; }}
    body {{ margin: 0; background: #fff; font-family: "Source Sans Pro", "Liberation Sans", Arial, sans-serif; color: #333; }}
    .page {{ width: 794px; height: 1123px; display: flex; overflow: hidden; }}
    .sidebar {{ width: 35%; background: #8B4513; color: #fff; padding: 40px 30px; box-sizing: border-box; }}
    .main {{ width: 65%; background: #fff; padding: 40px; box-sizing: border-box; }}
    .contact {{ margin-bottom: 40px; }}
    .contact div {{ font-size: 14px; line-height: 1.6; margin-bottom: 8px; font-weight: 500; }}
    .side-title {{ font-size: 18px; line-height: 1.2; margin: 0 0 20px 0; color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }}
    .side-skills {{ margin: 0; padding-left: 20px; }}
    .side-skills li {{ font-size: 14px; line-height: 1.4; margin-bottom: 8px; }}
    h1 {{ font-size: 32px; line-height: 1.15; margin: 0 0 20px 0; color: #2c3e50; font-weight: 700; }}
    section {{ margin-bottom: 30px; }}
    h2 {{ font-size: 16px; line-height: 1.2; margin: 0 0 12px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }}
    p {{ font-size: 14px; line-height: 1.7; text-align: justify; margin: 0; }}
    .entry {{ margin-bottom: 20px; }}
    .education-entry {{ margin-bottom: 16px; }}
    .entry-head {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 4px; }}
    h3 {{ font-size: 15px; line-height: 1.25; margin: 0; color: #2c3e50; font-weight: 700; }}
    .period {{ font-size: 13px; color: #7f8c8d; font-style: italic; text-align: right; min-width: 128px; }}
    .company {{ font-size: 14px; color: #34495e; margin-bottom: 8px; font-weight: 500; }}
    ul {{ margin: 0; padding-left: 20px; }}
    .main li {{ font-size: 13px; color: #555; margin-bottom: 2px; line-height: 1.5; }}
  </style>
</head>
<body>
  <main class="page">
    <aside class="sidebar">
      <div class="contact">{contact_html}</div>
      <h2 class="side-title">Skills</h2>
      <ul class="side-skills">{skills_html}</ul>
    </aside>
    <section class="main">
      <h1>{esc(context["full_name"])}</h1>
      <section>
        <h2>Professional Summary</h2>
        <p>{esc(context["professional_summary"])}</p>
      </section>
      <section>
        <h2>Experience</h2>
        {exp_html}
      </section>
      <section>
        <h2>Education</h2>
        {edu_html}
      </section>
    </section>
  </main>
</body>
</html>"""


def build_professional_html(resume: dict[str, Any]) -> str:
    context = build_context(resume)

    def esc(value: Any) -> str:
        return html.escape(str(value or ""))

    contact_html = "".join(
        f"<div>{esc(context['contacts'][field])}</div>"
        for field in ("email", "phone", "linkedin")
        if context["contacts"].get(field)
    )
    skills_html = "".join(f"<div><span>•</span>{esc(skill)}</div>" for skill in context["skills"])
    exp_html = ""
    for exp in context["work_experience"]:
        achievements = "".join(f"<li>{esc(item)}</li>" for item in exp.get("achievements") or [])
        exp_html += f"""
          <div class="entry">
            <div class="entry-head">
              <h3>{esc(exp.get("job_title"))}</h3>
              <div class="period">{esc(exp.get("period"))}</div>
            </div>
            <div class="company">{esc(exp.get("company_line"))}</div>
            <ul>{achievements}</ul>
          </div>
        """
    edu_html = ""
    for edu in context["education"]:
        edu_html += f"""
          <div class="entry education-entry">
            <div class="entry-head">
              <h3>{esc(edu.get("degree"))}</h3>
              <div class="period">{esc(edu.get("end_date"))}</div>
            </div>
            <div class="company">{esc(edu.get("institution_line"))}</div>
          </div>
        """
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: A4; margin: 0; }}
    body {{ margin: 0; background: #fff; font-family: Arial, sans-serif; color: #333; }}
    .page {{ width: 794px; height: 1123px; padding: 20px 30px; box-sizing: border-box; overflow: hidden; }}
    .header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }}
    .brand {{ display: flex; align-items: flex-start; min-width: 0; }}
    .logo {{ width: 60px; height: 60px; border: 2px solid #8B4513; margin-right: 20px; position: relative; box-sizing: border-box; flex: 0 0 auto; }}
    .logo::before {{ content: ""; position: absolute; left: 29px; top: 14px; width: 1px; height: 30px; background: #8B4513; transform: rotate(45deg); }}
    .initial-a {{ position: absolute; top: 8px; left: 8px; font-size: 16px; color: #8B4513; font-weight: 700; }}
    .initial-b {{ position: absolute; right: 8px; bottom: 8px; font-size: 16px; color: #8B4513; font-weight: 700; }}
    h1 {{ font-size: 32px; line-height: 1.1; margin: 0 0 4px 0; color: #8B4513; font-weight: 700; text-transform: uppercase; }}
    .surname {{ margin-bottom: 0; }}
    .contact {{ text-align: right; max-width: 35%; font-size: 14px; line-height: 1.4; color: #333; }}
    .contact div {{ margin-bottom: 4px; }}
    section {{ margin-bottom: 15px; }}
    h2 {{ font-size: 16px; line-height: 1.2; margin: 0 0 12px 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }}
    p {{ font-size: 14px; line-height: 1.7; text-align: justify; margin: 0; }}
    .skills {{ display: grid; grid-template-columns: 1fr 1fr; column-gap: 8px; row-gap: 8px; }}
    .skills div {{ font-size: 14px; color: #555; }}
    .skills span {{ color: #8B4513; margin-right: 8px; }}
    .entry {{ margin-bottom: 20px; }}
    .education-entry {{ margin-bottom: 16px; }}
    .entry-head {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 4px; }}
    h3 {{ font-size: 15px; line-height: 1.25; margin: 0; color: #2c3e50; font-weight: 700; }}
    .period {{ font-size: 13px; color: #7f8c8d; font-style: italic; text-align: right; min-width: 128px; }}
    .company {{ font-size: 14px; color: #34495e; margin-bottom: 8px; font-weight: 500; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ font-size: 13px; color: #555; margin-bottom: 2px; line-height: 1.5; }}
  </style>
</head>
<body>
  <main class="page">
    <div class="header">
      <div class="brand">
        <div class="logo">
          <div class="initial-a">{esc(context["first_initial"])}</div>
          <div class="initial-b">{esc(context["last_initial"])}</div>
        </div>
        <div>
          <h1>{esc(context["first_name_upper"])}</h1>
          <h1 class="surname">{esc(context["last_name_upper"])}</h1>
        </div>
      </div>
      <div class="contact">{contact_html}</div>
    </div>
    <section>
      <h2>Professional Summary</h2>
      <p>{esc(context["professional_summary"])}</p>
    </section>
    <section>
      <h2>Skills</h2>
      <div class="skills">{skills_html}</div>
    </section>
    <section>
      <h2>Experience</h2>
      {exp_html}
    </section>
    <section>
      <h2>Education</h2>
      {edu_html}
    </section>
  </main>
</body>
</html>"""


def build_frame_html(resume: dict[str, Any]) -> str:
    context = build_context(resume)

    def esc(value: Any) -> str:
        return html.escape(str(value or ""))

    contact_html = "".join(
        f"<div>{esc(context['contacts'][field])}</div>"
        for field in ("email", "phone", "linkedin", "website")
        if context["contacts"].get(field)
    )
    skills_html = "".join(f"<div><span>•</span>{esc(skill)}</div>" for skill in context["skills"])
    exp_html = ""
    for exp in context["work_experience"]:
        achievements = "".join(f"<li>{esc(item)}</li>" for item in exp.get("achievements") or [])
        exp_html += f"""
          <div class="entry">
            <div class="entry-head">
              <h3>{esc(exp.get("job_title"))}</h3>
              <div class="period">{esc(exp.get("period"))}</div>
            </div>
            <div class="company">{esc(exp.get("company_line"))}</div>
            <ul>{achievements}</ul>
          </div>
        """
    edu_html = ""
    for edu in context["education"]:
        edu_html += f"""
          <div class="entry education-entry">
            <div class="entry-head">
              <h3>{esc(edu.get("degree"))}</h3>
              <div class="period">{esc(edu.get("end_date"))}</div>
            </div>
            <div class="company">{esc(edu.get("institution_line"))}</div>
          </div>
        """
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: A4; margin: 0; }}
    body {{ margin: 0; background: #fff; font-family: Arial, sans-serif; color: #333; }}
    .page {{ width: 794px; height: 1123px; padding: 20px 30px; box-sizing: border-box; overflow: hidden; }}
    .header {{ text-align: center; margin-bottom: 20px; }}
    h1 {{ font-size: 36px; line-height: 1.1; margin: 0 0 12px 0; color: #8B4513; font-weight: 700; }}
    .contact {{ margin-top: 8px; }}
    .contact div {{ font-size: 14px; line-height: 1.4; margin-bottom: 4px; color: #333; }}
    section {{ margin-bottom: 15px; }}
    .section-head {{ display: flex; align-items: center; margin-bottom: 12px; }}
    h2 {{ font-size: 16px; line-height: 1.2; margin: 0 10px 0 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }}
    .rule {{ flex: 1; height: 1px; background: #ddd; margin-left: 10px; }}
    p {{ font-size: 14px; line-height: 1.7; text-align: justify; margin: 0; }}
    .skills {{ display: grid; grid-template-columns: 1fr 1fr; column-gap: 8px; row-gap: 8px; }}
    .skills div {{ font-size: 14px; color: #555; }}
    .skills span {{ color: #8B4513; margin-right: 8px; }}
    .entry {{ margin-bottom: 20px; }}
    .education-entry {{ margin-bottom: 16px; }}
    .entry-head {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 4px; }}
    h3 {{ font-size: 15px; line-height: 1.25; margin: 0; color: #2c3e50; font-weight: 700; }}
    .period {{ font-size: 13px; color: #7f8c8d; font-style: italic; text-align: right; min-width: 128px; }}
    .company {{ font-size: 14px; color: #34495e; margin-bottom: 8px; font-weight: 500; }}
    ul {{ margin: 0; padding-left: 20px; }}
    li {{ font-size: 13px; color: #555; margin-bottom: 2px; line-height: 1.5; }}
  </style>
</head>
<body>
  <main class="page">
    <div class="header">
      <h1>{esc(context["full_name"])}</h1>
      <div class="contact">{contact_html}</div>
    </div>
    <section>
      <div class="section-head"><h2>Professional Summary</h2><div class="rule"></div></div>
      <p>{esc(context["professional_summary"])}</p>
    </section>
    <section>
      <div class="section-head"><h2>Skills</h2><div class="rule"></div></div>
      <div class="skills">{skills_html}</div>
    </section>
    <section>
      <div class="section-head"><h2>Experience</h2><div class="rule"></div></div>
      {exp_html}
    </section>
    <section>
      <div class="section-head"><h2>Education</h2><div class="rule"></div></div>
      {edu_html}
    </section>
  </main>
</body>
</html>"""


def render_pdf_from_html(html_content: str, output_path: Path) -> None:
    import os
    import sys

    local_env = {
        "FRONTEND_BASE_URL": "http://localhost:5173",
        "API_BASE_URL": "http://localhost:8000",
        "SECRET_KEY": "local-prototype-secret-key",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "postgres",
        "POSTGRES_DB": "rezynt",
        "EMAIL_HOST": "localhost",
        "EMAIL_PORT": "465",
        "EMAIL_USERNAME": "prototype@example.com",
        "EMAIL_PASSWORD": "prototype",
        "EMAIL_DKIM_PRIVATE_KEY_PATH": "/tmp/nonexistent-dkim.private",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "REDIS_DB": "0",
        "OPENAI_API_KEY": "prototype",
        "OPENAI_PROXY_URL": "http://localhost",
        "PLATFORM_SCRATCH_APP_KEY": "prototype",
        "PLATFORM_UPLOAD_APP_KEY": "prototype",
        "PLATFORM_APP_URL": "http://localhost",
        "APP_API_KEY": "prototype",
    }
    for key, value in local_env.items():
        os.environ.setdefault(key, value)
    os.environ.setdefault("DYLD_FALLBACK_LIBRARY_PATH", "/opt/homebrew/lib")

    sys.path.insert(0, str(BACKEND))
    from app.services.pdf_service import pdf_service

    pdf_bytes, _ = pdf_service.generate_pdf_from_html(
        html_content=html_content,
        filename=output_path.name,
        use_watermark=False,
    )
    output_path.write_bytes(pdf_bytes)


def render_pdf() -> None:
    render_pdf_from_html(build_clarity_html(SAMPLE_RESUME), PDF_PATH)


def render_sidebar_pdf() -> None:
    render_pdf_from_html(build_sidebar_html(SAMPLE_RESUME), SIDEBAR_PDF_PATH)


def render_professional_pdf() -> None:
    render_pdf_from_html(build_professional_html(SAMPLE_RESUME), PROFESSIONAL_PDF_PATH)


def render_frame_pdf() -> None:
    render_pdf_from_html(build_frame_html(SAMPLE_RESUME), FRAME_PDF_PATH)


def main() -> None:
    add_placeholder_docx_template()
    add_sidebar_docx_template()
    add_professional_docx_template()
    add_frame_docx_template()
    render_filled_docx()
    render_sidebar_filled_docx()
    render_professional_filled_docx()
    render_frame_filled_docx()
    render_pdf()
    render_sidebar_pdf()
    render_professional_pdf()
    render_frame_pdf()
    print(TEMPLATE_PATH)
    print(FILLED_DOCX_PATH)
    print(PDF_PATH)
    print(SIDEBAR_TEMPLATE_PATH)
    print(SIDEBAR_FILLED_DOCX_PATH)
    print(SIDEBAR_PDF_PATH)
    print(PROFESSIONAL_TEMPLATE_PATH)
    print(PROFESSIONAL_FILLED_DOCX_PATH)
    print(PROFESSIONAL_PDF_PATH)
    print(FRAME_TEMPLATE_PATH)
    print(FRAME_FILLED_DOCX_PATH)
    print(FRAME_PDF_PATH)


if __name__ == "__main__":
    main()
