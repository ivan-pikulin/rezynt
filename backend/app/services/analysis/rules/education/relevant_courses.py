"""Rule: Relevant Courses - Checks relevance of courses to education and role"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class RelevantCoursesRule(BaseRule):
    """
    Analyzes relevance of courses to field of study and current role.
    Suggests removing irrelevant courses or adding relevant ones.
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check course relevance."""
        points = []
        
        current_role = resume.get('current_role') or ''
        work_exp = resume.get('work_experience', [])
        education = resume.get('education', [])
        
        for i, edu in enumerate(education):
            courses = edu.get('relevant_courses') or []
            field_of_study = edu.get('field_of_study') or ''
            degree = edu.get('degree') or ''
            
            if not courses:
                continue
            
            prompt = f"""Проанализируйте, насколько эти курсы соответствуют области обучения и текущей должности. Проверьте наличие дубликатов.

Область обучения: {field_of_study}
Степень: {degree}
Текущая должность: {current_role}
Курсы: {', '.join(courses)}

Верните JSON-объект со следующими полями:
- "irrelevant_courses": list of course names that should be removed
- "missing_courses": list of relevant courses that could be added
- "duplicates": list of duplicate course names

Если все курсы релевантны и дубликатов нет, верните пустые списки."""
            
            try:
                result = await llm_helper.call_llm_structured(prompt, max_tokens=500)
                
                if result.has_fix and result.fixed_text:
                    import json
                    try:
                        data = json.loads(result.fixed_text)
                        
                        # Handle irrelevant courses
                        irrelevant = data.get('irrelevant_courses', [])
                        if irrelevant:
                            # Find indices of irrelevant courses
                            courses_to_remove = []
                            for course in irrelevant:
                                if course in courses:
                                    idx = courses.index(course)
                                    courses_to_remove.append(idx)
                            
                            if courses_to_remove:
                                fix_suggestion = FixSuggestion(
                                    type="delete",
                                    field_path=f"education[{i}].relevant_courses",
                                    original_content=courses,
                                    new_content=courses_to_remove
                                )
                                
                                points.append(self.create_point(
                                    field_path=f"education[{i}].relevant_courses",
                                    title="Нерелевантные курсы",
                                    description=f"Удалить курсы, не относящиеся к области обучения: {', '.join(irrelevant[:3])}",
                                    fix_suggestion=fix_suggestion
                                ))
                        
                        # Handle missing courses
                        missing = data.get('missing_courses', [])
                        if missing:
                            fix_suggestion = FixSuggestion(
                                type="add",
                                field_path=f"education[{i}].relevant_courses",
                                new_content=missing[:5]  # Limit to 5 courses
                            )
                            
                            points.append(self.create_point(
                                field_path=f"education[{i}].relevant_courses",
                                title="Рассмотрите возможность добавления соответствующих курсов",
                                description=f"Добавьте соответствующие курсы: {', '.join(missing[:3])}",
                                fix_suggestion=fix_suggestion
                            ))
                        
                        # Handle duplicates
                        duplicates = data.get('duplicates', [])
                        if duplicates:
                            points.append(self.create_point(
                                field_path=f"education[{i}].relevant_courses",
                                title="Дублирующиеся курсы",
                                description=f"Удалить повторяющиеся курсы: {', '.join(duplicates[:3])}"
                            ))
                    except json.JSONDecodeError:
                        pass
            except Exception:
                # If LLM call fails, skip this entry
                pass
        
        return points

