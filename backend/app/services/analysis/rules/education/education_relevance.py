"""Rule: Education Relevance - Checks relevance of education to current role"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class EducationRelevanceRule(BaseRule):
    """
    Analyzes relevance of education to current role and industry.
    Provides warning if field of study is not relevant.
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 1
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check education relevance to current role."""
        points = []
        
        current_role = resume.get('current_role') or ''
        work_exp = resume.get('work_experience', [])
        education = resume.get('education', [])
        
        if not current_role or not education:
            return points
        
        # Build work experience summary
        work_summary = []
        for exp in work_exp[:3]:
            work_summary.append({
                'job_title': exp.get('job_title', ''),
                'achievements': exp.get('achievements', [])[:3]
            })
        
        # Check each education entry
        for i, edu in enumerate(education):
            field_of_study = edu.get('field_of_study') or ''
            degree = edu.get('degree') or ''
            
            if not field_of_study:
                continue
            
            prompt = f"""Analyze if this education is relevant to the candidate's current role and work experience.

Current role: {current_role}
Field of study: {field_of_study}
Degree: {degree}
Work experience: {work_exp[:200] if work_exp else 'None'}

Return a JSON object with:
- "is_relevant": boolean indicating if education is relevant
- "reasoning": explanation

If not relevant, set is_relevant to false and provide reasoning."""
            
            try:
                result = await llm_helper.call_llm_structured(prompt, max_tokens=300)
                
                if result.has_fix and result.fixed_text:
                    import json
                    try:
                        data = json.loads(result.fixed_text)
                        if not data.get('is_relevant', True):
                            points.append(self.create_point(
                                field_path=f"education[{i}].field_of_study",
                                title="Education May Not Be Relevant",
                                description=data.get('reasoning', 'Field of study may not align with current role'),
                                metadata={"severity": "low", "score_impact": 1}
                            ))
                    except json.JSONDecodeError:
                        pass
            except Exception:
                # If LLM call fails, skip this entry
                pass
        
        return points

