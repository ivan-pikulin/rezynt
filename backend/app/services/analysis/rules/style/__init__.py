"""Style & Grammar rules"""
from .inconsistent_verb_tense import InconsistentVerbTenseRule
from .weak_verbs import WeakVerbsRule
from .repetitive_wording import RepetitiveWordingRule
from .filler_phrases import FillerPhrasesRule
from .passive_voice import PassiveVoiceRule
from .personal_pronouns import PersonalPronounsRule
from .buzzwords import BuzzwordsRule
from .missing_action_verbs import MissingActionVerbsRule
from .undefined_abbreviations import UndefinedAbbreviationsRule

__all__ = [
    'InconsistentVerbTenseRule',
    'WeakVerbsRule',
    'RepetitiveWordingRule',
    'FillerPhrasesRule',
    'PassiveVoiceRule',
    'PersonalPronounsRule',
    'BuzzwordsRule',
    'MissingActionVerbsRule',
    'UndefinedAbbreviationsRule',
]

