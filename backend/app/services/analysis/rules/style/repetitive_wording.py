"""Rule 3.3: Repetitive Wording"""
from collections import Counter
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class RepetitiveWordingRule(BaseRule):
    """Detects repetitive phrases in resume."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for repeated phrases."""
        points = []
        
        # Collect text from each section separately
        summary_text = resume.get('professional_summary', '')
        
        experience_text = ''
        for exp in resume.get('work_experience', []):
            experience_text += ' ' + ' '.join(exp.get('achievements', []))
        
        # Check all text for repetition
        all_text = summary_text + ' ' + experience_text
        words = all_text.lower().split()
        
        # Count bigrams
        bigrams = [' '.join(words[i:i+2]) for i in range(len(words)-1)]
        bigram_counts = Counter(bigrams)
        
        # Flag if any bigram appears more than 3 times
        repeated_phrases = [phrase for phrase, count in bigram_counts.items() 
                           if count > 3 and len(phrase) > 8]
        
        if repeated_phrases:
            # Create separate points for each section if needed
            if summary_text and any(phrase in summary_text.lower() for phrase in repeated_phrases):
                points.append(self.create_point(
                    field_path="professional_summary",
                    title="Repetitive Wording",
                    description=f"Vary wording - '{repeated_phrases[0]}' repeated multiple times",
                    metadata={"repeated_phrases": repeated_phrases[:3]}
                ))
            
            if experience_text:
                points.append(self.create_point(
                    field_path="work_experience",
                    title="Repetitive Wording",
                    description=f"Vary wording - '{repeated_phrases[0]}' repeated {bigram_counts[repeated_phrases[0]]} times",
                    metadata={"repeated_phrases": repeated_phrases[:3]}
                ))
        
        return points

