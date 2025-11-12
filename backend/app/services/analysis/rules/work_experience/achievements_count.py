"""Rule: Achievements Count - Validates number of achievements and generates suggestions via LLM"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class AchievementsCountRule(BaseRule):
    """Detects work experience entries with too few or too many achievements and generates suggestions via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = True
        self.min_achievements = AnalysisConfig.MIN_ACHIEVEMENTS_COUNT
        self.max_achievements = AnalysisConfig.MAX_ACHIEVEMENTS_COUNT
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check achievements count and generate suggestions via LLM."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            achievements = exp.get('achievements', [])
            achievement_count = len(achievements)
            
            job_title = exp.get('job_title', 'this role')
            short_description = exp.get('short_description', '')
            skills = resume.get('skills', [])
            
            # Too few achievements
            if achievement_count < self.min_achievements:
                # Generate new achievements via LLM
                import json
                prompt = f"""Generate {self.min_achievements - achievement_count} new quantifiable achievements for this work experience entry.
                
Job Title: {job_title}
Company Description: {short_description}
Existing Achievements: {json.dumps(achievements)}
Relevant Skills: {', '.join(skills[:10])}

Generate achievements that:
- Start with strong action verbs
- Include quantifiable metrics (numbers, percentages, timeframes)
- Focus on results and impact, not responsibilities
- Are specific and measurable

Set has_fix to true and provide the new achievements as a JSON array in fixed_text (e.g., ["Achievement 1", "Achievement 2"])."""

                fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=400)
                
                fix_suggestion = None
                if fix_response.has_fix and fix_response.fixed_text:
                    # Try to parse as JSON array
                    import json
                    try:
                        new_achievements = json.loads(fix_response.fixed_text)
                        if isinstance(new_achievements, list):
                            fix_suggestion = FixSuggestion(
                                type="add",
                                field_path=f"work_experience[{i}].achievements.new",
                                new_content=new_achievements
                            )
                    except:
                        # If not JSON, treat as comma-separated or newline-separated
                        new_achievements = [a.strip() for a in fix_response.fixed_text.replace('\n', ',').split(',') if a.strip()]
                        if new_achievements:
                            fix_suggestion = FixSuggestion(
                                type="add",
                                field_path=f"work_experience[{i}].achievements.new",
                                new_content=new_achievements
                            )
                
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements.new",
                    title="Too Few Achievements",
                    description=f"Add more quantifiable achievements to strengthen this role ({achievement_count} → {self.min_achievements}+ recommended)",
                    fix_suggestion=fix_suggestion
                ))
            
            # Too many achievements
            elif achievement_count > self.max_achievements:
                # Generate suggestion to consolidate/remove achievements via LLM
                import json
                prompt = f"""This work experience entry has too many achievements ({achievement_count}). 
                
Job Title: {job_title}
Current Achievements: {json.dumps(achievements)}

Select the {self.max_achievements} most impactful and relevant achievements. You can:
- Keep the strongest achievements
- Combine similar achievements
- Remove less impactful ones

Set has_fix to true and provide the curated achievements as a JSON array in fixed_text (e.g., ["Achievement 1", "Achievement 2"])."""

                fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=500)
                
                fix_suggestion = None
                if fix_response.has_fix and fix_response.fixed_text:
                    # Try to parse as JSON array
                    import json
                    try:
                        curated_achievements = json.loads(fix_response.fixed_text)
                        if isinstance(curated_achievements, list):
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=f"work_experience[{i}].achievements",
                                original_content=achievements,
                                new_content=curated_achievements
                            )
                    except:
                        # If not JSON, treat as comma-separated or newline-separated
                        curated_achievements = [a.strip() for a in fix_response.fixed_text.replace('\n', ',').split(',') if a.strip()]
                        if curated_achievements:
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=f"work_experience[{i}].achievements",
                                original_content=achievements,
                                new_content=curated_achievements
                            )
                
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    title="Too Many Achievements",
                    description=f"Consolidate achievements to focus on the most impactful ones ({achievement_count} → ~{self.max_achievements} recommended)",
                    fix_suggestion=fix_suggestion
                ))
        
        return points
