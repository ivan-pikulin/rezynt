"""Rule 3.9: Abbreviations Without Definition"""
import re
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class UndefinedAbbreviationsRule(BaseRule):
    """Detects abbreviations that should be defined and expands them via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect undefined abbreviations and generate expansions."""
        points = []
        
        # Common acceptable abbreviations (don't need definition)
        common_abbrevs = [
            'api', 'sql', 'html', 'css', 'rest', 'http', 'https',
            'ai', 'ml', 'nlp', 'cv', 'phd', 'mba', 'ba', 'bs', 'ms',
            'ceo', 'cto', 'cfo', 'vp', 'usa', 'uk', 'eu', 'it', 'hr',
            'aws', 'gcp', 'saas', 'b2b', 'b2c', 'roi', 'kpi'
        ]
        
        # Check professional summary
        summary = resume.get('professional_summary', '')
        if summary:
            abbreviations = re.findall(r'\b[A-Z]{2,5}\b', summary)
            uncommon = [a for a in set(abbreviations) if a.lower() not in common_abbrevs]
            
            for abbr in uncommon:
                # Check if defined
                pattern = rf'\([^)]*{abbr}[^)]*\)|{abbr}\s*\([^)]+\)'
                if not re.search(pattern, summary):
                    # Try to expand via LLM with Structured Outputs
                    prompt = f"""Expand this abbreviation on first use in the text.

Text: "{summary}"
Abbreviation to expand: "{abbr}"

Set has_fix to true and provide the text with the abbreviation expanded in fixed_text.
For example: "ABC" → "Application Binary Code (ABC)" """
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path="professional_summary",
                            original_content=summary,
                            new_content=fix_response.fixed_text
                        )
                    
                    points.append(self.create_point(
                        field_path="professional_summary",
                        title="Undefined Abbreviation",
                        description=f"Define '{abbr}' on first use",
                        fix_suggestion=fix_suggestion
                    ))
        
        # Check achievements
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                abbreviations = re.findall(r'\b[A-Z]{2,5}\b', achievement)
                uncommon = [a for a in set(abbreviations) if a.lower() not in common_abbrevs]
                
                for abbr in uncommon:
                    # Check if defined
                    pattern = rf'\([^)]*{abbr}[^)]*\)|{abbr}\s*\([^)]+\)'
                    if not re.search(pattern, achievement):
                        # Try to expand via LLM with Structured Outputs
                        prompt = f"""Expand this abbreviation on first use in the text.

Text: "{achievement}"
Abbreviation to expand: "{abbr}"

Set has_fix to true and provide the text with the abbreviation expanded in fixed_text.
For example: "ABC" → "Application Binary Code (ABC)" """
                        
                        fix_response = await llm_helper.call_llm_structured(prompt)
                        
                        fix_suggestion = None
                        if fix_response.has_fix and fix_response.fixed_text:
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=f"work_experience[{i}].achievements[{j}]",
                                original_content=achievement,
                                new_content=fix_response.fixed_text
                            )
                        
                        points.append(self.create_point(
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            title="Undefined Abbreviation",
                            description=f"Define '{abbr}' on first use",
                            fix_suggestion=fix_suggestion
                        ))
        
        return points
