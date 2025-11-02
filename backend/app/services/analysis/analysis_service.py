"""Main analysis service for resume analysis"""
from datetime import datetime
from typing import List

from app.schemas.analysis import AnalysisResult, AnalysisSection, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.scoring import calculate_section_score, calculate_overall_score, get_section_status
from app.services.analysis.config import AnalysisConfig

# Import all rule classes
from app.services.analysis.rules.content import (
    MissingAchievementsRule,
    AchievementsWithoutMetricsRule,
    ResponsibilitiesNotResultsRule,
    MissingCompanyDescriptionRule,
    MissingDegreeRule,
    MissingFieldOfStudyRule,
    LongBulletsRule,
    MissingTechnologiesRule,
    MissingSummaryRule,
    SummaryTooShortRule,
    SummaryTooLongRule,
    TooFewSkillsRule,
    TooManySkillsRule,
    MissingContactsRule,
    MissingProfessionalLinksRule,
)
from app.services.analysis.rules.ats import (
    JobTitleCapitalizationRule,
    MissingKeywordsRule,
    InvalidDatesRule,
    EmploymentGapsRule,
    InconsistentDateFormatsRule,
    MissingExperienceLocationRule,
    SkillsNotInExperienceRule,
    ResumeLengthRule,
    GenericJobTitlesRule,
)
from app.services.analysis.rules.style import (
    InconsistentVerbTenseRule,
    WeakVerbsRule,
    RepetitiveWordingRule,
    FillerPhrasesRule,
    PassiveVoiceRule,
    PersonalPronounsRule,
    BuzzwordsRule,
    MissingActionVerbsRule,
    UndefinedAbbreviationsRule,
)


class AnalysisService:
    """Main service for resume analysis."""
    
    def __init__(self):
        # Initialize all rules
        self.rules: List[BaseRule] = self._load_rules()
    
    def _load_rules(self) -> List[BaseRule]:
        """Load and instantiate all rule classes."""
        return [
            # Content & Structure rules (15 rules)
            MissingAchievementsRule(),
            AchievementsWithoutMetricsRule(),
            ResponsibilitiesNotResultsRule(),
            MissingCompanyDescriptionRule(),
            MissingDegreeRule(),
            MissingFieldOfStudyRule(),
            LongBulletsRule(),
            MissingTechnologiesRule(),
            MissingSummaryRule(),
            SummaryTooShortRule(),
            SummaryTooLongRule(),
            TooFewSkillsRule(),
            TooManySkillsRule(),
            MissingContactsRule(),
            MissingProfessionalLinksRule(),
            
            # ATS Optimization rules (9 rules)
            JobTitleCapitalizationRule(),
            MissingKeywordsRule(),
            InvalidDatesRule(),
            EmploymentGapsRule(),
            InconsistentDateFormatsRule(),
            MissingExperienceLocationRule(),
            SkillsNotInExperienceRule(),
            ResumeLengthRule(),
            GenericJobTitlesRule(),
            
            # Style & Grammar rules (9 rules)
            InconsistentVerbTenseRule(),
            WeakVerbsRule(),
            RepetitiveWordingRule(),
            FillerPhrasesRule(),
            PassiveVoiceRule(),
            PersonalPronounsRule(),
            BuzzwordsRule(),
            MissingActionVerbsRule(),
            UndefinedAbbreviationsRule(),
        ]
    
    async def analyze_resume(self, resume: dict) -> AnalysisResult:
        """
        Analyze resume and return complete analysis result.
        
        Args:
            resume: Resume data dictionary
            
        Returns:
            AnalysisResult with score, sections, and improvement points
        """
        # Run all rules
        all_points = []
        for rule in self.rules:
            try:
                points = await rule.check(resume)
                all_points.extend(points)
            except Exception as e:
                # Log error but continue with other rules
                print(f"Error in rule {rule.rule_id}: {e}")
                continue
        
        # Group points by section
        sections = self._build_sections(all_points)
        
        # Calculate overall score
        score = calculate_overall_score(sections)
        
        # Determine label and subtitle
        label, subtitle = AnalysisConfig.get_score_label(score)
        
        # Calculate potential score if all improvements applied
        potential_score = min(100, score + sum(p.score_impact for p in all_points))
        
        return AnalysisResult(
            score=score,
            label=label,
            subtitle=subtitle,
            sections=sections,
            total_improvements=len(all_points),
            potential_score=potential_score,
            generated_at=datetime.utcnow()
        )
    
    def _build_sections(self, points: List[ImprovementPoint]) -> List[AnalysisSection]:
        """Group improvement points by section and calculate scores."""
        # Group by section_id
        section_points = {
            'content': [],
            'ats': [],
            'style': []
        }
        
        for point in points:
            section_points[point.section_id].append(point)
        
        # Build section objects
        sections = []
        for section_id, section_title in [
            ('content', 'Content & Structure'),
            ('ats', 'ATS Optimization'),
            ('style', 'Style & Grammar')
        ]:
            points_list = section_points[section_id]
            max_points = AnalysisConfig.MAX_SECTION_SCORES[section_id]
            
            current_points, total_impact = calculate_section_score(
                points_list, 
                max_points
            )
            
            percentage = int((current_points / max_points) * 100) if max_points > 0 else 100
            
            # Determine status
            status = get_section_status(percentage)
            
            sections.append(AnalysisSection(
                id=section_id,
                title=section_title,
                current_points=current_points,
                max_points=max_points,
                percentage=percentage,
                status=status,
                improvement_points=points_list
            ))
        
        return sections
    
    async def apply_fix(self, point_id: str, field_path: str, resume: dict) -> dict:
        """
        Apply a fix for a specific improvement point.
        
        Args:
            point_id: ID of the improvement point
            field_path: Field path where the issue was found
            resume: Resume data
            
        Returns:
            Dictionary with original and fixed text
        """
        # Find the rule that generated this point
        rule_id = point_id.split('_')[0] if '_' in point_id else point_id
        
        for rule in self.rules:
            if rule.rule_id == rule_id or rule.__class__.__name__ == rule_id:
                # Re-run the rule to get context
                points = await rule.check(resume)
                
                # Find the specific point
                point = next((p for p in points if p.id == point_id), None)
                
                if point and point.metadata:
                    # Call get_fix with the metadata as context
                    fixed_text = await rule.get_fix(point.metadata)
                    
                    if fixed_text:
                        return {
                            "original": point.metadata.get("original_text", ""),
                            "fixed": fixed_text,
                            "field_path": field_path
                        }
        
        return {
            "original": "",
            "fixed": "",
            "field_path": field_path
        }


# Singleton instance
analysis_service = AnalysisService()

