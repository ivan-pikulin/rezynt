# Implementation Notes

Use these notes when matching Rezynt React/PDF resume templates in DOCX.

## Stack and Source of Truth

- Use `docxtpl` for placeholders and loops; use `python-docx` for deterministic layout.
- Use backend WeasyPrint output as the PDF comparison surface.
- Current templates live in `frontend/src/shared/components/templates/`.
- Current DOCX prototype templates live in `backend/app/templates/docx/`.
- Current generated samples live in `artifacts/resume_export/`.
- Current generator is `scripts/generate_clarity_resume_prototype.py`.

## Fonts

- Verify PDF fonts with `pdffonts` before assuming a font.
- In the current samples, PDF uses `Arial`, `Arial-Bold`, and `Arial-Italic`, not Source Sans Pro.
- Set `run.font.name = "Arial"` and `rFonts/eastAsia = "Arial"` for every run. Word may otherwise substitute and change weight/spacing.
- If Word text looks unexpectedly bold, check whether the run actually has `bold=True` rather than blaming font rendering first.

## Page Geometry

- For A4 print-style templates, React print CSS often uses `padding: 20px 30px`; map that to about `top/bottom 0.55cm`, `left/right 0.8cm`.
- For full-bleed layouts like Sidebar, use zero page margins and an outer two-column table.
- Use explicit DXA/Twips table geometry:
  - `tblW`
  - `tblGrid`
  - per-cell `tcW`
  - fixed cell margins
- Do not depend on `autofit`; set `table.autofit = False` and `table.allow_autofit = False`.

## Lists and Bullets

- Word built-in `List Bullet` caused Clarity markers to stick to the text and differ from PDF.
- Real Word list bullets may also render black even when text is white, which broke Sidebar.
- For visual parity, use controlled manual bullets:
  - create a normal paragraph
  - set `left_indent`
  - add a run like `• {{ achievement }}` or split marker/text into separate runs when marker color differs
  - set explicit font size, color, line spacing, and `space_after`
- For Sidebar white bullets, render marker and text manually in white.
- For Professional/Frame skills, use two runs so bullet color can be brown and text gray.

## Dates and Two-Column Rows

- Tab stops are fragile if reused across layouts. A sidebar content column needs a smaller right tab stop than full-width templates.
- Prefer a helper that accepts `tab_stop_cm` or use explicit two-column tables where wrapping must be controlled.
- If a date wraps in DOCX while PDF stays on one line, increase right-side width or right tab stop and inspect again.

## Education Blocks

- Degree and institution are not always the same font weight.
- Sidebar and Professional needed institution text as regular weight, not bold.
- Avoid extra blank paragraphs between degree and institution; use a compact 2-row table with explicit cell margins and line spacing.
- For full-width templates, use wider education row geometry than sidebar.

## Sidebar-Specific Issues

- Text in the left colored column clipped against the Word page edge when only cell margins were used.
- Add paragraph left indent inside the sidebar column in addition to cell margins.
- Use manual bullets for white sidebar skills; Word list markers may ignore text color.
- Keep the outer table height/page fitting explicit to avoid a second page.

## Professional-Specific Issues

- Word/LibreOffice diagonal table borders are inconsistent for the square monogram.
- Generate a small PNG monogram from initials and insert it through `docxtpl.InlineImage`.
- Initials are derived from `personal_info.first_name[:1].upper()` and `personal_info.last_name[:1].upper()`.
- Tune the PNG font size/position visually; the monogram is an image asset in generated artifacts, not a static candidate-specific template file.

## Frame-Specific Issues

- Section heading rules are hard to align with Word borders.
- A text rule using repeated box-drawing characters can align better with the heading baseline, but must be short enough not to wrap.
- `PROFESSIONAL SUMMARY` needs a wider label column than short headings to avoid wrapping.

## Visual QA Checklist

- Render DOCX and PDF to PNG.
- Open the PNGs and compare:
  - page count
  - font family and weight
  - list marker spacing and color
  - section spacing
  - title/header position
  - date alignment and wrapping
  - sidebar clipping
  - education degree/institution weights
  - decorative elements such as monograms or horizontal rules
- Run unresolved tag check after every render.
- Mention any remaining renderer limitation explicitly instead of hiding it.
