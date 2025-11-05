from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.schemas.analysis import ImprovementPoint


class BaseRule(ABC):
    """
    Base class for all analysis rules.
    
    Rules detect issues and generate structured fixes directly in the check() method.
    Fixes are included as FixSuggestion objects in ImprovementPoints.
    """
    
    def __init__(self):
        self.rule_id = self.__class__.__name__
        self.section_id = "content"  # Override in subclass: 'content', 'ats', 'style'
        self.severity = "medium"  # Override: 'high', 'medium', 'low'
        self.score_impact = 3  # Override: 1-10
    
    @abstractmethod
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Detect issues in the resume and generate fixes in one pass.
        
        Each ImprovementPoint should include fix_suggestion if auto-fix is available.
        
        Can use any approach:
        - Pure mechanical checks (regex, length, etc.)
        - LLM-based detection and fix generation
        - Hybrid approach
        
        Args:
            resume: Resume data dictionary
            
        Returns:
            List of detected improvement points with embedded fix_suggestions
        """
        pass
    
    def create_point(
        self, 
        field_path: str, 
        title: str,
        description: str, 
        **kwargs
    ) -> ImprovementPoint:
        """
        Helper method to create an improvement point with consistent data.
        
        Args:
            field_path: JSON path to the field (e.g., "work_experience[0].achievements")
            title: Short title of the issue
            description: Detailed description of the issue
            **kwargs: Additional fields (metadata, fix_suggestion, etc.)
            
        Returns:
            ImprovementPoint instance
        """
        # Generate unique ID from rule_id and field_path
        point_id = f"{self.rule_id}_{field_path.replace('[', '_').replace(']', '').replace('.', '_')}"
        
        return ImprovementPoint(
            id=point_id,
            rule_id=self.rule_id,
            section_id=self.section_id,
            field_path=field_path,
            title=title,
            description=description,
            score_impact=self.score_impact,
            severity=self.severity,
            **kwargs
        )

