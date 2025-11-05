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
    MissingRequiredFieldsRule,
    GenerateMissingSummaryRule,
    SummaryLengthRule,
    SkillsCountRule,
)
from app.services.analysis.rules.ats import (
    JobTitleCapitalizationRule,
    MissingKeywordsRule,
    EmploymentGapsRule,
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
            # Content & Structure rules (11 rules - consolidated from 13)
            MissingRequiredFieldsRule(),  # Must run first - mechanical checks for missing fields
            GenerateMissingSummaryRule(),  # LLM-powered summary generation (runs after mechanical check)
            MissingAchievementsRule(),
            MissingCompanyDescriptionRule(),
            AchievementsWithoutMetricsRule(),
            ResponsibilitiesNotResultsRule(),
            MissingDegreeRule(),
            MissingFieldOfStudyRule(),
            LongBulletsRule(),
            SummaryLengthRule(),  # Checks existing summaries (too short/long)
            SkillsCountRule(),

            # ATS Optimization rules (7 rules)
            JobTitleCapitalizationRule(),
            MissingKeywordsRule(),
            EmploymentGapsRule(),
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
        
        Fixes are now generated during analysis and included in ImprovementPoints
        as FixSuggestion objects.
        
        Args:
            resume: Resume data dictionary
            
        Returns:
            AnalysisResult with score, sections, and improvement points with embedded fixes
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
        # Each section would be at 100 if all issues are fixed
        potential_sections = []
        for section in sections:
            # If all issues in this section are fixed, score = 100
            potential_section = AnalysisSection(
                id=section.id,
                title=section.title,
                current_points=100,
                max_points=100,
                percentage=100,
                status="Strong",
                improvement_points=[]
            )
            potential_sections.append(potential_section)
        
        potential_score = calculate_overall_score(potential_sections)
        
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
            
            current_points, total_impact = calculate_section_score(points_list)
            
            percentage = current_points  # Score is already 0-100
            
            # Determine status
            status = get_section_status(percentage)
            
            sections.append(AnalysisSection(
                id=section_id,
                title=section_title,
                current_points=current_points,
                max_points=100,
                percentage=percentage,
                status=status,
                improvement_points=points_list
            ))
        
        return sections


# Singleton instance
analysis_service = AnalysisService()

