---
name: rezynt-docx-resume-templates
description: Create, refine, and QA Rezynt DOCX resume templates that visually match the existing React HTML/PDF resume templates. Use when working on backend/app/templates/docx/*.docx, docxtpl/python-docx generation, scripts/generate_clarity_resume_prototype.py, or fixing Word-specific resume layout issues such as bullets, fonts, spacing, sidebar clipping, education rows, one-page fitting, PNG monograms, and PDF-to-DOCX visual parity.
---

# Rezynt DOCX Resume Templates

Use this skill when implementing or repairing DOCX resume templates for Rezynt. The goal is not generic Word output; the DOCX must visually track the matching React template and the backend WeasyPrint PDF.

## Core Workflow

1. Read the matching React template in `frontend/src/shared/components/templates/`.
2. Check the current DOCX prototype generator: `scripts/generate_clarity_resume_prototype.py`.
3. Generate the DOCX template under `backend/app/templates/docx/` with `docxtpl` placeholders and `python-docx` geometry.
4. Generate a filled sample DOCX and the comparison PDF from the same sample data.
5. Render the DOCX to PNG and inspect it visually before reporting completion.
6. Iterate on the DOCX until the rendered page matches the PDF closely enough for Word review.
7. Update `.memory_bank` when code, generated templates, or repository workflow changes.

## Commands

Run the generator from `backend/`:

```bash
DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib uv run python ../scripts/generate_clarity_resume_prototype.py
```

Render a DOCX sample:

```bash
uv run --with pdf2image --with pillow python /Users/ivan/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/skills/documents/render_docx.py /Users/ivan/Desktop/repositories/Personal/rezynt/artifacts/resume_export/<template>_sample_resume.docx --output_dir /Users/ivan/Desktop/repositories/Personal/rezynt/artifacts/resume_export/rendered_<template>_docx --emit_pdf
```

Render a PDF sample:

```bash
pdftoppm -png -r 160 artifacts/resume_export/<template>_sample_resume.pdf artifacts/resume_export/rendered_<template>_pdf/page
```

Check unresolved template tags:

```bash
unzip -p artifacts/resume_export/<template>_sample_resume.docx word/document.xml | rg "\{\{|\{%|\}\}|%\}" || true
```

Check PDF fonts:

```bash
pdffonts artifacts/resume_export/<template>_sample_resume.pdf
```

## Non-Negotiables

- Always visually inspect rendered DOCX PNGs; XML/tag checks are not enough.
- Compare against the generated PDF PNG, not memory.
- Keep samples on one page unless the source PDF also spans multiple pages.
- Use explicit page margins, table widths, grids, cell widths, cell margins, font names, and spacing. Do not rely on Word defaults.
- Prefer local patterns in `scripts/generate_clarity_resume_prototype.py` over inventing a second generator style.
- Be fail-fast: if a Word/LibreOffice feature renders inconsistently, replace it with a deterministic construction and document why.

## Known Nuances

Read [implementation-notes.md](references/implementation-notes.md) before fixing visual mismatches or adding another template. It captures the concrete issues already found in Clarity, Sidebar, Professional, and Frame.
