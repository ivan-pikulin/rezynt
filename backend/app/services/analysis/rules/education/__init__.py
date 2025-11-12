"""Education rules"""
from .education_date_validation import EducationDateValidationRule
from .education_relevance import EducationRelevanceRule
from .institution_name_consistency import InstitutionNameConsistencyRule
from .missing_degree import MissingDegreeRule
from .missing_field_of_study import MissingFieldOfStudyRule
from .missing_institution import MissingInstitutionRule
from .relevant_courses import RelevantCoursesRule

__all__ = [
    'EducationDateValidationRule',
    'EducationRelevanceRule',
    'InstitutionNameConsistencyRule',
    'MissingDegreeRule',
    'MissingFieldOfStudyRule',
    'MissingInstitutionRule',
    'RelevantCoursesRule',
]
