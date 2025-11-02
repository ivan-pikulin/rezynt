"""Rule 3.9: Abbreviations Without Definition"""
import re
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class UndefinedAbbreviationsRule(BaseRule):
    """Detects abbreviations that should be defined."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "llm_assisted"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for undefined abbreviations."""
        points = []
        
        # Common acceptable abbreviations (don't need definition)
        common_abbrevs = [
            'api', 'sql', 'html', 'css', 'rest', 'http', 'https',
            'ai', 'ml', 'nlp', 'cv', 'phd', 'mba', 'ba', 'bs', 'ms',
            'ceo', 'cto', 'cfo', 'vp', 'usa', 'uk', 'eu', 'it', 'hr'
        ]
        
        # Find all abbreviations (2-5 uppercase letters)
        all_text = resume.get('professional_summary', '') + ' '
        for exp in resume.get('work_experience', []):
            all_text += ' ' + ' '.join(exp.get('achievements', []))
        
        abbreviations = re.findall(r'\b[A-Z]{2,5}\b', all_text)
        
        # Filter out common ones
        uncommon_abbrevs = [
            abbr for abbr in set(abbreviations)
            if abbr.lower() not in common_abbrevs
        ]
        
        # Check if they're defined (abbreviation followed by parentheses)
        undefined = []
        for abbr in uncommon_abbrevs:
            # Look for pattern: "Full Name (ABBR)" or "ABBR (Full Name)"
            pattern1 = rf'\([^)]*{abbr}[^)]*\)'
            pattern2 = rf'{abbr}\s*\([^)]+\)'
            
            if not re.search(pattern1, all_text) and not re.search(pattern2, all_text):
                undefined.append(abbr)
        
        if len(undefined) >= 2:
            points.append(self.create_point(
                field_path="work_experience",
                title="Undefined Abbreviations",
                description=f"Define abbreviations on first use: {', '.join(undefined[:3])}",
                metadata={"undefined": undefined}
            ))
        
        return points

