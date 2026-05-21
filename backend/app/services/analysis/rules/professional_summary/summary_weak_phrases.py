"""Rule: Summary Weak Phrases - Detects weak phrases in professional summary"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class SummaryWeakPhrasesRule(BaseRule):
    """Detects weak and filler phrases in professional summary and replaces them with stronger alternatives."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect weak phrases in summary and generate stronger alternatives."""
        points = []
        
        summary = (resume.get('professional_summary') or '').strip()
        if not summary or len(summary) < 20:
            return points
        
        current_role = resume.get('current_role') or ''
        
        weak_phrases = [
            'basically', 'actually', 'just', 'simply', 'merely',
            'kind of', 'sort of', 'a bit', 'somewhat',
            'I think', 'I believe', 'I feel', 'in my opinion'
        ]
        
        # Check if summary contains weak phrases
        summary_lower = summary.lower()
        found_weak = [phrase for phrase in weak_phrases if phrase in summary_lower]
        
        if found_weak:
            prompt = f"""Замените слабые фразы более сильным и уверенным языком в этом профессиональном summary.

Резюме: "{summary}"
Текущая должность: {current_role}
Слабые фразы для замены: {', '.join(found_weak)}

Установите has_fix в true и верните улучшенное summary в fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)
            
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary,
                    new_content=fix_response.fixed_text
                )
                
                points.append(self.create_point(
                    field_path="professional_summary",
                    title="Слабые фразы в резюме",
                    description=f"Замените слабые фразы более сильными: {', '.join(found_weak[:3])}.",
                    fix_suggestion=fix_suggestion
                ))
        
        return points
