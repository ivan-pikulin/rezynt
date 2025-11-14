"""Main analysis service for resume analysis"""
import asyncio
from datetime import datetime
from typing import List

from app.schemas.analysis import AnalysisResult, AnalysisSection, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.scoring import calculate_section_score, calculate_overall_score, get_section_status
from app.services.analysis.config import AnalysisConfig

# Import all rule classes
from app.services.analysis.rules.general import (
    BuzzwordsRule,
    ContentLanguageRule,
    FillerPhrasesRule,
    GrammarRule,
    MissingRequiredFieldsRule,
    PersonalPronounsRule,
    ResumeLengthRule,
    UndefinedAbbreviationsRule,
)
from app.services.analysis.rules.personal_info import (
    CapitalizationConsistencyRule,
)
from app.services.analysis.rules.contacts import (
    ContactValidationRule,
    ContactsForRoleRule,
)
from app.services.analysis.rules.professional_summary import (
    GenerateMissingSummaryRule,
    NumberFormatConsistencyRule,
    SummaryLengthRule,
    SummaryWeakPhrasesRule,
)
from app.services.analysis.rules.skills import (
    MissingKeywordsRule,
    SkillsCountRule,
    SkillsNotInExperienceRule,
)
from app.services.analysis.rules.work_experience import (
    AchievementsCountRule,
    AchievementsNotResponsibilitiesRule,
    AchievementsWithoutMetricsRule,
    AchivementLengthRule,
    CompanyNameConsistencyRule,
    DateValidationRule,
    DuplicateAchievementsRule,
    EmploymentGapsRule,
    GenericJobTitlesRule,
    JobTitleCapitalizationRule,
    MissingCompanyDescriptionRule,
    MissingCompanyRule,
    MissingExperienceLocationRule,
    MissingStartDateRule,
    PassiveVoiceRule,
    WeakVerbsRule,
)
from app.services.analysis.rules.education import (
    EducationDateValidationRule,
    EducationRelevanceRule,
    InstitutionNameConsistencyRule,
    MissingDegreeRule,
    MissingFieldOfStudyRule,
    MissingInstitutionRule,
    RelevantCoursesRule,
)


class AnalysisService:
    """Main service for resume analysis."""
    
    def __init__(self):
        # Initialize all rules
        self.rules: List[BaseRule] = self._load_rules()
    
    def _load_rules(self) -> List[BaseRule]:
        """Load and instantiate all rule classes."""
        return [
            # General rules (apply to all fields)
            MissingRequiredFieldsRule(),  # Must run first - mechanical checks for missing fields
            ContentLanguageRule(),
            ResumeLengthRule(),
            GrammarRule(),
            BuzzwordsRule(),
            FillerPhrasesRule(),
            UndefinedAbbreviationsRule(),
            PersonalPronounsRule(),

            # Personal info rules
            CapitalizationConsistencyRule(),

            # Contact rules
            ContactValidationRule(),
            ContactsForRoleRule(),

            # Professional summary rules
            GenerateMissingSummaryRule(),  # LLM-powered summary generation (runs after mechanical check)
            SummaryLengthRule(),  # Checks existing summaries (too short/long)
            SummaryWeakPhrasesRule(),
            NumberFormatConsistencyRule(),

            # Skills rules
            SkillsCountRule(),
            MissingKeywordsRule(),
            SkillsNotInExperienceRule(),

            # Work experience rules
            MissingCompanyRule(),
            MissingStartDateRule(),
            DateValidationRule(),
            MissingCompanyDescriptionRule(),
            MissingExperienceLocationRule(),
            GenericJobTitlesRule(),
            JobTitleCapitalizationRule(),
            CompanyNameConsistencyRule(),
            EmploymentGapsRule(),
            AchievementsCountRule(),
            AchievementsWithoutMetricsRule(),
            AchievementsNotResponsibilitiesRule(),
            AchivementLengthRule(),
            WeakVerbsRule(),
            PassiveVoiceRule(),
            DuplicateAchievementsRule(),

            # Education rules
            MissingInstitutionRule(),
            MissingDegreeRule(),
            MissingFieldOfStudyRule(),
            EducationDateValidationRule(),
            InstitutionNameConsistencyRule(),
            EducationRelevanceRule(),
            RelevantCoursesRule(),
        ]
    
    async def analyze_resume(self, resume: dict, is_premium: bool = False) -> AnalysisResult:
        """
        Analyze resume and return complete analysis result.
        
        Fixes are now generated during analysis and included in ImprovementPoints
        as FixSuggestion objects.
        
        Args:
            resume: Resume data dictionary
            is_premium: Whether user has premium subscription. Non-premium users skip premium_only rules.
            
        Returns:
            AnalysisResult with score, sections, and improvement points with embedded fixes
        """
        # Log resume structure for debugging
        print("=" * 60)
        print("📋 ANALYZING RESUME")
        print(f"Premium user: {is_premium}")
        print("=" * 60)
        print(f"Resume keys: {list(resume.keys()) if resume else 'None'}")
        if resume:
            prof_summary = resume.get('professional_summary')
            print(f"  - professional_summary: {type(prof_summary)} = {prof_summary}")
            
            personal_info = resume.get('personal_info')
            print(f"  - personal_info: {type(personal_info)}")
            if personal_info:
                print(f"    - first_name: {personal_info.get('first_name')}")
                print(f"    - last_name: {personal_info.get('last_name')}")
                print(f"    - contacts: {personal_info.get('contacts')}")
            
            work_exp = resume.get('work_experience') or []
            print(f"  - work_experience: {type(work_exp)} (length: {len(work_exp)})")
            
            education = resume.get('education') or []
            print(f"  - education: {type(education)} (length: {len(education)})")
            
            skills = resume.get('skills') or []
            print(f"  - skills: {type(skills)} (length: {len(skills)})")
        print("=" * 60)
        
        # Filter rules based on premium status
        rules_to_run = [
            rule for rule in self.rules
            if is_premium or not rule.premium_only
        ]

        if not is_premium:
            skipped_count = len(self.rules) - len(rules_to_run)
            print(f"⏭️  Skipping {skipped_count} premium-only rules for non-premium user")

        # Run filtered rules in parallel using asyncio.gather()
        print(f"🚀 Running {len(rules_to_run)} rules in parallel...")

        async def run_rule_safely(rule: BaseRule) -> List[ImprovementPoint]:
            """Run a single rule with error handling"""
            try:
                points = await rule.check(resume)
                if len(points) > 0:
                    print(f"✓ {rule.rule_id}: {len(points)} points")
                return points
            except Exception as e:
                # Log error with more details
                import traceback
                print(f"✗ Error in rule {rule.rule_id}: {e}")
                print(f"  Type: {type(e).__name__}")
                print(traceback.format_exc())
                return []  # Return empty list on error

        # Execute all rules concurrently
        results = await asyncio.gather(*[run_rule_safely(rule) for rule in rules_to_run])

        # Flatten results into single list
        all_points = []
        for points in results:
            all_points.extend(points)
        
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
            status='completed',  # Analysis is complete when returned from this method
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

