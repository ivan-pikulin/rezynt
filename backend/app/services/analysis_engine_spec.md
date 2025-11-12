# Resume Analysis Engine Architecture

## Overview

This document describes the architecture and implementation plan for the resume analysis engine that provides real-time scoring and improvement suggestions for user resumes.

The analysis engine evaluates resumes across three main categories:
- **Content & Structure** (50% weight) - completeness, achievements, logic
- **ATS Optimization** (30% weight) - keyword matching, formatting consistency
- **Style & Grammar** (20% weight) - language quality, professional tone

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (RefinePage)                   │
│  - Displays analysis score and sections                      │
│  - Shows improvement recommendations with severity           │
│  - "Go to Edit" / "Fix" action buttons                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ GET /api/v1/analysis/
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              API Endpoint (analysis.py)                      │
│  - Validates user authentication                             │
│  - Retrieves user's resume data                              │
│  - Calls AnalysisService                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           AnalysisService (analysis_service.py)              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  analyze_resume(resume_data: dict)                 │    │
│  │    ├─→ Load all rules (content, ATS, style)       │    │
│  │    ├─→ Run each rule.check(resume)                │    │
│  │    ├─→ Collect all ImprovementPoints              │    │
│  │    ├─→ Group points by section                    │    │
│  │    └─→ Calculate overall score                    │    │
│  │         - Aggregates section scores                │    │
│  │         - Returns 0-100 score                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

### Backend Files

```
backend/app/
│
├── services/
│   ├── analysis/
│   │   ├── __init__.py
│   │   ├── analysis_service.py      # Main analysis orchestrator
│   │   │   └── class AnalysisService
│   │   │       ├── analyze_resume()
│   │   │       ├── _build_result()
│   │   │       └── _calculate_overall_score()
│   │   │
│   │   ├── rules/
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # BaseRule class
│   │   │   │   └── class BaseRule (abstract)
│   │   │   │       ├── check()
│   │   │   │       ├── get_fix()
│   │   │   │       └── create_point()
│   │   │   │
│   │   │   ├── content/             # Content & Structure rules
│   │   │   │   ├── __init__.py
│   │   │   │   ├── missing_achievements.py
│   │   │   │   ├── achievements_without_metrics.py
│   │   │   │   ├── achievements_not_responsibilities.py
│   │   │   │   ├── missing_company_description.py
│   │   │   │   ├── missing_degree.py
│   │   │   │   ├── missing_field_of_study.py
│   │   │   │   ├── long_bullets.py
│   │   │   │   ├── missing_technologies.py
│   │   │   │   ├── missing_summary.py
│   │   │   │   ├── summary_too_short.py
│   │   │   │   ├── summary_too_long.py
│   │   │   │   ├── too_few_skills.py
│   │   │   │   ├── too_many_skills.py
│   │   │   │   ├── missing_contacts.py
│   │   │   │   └── missing_professional_links.py
│   │   │   │
│   │   │   ├── ats/                 # ATS Optimization rules
│   │   │   │   ├── __init__.py
│   │   │   │   ├── job_title_capitalization.py
│   │   │   │   ├── missing_keywords.py
│   │   │   │   ├── invalid_dates.py
│   │   │   │   ├── employment_gaps.py
│   │   │   │   ├── inconsistent_date_formats.py
│   │   │   │   ├── missing_experience_location.py
│   │   │   │   ├── skills_not_in_experience.py
│   │   │   │   ├── resume_length.py
│   │   │   │   └── generic_job_titles.py
│   │   │   │
│   │   │   └── style/               # Style & Grammar rules
│   │   │       ├── __init__.py
│   │   │       ├── inconsistent_verb_tense.py
│   │   │       ├── weak_verbs.py
│   │   │       ├── repetitive_wording.py
│   │   │       ├── filler_phrases.py
│   │   │       ├── passive_voice.py
│   │   │       ├── personal_pronouns.py
│   │   │       ├── buzzwords.py
│   │   │       ├── missing_action_verbs.py
│   │   │       └── undefined_abbreviations.py
│   │   │
│   │   ├── llm_helper.py            # LLM integration helper
│   │   ├── scoring.py               # Scoring calculations
│   │   └── config.py                # Analysis configuration
│   │
│   └── spec.xml                     # Update with analysis service specs
│
├── schemas/
│   ├── analysis.py                  # Pydantic schemas for analysis
│   │   ├── class ImprovementPoint   # Single improvement suggestion
│   │   ├── class AnalysisSection    # Section with points
│   │   ├── class AnalysisResult     # Complete analysis result
│   │   └── class AnalysisResponse   # API response schema
│   │
│   └── __init__.py                  # Export analysis schemas
│
├── api/v1/endpoints/
│   ├── analysis.py                  # REST API endpoints
│   │   ├── GET  /api/v1/analysis/
│   │   ├── POST /api/v1/analysis/refresh
│   │   └── POST /api/v1/analysis/fix  # Apply LLM fix
│   │
│   └── spec.xml                     # Update with analysis endpoints
│
└── core/
    └── tasks.py                     # Optional: Celery tasks
        └── analyze_resume_task()    # For async analysis
```

### Frontend Files

```
frontend/src/
│
├── shared/services/api/
│   ├── analysisApi.ts               # Analysis API client (refactor from mock)
│   │   └── class AnalysisApi extends BaseApi
│   │       ├── getAnalysis()
│   │       ├── refreshAnalysis()
│   │       └── applyFix(pointId)
│   │
│   └── types.ts                     # Update with analysis types
│
└── features/refine/
    ├── RefinePage.tsx               # Update import to use shared API
    ├── analysisApi.ts               # DELETE (move to shared)
    └── components/
        └── ImprovementPoint.tsx     # Component for single improvement
```

## Data Structures

### Improvement Point Schema

```python
class ImprovementPoint(BaseModel):
    """Single improvement suggestion"""
    id: str                          # Unique point ID (e.g., "exp_0_no_achievements")
    rule_id: str                     # Rule identifier (e.g., "no_achievements")
    section_id: str                  # 'content', 'ats', 'style'
    field_path: str                  # JSON path (e.g., "experience[0].achievements")
    message: str                     # Human-readable message
    score_impact: int                # Points added if fixed (0-10)
    severity: Literal['high', 'medium', 'low']  # 🔴🟠🟡
    check_type: Literal['mechanical', 'llm', 'llm_assisted']
    action_type: Literal['go_to_edit', 'fix', 'both']
    fix_suggestion: Optional[str]    # LLM-generated fix (if available)
    metadata: Optional[Dict[str, Any]]  # Additional context
```

### Analysis Section Schema

```python
class AnalysisSection(BaseModel):
    """Analysis section with improvement points"""
    id: str                          # 'content', 'ats', 'style'
    title: str                       # Display title
    total_points: int                # Total possible points
    current_points: int              # Current points (total - sum(impact))
    max_points: int                  # Maximum achievable points
    percentage: int                  # Completion percentage
    status: Literal['NeedsWork', 'Good', 'Strong']
    improvement_points: List[ImprovementPoint]
```

### Analysis Result Schema

```python
class AnalysisResult(BaseModel):
    """Complete analysis result"""
    score: int                       # Overall score (0-100)
    label: str                       # 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'
    subtitle: str                    # Motivational message
    sections: List[AnalysisSection]  # Analysis sections
    total_improvements: int          # Total number of suggestions
    potential_score: int             # Score if all improvements applied
    generated_at: datetime           # Timestamp
```

## Code Architecture

### Base Rule Class

All rules inherit from a single `BaseRule` abstract class. The `check_type` and `action_type` are **metadata only** - they don't affect the execution logic, just provide information for the frontend and monitoring.

```python
# services/analysis/rules/base.py
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.schemas.analysis import ImprovementPoint

class BaseRule(ABC):
    """
    Base class for all analysis rules.
    
    Each rule can use mechanical checks, LLM, or a combination - it's up to the implementation.
    The check_type and action_type are metadata for UI/monitoring purposes only.
    """
    
    def __init__(self):
        self.rule_id = self.__class__.__name__
        self.section_id = "content"      # Override in subclass: 'content', 'ats', 'style'
        self.severity = "medium"         # Override: 'high', 'medium', 'low'
        self.score_impact = 3            # Override: 1-10
        self.check_type = "mechanical"   # Metadata: 'mechanical', 'llm', 'llm_assisted'
        self.action_type = "go_to_edit"  # Metadata: 'go_to_edit', 'fix', 'both'
    
    @abstractmethod
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Detect issues in the resume.
        
        Can use any approach:
        - Pure mechanical checks (regex, length, etc.)
        - LLM-based detection
        - Hybrid approach
        
        Args:
            resume: Resume data dictionary
            
        Returns:
            List of detected improvement points
        """
        pass
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """
        Generate a fix suggestion (optional).
        
        Can return:
        - None: No auto-fix available (user must edit manually)
        - str: Simple mechanical fix
        - str: LLM-generated fix
        
        This method is called only when user clicks "Fix" button.
        
        Args:
            context: Context including original_text and other metadata
            
        Returns:
            Fixed text or None if no auto-fix available
        """
        return None
    
    def create_point(
        self, 
        field_path: str, 
        message: str, 
        **kwargs
    ) -> ImprovementPoint:
        """
        Helper method to create an improvement point with consistent data.
        
        Args:
            field_path: JSON path to the field (e.g., "work_experience[0].achievements")
            message: Human-readable message for the user
            **kwargs: Additional fields (metadata, fix_suggestion, etc.)
            
        Returns:
            ImprovementPoint instance
        """
        return ImprovementPoint(
            id=f"{self.rule_id}_{field_path.replace('[', '_').replace(']', '').replace('.', '_')}",
            rule_id=self.rule_id,
            section_id=self.section_id,
            field_path=field_path,
            message=message,
            score_impact=self.score_impact,
            severity=self.severity,
            check_type=self.check_type,
            action_type=self.action_type,
            **kwargs
        )
```

### Example Rules Implementation

#### Example 1: Pure Mechanical Rule (No LLM)

```python
# services/analysis/rules/content/missing_achievements.py
from typing import List
from app.services.analysis.rules.base import BaseRule
from app.schemas.analysis import ImprovementPoint

class MissingAchievementsRule(BaseRule):
    """Detects work experience entries without achievements."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Simple mechanical check - no LLM needed."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            achievements = exp.get('achievements', [])
            
            if not achievements or len(achievements) == 0:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"Add quantifiable achievements for {exp.get('job_title', 'this role')}"
                ))
        
        return points
    
    # get_fix() not overridden - returns None (no auto-fix)
```

#### Example 2: LLM-Assisted Rule (Mechanical detection + LLM fix)

```python
# services/analysis/rules/content/long_bullets.py
from typing import List, Optional, Dict, Any
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import LLMHelper
from app.schemas.analysis import ImprovementPoint

class LongBulletsRule(BaseRule):
    """Detects and shortens overly long achievement bullets."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "llm_assisted"  # Metadata: detection is mechanical, fix uses LLM
        self.action_type = "fix"
        self.llm_helper = LLMHelper()
        self.max_words = 25
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical detection - simple word count."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                word_count = len(achievement.split())
                
                if word_count > self.max_words:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        message=f"Shorten bullet ({word_count} words → <{self.max_words} words)",
                        metadata={
                            "original_text": achievement,
                            "word_count": word_count
                        }
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM generates shortened version."""
        original_text = context.get("original_text")
        
        if not original_text:
            return None
        
        shortened = await self.llm_helper.shorten_text(
            text=original_text,
            max_words=self.max_words,
            preserve_meaning=True
        )
        
        return shortened
```

#### Example 3: LLM Rule (LLM for detection and/or fix)

```python
# services/analysis/rules/content/achievements_without_metrics.py
import re
from typing import List, Optional, Dict, Any
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import LLMHelper
from app.schemas.analysis import ImprovementPoint

class AchievementsWithoutMetricsRule(BaseRule):
    """Detects achievements without quantifiable metrics and adds them."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
        self.check_type = "llm"  # Metadata: could use LLM for better detection
        self.action_type = "fix"
        self.llm_helper = LLMHelper()
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Detection can use simple heuristics OR LLM.
        Here using heuristics for speed/cost, but could enhance with LLM.
        """
        points = []
        
        # Metric patterns for quick detection
        metric_patterns = [
            r'\d+%',           # 25%
            r'\$\d+',          # $50K
            r'\d+[KMB]',       # 10K, 5M
            r'\d+x',           # 2x
            r'\d+\s*(users|clients|projects|hours|days)',
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                # Quick mechanical check
                has_metric = any(
                    re.search(pattern, achievement, re.IGNORECASE) 
                    for pattern in metric_patterns
                )
                
                if not has_metric and len(achievement) > 10:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        message="Add specific metrics to quantify your impact",
                        metadata={"original_text": achievement}
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM generates version with metrics."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        with_metrics = await self.llm_helper.add_metrics_to_achievement(
            achievement=original,
            prompt=(
                "Add specific quantifiable metrics (percentages, dollar amounts, "
                "numbers of users/projects, time saved) to make this achievement "
                "more concrete and impressive. Keep the core message the same."
            )
        )
        
        return with_metrics
```

### Analysis Service

```python
# services/analysis/analysis_service.py
from typing import List, Dict, Any
from datetime import datetime
from app.schemas.analysis import AnalysisResult, AnalysisSection, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.scoring import calculate_section_score, calculate_overall_score

# Import all rule classes
from app.services.analysis.rules.content import (
    MissingAchievementsRule,
    AchievementsWithoutMetricsRule,
    LongBulletsRule,
    # ... other content rules
)
from app.services.analysis.rules.ats import (
    JobTitleCapitalizationRule,
    MissingKeywordsRule,
    # ... other ATS rules
)
from app.services.analysis.rules.style import (
    WeakVerbsRule,
    PassiveVoiceRule,
    # ... other style rules
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
            AchievementsNotResponsibilitiesRule(),
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
        label, subtitle = self._get_score_label(score)
        
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
        from app.services.analysis.config import AnalysisConfig
        
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
            
            percentage = int((current_points / max_points) * 100)
            
            # Determine status
            if percentage >= 80:
                status = "Strong"
            elif percentage >= 60:
                status = "Good"
            else:
                status = "NeedsWork"
            
            sections.append(AnalysisSection(
                id=section_id,
                title=section_title,
                current_points=current_points,
                max_points=max_points,
                total_points=max_points,
                percentage=percentage,
                status=status,
                improvement_points=points_list
            ))
        
        return sections
    
    def _get_score_label(self, score: int) -> tuple[str, str]:
        """Get label and subtitle based on score."""
        if score >= 90:
            return "Excellent", "Outstanding resume!"
        elif score >= 80:
            return "Strong", "Almost perfect!"
        elif score >= 60:
            return "Good", "Looking solid!"
        elif score >= 40:
            return "Fair", "You're on the right track!"
        else:
            return "Weak", "Let's work on it!"
```

### Key Points

1. **Single Base Class**: All rules inherit from one `BaseRule` - no need for separate `MechanicalRule`, `LLMRule`, etc.

2. **Flexible Implementation**: Each rule decides internally whether to use:
   - Pure mechanical checks
   - LLM for detection
   - LLM for fixes
   - Any combination

3. **Metadata Only**: `check_type` and `action_type` are just labels for:
   - Frontend UI (show correct icons/buttons)
   - Monitoring (track LLM costs)
   - Documentation (understand rule behavior)

4. **Optional Fixes**: Rules override `get_fix()` only if they support auto-fixing

5. **Easy to Extend**: Adding a new rule is simple:
   - Create new class extending `BaseRule`
   - Implement `check()` method
   - Optionally implement `get_fix()` method
   - Add to `AnalysisService._load_rules()`

---

## Analysis Rules

---

## 📦 **Section 1: Content & Structure (50% weight)**

**Goal:** Ensure completeness, achievements, logical flow, and proper structure.

**Total possible impact:** 100 points

---

### Rule 1.1: Missing Achievements

**Field:** `experience[i].achievements`  
**Message:** "Add quantifiable achievements and results for this role."  
**Score Impact:** +8  
**Severity:** 🔴 High  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_achievements(resume: dict) -> List[ImprovementPoint]:
    points = []
    for i, exp in enumerate(resume.get('work_experience', [])):
        achievements = exp.get('achievements', [])
        if not achievements or len(achievements) == 0:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_achievements",
                rule_id="missing_achievements_rule",
                section_id="content",
                field_path=f"work_experience[{i}].achievements",
                message=f"Add quantifiable achievements for {exp.get('job_title', 'this role')}",
                score_impact=8,
                severity="high",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    return points
```

---

### Rule 1.2: Achievements Without Metrics

**Field:** `experience[i].achievements[j]`  
**Message:** "Make this achievement quantifiable by adding metrics (%, $, numbers)."  
**Score Impact:** +6  
**Severity:** 🔴 High  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async async def check_achievements_without_metrics(resume: dict) -> List[ImprovementPoint]:
    import re
    points = []
    metric_patterns = [
        r'\d+%',           # Percentage: 25%
        r'\$\d+',          # Money: $50K
        r'\d+[KMB]',       # Thousands/Millions: 10K, 5M
        r'\d+x',           # Multiplier: 2x, 3x
        r'\d+\s*(users|clients|projects)',  # Count with unit
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        for j, achievement in enumerate(exp.get('achievements', [])):
            has_metric = any(re.search(pattern, achievement) for pattern in metric_patterns)
            if not has_metric and len(achievement) > 10:
                points.append(ImprovementPoint(
                    id=f"exp_{i}_ach_{j}_no_metrics",
                    rule_id="achievements_without_metrics_rule",
                    section_id="content",
                    field_path=f"work_experience[{i}].achievements[{j}]",
                    message="Add specific metrics to quantify your impact",
                    score_impact=6,
                    severity="high",
                    check_type="llm",
                    action_type="fix",
                    metadata={"original_text": achievement}
                ))
    return points
```

---

### Rule 1.3: Achievements Not Responsibilities

**Field:** `experience[i].achievements[j]`  
**Message:** "Convert responsibility-oriented language into impact-oriented achievements."  
**Score Impact:** +5  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_achievements_not_responsibilities(resume: dict) -> List[ImprovementPoint]:
    points = []
    responsibility_phrases = [
        'responsible for',
        'worked on',
        'duties included',
        'in charge of',
        'tasked with',
        'managed to',
        'helped with'
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        for j, achievement in enumerate(exp.get('achievements', [])):
            text_lower = achievement.lower()
            if any(phrase in text_lower for phrase in responsibility_phrases):
                points.append(ImprovementPoint(
                    id=f"exp_{i}_ach_{j}_responsibility",
                    rule_id="achievements_not_responsibilities_rule",
                    section_id="content",
                    field_path=f"work_experience[{i}].achievements[{j}]",
                    message="Rewrite to focus on results and impact, not just duties",
                    score_impact=5,
                    severity="medium",
                    check_type="llm",
                    action_type="fix",
                    metadata={"original_text": achievement}
                ))
    return points
```

---

### Rule 1.4: Missing Company/Project Description

**Field:** `experience[i].short_description`  
**Message:** "Add 1–2 sentence context about company or project scope."  
**Score Impact:** +3  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async async def check_missing_company_description(resume: dict) -> List[ImprovementPoint]:
    points = []
    for i, exp in enumerate(resume.get('work_experience', [])):
        description = exp.get('short_description', '').strip()
        if not description or len(description) < 10:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_description",
                rule_id="missing_company_description_rule",
                section_id="content",
                field_path=f"work_experience[{i}].short_description",
                message=f"Add context about {exp.get('company', 'the company')} or project",
                score_impact=3,
                severity="low",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    return points
```

---

### Rule 1.5: Missing Degree in Education

**Field:** `education[i].degree`  
**Message:** "Add your degree/qualification for this program."  
**Score Impact:** +7  
**Severity:** 🔴 High  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_degree(resume: dict) -> List[ImprovementPoint]:
    points = []
    for i, edu in enumerate(resume.get('education', [])):
        degree = edu.get('degree', '').strip()
        if not degree:
            points.append(ImprovementPoint(
                id=f"edu_{i}_no_degree",
                rule_id="missing_degree_rule",
                section_id="content",
                field_path=f"education[{i}].degree",
                message=f"Specify degree for {edu.get('institution', 'this program')}",
                score_impact=7,
                severity="high",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    return points
```

---

### Rule 1.6: Missing Field of Study

**Field:** `education[i].field_of_study`  
**Message:** "Add your field of study/major."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_field_of_study(resume: dict) -> List[ImprovementPoint]:
    points = []
    for i, edu in enumerate(resume.get('education', [])):
        field = edu.get('field_of_study', '').strip()
        if not field:
            points.append(ImprovementPoint(
                id=f"edu_{i}_no_field",
                rule_id="missing_field_of_study_rule",
                section_id="content",
                field_path=f"education[{i}].field_of_study",
                message="Add your major or specialization",
                score_impact=4,
                severity="medium",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    return points
```

---

### Rule 1.7: Long Achievement Bullets

**Field:** `experience[i].achievements[j]`  
**Message:** "Shorten this bullet for clarity and scanning (aim for <25 words)."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM-assisted mechanical

**Pseudocode:**
```python
async def check_long_bullets(resume: dict) -> List[ImprovementPoint]:
    points = []
    max_words = 25
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        for j, achievement in enumerate(exp.get('achievements', [])):
            word_count = len(achievement.split())
            if word_count > max_words:
                points.append(ImprovementPoint(
                    id=f"exp_{i}_ach_{j}_too_long",
                    rule_id="long_bullets_rule",
                    section_id="content",
                    field_path=f"work_experience[{i}].achievements[{j}]",
                    message=f"Shorten bullet ({word_count} words → <{max_words} words)",
                    score_impact=2,
                    severity="low",
                    check_type="llm_assisted",
                    action_type="fix",
                    metadata={"original_text": achievement, "word_count": word_count}
                ))
    return points
```

---

### Rule 1.8: Missing Technologies/Tools

**Field:** `experience[i].technologies_tools`  
**Message:** "Add tools & technologies used in this role."  
**Score Impact:** +5  
**Severity:** 🟠 Medium  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_technologies(resume: dict) -> List[ImprovementPoint]:
    points = []
    for i, exp in enumerate(resume.get('work_experience', [])):
        technologies = exp.get('technologies_tools', [])
        if not technologies or len(technologies) == 0:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_technologies",
                rule_id="missing_technologies_rule",
                section_id="content",
                field_path=f"work_experience[{i}].technologies_tools",
                message=f"List technologies used in {exp.get('job_title', 'this role')}",
                score_impact=5,
                severity="medium",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    return points
```

---

### Rule 1.9: Missing Professional Summary

**Field:** `professional_summary`  
**Message:** "Add a professional summary to introduce yourself."  
**Score Impact:** +6  
**Severity:** 🔴 High  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_summary(resume: dict) -> List[ImprovementPoint]:
    points = []
    summary = resume.get('professional_summary', '').strip()
    if not summary or len(summary) < 20:
        points.append(ImprovementPoint(
            id="no_professional_summary",
            rule_id="missing_professional_summary_rule",
            section_id="content",
            field_path="professional_summary",
            message="Add a compelling professional summary (2-3 sentences)",
            score_impact=6,
            severity="high",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    return points
```

---

### Rule 1.10: Summary Too Short

**Field:** `professional_summary`  
**Message:** "Expand your summary to at least 100 characters."  
**Score Impact:** +3  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_summary_too_short(resume: dict) -> List[ImprovementPoint]:
    points = []
    summary = resume.get('professional_summary', '').strip()
    min_length = 100
    
    if summary and len(summary) < min_length:
        points.append(ImprovementPoint(
            id="summary_too_short",
            rule_id="summary_too_short_rule",
            section_id="content",
            field_path="professional_summary",
            message=f"Expand summary ({len(summary)} → {min_length}+ characters)",
            score_impact=3,
            severity="low",
            check_type="llm",
            action_type="fix",
            metadata={"current_length": len(summary), "original_text": summary}
        ))
    return points
```

---

### Rule 1.11: Summary Too Long

**Field:** `professional_summary`  
**Message:** "Shorten summary to keep it concise (<500 characters)."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_summary_too_long(resume: dict) -> List[ImprovementPoint]:
    points = []
    summary = resume.get('professional_summary', '').strip()
    max_length = 500
    
    if len(summary) > max_length:
        points.append(ImprovementPoint(
            id="summary_too_long",
            rule_id="summary_too_long_rule",
            section_id="content",
            field_path="professional_summary",
            message=f"Condense summary ({len(summary)} → <{max_length} characters)",
            score_impact=2,
            severity="low",
            check_type="llm",
            action_type="fix",
            metadata={"current_length": len(summary), "original_text": summary}
        ))
    return points
```

---

### Rule 1.12: Too Few Skills

**Field:** `skills`  
**Message:** "Add more relevant skills (aim for at least 8-10)."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_too_few_skills(resume: dict) -> List[ImprovementPoint]:
    points = []
    skills = resume.get('skills', [])
    min_skills = 8
    
    if len(skills) < min_skills:
        points.append(ImprovementPoint(
            id="too_few_skills",
            rule_id="too_few_skills_rule",
            section_id="content",
            field_path="skills",
            message=f"Add more skills ({len(skills)} → {min_skills}+ skills)",
            score_impact=4,
            severity="medium",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    return points
```

---

### Rule 1.13: Too Many Skills

**Field:** `skills`  
**Message:** "Reduce skills list to most relevant (aim for 15-20 max)."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_too_many_skills(resume: dict) -> List[ImprovementPoint]:
    points = []
    skills = resume.get('skills', [])
    max_skills = 20
    
    if len(skills) > max_skills:
        points.append(ImprovementPoint(
            id="too_many_skills",
            rule_id="too_many_skills_rule",
            section_id="content",
            field_path="skills",
            message=f"Focus on top skills ({len(skills)} → <{max_skills} skills)",
            score_impact=2,
            severity="low",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    return points
```

---

### Rule 1.14: Missing Contact Information

**Field:** `personal_info.contacts.email`, `personal_info.contacts.phone`  
**Message:** "Add essential contact information."  
**Score Impact:** +8  
**Severity:** 🔴 High  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_contacts(resume: dict) -> List[ImprovementPoint]:
    points = []
    personal_info = resume.get('personal_info', {})
    contacts = personal_info.get('contacts', {})
    
    if not contacts.get('email'):
        points.append(ImprovementPoint(
            id="no_email",
            rule_id="missing_email_rule",
            section_id="content",
            field_path="personal_info.contacts.email",
            message="Add your email address",
            score_impact=8,
            severity="high",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    
    if not contacts.get('phone'):
        points.append(ImprovementPoint(
            id="no_phone",
            rule_id="missing_phone_rule",
            section_id="content",
            field_path="personal_info.contacts.phone",
            message="Add your phone number",
            score_impact=5,
            severity="medium",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    
    return points
```

---

### Rule 1.15: Missing Professional Links

**Field:** `personal_info.contacts.linkedin`, `personal_info.contacts.github`  
**Message:** "Add professional profile links (LinkedIn, GitHub, portfolio)."  
**Score Impact:** +3  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_professional_links(resume: dict) -> List[ImprovementPoint]:
    points = []
    personal_info = resume.get('personal_info', {})
    contacts = personal_info.get('contacts', {})
    
    has_linkedin = contacts.get('linkedin')
    has_github = contacts.get('github')
    has_website = contacts.get('website')
    
    if not any([has_linkedin, has_github, has_website]):
        points.append(ImprovementPoint(
            id="no_professional_links",
            rule_id="missing_professional_links_rule",
            section_id="content",
            field_path="personal_info.contacts",
            message="Add at least one professional link (LinkedIn/GitHub/Portfolio)",
            score_impact=3,
            severity="low",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    
    return points
```

---

## ⚙️ **Section 2: ATS Optimization (30% weight)**

**Goal:** Ensure ATS compatibility, keyword optimization, and proper formatting.

**Total possible impact:** 60 points

---

### Rule 2.1: Incorrect Job Title Capitalization

**Field:** `experience[i].job_title`  
**Message:** "Capitalize job title properly (use Title Case)."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Fix  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_job_title_capitalization(resume: dict) -> List[ImprovementPoint]:
    import re
    points = []
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        job_title = exp.get('job_title', '').strip()
        if not job_title:
            continue
            
        # Check if not in Title Case and not all uppercase (acronyms ok)
        if job_title != job_title.title() and not job_title.isupper():
            # Ignore if contains common acronyms
            if not re.search(r'\b[A-Z]{2,}\b', job_title):
                points.append(ImprovementPoint(
                    id=f"exp_{i}_title_capitalization",
                    rule_id="job_title_capitalization_rule",
                    section_id="ats",
                    field_path=f"work_experience[{i}].job_title",
                    message="Use consistent Title Case for job title",
                    score_impact=2,
                    severity="low",
                    check_type="mechanical",
                    action_type="fix",
                    fix_suggestion=job_title.title()
                ))
    return points
```

---

### Rule 2.2: Missing Important Keywords

**Field:** `skills`, `experience[i].achievements`  
**Message:** "Add missing keywords relevant to your target role."  
**Score Impact:** +7  
**Severity:** 🔴 High  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_missing_keywords(resume: dict, target_role: Optional[str] = None) -> List[ImprovementPoint]:
    """
    This check requires LLM to analyze industry-specific keywords
    Based on current_role or target_role, suggest relevant keywords
    """
    points = []
    current_role = resume.get('personal_info', {}).get('current_role', '')
    skills = resume.get('skills', [])
    
    # Common tech keywords by domain (can be expanded with LLM analysis)
    keyword_sets = {
        'data': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Analytics'],
        'ml': ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Deep Learning', 'NLP'],
        'backend': ['API', 'REST', 'Database', 'Docker', 'Kubernetes'],
        'frontend': ['React', 'Vue', 'Angular', 'TypeScript', 'CSS'],
    }
    
    # This is simplified - in reality, use LLM to analyze
    # For MVP, can use simple keyword matching
    
    # Example: if role contains "ML Engineer" but no ML keywords
    role_lower = current_role.lower()
    missing_keywords = []
    
    for domain, keywords in keyword_sets.items():
        if domain in role_lower:
            for keyword in keywords:
                if not any(keyword.lower() in skill.lower() for skill in skills):
                    missing_keywords.append(keyword)
    
    if missing_keywords:
        points.append(ImprovementPoint(
            id="missing_keywords",
            rule_id="missing_keywords_rule",
            section_id="ats",
            field_path="skills",
            message=f"Consider adding: {', '.join(missing_keywords[:5])}",
            score_impact=7,
            severity="high",
            check_type="llm",
            action_type="fix",
            metadata={"suggested_keywords": missing_keywords}
        ))
    
    return points
```

---

### Rule 2.3: Invalid Date Ranges

**Field:** `experience[i].start_date`, `experience[i].end_date`  
**Message:** "Correct inconsistent dates in your work history."  
**Score Impact:** +6  
**Severity:** 🔴 High  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
from datetime import datetime

def parse_date(date_str: str) -> datetime:
    """Parse date string using common formats"""
    formats = [
        "%Y-%m-%d",      # 2020-01-15
        "%Y/%m/%d",      # 2020/01/15
        "%b %Y",         # Jan 2020
        "%B %Y",         # January 2020
        "%m/%Y",         # 01/2020
        "%Y-%m",         # 2020-01
        "%Y",            # 2020
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unable to parse date: {date_str}")

async def check_invalid_dates(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        start_date_str = exp.get('start_date', '')
        end_date_str = exp.get('end_date', '')
        
        if not start_date_str:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_start_date",
                rule_id="missing_start_date_rule",
                section_id="ats",
                field_path=f"work_experience[{i}].start_date",
                message="Add start date for this position",
                score_impact=5,
                severity="high",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
            continue
        
        try:
            start_date = parse_date(start_date_str)
            
            # If end_date exists and is not "Present", validate
            if end_date_str and end_date_str.lower() not in ['present', 'current', 'now']:
                end_date = parse_date(end_date_str)
                
                # Check if start_date > end_date
                if start_date > end_date:
                    points.append(ImprovementPoint(
                        id=f"exp_{i}_invalid_date_range",
                        rule_id="invalid_date_range_rule",
                        section_id="ats",
                        field_path=f"work_experience[{i}]",
                        message="Start date is after end date - please correct",
                        score_impact=6,
                        severity="high",
                        check_type="mechanical",
                        action_type="go_to_edit"
                    ))
        except (ValueError, Exception):
            points.append(ImprovementPoint(
                id=f"exp_{i}_unparseable_date",
                rule_id="unparseable_date_rule",
                section_id="ats",
                field_path=f"work_experience[{i}]",
                message="Use consistent date format (e.g., 'Jan 2020')",
                score_impact=4,
                severity="medium",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    
    return points
```

---

### Rule 2.4: Employment Gaps

**Field:** `experience[i].end_date`, `experience[i+1].start_date`  
**Message:** "Consider explaining employment gap (freelance, study, sabbatical)."  
**Score Impact:** +3  
**Severity:** 🟠 Medium  
**Action:** Go to Edit  
**Type:** LLM-assisted mechanical

**Pseudocode:**
```python
from datetime import datetime

def parse_date(date_str: str) -> datetime:
    """Parse date string using common formats"""
    formats = [
        "%Y-%m-%d",      # 2020-01-15
        "%Y/%m/%d",      # 2020/01/15
        "%b %Y",         # Jan 2020
        "%B %Y",         # January 2020
        "%m/%Y",         # 01/2020
        "%Y-%m",         # 2020-01
        "%Y",            # 2020
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unable to parse date: {date_str}")

def months_between(date1: datetime, date2: datetime) -> int:
    """Calculate number of months between two dates"""
    return (date1.year - date2.year) * 12 + (date1.month - date2.month)

async def check_employment_gaps(resume: dict) -> List[ImprovementPoint]:
    points = []
    experiences = resume.get('work_experience', [])
    
    if len(experiences) < 2:
        return points
    
    # Sort by start_date
    def get_sort_date(exp):
        try:
            return parse_date(exp.get('start_date', '1900-01-01'))
        except:
            return datetime(1900, 1, 1)
    
    sorted_exp = sorted(experiences, key=get_sort_date, reverse=True)
    
    for i in range(len(sorted_exp) - 1):
        current = sorted_exp[i]
        previous = sorted_exp[i + 1]
        
        try:
            # End date of previous job
            prev_end_str = previous.get('end_date', '')
            if prev_end_str.lower() in ['present', 'current', 'now']:
                continue
                
            prev_end = parse_date(prev_end_str)
            current_start = parse_date(current.get('start_date'))
            
            # Calculate gap in months
            gap_months = months_between(current_start, prev_end)
            
            # Flag if gap > 6 months
            if gap_months > 6:
                points.append(ImprovementPoint(
                    id=f"gap_between_{i}_and_{i+1}",
                    rule_id="employment_gap_rule",
                    section_id="ats",
                    field_path=f"work_experience",
                    message=f"{gap_months}-month gap detected - consider adding explanation",
                    score_impact=3,
                    severity="medium",
                    check_type="llm_assisted",
                    action_type="go_to_edit",
                    metadata={"gap_months": gap_months}
                ))
        except (ValueError, Exception):
            continue
    
    return points
```

---

### Rule 2.5: Inconsistent Date Formats

**Field:** `experience[i].start_date`, `education[i].start_date`  
**Message:** "Use consistent date format across all entries."  
**Score Impact:** +3  
**Severity:** 🟠 Medium  
**Action:** Fix  
**Type:** Mechanical

**Pseudocode:**
```python
import re

async def check_inconsistent_date_formats(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Collect dates by section
    work_dates = []
    edu_dates = []
    
    # Collect work experience dates
    for exp in resume.get('work_experience', []):
        if exp.get('start_date'):
            work_dates.append(exp['start_date'])
        if exp.get('end_date'):
            work_dates.append(exp['end_date'])
    
    # Collect education dates
    for edu in resume.get('education', []):
        if edu.get('start_date'):
            edu_dates.append(edu['start_date'])
        if edu.get('end_date'):
            edu_dates.append(edu['end_date'])
    
    all_dates = work_dates + edu_dates
    
    if len(all_dates) < 2:
        return points
    
    # Define date format patterns
    formats = {
        'YYYY-MM-DD': r'^\d{4}-\d{2}-\d{2}$',
        'Mon YYYY': r'^[A-Za-z]{3}\s\d{4}$',
        'Month YYYY': r'^[A-Za-z]+\s\d{4}$',
        'MM/YYYY': r'^\d{2}/\d{4}$',
    }
    
    # Detect formats
    detected_formats = set()
    for date_str in all_dates:
        date_lower = date_str.lower()
        if date_lower in ['present', 'current', 'now']:
            continue
        for fmt_name, pattern in formats.items():
            if re.match(pattern, date_str):
                detected_formats.add(fmt_name)
                break
    
    # If more than one format detected, create separate points
    if len(detected_formats) > 1:
        formats_str = ', '.join(detected_formats)
        
        # Add point for work experience if it has dates
        if work_dates:
            points.append(ImprovementPoint(
                id="inconsistent_date_formats_work",
                rule_id="inconsistent_date_formats_rule",
                section_id="ats",
                field_path="work_experience",
                message=f"Standardize date format in work experience (found: {formats_str})",
                score_impact=2,
                severity="medium",
                check_type="mechanical",
                action_type="fix"
            ))
        
        # Add point for education if it has dates
        if edu_dates:
            points.append(ImprovementPoint(
                id="inconsistent_date_formats_education",
                rule_id="inconsistent_date_formats_rule",
                section_id="ats",
                field_path="education",
                message=f"Standardize date format in education (found: {formats_str})",
                score_impact=1,
                severity="low",
                check_type="mechanical",
                action_type="fix"
            ))
    
    return points
```

---

### Rule 2.6: Missing Location for Experience

**Field:** `experience[i].city`, `experience[i].country`  
**Message:** "Add location (city/country) for this position."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_missing_experience_location(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        city = exp.get('city', '').strip()
        country = exp.get('country', '').strip()
        
        if not city and not country:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_location",
                rule_id="missing_experience_location_rule",
                section_id="ats",
                field_path=f"work_experience[{i}]",
                message=f"Add location for {exp.get('company', 'this position')}",
                score_impact=2,
                severity="low",
                check_type="mechanical",
                action_type="go_to_edit"
            ))
    
    return points
```

---

### Rule 2.7: Skills Not Mentioned in Experience

**Field:** `skills`, `experience[i]`  
**Message:** "Some skills are not demonstrated in your work experience."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Go to Edit  
**Type:** LLM-assisted mechanical

**Pseudocode:**
```python
async def check_skills_not_in_experience(resume: dict) -> List[ImprovementPoint]:
    points = []
    skills = resume.get('skills', [])
    
    # Collect all text from experience
    experience_text = ""
    for exp in resume.get('work_experience', []):
        experience_text += " " + exp.get('job_title', '')
        experience_text += " " + exp.get('short_description', '')
        for ach in exp.get('achievements', []):
            experience_text += " " + ach
        for tech in exp.get('technologies_tools', []):
            experience_text += " " + tech
    
    experience_text_lower = experience_text.lower()
    
    unmentioned_skills = []
    for skill in skills:
        if skill.lower() not in experience_text_lower:
            unmentioned_skills.append(skill)
    
    # Flag if more than 30% skills are unmentioned - create separate points
    if len(unmentioned_skills) > len(skills) * 0.3:
        # Point for skills section - to remove unmentioned
        points.append(ImprovementPoint(
            id="unmentioned_skills_remove",
            rule_id="skills_not_in_experience_rule",
            section_id="ats",
            field_path="skills",
            message=f"Remove {len(unmentioned_skills)} skills not demonstrated in experience",
            score_impact=2,
            severity="medium",
            check_type="llm_assisted",
            action_type="go_to_edit",
            metadata={"unmentioned_skills": unmentioned_skills[:5]}
        ))
        
        # Point for work experience - to add skill demonstrations
        points.append(ImprovementPoint(
            id="unmentioned_skills_demonstrate",
            rule_id="skills_not_in_experience_rule",
            section_id="ats",
            field_path="work_experience",
            message=f"Add examples demonstrating your listed skills in work experience",
            score_impact=2,
            severity="medium",
            check_type="llm_assisted",
            action_type="go_to_edit",
            metadata={"unmentioned_skills": unmentioned_skills[:5]}
        ))
    
    return points
```

---

### Rule 2.8: Resume Length Issues

**Field:** Resume overall  
**Message:** "Resume length is not optimal (aim for 400-600 words per page)."  
**Score Impact:** +3  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** Mechanical

**Pseudocode:**
```python
async def check_resume_length(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Calculate total word count
    total_words = 0
    
    # Summary
    total_words += len(resume.get('professional_summary', '').split())
    
    # Skills
    total_words += len(resume.get('skills', []))
    
    # Experience
    for exp in resume.get('work_experience', []):
        total_words += len(exp.get('short_description', '').split())
        for ach in exp.get('achievements', []):
            total_words += len(ach.split())
    
    # Education
    for edu in resume.get('education', []):
        total_words += len(' '.join(edu.get('relevant_courses', [])).split())
    
    # Optimal: 400-600 words (1 page) or 800-1200 words (2 pages)
    if total_words < 300:
        points.append(ImprovementPoint(
            id="resume_too_short",
            rule_id="resume_length_rule",
            section_id="ats",
            field_path="resume",
            message=f"Resume is too brief ({total_words} words) - add more details",
            score_impact=4,
            severity="medium",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    elif total_words > 1500:
        points.append(ImprovementPoint(
            id="resume_too_long",
            rule_id="resume_length_rule",
            section_id="ats",
            field_path="resume",
            message=f"Resume is too long ({total_words} words) - consider condensing",
            score_impact=3,
            severity="low",
            check_type="mechanical",
            action_type="go_to_edit"
        ))
    
    return points
```

---

### Rule 2.9: Generic Job Titles

**Field:** `experience[i].job_title`  
**Message:** "Use specific job title that matches industry standards."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_generic_job_titles(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Generic titles to flag
    generic_titles = [
        'employee',
        'worker',
        'staff',
        'member',
        'associate',
        'specialist',  # Only if standalone
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        job_title = exp.get('job_title', '').strip().lower()
        
        # Check if title is too generic
        if any(generic in job_title for generic in generic_titles) and len(job_title.split()) <= 2:
            points.append(ImprovementPoint(
                id=f"exp_{i}_generic_title",
                rule_id="generic_job_title_rule",
                section_id="ats",
                field_path=f"work_experience[{i}].job_title",
                message="Use more specific job title reflecting your actual role",
                score_impact=4,
                severity="medium",
                check_type="llm",
                action_type="fix",
                metadata={"original_title": exp.get('job_title')}
            ))
    
    return points
```

---

## ✍️ **Section 3: Style & Grammar (20% weight)**

**Goal:** Ensure professional language, consistent style, and grammatical correctness.

**Total possible impact:** 40 points

---

### Rule 3.1: Inconsistent Verb Tense

**Field:** `experience[i].achievements`  
**Message:** "Use consistent verb tense (past for previous roles, present for current)."  
**Score Impact:** +5  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_inconsistent_verb_tense(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        # Determine if current position
        end_date = exp.get('end_date', '').lower()
        is_current = end_date in ['present', 'current', 'now', ''] or not end_date
        
        achievements = exp.get('achievements', [])
        if not achievements:
            continue
        
        # Simple heuristic: check first word of each achievement
        # For proper check, would need NLP/LLM
        mixed_tenses = False
        present_verbs = ['lead', 'manage', 'develop', 'implement', 'create']
        past_verbs = ['led', 'managed', 'developed', 'implemented', 'created']
        
        has_present = any(
            any(verb in ach.lower()[:20] for verb in present_verbs)
            for ach in achievements
        )
        has_past = any(
            any(verb in ach.lower()[:20] for verb in past_verbs)
            for ach in achievements
        )
        
        if has_present and has_past:
            mixed_tenses = True
        
        # Or check if tense doesn't match job status
        wrong_tense = (is_current and not has_present) or (not is_current and has_present)
        
        if mixed_tenses or wrong_tense:
            expected = "present" if is_current else "past"
            points.append(ImprovementPoint(
                id=f"exp_{i}_inconsistent_tense",
                rule_id="inconsistent_verb_tense_rule",
                section_id="style",
                field_path=f"work_experience[{i}].achievements",
                message=f"Use {expected} tense consistently for this {'current' if is_current else 'past'} role",
                score_impact=5,
                severity="medium",
                check_type="llm",
                action_type="fix"
            ))
    
    return points
```

---

### Rule 3.2: Weak Action Verbs

**Field:** `experience[i].achievements[j]`  
**Message:** "Replace weak verbs with strong action verbs."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_weak_verbs(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    weak_verbs = [
        'helped', 'assisted', 'participated', 'involved',
        'worked on', 'dealt with', 'handled', 'did',
        'made', 'got', 'tried', 'attempted'
    ]
    
    strong_alternatives = {
        'helped': ['facilitated', 'supported', 'enabled'],
        'assisted': ['supported', 'coordinated', 'collaborated'],
        'participated': ['contributed', 'engaged', 'collaborated'],
        'worked on': ['developed', 'built', 'implemented'],
    }
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        weak_achievements = []
        
        for j, achievement in enumerate(exp.get('achievements', [])):
            ach_lower = achievement.lower()
            found_weak = None
            
            for weak in weak_verbs:
                if weak in ach_lower[:30]:  # Check beginning of sentence
                    found_weak = weak
                    break
            
            if found_weak:
                weak_achievements.append((j, achievement, found_weak))
        
        # If multiple weak verbs found, create improvement point
        if len(weak_achievements) >= 2:
            points.append(ImprovementPoint(
                id=f"exp_{i}_weak_verbs",
                rule_id="weak_action_verbs_rule",
                section_id="style",
                field_path=f"work_experience[{i}].achievements",
                message=f"Replace weak verbs with stronger alternatives in {len(weak_achievements)} bullets",
                score_impact=4,
                severity="medium",
                check_type="llm",
                action_type="fix",
                metadata={"weak_achievements": weak_achievements}
            ))
    
    return points
```

---

### Rule 3.3: Repetitive Wording

**Field:** `experience[i].achievements`, `professional_summary`  
**Message:** "Vary your wording to avoid repetition."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM-assisted mechanical

**Pseudocode:**
```python
from collections import Counter

async def check_repetitive_wording(resume: dict) -> List[ImprovementPoint]:
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
            points.append(ImprovementPoint(
                id="repetitive_wording_summary",
                rule_id="repetitive_wording_rule",
                section_id="style",
                field_path="professional_summary",
                message=f"Vary wording - '{repeated_phrases[0]}' repeated multiple times",
                score_impact=1,
                severity="low",
                check_type="llm_assisted",
                action_type="fix",
                metadata={"repeated_phrases": repeated_phrases[:3]}
            ))
        
        if experience_text:
            points.append(ImprovementPoint(
                id="repetitive_wording_experience",
                rule_id="repetitive_wording_rule",
                section_id="style",
                field_path="work_experience",
                message=f"Vary wording - '{repeated_phrases[0]}' repeated {bigram_counts[repeated_phrases[0]]} times",
                score_impact=1,
                severity="low",
                check_type="llm_assisted",
                action_type="fix",
                metadata={"repeated_phrases": repeated_phrases[:3]}
            ))
    
    return points
```

---

### Rule 3.4: Filler Phrases

**Field:** `experience[i].achievements[j]`  
**Message:** "Remove filler phrases to make bullets more concise."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_filler_phrases(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    filler_phrases = [
        'in order to',
        'moreover',
        'additionally',
        'furthermore',
        'as well as',
        'in addition to',
        'it should be noted that',
        'it is important to',
        'basically',
        'actually',
        'literally'
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        for j, achievement in enumerate(exp.get('achievements', [])):
            ach_lower = achievement.lower()
            found_fillers = [filler for filler in filler_phrases if filler in ach_lower]
            
            if found_fillers:
                points.append(ImprovementPoint(
                    id=f"exp_{i}_ach_{j}_filler",
                    rule_id="filler_phrases_rule",
                    section_id="style",
                    field_path=f"work_experience[{i}].achievements[{j}]",
                    message=f"Remove filler phrase: '{found_fillers[0]}'",
                    score_impact=2,
                    severity="low",
                    check_type="llm",
                    action_type="fix",
                    metadata={"original_text": achievement, "fillers": found_fillers}
                ))
    
    return points
```

---

### Rule 3.5: Passive Voice

**Field:** `experience[i].achievements[j]`  
**Message:** "Use active voice instead of passive for stronger impact."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_passive_voice(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Common passive voice indicators
    passive_indicators = [
        'was ', 'were ', 'been ', 'being ',
        'was developed', 'was created', 'was implemented',
        'were used', 'were applied', 'been completed'
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        passive_achievements = []
        
        for j, achievement in enumerate(exp.get('achievements', [])):
            ach_lower = achievement.lower()
            
            if any(indicator in ach_lower for indicator in passive_indicators):
                passive_achievements.append((j, achievement))
        
        if passive_achievements:
            points.append(ImprovementPoint(
                id=f"exp_{i}_passive_voice",
                rule_id="passive_voice_rule",
                section_id="style",
                field_path=f"work_experience[{i}].achievements",
                message=f"Convert {len(passive_achievements)} bullet(s) to active voice",
                score_impact=4,
                severity="medium",
                check_type="llm",
                action_type="fix",
                metadata={"passive_achievements": passive_achievements}
            ))
    
    return points
```

---

### Rule 3.6: Personal Pronouns

**Field:** `experience[i].achievements[j]`, `professional_summary`  
**Message:** "Remove personal pronouns (I, my, we) from achievements."  
**Score Impact:** +3  
**Severity:** 🟠 Medium  
**Action:** Fix  
**Type:** Mechanical

**Pseudocode:**
```python
import re

async def check_personal_pronouns(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    pronoun_pattern = r'\b(I|me|my|mine|we|our|ours)\b'
    
    # Check summary
    summary = resume.get('professional_summary', '')
    if re.search(pronoun_pattern, summary, re.IGNORECASE):
        points.append(ImprovementPoint(
            id="summary_has_pronouns",
            rule_id="personal_pronouns_rule",
            section_id="style",
            field_path="professional_summary",
            message="Remove personal pronouns from summary",
            score_impact=3,
            severity="medium",
            check_type="mechanical",
            action_type="fix"
        ))
    
    # Check achievements
    for i, exp in enumerate(resume.get('work_experience', [])):
        pronoun_count = 0
        
        for j, achievement in enumerate(exp.get('achievements', [])):
            if re.search(pronoun_pattern, achievement, re.IGNORECASE):
                pronoun_count += 1
        
        if pronoun_count > 0:
            points.append(ImprovementPoint(
                id=f"exp_{i}_has_pronouns",
                rule_id="personal_pronouns_rule",
                section_id="style",
                field_path=f"work_experience[{i}].achievements",
                message=f"Remove pronouns from {pronoun_count} bullet(s)",
                score_impact=3,
                severity="medium",
                check_type="mechanical",
                action_type="fix"
            ))
    
    return points
```

---

### Rule 3.7: Jargon and Buzzwords

**Field:** `experience[i].achievements[j]`, `professional_summary`  
**Message:** "Replace buzzwords with concrete, specific terms."  
**Score Impact:** +3  
**Severity:** 🟡 Low  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_buzzwords(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    buzzwords = [
        'synergy', 'leverage', 'paradigm', 'disruptive',
        'innovative', 'cutting-edge', 'best-in-class',
        'world-class', 'rockstar', 'ninja', 'guru',
        'think outside the box', 'game-changer',
        'strategic', 'dynamic', 'results-oriented'
    ]
    
    # Check professional summary
    summary_text = resume.get('professional_summary', '')
    summary_buzzwords = [bw for bw in buzzwords if bw in summary_text.lower()]
    
    # Check work experience
    experience_text = ''
    for exp in resume.get('work_experience', []):
        experience_text += ' ' + ' '.join(exp.get('achievements', []))
    experience_buzzwords = [bw for bw in buzzwords if bw in experience_text.lower()]
    
    # Create separate points for each section
    if summary_buzzwords:
        points.append(ImprovementPoint(
            id="excessive_buzzwords_summary",
            rule_id="buzzwords_rule",
            section_id="style",
            field_path="professional_summary",
            message=f"Replace buzzwords with specific terms: {', '.join(summary_buzzwords[:3])}",
            score_impact=1,
            severity="low",
            check_type="llm",
            action_type="fix",
            metadata={"buzzwords": summary_buzzwords}
        ))
    
    if experience_buzzwords:
        points.append(ImprovementPoint(
            id="excessive_buzzwords_experience",
            rule_id="buzzwords_rule",
            section_id="style",
            field_path="work_experience",
            message=f"Replace buzzwords with specific terms: {', '.join(experience_buzzwords[:3])}",
            score_impact=2,
            severity="low",
            check_type="llm",
            action_type="fix",
            metadata={"buzzwords": experience_buzzwords}
        ))
    
    return points
```

---

### Rule 3.8: Missing Action Verbs

**Field:** `experience[i].achievements[j]`  
**Message:** "Start each bullet with a strong action verb."  
**Score Impact:** +4  
**Severity:** 🟠 Medium  
**Action:** Fix (LLM)  
**Type:** LLM

**Pseudocode:**
```python
async def check_missing_action_verbs(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Strong action verbs (past and present tense)
    action_verbs = [
        'led', 'managed', 'developed', 'implemented', 'created',
        'designed', 'built', 'architected', 'optimized', 'increased',
        'reduced', 'improved', 'launched', 'delivered', 'achieved',
        'lead', 'manage', 'develop', 'implement', 'create',
        'design', 'build', 'architect', 'optimize', 'increase',
    ]
    
    for i, exp in enumerate(resume.get('work_experience', [])):
        weak_bullets = []
        
        for j, achievement in enumerate(exp.get('achievements', [])):
            # Skip empty or whitespace-only achievements
            if not achievement or not achievement.strip():
                continue
                
            words = achievement.split()
            if not words:  # Skip if no words after split
                continue
                
            first_word = words[0].lower().strip('.,;:-')
            
            if first_word not in action_verbs:
                weak_bullets.append((j, achievement))
        
        if len(weak_bullets) >= 2:
            points.append(ImprovementPoint(
                id=f"exp_{i}_no_action_verbs",
                rule_id="missing_action_verbs_rule",
                section_id="style",
                field_path=f"work_experience[{i}].achievements",
                message=f"{len(weak_bullets)} bullets don't start with action verbs",
                score_impact=4,
                severity="medium",
                check_type="llm",
                action_type="fix",
                metadata={"weak_bullets": weak_bullets[:3]}
            ))
    
    return points
```

---

### Rule 3.9: Abbreviations Without Definition

**Field:** `experience[i].achievements[j]`, `skills`  
**Message:** "Define uncommon abbreviations on first use."  
**Score Impact:** +2  
**Severity:** 🟡 Low  
**Action:** Go to Edit  
**Type:** LLM-assisted mechanical

**Pseudocode:**
```python
import re

async def check_undefined_abbreviations(resume: dict) -> List[ImprovementPoint]:
    points = []
    
    # Common acceptable abbreviations (don't need definition)
    common_abbrevs = [
        'api', 'sql', 'html', 'css', 'rest', 'http', 'https',
        'ai', 'ml', 'nlp', 'cv', 'phd', 'mba', 'ba', 'bs', 'ms',
        'ceo', 'cto', 'cfo', 'vp', 'usa', 'uk', 'eu'
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
        points.append(ImprovementPoint(
            id="undefined_abbreviations",
            rule_id="undefined_abbreviations_rule",
            section_id="style",
            field_path="work_experience",
            message=f"Define abbreviations on first use: {', '.join(undefined[:3])}",
            score_impact=2,
            severity="low",
            check_type="llm_assisted",
            action_type="go_to_edit",
            metadata={"undefined": undefined}
        ))
    
    return points
```

---

## Scoring Algorithm

### Section Score Calculation

```python
def calculate_section_score(
    improvement_points: List[ImprovementPoint],
    max_section_score: int
) -> tuple[int, int]:
    """
    Calculate section score based on improvement points
    
    Args:
        improvement_points: List of detected issues
        max_section_score: Maximum possible score for section
    
    Returns:
        (current_score, potential_impact): Current score and total potential gain
    """
    total_impact = sum(point.score_impact for point in improvement_points)
    current_score = max(0, max_section_score - total_impact)
    
    return current_score, total_impact
```

### Overall Score Calculation

```python
def calculate_overall_score(sections: List[AnalysisSection]) -> int:
    """
    Calculate overall score (0-100) based on section weights
    
    Weights:
        - Content & Structure: 50%
        - ATS Optimization: 30%
        - Style & Grammar: 20%
    """
    weights = {
        'content': 0.50,
        'ats': 0.30,
        'style': 0.20
    }
    
    max_scores = {
        'content': 100,
        'ats': 60,
        'style': 40
    }
    
    total_score = 0
    for section in sections:
        section_percentage = (section.current_points / max_scores[section.id]) * 100
        total_score += section_percentage * weights[section.id]
    
    return int(total_score)
```

### Score Labels

| Score Range | Label | Subtitle |
|------------|-------|----------|
| 0-39 | Weak | "Let's work on it!" |
| 40-59 | Fair | "You're on the right track!" |
| 60-79 | Good | "Looking solid!" |
| 80-89 | Strong | "Almost perfect!" |
| 90-100 | Excellent | "Outstanding resume!" |

---

## API Endpoints

### GET /api/v1/analysis/

**Description:** Get analysis for current user's resume

**Authentication:** Required (VerifiedUser)

**Response:**
```json
{
  "score": 68,
  "label": "Good",
  "subtitle": "Looking solid!",
  "sections": [
    {
      "id": "content",
      "title": "Content & Structure",
      "current_points": 78,
      "max_points": 100,
      "percentage": 78,
      "status": "Good",
      "improvement_points": [
        {
          "id": "exp_0_no_achievements",
          "rule_id": "missing_achievements",
          "section_id": "content",
          "field_path": "work_experience[0].achievements",
          "message": "Add quantifiable achievements for Senior Developer",
          "score_impact": 8,
          "severity": "high",
          "check_type": "mechanical",
          "action_type": "go_to_edit"
        }
      ]
    }
  ],
  "total_improvements": 12,
  "potential_score": 95,
  "generated_at": "2025-11-02T14:30:00Z"
}
```

### POST /api/v1/analysis/refresh

**Description:** Force recalculation of analysis (bypass cache)

**Authentication:** Required (VerifiedUser)

### POST /api/v1/analysis/fix

**Description:** Apply LLM-generated fix for specific improvement point

**Authentication:** Required (VerifiedUser)

**Request Body:**
```json
{
  "point_id": "exp_0_ach_1_no_metrics",
  "field_path": "work_experience[0].achievements[1]"
}
```

**Response:**
```json
{
  "original": "Worked on improving system performance",
  "fixed": "Optimized system performance by 40%, reducing response time from 200ms to 120ms",
  "field_path": "work_experience[0].achievements[1]"
}
```

---

## Implementation Strategy

### Phase 1: Mechanical Checks (Week 1)
- Implement all mechanical checks
- Basic API endpoints
- Frontend display of improvement points
- Simple in-memory caching

**Rules to implement:** 1.1, 1.4, 1.5, 1.6, 1.9, 1.12, 1.13, 1.14, 1.15, 2.1, 2.3, 2.5, 2.6, 2.8, 3.6

### Phase 2: LLM-Assisted Checks (Week 2)
- Integrate OpenAI for content analysis
- Implement Fix action buttons
- Add LLM-based improvements
- Redis caching

**Rules to implement:** 1.2, 1.3, 1.7, 1.10, 1.11, 2.2, 2.4, 2.7, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8, 3.9

### Phase 3: Advanced Features (Week 3)
- Detailed recommendations
- Progress tracking
- A/B testing scoring algorithms
- Performance optimization

---

## Testing Strategy

### Unit Tests

```python
# Test each rule individually
def test_check_missing_achievements():
    resume = {
        "work_experience": [
            {"job_title": "Developer", "achievements": []}
        ]
    }
    points = check_missing_achievements(resume)
    assert len(points) == 1
    assert points[0].score_impact == 8

def test_check_achievements_without_metrics():
    resume = {
        "work_experience": [{
            "achievements": [
                "Improved system performance significantly"
            ]
        }]
    }
    points = check_achievements_without_metrics(resume)
    assert len(points) == 1
    assert "metric" in points[0].message.lower()
```

### Integration Tests

```python
def test_full_analysis_empty_resume():
    resume = {}
    service = AnalysisService()
    result = service.analyze_resume(resume)
    
    assert result.score < 30
    assert result.label == "Weak"
    assert len(result.sections[0].improvement_points) > 5

def test_full_analysis_complete_resume():
    resume = load_sample_complete_resume()
    service = AnalysisService()
    result = service.analyze_resume(resume)
    
    assert result.score >= 80
    assert result.label in ["Strong", "Excellent"]
```

---

## Configuration

```python
# config.py
class AnalysisConfig:
    # Thresholds
    MIN_SUMMARY_LENGTH = 100
    MAX_SUMMARY_LENGTH = 500
    MIN_SKILLS_COUNT = 8
    MAX_SKILLS_COUNT = 20
    MAX_BULLET_WORDS = 25
    MIN_RESUME_WORDS = 300
    MAX_RESUME_WORDS = 1500
    EMPLOYMENT_GAP_MONTHS = 6
    
    # Scoring
    SECTION_WEIGHTS = {
        'content': 0.50,
        'ats': 0.30,
        'style': 0.20
    }
    
    # Maximum possible scores per section
    # Note: These are target maximums. The actual max_points for each section
    # is calculated dynamically by summing all possible score_impact values
    # from rules in that section. Current score = max_points - sum(detected_impacts)
    MAX_SECTION_SCORES = {
        'content': 100,
        'ats': 60,
        'style': 40
    }
    
    # LLM
    ENABLE_LLM_CHECKS = True
    LLM_MODEL = "gpt-4o-mini"
    LLM_TEMPERATURE = 0.3
    
    # Cache
    CACHE_TTL = 300  # 5 minutes
    USE_REDIS = True
```

---

**Document Version:** 2.0  
**Last Updated:** 2025-11-02  
**Author:** AI Assistant  
**Status:** Detailed Implementation Spec
