from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.schemas.analysis import ImprovementPoint


class BaseRule(ABC):
    """
    Base class for all analysis rules.
    
    Each rule can use mechanical checks, LLM, or a combination - it's up to the implementation.
    The check_type and action_type are metadata for UI/monitoring purposes only.
    """
    
    def __init__(self):
        self.rule_id = self.__class__.__name__
        self.section_id = "content"  # Override in subclass: 'content', 'ats', 'style'
        self.severity = "medium"  # Override: 'high', 'medium', 'low'
        self.score_impact = 3  # Override: 1-10
        self.check_type = "mechanical"  # Metadata: 'mechanical', 'llm', 'llm_assisted'
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
            check_type=self.check_type,
            action_type=self.action_type,
            **kwargs
        )

