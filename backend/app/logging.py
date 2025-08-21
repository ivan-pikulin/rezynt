import logging
import json
import ast
import re
import random
from rich.console import Console
from rich.logging import RichHandler
from rich.traceback import install as rich_traceback_install
from rich.theme import Theme
from rich.panel import Panel
from rich.text import Text


rich_traceback_install(show_locals=True)

custom_theme = Theme({
    "logging.name": "yellow",
    "logging.level.debug": "dim cyan",
    "logging.level.info": "green",
    "logging.level.warning": "yellow",
    "logging.level.error": "bold red",
    "logging.level.critical": "bold white on red",
})
console = Console(theme=custom_theme, color_system="256")


class JSONPrettyRichHandler(RichHandler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = record.getMessage()
            pretty = None

            if isinstance(msg, (dict, list)):
                pretty = json.dumps(msg, indent=2, ensure_ascii=False)

            elif isinstance(msg, str):
                match = re.match(r"^(.*?):\s*(\{.*\}|\[.*\])$", msg)
                if match:
                    prefix, json_part = match.groups()
                    try:
                        parsed = ast.literal_eval(json_part)
                        if isinstance(parsed, (dict, list)):
                            formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
                            pretty = f"{prefix}:\n{formatted}"
                    except Exception:
                        pass

            if pretty:
                record.msg = pretty
                record.args = ()

        except Exception as e:
            console.print(f"[bold red]Ошибка при форматировании логов: {e}[/bold red]")

        super().emit(record)


def setup_logging():
    logging.basicConfig(
        format="%(message)s",
        level=logging.INFO,
        datefmt="[%H:%M:%S]",
        handlers=[
            JSONPrettyRichHandler(
                rich_tracebacks=True,
                show_time=True,
                show_path=False,
                show_level=True,
                console=console, 
            )
        ]
    )

    # Configure uvicorn logging for better error visibility
    logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
    logging.getLogger("uvicorn.error").setLevel(logging.DEBUG)
    
    # Disable SQLAlchemy engine logging completely
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.dialects").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.orm").setLevel(logging.WARNING)
    
    # Configure other loggers
    logging.getLogger("httpx").setLevel(logging.INFO)
    logging.getLogger("celery").setLevel(logging.INFO)
    logging.getLogger("flower").setLevel(logging.INFO)
