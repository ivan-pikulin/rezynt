from .crud_user import user_crud
from .crud_template import template_crud
from .crud_resume import resume_crud

# For type hints
__all__ = [
    "user_crud",
    "template_crud",
    "resume_crud",
]